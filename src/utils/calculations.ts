/**
 * FLOCK OS - Core Calculation Engine & Business Logic
 * Poultry operations calculations and business rules
 */

/**
 * 1. Closing Birds Calculation
 * Closing Birds = Opening Birds - Mortality - Culling - Sales/Transfers
 */
export function calculateClosingBirds(
  opening: number,
  mortality: number,
  culling: number = 0,
  sales: number = 0
): number {
  const result = opening - (mortality || 0) - (culling || 0) - (sales || 0);
  return Math.max(0, result);
}

/**
 * 2. Mortality Percentage
 * Mortality % = Total Mortality / Initial (or Relevant) Bird Population * 100
 */
export function calculateMortalityPercent(totalMortality: number, initialBirds: number): number {
  if (!initialBirds || initialBirds <= 0) return 0;
  return Number(((totalMortality / initialBirds) * 100).toFixed(2));
}

/**
 * 3. Overall FCR (Feed Conversion Ratio)
 * FCR = Total Feed Consumed (kg) / Total Live Weight Gain (kg)
 */
export function calculateFCR(totalFeedKg: number, totalLiveWeightGainKg: number): number {
  if (!totalLiveWeightGainKg || totalLiveWeightGainKg <= 0) return 0;
  return Number((totalFeedKg / totalLiveWeightGainKg).toFixed(2));
}

/**
 * 4. Average Chick Weight (DOC)
 * Average Chick Weight = Total weight of sampled chicks / Number of chicks sampled
 */
export function calculateAverageChickWeight(totalWeightGrams: number, count: number): number {
  if (!count || count <= 0) return 0;
  return Number((totalWeightGrams / count).toFixed(1));
}

/**
 * 5. Weekly Average Bird Weight
 * Sum of sampled bird weights / Number of birds sampled
 */
export function calculateAverageSampleWeight(sampleWeightsGrams: number[]): number {
  if (!sampleWeightsGrams || sampleWeightsGrams.length === 0) return 0;
  const sum = sampleWeightsGrams.reduce((acc, curr) => acc + (Number(curr) || 0), 0);
  return Math.round(sum / sampleWeightsGrams.length);
}

/**
 * 6. Weight Gain per Bird (week)
 * Average weight this week - Average weight previous week (for week 1, previous = DOC weight)
 */
export function calculateWeightGainPerBird(
  currentAvgGrams: number,
  previousAvgGrams: number
): number {
  return Math.round(currentAvgGrams - previousAvgGrams);
}

/**
 * 7. Total Weight Gained by Flock (week)
 * Total Weight Gained = (Weight gain per bird in grams * Live birds at weighing date) / 1000 (kg)
 */
export function calculateTotalWeightGainedKg(
  gainPerBirdGrams: number,
  liveBirds: number
): number {
  if (!liveBirds || liveBirds <= 0) return 0;
  const totalKg = (gainPerBirdGrams * liveBirds) / 1000;
  return Number(totalKg.toFixed(1));
}

/**
 * 8. Weekly FCR
 * Weekly FCR = Feed consumed during the week (kg) / Total weight gained in the week (kg)
 */
export function calculateWeeklyFCR(
  feedConsumedWeekKg: number,
  totalWeightGainedWeekKg: number
): number {
  if (!totalWeightGainedWeekKg || totalWeightGainedWeekKg <= 0) return 0;
  return Number((feedConsumedWeekKg / totalWeightGainedWeekKg).toFixed(2));
}

/**
 * 9. Weekly Target Result
 * Achieved if actual average weight is at or above the weekly goal, otherwise Not Achieved
 * difference = actual - goal
 */
export function evaluateWeeklyTarget(
  actualAvgGrams: number,
  goalGrams: number
): { isAchieved: boolean; differenceGrams: number } {
  const differenceGrams = actualAvgGrams - goalGrams;
  return {
    isAchieved: actualAvgGrams >= goalGrams,
    differenceGrams,
  };
}

/**
 * 10. Commercial Sale Calculations
 * Total Amount = Total weight sold (kg) * Final rate per kg
 * Rate Difference = Final rate - Actual (market) rate
 * Total Rate Difference = Rate Difference * Total weight sold
 */
export function calculateSaleMetrics(
  totalWeightKg: number,
  birdsSold: number,
  marketRatePerKg: number,
  finalRatePerKg: number
) {
  const totalAmount = Math.round(totalWeightKg * finalRatePerKg);
  const rateDifferencePerKg = Number((finalRatePerKg - marketRatePerKg).toFixed(2));
  const totalRateDifference = Math.round(rateDifferencePerKg * totalWeightKg);
  const avgBirdWeightKg = birdsSold > 0 ? Number((totalWeightKg / birdsSold).toFixed(3)) : 0;

  return {
    totalAmount,
    rateDifferencePerKg,
    totalRateDifference,
    avgBirdWeightKg,
  };
}

/**
 * Currency and Number Formatters for Pakistani Poultry Context
 */
export function formatPKR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return 'Rs. 0';
  return 'Rs. ' + Math.round(amount).toLocaleString('en-PK');
}

export function formatNumber(num: number): string {
  if (isNaN(num) || num === null || num === undefined) return '0';
  return num.toLocaleString('en-PK');
}

export function formatWeight(grams: number): string {
  if (!grams) return '0 g';
  if (grams >= 1000) {
    return `${(grams / 1000).toFixed(2)} kg (${formatNumber(grams)} g)`;
  }
  return `${formatNumber(grams)} g`;
}
