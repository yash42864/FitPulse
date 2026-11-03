export interface UserPreferences {
  measurementUnits: 'metric' | 'imperial';
  dailyStepGoal: number;
  dailyCalorieGoal: number;
  dailyWaterGoal: number;
  dailySleepGoal: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  height?: number;
  currentWeight?: number;
  activityLevel?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';
  fitnessGoal?: 'muscle_gain' | 'fat_loss' | 'weight_maintenance' | 'general_fitness' | 'improved_endurance';
  timezone?: string;
  preferences: UserPreferences;
}

export interface ActivityLog {
  _id: string;
  userId: string;
  date: string;
  steps: number;
  distanceKm: number;
  estimatedCaloriesBurned: number;
  source: 'manual' | 'sync' | 'wearable';
  createdAt: string;
}

export interface FoodItem {
  _id: string;
  name: string;
  category: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  createdBy?: string | null;
  isPublic: boolean;
}

export interface MealItem {
  _id?: string;
  foodItemId?: string;
  name: string;
  servingSize: number;
  servingUnit: string;
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface MealLog {
  _id: string;
  userId: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'drink';
  items: MealItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  createdAt: string;
}

export interface WorkoutSet {
  setNumber: number;
  reps: number;
  weightKg: number;
  restTimeSeconds?: number;
}

export interface ExerciseEntry {
  _id?: string;
  exerciseName: string;
  sets: WorkoutSet[];
  notes?: string;
}

export interface WorkoutLog {
  _id: string;
  userId: string;
  date: string;
  workoutType: 'strength_training' | 'cardio' | 'yoga' | 'pilates' | 'walking' | 'running' | 'cycling' | 'mobility' | 'custom';
  durationMinutes: number;
  exercises: ExerciseEntry[];
  estimatedCaloriesBurned: number;
  notes?: string;
  createdAt: string;
}

export interface WorkoutTemplate {
  _id: string;
  name: string;
  category: string;
  exercises: {
    exerciseName: string;
    defaultSets: number;
    defaultReps: number;
    defaultWeightKg: number;
  }[];
}

export interface SleepLog {
  _id: string;
  userId: string;
  sleepStart: string;
  sleepEnd: string;
  durationMinutes: number;
  quality: number;
  notes?: string;
  createdAt: string;
}

export interface WaterLog {
  _id: string;
  userId: string;
  timestamp: string;
  amountMl: number;
}

export interface BodyMeasurement {
  _id: string;
  userId: string;
  date: string;
  weightKg: number;
  waistCm?: number;
  hipCm?: number;
  chestCm?: number;
  armCm?: number;
  thighCm?: number;
  notes?: string;
}

export interface Goal {
  _id: string;
  userId: string;
  goalType: 'steps' | 'calories' | 'protein' | 'water' | 'sleep' | 'workouts' | 'weight';
  targetValue: number;
  unit: string;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
  currentProgress?: number;
  percentage?: number;
}

export interface DashboardOverview {
  date: string;
  user: {
    name: string;
    fitnessGoal: string;
    preferences: UserPreferences;
  };
  kpis: {
    steps: {
      current: number;
      target: number;
      percentage: number;
      distanceKm: number;
    };
    calories: {
      consumed: number;
      burned: number;
      target: number;
      balance: number;
    };
    water: {
      consumedMl: number;
      targetMl: number;
      percentage: number;
    };
    sleep: {
      lastDurationMinutes: number;
      lastDurationHours: number;
      targetMinutes: number;
      quality: number;
    };
    workout: {
      completedThisWeek: number;
      totalDurationMinutes: number;
    };
    nutrition: {
      protein: number;
      proteinGoal: number;
      carbs: number;
      fat: number;
    };
    weight: {
      currentKg: number;
    };
  };
  visualizations: {
    weeklySteps: {
      date: string;
      steps: number;
      distanceKm: number;
      caloriesBurned: number;
    }[];
    calorieBalance: {
      date: string;
      caloriesConsumed: number;
      walkingBurned: number;
      workoutBurned: number;
      totalBurned: number;
      netBalance: number;
    }[];
    macroDistribution: {
      name: string;
      value: number;
      grams: number;
      color: string;
    }[];
    consistencyScore: {
      totalScore: number;
      breakdown: {
        steps: { score: number; max: number; adherencePercentage: number };
        workouts: { score: number; max: number; adherencePercentage: number };
        sleep: { score: number; max: number; adherencePercentage: number };
        hydration: { score: number; max: number; adherencePercentage: number };
        nutrition: { score: number; max: number; adherencePercentage: number };
      };
      evaluationWindowDays: number;
      disclaimer: string;
    };
  };
}
