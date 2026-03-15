import type { PortfolioCategorySnapshot } from "../types";

export const calculateAsoScore = (categories: PortfolioCategorySnapshot[]): number => {
  if (categories.length === 0) {
    return 100;
  }

  const maxDeviation = categories.reduce(
    (max, category) => Math.max(max, Math.abs(category.deviationPoints)),
    0,
  );

  const score = Math.max(0, Math.min(100, 100 - maxDeviation * 2.5));
  return Math.round(score);
};
