/**
 * Fitness & Health Calculation Utilities
 * FitPulse Platform
 * Transparent and documented estimation formulas
 */

/**
 * Calculates estimated walking distance based on step count and optional height.
 * Default average stride length is ~0.762 meters (0.000762 km) per step.
 * If user height is known: Stride length ≈ height (cm) * 0.414 / 100 meters.
 */
export const calculateDistanceKm = (steps: number, heightCm?: number): number => {
  if (steps <= 0) return 0;
  const strideKm = heightCm && heightCm > 50
    ? (heightCm * 0.414) / 100000
    : 0.000762;
  const distance = steps * strideKm;
  return Number(distance.toFixed(2));
};

/**
 * Calculates estimated calories burned from walking.
 * Standard estimate: ~0.045 kcal per step for a 70kg adult,
 * scaled proportionally with body weight (kg) if provided:
 * Calories = steps * (weightKg / 70) * 0.045
 */
export const calculateWalkingCalories = (steps: number, weightKg: number = 70): number => {
  if (steps <= 0) return 0;
  const calories = steps * (weightKg / 70) * 0.045;
  return Math.round(calories);
};

/**
 * Estimates workout calories burned using standard MET (Metabolic Equivalent of Task) values.
 * Formula: Calories Burned = (MET * 3.5 * weightKg / 200) * durationMinutes
 */
export const WORKOUT_MET_TABLE: Record<string, number> = {
  strength_training: 5.0,
  cardio: 8.0,
  yoga: 3.0,
  pilates: 3.5,
  walking: 3.8,
  running: 9.8,
  cycling: 7.5,
  mobility: 2.8,
  custom: 5.0,
};

export const calculateWorkoutCalories = (
  workoutType: string,
  durationMinutes: number,
  weightKg: number = 70
): number => {
  if (durationMinutes <= 0) return 0;
  const met = WORKOUT_MET_TABLE[workoutType] || 5.0;
  const calories = (met * 3.5 * weightKg / 200) * durationMinutes;
  return Math.round(calories);
};

/**
 * Calculates sleep duration in minutes from start and end dates.
 * Reliably handles sessions crossing midnight.
 */
export const calculateSleepDurationMinutes = (start: Date | string, end: Date | string): number => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffMs = endDate.getTime() - startDate.getTime();
  if (diffMs <= 0) {
    // If end is nominally earlier or equal, assume next day if not explicitly provided
    return 0;
  }
  return Math.round(diffMs / (1000 * 60));
};
