import type { Prisma } from "@prisma/client";
import prisma from "../../config/prisma";
import { scorePair, type MatchableItem } from "./matching.logic";

type AIItem = {
  name: string;
  description: string;
  category: string;
  location: string;
  date: string;
  image_url: string;
};

type MultimodalResult = {
  text_similarity?: number;
  image_similarity?: number | null;
  location_similarity?: number;
  date_similarity?: number;
  combined_score?: number;
};

type BatchResult = {
  index: number;
  text_similarity: number;
};

type LostWithCategory = Prisma.LostItemGetPayload<{
  include: {
    category: { select: { name: true } };
  };
}>;

type FoundWithCategory = Prisma.FoundItemGetPayload<{
  include: {
    category: { select: { name: true } };
  };
}>;

type RankedCandidate = {
  found: FoundWithCategory;
  comparable: MatchableItem;
  score: number;
  confidence: string;
  explanation: string;
};

function toLostAI(item: LostWithCategory): AIItem {
  return {
    name: item.lostItemName,
    description: item.description || "",
    category: item.category?.name || "",
    location: item.location || "",
    date: item.date.toISOString(),
    image_url: item.img || "",
  };
}

function toFoundAI(item: FoundWithCategory): AIItem {
  return {
    name: item.foundItemName,
    description: item.description || "",
    category: item.category?.name || "",
    location: item.location || "",
    date: item.date.toISOString(),
    image_url: item.img || "",
  };
}

function toFoundComparable(item: FoundWithCategory): MatchableItem {
  return {
    name: item.foundItemName,
    description: item.description,
    location: item.location,
  };
}

function toLostComparable(item: LostWithCategory): MatchableItem {
  return {
    name: item.lostItemName,
    description: item.description,
    location: item.location,
  };
}

/**
 * Encode one anchor and all candidates in a single AI request.
 * If the AI service is unavailable, lexical matching remains available.
 */
async function getBatchSemanticScores(
  anchor: AIItem,
  candidates: AIItem[]
): Promise<Map<number, number>> {
  const aiUrl = process.env.AI_SERVICE_URL?.replace(/\/+$/, "");
  const scores = new Map<number, number>();

  if (!aiUrl || !candidates.length) return scores;

  try {
    const response = await fetch(`${aiUrl}/match/batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        anchor,
        candidates,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      console.error("Batch AI returned:", response.status);
      return scores;
    }

    const result = await response.json() as {
      results?: BatchResult[];
    };

    if (!Array.isArray(result.results)) return scores;

    for (const entry of result.results) {
      if (
        Number.isInteger(entry.index) &&
        entry.index >= 0 &&
        entry.index < candidates.length &&
        typeof entry.text_similarity === "number" &&
        Number.isFinite(entry.text_similarity) &&
        entry.text_similarity >= 0 &&
        entry.text_similarity <= 1
      ) {
        scores.set(entry.index, entry.text_similarity);
      }
    }

    return scores;
  } catch (error) {
    console.error(
      "Batch AI unavailable; using lexical matching:",
      error
    );
    return scores;
  }
}

/**
 * Run expensive multimodal comparison only on shortlisted candidates.
 */
async function getMultimodalSimilarity(
  lost: AIItem,
  found: AIItem
): Promise<MultimodalResult | null> {
  const aiUrl = process.env.AI_SERVICE_URL?.replace(/\/+$/, "");

  if (!aiUrl) return null;

  try {
    const response = await fetch(`${aiUrl}/match/multimodal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lost, found }),
      signal: AbortSignal.timeout(20000),
    });

    if (!response.ok) {
      console.error("Multimodal AI returned:", response.status);
      return null;
    }

    const result = await response.json() as MultimodalResult;

    if (
      typeof result.combined_score !== "number" ||
      !Number.isFinite(result.combined_score) ||
      result.combined_score < 0 ||
      result.combined_score > 1
    ) {
      return null;
    }

    return result;
  } catch (error) {
    console.error(
      "Multimodal AI unavailable; using existing matching:",
      error
    );
    return null;
  }
}

