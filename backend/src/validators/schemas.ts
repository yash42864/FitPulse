import { z } from 'zod';

// Auth Validation
export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Valid email address required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  dateOfBirth: z.string().optional(),
  height: z.number().min(50).max(300).optional(),
  currentWeight: z.number().min(20).max(500).optional(),
  activityLevel: z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active']).optional(),
  fitnessGoal: z.enum(['muscle_gain', 'fat_loss', 'weight_maintenance', 'general_fitness', 'improved_endurance']).optional(),
  timezone: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(1, 'Password is required'),
});

export const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  dateOfBirth: z.string().optional().nullable(),
  height: z.number().min(50).max(300).optional().nullable(),
  currentWeight: z.number().min(20).max(500).optional().nullable(),
  activityLevel: z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active']).optional(),
  fitnessGoal: z.enum(['muscle_gain', 'fat_loss', 'weight_maintenance', 'general_fitness', 'improved_endurance']).optional(),
  timezone: z.string().optional(),
  preferences: z.object({
    measurementUnits: z.enum(['metric', 'imperial']).optional(),
    dailyStepGoal: z.number().min(1000).max(100000).optional(),
    dailyCalorieGoal: z.number().min(800).max(10000).optional(),
    dailyWaterGoal: z.number().min(500).max(10000).optional(),
    dailySleepGoal: z.number().min(180).max(900).optional(),
  }).optional(),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

// Activity Validation
export const ActivityLogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD'),
  steps: z.number().int().min(0).max(200000),
  distanceKm: z.number().min(0).optional(),
  estimatedCaloriesBurned: z.number().min(0).optional(),
  source: z.enum(['manual', 'sync', 'wearable']).default('manual'),
});

// Food Catalog Item
export const FoodItemInputSchema = z.object({
  name: z.string().min(1, 'Food name is required').trim(),
  category: z.string().min(1, 'Category is required').trim(),
  servingSize: z.number().positive('Serving size must be positive'),
  servingUnit: z.string().min(1, 'Serving unit is required').trim(),
  calories: z.number().min(0, 'Calories cannot be negative'),
  protein: z.number().min(0, 'Protein cannot be negative'),
  carbs: z.number().min(0, 'Carbohydrates cannot be negative'),
  fat: z.number().min(0, 'Fat cannot be negative'),
  fiber: z.number().min(0, 'Fiber cannot be negative').default(0),
  isPublic: z.boolean().default(true),
});

// Meal Log Item
const MealItemInputSchema = z.object({
  foodItemId: z.string().optional(),
  name: z.string().min(1),
  servingSize: z.number().default(100),
  servingUnit: z.string().default('g'),
  quantity: z.number().min(0.01),
  calories: z.number().min(0),
  protein: z.number().min(0),
  carbs: z.number().min(0),
  fat: z.number().min(0),
  fiber: z.number().min(0).default(0),
});

export const MealLogInputSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD'),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack', 'drink']),
  items: z.array(MealItemInputSchema).min(1, 'At least one item is required in a meal'),
});

// Workout Log
const WorkoutSetInputSchema = z.object({
  setNumber: z.number().int().min(1),
  reps: z.number().int().min(0),
  weightKg: z.number().min(0).default(0),
  restTimeSeconds: z.number().min(0).optional(),
});

const ExerciseEntryInputSchema = z.object({
  exerciseName: z.string().min(1, 'Exercise name is required'),
  sets: z.array(WorkoutSetInputSchema).default([]),
  notes: z.string().optional(),
});

export const WorkoutLogInputSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD'),
  workoutType: z.enum(['strength_training', 'cardio', 'yoga', 'pilates', 'walking', 'running', 'cycling', 'mobility', 'custom']),
  durationMinutes: z.number().min(1).max(1440),
  exercises: z.array(ExerciseEntryInputSchema).default([]),
  estimatedCaloriesBurned: z.number().min(0).optional(),
  notes: z.string().optional(),
});

// Sleep Log
export const SleepLogInputSchema = z.object({
  sleepStart: z.string().datetime({ offset: true }).or(z.string().min(1)),
  sleepEnd: z.string().datetime({ offset: true }).or(z.string().min(1)),
  durationMinutes: z.number().min(1).max(1440).optional(),
  quality: z.number().int().min(1).max(5),
  notes: z.string().optional(),
});

// Water Log
export const WaterLogInputSchema = z.object({
  timestamp: z.string().optional(),
  amountMl: z.number().min(1).max(5000),
});

// Body Measurement
export const BodyMeasurementInputSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD'),
  weightKg: z.number().min(20).max(500),
  waistCm: z.number().min(20).max(250).optional().nullable(),
  hipCm: z.number().min(20).max(250).optional().nullable(),
  chestCm: z.number().min(20).max(250).optional().nullable(),
  armCm: z.number().min(10).max(100).optional().nullable(),
  thighCm: z.number().min(15).max(150).optional().nullable(),
  notes: z.string().optional(),
});

// Goal
export const GoalInputSchema = z.object({
  goalType: z.enum(['steps', 'calories', 'protein', 'water', 'sleep', 'workouts', 'weight']),
  targetValue: z.number().positive(),
  unit: z.string().min(1),
  effectiveFrom: z.string().optional(),
  effectiveTo: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

// Workout Template
export const WorkoutTemplateInputSchema = z.object({
  name: z.string().min(1),
  category: z.string().default('strength_training'),
  exercises: z.array(
    z.object({
      exerciseName: z.string().min(1),
      defaultSets: z.number().min(1).default(3),
      defaultReps: z.number().min(1).default(10),
      defaultWeightKg: z.number().min(0).default(0),
    })
  ).default([]),
});
