export type Picks = Record<string, string>;
export type Winners = Record<string, string>;

export function computeScore(
  picks: Picks,
  winners: Winners
): { score: number; total: number } {
  const total = Object.keys(winners).length;
  const score = Object.entries(winners).filter(
    ([category, winner]) => picks[category] === winner
  ).length;
  return { score, total };
}
