import { Request, Response } from "express";
import prisma from "../../config/prisma";

const AI_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:8001";

const OBJECT_GROUPS: Record<string, string[]> = {
  headphones: ["headphone", "headphones", "earbud", "earbuds", "headset", "airpods"],
  phone: ["phone", "smartphone", "iphone", "samsung galaxy", "mobile"],
  laptop: ["laptop", "macbook", "notebook computer"],
  tablet: ["tablet", "ipad"],
  bag: ["backpack", "rucksack", "handbag", "suitcase", "tote bag"],
  keys: ["keyring", "key ring", "keys", "keychain"],
  wallet: ["wallet", "purse"],
  watch: ["watch", "smartwatch"],
  glasses: ["glasses", "spectacles", "sunglasses"],
  bottle: ["water bottle", "bottle", "flask"],
  book: ["textbook", "notebook", "book"],
};

function detectObjectGroup(name: string, description: string): string | null {
  const text = `${name} ${description}`.toLowerCase();
  for (const [group, terms] of Object.entries(OBJECT_GROUPS)) {
    if (terms.some((term) => text.includes(term))) return group;
  }
  return null;
}


const aiMatches = async (req: Request, res: Response) => {
  try {
    const lostId = String(req.params.id || "");

    if (!lostId) {
      return res.status(400).json({
        success: false,
        message: "Lost item ID is required",
      });
    }

    const lost = await prisma.lostItem.findFirst({
      where: {
        id: lostId,
        isDeleted: false,
        isFound: false,
      },
      include: { category: true },
    });

    if (!lost) {
      return res.status(404).json({
        success: false,
        message: "Active lost item not found",
      });
    }

    const foundItems = await prisma.foundItem.findMany({
      where: {
        isDeleted: false,
        isClaimed: false,
      },
      include: { category: true },
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    const candidates = [];

    for (const found of foundItems) {
      const response = await fetch(`${AI_URL}/match/multimodal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lost: {
            name: lost.lostItemName,
            description: lost.description,
            category: lost.category?.name || "",
            location: lost.location,
            date: lost.date.toISOString(),
            image_url: lost.img || "",
          },
          found: {
            name: found.foundItemName,
            description: found.description,
            category: found.category?.name || "",
            location: found.location,
            date: found.date.toISOString(),
            image_url: found.img || "",
          },
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        const details = await response.text();
        console.error(
          `AI failed for found item ${found.id} (${found.foundItemName}), ` +
          `HTTP ${response.status}:`,
          details
        );
        // Skip this candidate and continue with the remaining found items.
        continue;
      }

      const score = await response.json() as {
        text_similarity: number;
        image_similarity: number | null;
        location_similarity: number;
        date_similarity: number;
        combined_score: number;
        text_model?: string;
        image_model?: string | null;
        ranking_method: string;
        disclaimer: string;
      };

      const lostCategory = (lost.category?.name || "").trim().toLowerCase();
      const foundCategory = (found.category?.name || "").trim().toLowerCase();
      const categoryKnown = Boolean(lostCategory && foundCategory);
      const categoryMatch = categoryKnown
        ? lostCategory === foundCategory
        : null;

      // Missing categories are neutral. Known mismatches receive a ranking penalty.
      const categorySimilarity = categoryMatch === null
        ? null
        : categoryMatch ? 1 : 0;
      const lostObjectGroup = detectObjectGroup(
        lost.lostItemName,
        lost.description,
      );
      const foundObjectGroup = detectObjectGroup(
        found.foundItemName,
        found.description,
      );
      const objectTypeKnown = Boolean(lostObjectGroup && foundObjectGroup);
      const objectTypeMatch = objectTypeKnown
        ? lostObjectGroup === foundObjectGroup
        : null;

      // Preserve the category penalty and add a further penalty only for
      // confidently recognized, different object groups.
      const categoryAdjustedScore = categoryMatch === false
        ? score.combined_score * 0.35
        : score.combined_score;
      const adjustedScore = objectTypeMatch === false
        ? categoryAdjustedScore * 0.20
        : categoryAdjustedScore;

      candidates.push({
        foundItem: {
          id: found.id,
          name: found.foundItemName,
          description: found.description,
          image: found.img,
          category: found.category?.name || "",
          location: found.location,
          date: found.date,
        },
        scores: {
          ...score,
          category_match: categoryMatch,
          category_similarity: categorySimilarity,
          lost_object_type: lostObjectGroup,
          found_object_type: foundObjectGroup,
          object_type_match: objectTypeMatch,
          adjusted_score: Number(adjustedScore.toFixed(4)),
        },
      });
    }

    candidates.sort(
      (a, b) => b.scores.adjusted_score - a.scores.adjusted_score
    );

    return res.status(200).json({
      success: true,
      message: "AI candidate ranking completed",
      data: {
        lostItem: {
          id: lost.id,
          name: lost.lostItemName,
        },
        count: candidates.length,
        rankingMethod: "Sentence Transformers + CLIP with category and object-type-aware ranking",
        candidates,
        disclaimer:
          "Scores are experimental ranking signals, not probabilities or proof of ownership.",
      },
    });
  } catch (error) {
    console.error("AI candidate matching error:", error);
    return res.status(503).json({
      success: false,
      message: "AI matching failed. Check the AI service and backend logs.",
    });
  }
};

export const aiMatchesController = { aiMatches };