/**
 * Shared matching pipeline for both directions:
 * lost item -> found items
 * found item -> lost items
 */
async function rankAndPersistCandidates(
  lost: LostWithCategory,
  foundItems: FoundWithCategory[],
  useSemantic: boolean,
  persistAllEligible = false
) {
  if (!foundItems.length) return [];

  const lostComparable = toLostComparable(lost);
  const lostAI = toLostAI(lost);

  const foundComparables = foundItems.map(toFoundComparable);
  const foundAIItems = foundItems.map(toFoundAI);

  // One batch request for the anchor and all candidate descriptions.
  const semanticScores = useSemantic
    ? await getBatchSemanticScores(lostAI, foundAIItems)
    : new Map<number, number>();

  // Hybrid preliminary ranking.
  const preliminary = foundItems
    .map((found, index) => {
      const comparable = foundComparables[index];
      const semanticScore = semanticScores.get(index);

      const baseline = scorePair(
        lostComparable,
        comparable,
        semanticScore
      );

      return {
        found,
        comparable,
        baseline,
      };
    })
    .filter((entry) => entry.baseline.score >= 15)
    .sort((a, b) => b.baseline.score - a.baseline.score);

  if (!preliminary.length) return [];

  // CLIP is limited to the top 10 preliminary candidates.
  const multimodalShortlist = preliminary.slice(0, 10);

  const multimodalResults = await Promise.all(
    multimodalShortlist.map(async (entry) => ({
      foundId: entry.found.id,
      result: useSemantic
        ? await getMultimodalSimilarity(
            lostAI,
            toFoundAI(entry.found)
          )
        : null,
    }))
  );

  const multimodalByFoundId = new Map(
    multimodalResults.map((entry) => [
      entry.foundId,
      entry.result,
    ])
  );

  const ranked: RankedCandidate[] = preliminary.map((entry) => {
    const multimodal = multimodalByFoundId.get(entry.found.id);

    const finalScore = multimodal?.combined_score !== undefined
      ? 0.65 * entry.baseline.score +
        0.35 * multimodal.combined_score * 100
      : entry.baseline.score;

    const score = Number(finalScore.toFixed(2));

    return {
      found: entry.found,
      comparable: entry.comparable,
      score,
      confidence:
        score >= 78 ? "HIGH" :
        score >= 55 ? "MEDIUM" : "LOW",
      explanation: multimodal
        ? `${entry.baseline.explanation} Multimodal AI also considered text, image, location and date signals.`
        : entry.baseline.explanation,
    };
  });

  ranked.sort((a, b) => b.score - a.score);

  // Forward matching retains its top-10 persistence behaviour.
  // Reverse matching persists all eligible candidates, as before.
  const candidatesToPersist = persistAllEligible
    ? ranked
    : ranked.slice(0, 10);

  if (!candidatesToPersist.length) return [];

  const foundIds = candidatesToPersist.map(
    (candidate) => candidate.found.id
  );

  // Retrieve existing statuses in one query instead of one query per candidate.
  const existingCandidates = await prisma.matchCandidate.findMany({
    where: {
      lostItemId: lost.id,
      foundItemId: { in: foundIds },
    },
    select: {
      id: true,
      foundItemId: true,
      score: true,
      status: true,
    },
  });

  const existingByFoundId = new Map(
    existingCandidates.map((candidate) => [
      candidate.foundItemId,
      candidate,
    ])
  );

  const saved = [];

  for (const candidate of candidatesToPersist) {
    const existing = existingByFoundId.get(candidate.found.id);

    const uniqueKey = {
      lostItemId_foundItemId: {
        lostItemId: lost.id,
        foundItemId: candidate.found.id,
      },
    };

    const record = await prisma.matchCandidate.upsert({
      where: uniqueKey,
      create: {
        lostItemId: lost.id,
        foundItemId: candidate.found.id,
        score: candidate.score,
        confidence: candidate.confidence,
        explanation: candidate.explanation,
      },
      update: {
        score: candidate.score,
        confidence: candidate.confidence,
        explanation: candidate.explanation,
      },
    });

    saved.push({
      ...record,
      foundItem: candidate.found,
    });

    // Never automatically revive rejected candidates or notify for
    // already verified/completed matches.
    const canNotify =
      !existing ||
      existing.status === "POTENTIAL_MATCH" ||
      existing.status === "VERIFICATION_PENDING";

    const crossedThreshold =
      (!existing || existing.score < 55) &&
      candidate.score >= 55;

    if (canNotify && crossedThreshold) {
      // Only change items that are still in their original report state.
      await Promise.all([
        prisma.lostItem.updateMany({
          where: {
            id: lost.id,
            status: "LOST",
          },
          data: {
            status: "POTENTIAL_MATCH",
          },
        }),
        prisma.foundItem.updateMany({
          where: {
            id: candidate.found.id,
            status: "FOUND",
          },
          data: {
            status: "POTENTIAL_MATCH",
          },
        }),
      ]);

      await prisma.notification.createMany({
        data: [
          {
            userId: lost.userId,
            title: "A potential match was found",
            message: `Findora found a possible match for "${lost.lostItemName}". Review the match and verify ownership.`,
            type: "POTENTIAL_MATCH",
            metadata: {
              lostItemId: lost.id,
              matchId: record.id,
            },
          },
          {
            userId: candidate.found.userId,
            title: "A lost report may match your found item",
            message: `A lost-item report may match "${candidate.found.foundItemName}". Review the match and complete private verification if appropriate.`,
            type: "POTENTIAL_MATCH",
            metadata: {
              foundItemId: candidate.found.id,
              matchId: record.id,
            },
          },
        ],
      }).catch((error) =>
        console.error(
          "Match notification could not be saved:",
          error
        )
      );
    }
  }

  return saved;
}


