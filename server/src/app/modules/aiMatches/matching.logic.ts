export type MatchableItem = {
  name: string;
  description?: string | null;
  location?: string | null;
  // Retained for compatibility, but never used to score physical item similarity.
  contactName?: string | null;
  contactPhoneHash?: string | null;
};

export const normalize = (value?: string | null) =>
  (value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();

export function similarity(a?: string | null, b?: string | null): number | null {
  const left = normalize(a);
  const right = normalize(b);

  if (!left || !right) return null;
  if (left === right) return 1;
  if (left.includes(right) || right.includes(left)) return 0.88;

  const aTokens = new Set(left.split(/\s+/).filter(Boolean));
  const bTokens = new Set(right.split(/\s+/).filter(Boolean));
  const intersection = [...aTokens].filter((token) => bTokens.has(token)).length;
  const union = new Set([...aTokens, ...bTokens]).size;
  const jaccard = union ? intersection / union : 0;

  const shorter = Math.min(left.length, right.length);
  const prefix =
    left.slice(0, Math.min(4, shorter)) ===
    right.slice(0, Math.min(4, shorter))
      ? 0.12
      : 0;

  return Math.min(1, jaccard * 0.82 + prefix);
}

export function scorePair(
  lost: MatchableItem,
  found: MatchableItem,
  semanticTextScore?: number | null
) {
  const nameSimilarity = similarity(lost.name, found.name);
  const descriptionSimilarity = similarity(
    lost.description,
    found.description
  );

  const semanticBlend =
    typeof semanticTextScore === "number" &&
    Number.isFinite(semanticTextScore)
      ? Math.max(0, Math.min(1, semanticTextScore))
      : null;

  const signals: Array<{
    label: string;
    weight: number;
    value: number | null;
  }> = [
    {
      label: "item name",
      weight: 35,
      value:
        nameSimilarity === null
          ? semanticBlend
          : semanticBlend === null
            ? nameSimilarity
            : nameSimilarity * 0.65 + semanticBlend * 0.35,
    },
    {
      label: "description",
      weight: 40,
      value:
        descriptionSimilarity === null
          ? semanticBlend
          : semanticBlend === null
            ? descriptionSimilarity
            : descriptionSimilarity * 0.65 + semanticBlend * 0.35,
    },
    {
      label: "location",
      weight: 25,
      value: similarity(lost.location, found.location),
    },
  ];

  const available = signals.filter(
    (signal) => signal.value !== null
  );

  const availableWeight = available.reduce(
    (sum, signal) => sum + signal.weight,
    0
  );

  const score = availableWeight
    ? (available.reduce(
        (sum, signal) => sum + signal.weight * (signal.value || 0),
        0
      ) /
        availableWeight) *
      100
    : 0;

  const explanation = available
    .filter((signal) => (signal.value || 0) >= 0.45)
    .sort((a, b) => (b.value || 0) - (a.value || 0))
    .map((signal) => `${signal.label} similarity`)
    .slice(0, 4);

  const confidence =
    score >= 78 ? "HIGH" : score >= 55 ? "MEDIUM" : "LOW";

  return {
    score: Number(score.toFixed(2)),
    confidence,
    explanation: explanation.length
      ? `Strong signals: ${explanation.join(", ")}. Ownership is not confirmed until private verification succeeds.`
      : "Limited descriptive overlap. Review the item details and complete private ownership verification before any handover.",
  };
}