/**
 * Optimized reverse matching:
 * one found item (anchor) -> up to 500 lost reports (candidates).
 * Semantic ranking is batched; multimodal ranking is limited to the top 10.
 */
async function rankAndPersistForFoundItem(
  found: FoundWithCategory,
  lostItems: LostWithCategory[],
  useSemantic: boolean
) {
  if (!lostItems.length) return [];

  const foundAI = toFoundAI(found);
  const foundComparable = toFoundComparable(found);

  // One semantic AI request for every lost report.
  const semanticScores = useSemantic
    ? await getBatchSemanticScores(
        foundAI,
        lostItems.map(toLostAI)
      )
    : new Map<number, number>();

  // Calculate lexical + semantic scores for all candidates.
  const preliminary = lostItems
    .map((lost, index) => {
      const baseline = scorePair(
        toLostComparable(lost),
        foundComparable,
        semanticScores.get(index)
      );

      return {
        lost,
        baseline,
      };
    })
    .filter((entry) => entry.baseline.score >= 15)
    .sort((a, b) => b.baseline.score - a.baseline.score);

  if (!preliminary.length) return [];

  // Run expensive multimodal comparison only for the top 10.
  const multimodalResults = await Promise.all(
    preliminary.slice(0, 10).map(async (entry) => ({
      lostId: entry.lost.id,
      result: useSemantic
        ? await getMultimodalSimilarity(
            toLostAI(entry.lost),
            foundAI
          )
        : null,
    }))
  );

  const multimodalByLostId = new Map(
    multimodalResults.map((entry) => [
      entry.lostId,
      entry.result,
    ])
  );

  const ranked = preliminary
    .map((entry) => {
      const multimodal = multimodalByLostId.get(entry.lost.id);

      const finalScore = multimodal?.combined_score !== undefined
        ? 0.65 * entry.baseline.score +
          0.35 * multimodal.combined_score * 100
        : entry.baseline.score;

      const score = Number(finalScore.toFixed(2));

      return {
        lost: entry.lost,
        score,
        confidence:
          score >= 78 ? "HIGH" :
          score >= 55 ? "MEDIUM" : "LOW",
        explanation: multimodal
          ? `${entry.baseline.explanation} Multimodal AI also considered text, image, location and date signals.`
          : entry.baseline.explanation,
      };
    })
    .sort((a, b) => b.score - a.score);

  // Fetch existing match statuses in one query.
  const existingCandidates = await prisma.matchCandidate.findMany({
    where: {
      foundItemId: found.id,
      lostItemId: {
        in: ranked.map((candidate) => candidate.lost.id),
      },
    },
    select: {
      id: true,
      lostItemId: true,
      score: true,
      status: true,
    },
  });

  const existingByLostId = new Map(
    existingCandidates.map((candidate) => [
      candidate.lostItemId,
      candidate,
    ])
  );

  const saved = [];

  // Persist every eligible candidate, not just the top 10.
  for (const candidate of ranked) {
    const lost = candidate.lost;
    const existing = existingByLostId.get(lost.id);

    const record = await prisma.matchCandidate.upsert({
      where: {
        lostItemId_foundItemId: {
          lostItemId: lost.id,
          foundItemId: found.id,
        },
      },
      create: {
        lostItemId: lost.id,
        foundItemId: found.id,
        score: candidate.score,
        confidence: candidate.confidence,
        explanation: candidate.explanation,
      },
      update: {
        score: candidate.score,
        confidence: candidate.confidence,
        explanation: candidate.explanation,
      },
    });

    saved.push({
      ...record,
      foundItem: found,
    });

    // Do not revive rejected matches or notify completed matches.
    const canNotify =
      !existing ||
      existing.status === "POTENTIAL_MATCH" ||
      existing.status === "VERIFICATION_PENDING";

    const crossedThreshold =
      (!existing || existing.score < 55) &&
      candidate.score >= 55;

    if (canNotify && crossedThreshold) {
      await Promise.all([
        prisma.lostItem.updateMany({
          where: {
            id: lost.id,
            status: "LOST",
          },
          data: {
            status: "POTENTIAL_MATCH",
          },
        }),
        prisma.foundItem.updateMany({
          where: {
            id: found.id,
            status: "FOUND",
          },
          data: {
            status: "POTENTIAL_MATCH",
          },
        }),
      ]);

      await prisma.notification.createMany({
        data: [
          {
            userId: lost.userId,
            title: "A potential match was found",
            message: `Findora found a possible match for "${lost.lostItemName}". Review the match and verify ownership.`,
            type: "POTENTIAL_MATCH",
            metadata: {
              lostItemId: lost.id,
              matchId: record.id,
            },
          },
          {
            userId: found.userId,
            title: "A lost report may match your found item",
            message: `A lost-item report may match "${found.foundItemName}". Review the match and complete private verification if appropriate.`,
            type: "POTENTIAL_MATCH",
            metadata: {
              foundItemId: found.id,
              matchId: record.id,
            },
          },
        ],
      }).catch((error) =>
        console.error(
          "Match notification could not be saved:",
          error
        )
      );
    }
  }

  return saved;
}

export const matchingService = {
  forLostItem: async (
    lostItemId: string,
    useSemantic = true
  ) => {
    const lost = await prisma.lostItem.findFirst({
      where: {
        id: lostItemId,
        isDeleted: false,
      },
      include: {
        category: {
          select: { name: true },
        },
      },
    });

    if (!lost) return [];

    const foundItems = await prisma.foundItem.findMany({
      where: {
        isDeleted: false,
        isClaimed: false,
      },
      include: {
        category: {
          select: { name: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 500,
    });

    return rankAndPersistCandidates(
      lost,
      foundItems,
      useSemantic,
      false
    );
  },

  forFoundItem: async (
    foundItemId: string,
    useSemantic = true
  ) => {
    const found = await prisma.foundItem.findFirst({
      where: {
        id: foundItemId,
        isDeleted: false,
        isClaimed: false,
      },
      include: {
        category: {
          select: { name: true },
        },
      },
    });

    if (!found) return [];

    const lostItems = await prisma.lostItem.findMany({
      where: {
        isDeleted: false,
        isFound: false,
      },
      include: {
        category: {
          select: { name: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 500,
    });

    return rankAndPersistForFoundItem(
      found,
      lostItems,
      useSemantic
    );
  },

  scorePair,
};
