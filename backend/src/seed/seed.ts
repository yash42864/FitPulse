import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { FoodItem } from '../models/FoodItem.js';
import { MealLog } from '../models/MealLog.js';
import { WorkoutLog } from '../models/WorkoutLog.js';
import { SleepLog } from '../models/SleepLog.js';
import { WaterLog } from '../models/WaterLog.js';
import { BodyMeasurement } from '../models/BodyMeasurement.js';
import { Goal } from '../models/Goal.js';
import { WorkoutTemplate } from '../models/WorkoutTemplate.js';
import { calculateDistanceKm, calculateWalkingCalories } from '../utils/calculations.js';

const DEMO_EMAIL = 'demo@fitpulse.app';
const DEMO_PASSWORD = 'Password123!';

// Catalog of 45+ realistic food items (including Indian foods, staples, fruits, veggies, nuts)
const FOOD_CATALOG = [
  // Indian Staples & Breads
  { name: 'Roti (Whole Wheat Chapati)', category: 'Indian Traditional', servingSize: 1, servingUnit: 'piece (40g)', calories: 104, protein: 3.1, carbs: 20.2, fat: 0.9, fiber: 2.8 },
  { name: 'Steamed White Rice', category: 'Grains', servingSize: 1, servingUnit: 'bowl (150g)', calories: 195, protein: 4.1, carbs: 43.5, fat: 0.4, fiber: 0.6 },
  { name: 'Brown Rice Cooked', category: 'Grains', servingSize: 1, servingUnit: 'bowl (150g)', calories: 168, protein: 3.8, carbs: 35.2, fat: 1.4, fiber: 2.7 },
  { name: 'Rolled Oats (Cooked)', category: 'Grains', servingSize: 1, servingUnit: 'cup (234g)', calories: 158, protein: 6.0, carbs: 27.0, fat: 3.2, fiber: 4.0 },
  { name: 'Idli (Steamed Rice & Lentil)', category: 'Indian Traditional', servingSize: 2, servingUnit: 'pieces (100g)', calories: 140, protein: 4.2, carbs: 28.0, fat: 0.6, fiber: 1.8 },
  { name: 'Plain Dosa', category: 'Indian Traditional', servingSize: 1, servingUnit: 'piece (100g)', calories: 168, protein: 3.9, carbs: 29.2, fat: 3.7, fiber: 1.4 },
  { name: 'Poha (Flattened Rice with Veggies)', category: 'Indian Traditional', servingSize: 1, servingUnit: 'bowl (180g)', calories: 250, protein: 4.5, carbs: 42.0, fat: 6.8, fiber: 3.2 },
  { name: 'Upma (Semolina & Vegetables)', category: 'Indian Traditional', servingSize: 1, servingUnit: 'bowl (180g)', calories: 230, protein: 5.2, carbs: 38.0, fat: 6.0, fiber: 2.9 },

  // Lentils & Legumes
  { name: 'Yellow Moong Dal Tadka', category: 'Lentils & Legumes', servingSize: 1, servingUnit: 'bowl (150g)', calories: 150, protein: 9.2, carbs: 19.8, fat: 3.8, fiber: 4.5 },
  { name: 'Rajma Masala (Red Kidney Beans)', category: 'Lentils & Legumes', servingSize: 1, servingUnit: 'bowl (180g)', calories: 215, protein: 11.5, carbs: 31.0, fat: 4.8, fiber: 8.2 },
  { name: 'Chole Masala (Chickpeas Curry)', category: 'Lentils & Legumes', servingSize: 1, servingUnit: 'bowl (180g)', calories: 240, protein: 12.0, carbs: 34.0, fat: 6.2, fiber: 9.0 },
  { name: 'Black Dal (Dal Makhani)', category: 'Lentils & Legumes', servingSize: 1, servingUnit: 'bowl (180g)', calories: 280, protein: 10.8, carbs: 26.5, fat: 14.0, fiber: 6.5 },
  { name: 'Boiled Chickpeas (Salad)', category: 'Lentils & Legumes', servingSize: 1, servingUnit: 'cup (164g)', calories: 269, protein: 14.5, carbs: 45.0, fat: 4.2, fiber: 12.5 },
  { name: 'Sprouted Moong Salad', category: 'Lentils & Legumes', servingSize: 1, servingUnit: 'bowl (150g)', calories: 135, protein: 10.5, carbs: 22.0, fat: 0.8, fiber: 6.2 },

  // Dairy & Proteins
  { name: 'Paneer (Cottage Cheese, Raw)', category: 'Dairy', servingSize: 100, servingUnit: 'g', calories: 265, protein: 18.3, carbs: 3.4, fat: 20.8, fiber: 0 },
  { name: 'Palak Paneer', category: 'Indian Traditional', servingSize: 1, servingUnit: 'bowl (200g)', calories: 235, protein: 12.0, carbs: 8.5, fat: 16.5, fiber: 4.2 },
  { name: 'Tofu (Firm)', category: 'Proteins', servingSize: 100, servingUnit: 'g', calories: 83, protein: 10.0, carbs: 1.5, fat: 4.8, fiber: 1.0 },
  { name: 'Curd / Plain Yogurt (Dahi)', category: 'Dairy', servingSize: 1, servingUnit: 'bowl (150g)', calories: 98, protein: 5.3, carbs: 7.0, fat: 5.0, fiber: 0 },
  { name: 'Greek Yogurt (Non-fat)', category: 'Dairy', servingSize: 1, servingUnit: 'cup (170g)', calories: 100, protein: 17.0, carbs: 6.0, fat: 0.7, fiber: 0 },
  { name: 'Cow Milk (Toned)', category: 'Dairy', servingSize: 1, servingUnit: 'glass (250ml)', calories: 150, protein: 8.0, carbs: 12.0, fat: 7.5, fiber: 0 },
  { name: 'Soy Milk (Unsweetened)', category: 'Dairy', servingSize: 1, servingUnit: 'glass (250ml)', calories: 80, protein: 7.0, carbs: 4.0, fat: 4.0, fiber: 2.0 },
  { name: 'Whey Protein Isolate (Vanilla)', category: 'Proteins', servingSize: 1, servingUnit: 'scoop (30g)', calories: 120, protein: 25.0, carbs: 2.0, fat: 1.0, fiber: 0 },
  { name: 'Boiled Egg (Large)', category: 'Proteins', servingSize: 1, servingUnit: 'egg (50g)', calories: 78, protein: 6.3, carbs: 0.6, fat: 5.3, fiber: 0 },
  { name: 'Egg White Omelette (3 whites)', category: 'Proteins', servingSize: 1, servingUnit: 'serving (100g)', calories: 85, protein: 13.5, carbs: 1.2, fat: 2.5, fiber: 0 },
  { name: 'Grilled Chicken Breast', category: 'Proteins', servingSize: 100, servingUnit: 'g', calories: 165, protein: 31.0, carbs: 0, fat: 3.6, fiber: 0 },

  // Vegetables & Curries
  { name: 'Mixed Vegetable Sabzi', category: 'Vegetables', servingSize: 1, servingUnit: 'bowl (150g)', calories: 120, protein: 3.0, carbs: 14.0, fat: 5.5, fiber: 4.0 },
  { name: 'Bhindi Masala (Okra)', category: 'Vegetables', servingSize: 1, servingUnit: 'bowl (150g)', calories: 110, protein: 2.5, carbs: 11.0, fat: 6.0, fiber: 4.5 },
  { name: 'Aloo Gobi', category: 'Vegetables', servingSize: 1, servingUnit: 'bowl (150g)', calories: 140, protein: 3.2, carbs: 18.0, fat: 6.2, fiber: 3.8 },
  { name: 'Steamed Broccoli', category: 'Vegetables', servingSize: 1, servingUnit: 'cup (91g)', calories: 31, protein: 2.5, carbs: 6.0, fat: 0.4, fiber: 2.4 },
  { name: 'Cucumber & Tomato Salad', category: 'Vegetables', servingSize: 1, servingUnit: 'plate (150g)', calories: 45, protein: 1.5, carbs: 8.0, fat: 0.5, fiber: 2.5 },
  { name: 'Boiled Sweet Potato', category: 'Vegetables', servingSize: 1, servingUnit: 'medium (130g)', calories: 112, protein: 2.0, carbs: 26.0, fat: 0.1, fiber: 3.9 },

  // Fruits
  { name: 'Banana', category: 'Fruits', servingSize: 1, servingUnit: 'medium (118g)', calories: 105, protein: 1.3, carbs: 27.0, fat: 0.3, fiber: 3.1 },
  { name: 'Apple (with skin)', category: 'Fruits', servingSize: 1, servingUnit: 'medium (182g)', calories: 95, protein: 0.5, carbs: 25.0, fat: 0.3, fiber: 4.4 },
  { name: 'Orange', category: 'Fruits', servingSize: 1, servingUnit: 'medium (131g)', calories: 62, protein: 1.2, carbs: 15.4, fat: 0.2, fiber: 3.1 },
  { name: 'Papaya Cubes', category: 'Fruits', servingSize: 1, servingUnit: 'cup (145g)', calories: 62, protein: 0.7, carbs: 15.8, fat: 0.4, fiber: 2.5 },
  { name: 'Pomegranate Seeds', category: 'Fruits', servingSize: 1, servingUnit: 'cup (174g)', calories: 144, protein: 3.0, carbs: 32.7, fat: 2.0, fiber: 7.0 },

  // Nuts, Seeds & Healthy Fats
  { name: 'Raw Almonds', category: 'Nuts & Seeds', servingSize: 1, servingUnit: 'handful (28g / 23 almonds)', calories: 164, protein: 6.0, carbs: 6.1, fat: 14.2, fiber: 3.5 },
  { name: 'Walnuts', category: 'Nuts & Seeds', servingSize: 1, servingUnit: 'handful (28g / 7 halves)', calories: 185, protein: 4.3, carbs: 3.9, fat: 18.5, fiber: 1.9 },
  { name: 'Chia Seeds', category: 'Nuts & Seeds', servingSize: 1, servingUnit: 'tbsp (12g)', calories: 58, protein: 2.0, carbs: 5.0, fat: 3.7, fiber: 4.1 },
  { name: 'Peanut Butter (Natural)', category: 'Nuts & Seeds', servingSize: 2, servingUnit: 'tbsp (32g)', calories: 188, protein: 8.0, carbs: 7.0, fat: 16.0, fiber: 2.0 },

  // Beverages & Snacks
  { name: 'Green Tea (Unsweetened)', category: 'Beverages', servingSize: 1, servingUnit: 'cup (240ml)', calories: 2, protein: 0.2, carbs: 0, fat: 0, fiber: 0 },
  { name: 'Masala Chai (with milk & 1 tsp sugar)', category: 'Beverages', servingSize: 1, servingUnit: 'cup (150ml)', calories: 85, protein: 2.8, carbs: 12.0, fat: 3.0, fiber: 0 },
  { name: 'Coconut Water', category: 'Beverages', servingSize: 1, servingUnit: 'glass (250ml)', calories: 45, protein: 1.7, carbs: 8.9, fat: 0.5, fiber: 2.6 },
  { name: 'Roasted Makhana (Foxnuts)', category: 'Snacks', servingSize: 1, servingUnit: 'bowl (30g)', calories: 110, protein: 3.2, carbs: 22.0, fat: 0.5, fiber: 2.2 },
  { name: 'Dark Chocolate (70% Cacao)', category: 'Snacks', servingSize: 1, servingUnit: 'square (20g)', calories: 115, protein: 1.8, carbs: 9.0, fat: 8.5, fiber: 2.0 },
];

export const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('[Seed] Starting FitPulse database population...');

    // 1. Upsert or create Demo User
    let demoUser = await User.findOne({ email: DEMO_EMAIL });
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, salt);

    if (!demoUser) {
      demoUser = await User.create({
        name: 'Alex Johnson',
        email: DEMO_EMAIL,
        passwordHash,
        dateOfBirth: new Date('1998-05-15'),
        height: 178, // cm
        currentWeight: 75.5, // kg
        activityLevel: 'moderately_active',
        fitnessGoal: 'muscle_gain',
        timezone: 'Asia/Kolkata',
        preferences: {
          measurementUnits: 'metric',
          dailyStepGoal: 10000,
          dailyCalorieGoal: 2300,
          dailyWaterGoal: 3000,
          dailySleepGoal: 480, // 8 hours
        },
      });
      console.log(`[Seed] Created Demo User: ${demoUser.email} (ID: ${demoUser._id})`);
    } else {
      demoUser.passwordHash = passwordHash;
      await demoUser.save();
      console.log(`[Seed] Updated Demo User: ${demoUser.email}`);
    }

    const userId = demoUser._id;

    // Clear previous logs for idempotency
    await Promise.all([
      FoodItem.deleteMany({ createdBy: null }),
      ActivityLog.deleteMany({ userId }),
      MealLog.deleteMany({ userId }),
      WorkoutLog.deleteMany({ userId }),
      SleepLog.deleteMany({ userId }),
      WaterLog.deleteMany({ userId }),
      BodyMeasurement.deleteMany({ userId }),
      Goal.deleteMany({ userId }),
      WorkoutTemplate.deleteMany({ userId }),
    ]);

    // 2. Insert Food Catalog
    const insertedFoods = await FoodItem.insertMany(
      FOOD_CATALOG.map((f) => ({ ...f, createdBy: null, isPublic: true }))
    );
    console.log(`[Seed] Inserted ${insertedFoods.length} catalog food items.`);

    // Map food names for quick lookup
    const foodMap = new Map<string, any>();
    insertedFoods.forEach((item) => foodMap.set(item.name, item));

    // 3. Generate 30 days of historical data (from 29 days ago to today)
    const today = new Date();
    const dates: string[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }

    // 3A. Activity Logs (30 days)
    const activityLogsToInsert = dates.map((dateStr, idx) => {
      // Realistic step distribution: 7,000 to 14,000 steps with occasional weekend variance
      const isWeekend = idx % 7 === 5 || idx % 7 === 6;
      const baseSteps = isWeekend ? 11500 : 9200;
      const steps = Math.round(baseSteps + (Math.sin(idx) * 2200) + (idx * 50));
      const distanceKm = calculateDistanceKm(steps, demoUser.height);
      const estimatedCaloriesBurned = calculateWalkingCalories(steps, demoUser.currentWeight || 75);

      return {
        userId,
        date: dateStr,
        steps,
        distanceKm,
        estimatedCaloriesBurned,
        source: 'manual' as const,
      };
    });
    await ActivityLog.insertMany(activityLogsToInsert);
    console.log(`[Seed] Inserted ${activityLogsToInsert.length} daily activity logs.`);

    // 3B. Nutrition Logs (30 days x 3-4 meals per day)
    const mealLogsToInsert: any[] = [];
    const roti = foodMap.get('Roti (Whole Wheat Chapati)');
    const rice = foodMap.get('Steamed White Rice');
    const dal = foodMap.get('Yellow Moong Dal Tadka');
    const oats = foodMap.get('Rolled Oats (Cooked)');
    const paneer = foodMap.get('Palak Paneer');
    const rajma = foodMap.get('Rajma Masala (Red Kidney Beans)');
    const banana = foodMap.get('Banana');
    const almonds = foodMap.get('Raw Almonds');
    const whey = foodMap.get('Whey Protein Isolate (Vanilla)');
    const curd = foodMap.get('Curd / Plain Yogurt (Dahi)');
    const greenTea = foodMap.get('Green Tea (Unsweetened)');
    const boiledEgg = foodMap.get('Boiled Egg (Large)');

    dates.forEach((dateStr) => {
      // Breakfast: Oats + Banana + Almonds
      const bItems = [
        { foodItemId: oats._id, name: oats.name, servingSize: oats.servingSize, servingUnit: oats.servingUnit, quantity: 1, calories: oats.calories, protein: oats.protein, carbs: oats.carbs, fat: oats.fat, fiber: oats.fiber },
        { foodItemId: banana._id, name: banana.name, servingSize: banana.servingSize, servingUnit: banana.servingUnit, quantity: 1, calories: banana.calories, protein: banana.protein, carbs: banana.carbs, fat: banana.fat, fiber: banana.fiber },
        { foodItemId: almonds._id, name: almonds.name, servingSize: almonds.servingSize, servingUnit: almonds.servingUnit, quantity: 1, calories: almonds.calories, protein: almonds.protein, carbs: almonds.carbs, fat: almonds.fat, fiber: almonds.fiber },
      ];
      mealLogsToInsert.push({
        userId,
        date: dateStr,
        mealType: 'breakfast',
        items: bItems,
        totalCalories: Math.round(bItems.reduce((s, i) => s + i.calories, 0)),
        totalProtein: Math.round(bItems.reduce((s, i) => s + i.protein, 0) * 10) / 10,
        totalCarbs: Math.round(bItems.reduce((s, i) => s + i.carbs, 0) * 10) / 10,
        totalFat: Math.round(bItems.reduce((s, i) => s + i.fat, 0) * 10) / 10,
        totalFiber: Math.round(bItems.reduce((s, i) => s + i.fiber, 0) * 10) / 10,
      });

      // Lunch: Roti (2) + Dal + Curd
      const lItems = [
        { foodItemId: roti._id, name: roti.name, servingSize: roti.servingSize, servingUnit: roti.servingUnit, quantity: 2, calories: roti.calories * 2, protein: roti.protein * 2, carbs: roti.carbs * 2, fat: roti.fat * 2, fiber: roti.fiber * 2 },
        { foodItemId: dal._id, name: dal.name, servingSize: dal.servingSize, servingUnit: dal.servingUnit, quantity: 1, calories: dal.calories, protein: dal.protein, carbs: dal.carbs, fat: dal.fat, fiber: dal.fiber },
        { foodItemId: curd._id, name: curd.name, servingSize: curd.servingSize, servingUnit: curd.servingUnit, quantity: 1, calories: curd.calories, protein: curd.protein, carbs: curd.carbs, fat: curd.fat, fiber: curd.fiber },
      ];
      mealLogsToInsert.push({
        userId,
        date: dateStr,
        mealType: 'lunch',
        items: lItems,
        totalCalories: Math.round(lItems.reduce((s, i) => s + i.calories, 0)),
        totalProtein: Math.round(lItems.reduce((s, i) => s + i.protein, 0) * 10) / 10,
        totalCarbs: Math.round(lItems.reduce((s, i) => s + i.carbs, 0) * 10) / 10,
        totalFat: Math.round(lItems.reduce((s, i) => s + i.fat, 0) * 10) / 10,
        totalFiber: Math.round(lItems.reduce((s, i) => s + i.fiber, 0) * 10) / 10,
      });

      // Snack: Whey or Eggs + Green Tea
      const sItems = [
        { foodItemId: whey._id, name: whey.name, servingSize: whey.servingSize, servingUnit: whey.servingUnit, quantity: 1, calories: whey.calories, protein: whey.protein, carbs: whey.carbs, fat: whey.fat, fiber: whey.fiber },
        { foodItemId: greenTea._id, name: greenTea.name, servingSize: greenTea.servingSize, servingUnit: greenTea.servingUnit, quantity: 1, calories: greenTea.calories, protein: greenTea.protein, carbs: greenTea.carbs, fat: greenTea.fat, fiber: greenTea.fiber },
      ];
      mealLogsToInsert.push({
        userId,
        date: dateStr,
        mealType: 'snack',
        items: sItems,
        totalCalories: Math.round(sItems.reduce((s, i) => s + i.calories, 0)),
        totalProtein: Math.round(sItems.reduce((s, i) => s + i.protein, 0) * 10) / 10,
        totalCarbs: Math.round(sItems.reduce((s, i) => s + i.carbs, 0) * 10) / 10,
        totalFat: Math.round(sItems.reduce((s, i) => s + i.fat, 0) * 10) / 10,
        totalFiber: Math.round(sItems.reduce((s, i) => s + i.fiber, 0) * 10) / 10,
      });

      // Dinner: Rice + Rajma or Palak Paneer + Boiled Eggs
      const dItems = [
        { foodItemId: rice._id, name: rice.name, servingSize: rice.servingSize, servingUnit: rice.servingUnit, quantity: 1, calories: rice.calories, protein: rice.protein, carbs: rice.carbs, fat: rice.fat, fiber: rice.fiber },
        { foodItemId: rajma._id, name: rajma.name, servingSize: rajma.servingSize, servingUnit: rajma.servingUnit, quantity: 1, calories: rajma.calories, protein: rajma.protein, carbs: rajma.carbs, fat: rajma.fat, fiber: rajma.fiber },
        { foodItemId: boiledEgg._id, name: boiledEgg.name, servingSize: boiledEgg.servingSize, servingUnit: boiledEgg.servingUnit, quantity: 2, calories: boiledEgg.calories * 2, protein: boiledEgg.protein * 2, carbs: boiledEgg.carbs * 2, fat: boiledEgg.fat * 2, fiber: 0 },
      ];
      mealLogsToInsert.push({
        userId,
        date: dateStr,
        mealType: 'dinner',
        items: dItems,
        totalCalories: Math.round(dItems.reduce((s, i) => s + i.calories, 0)),
        totalProtein: Math.round(dItems.reduce((s, i) => s + i.protein, 0) * 10) / 10,
        totalCarbs: Math.round(dItems.reduce((s, i) => s + i.carbs, 0) * 10) / 10,
        totalFat: Math.round(dItems.reduce((s, i) => s + i.fat, 0) * 10) / 10,
        totalFiber: Math.round(dItems.reduce((s, i) => s + i.fiber, 0) * 10) / 10,
      });
    });
    await MealLog.insertMany(mealLogsToInsert);
    console.log(`[Seed] Inserted ${mealLogsToInsert.length} meal entries across 30 days.`);

    // 3C. Workout Sessions (20 workouts across the 30 days)
    const workoutLogsToInsert: any[] = [];
    const workoutTypes = ['strength_training', 'running', 'strength_training', 'cycling', 'yoga'] as const;

    dates.forEach((dateStr, idx) => {
      // 20 workouts out of 30 days (~4-5 days a week)
      if (idx % 3 !== 0) {
        const type = workoutTypes[idx % workoutTypes.length];
        const durationMinutes = 45 + (idx % 5) * 5; // 45 to 65 mins

        let exercises: any[] = [];
        if (type === 'strength_training') {
          exercises = [
            {
              exerciseName: 'Barbell Squat',
              sets: [
                { setNumber: 1, reps: 10, weightKg: 70, restTimeSeconds: 90 },
                { setNumber: 2, reps: 8, weightKg: 80, restTimeSeconds: 90 },
                { setNumber: 3, reps: 6, weightKg: 90, restTimeSeconds: 120 },
              ],
            },
            {
              exerciseName: 'Bench Press',
              sets: [
                { setNumber: 1, reps: 10, weightKg: 60, restTimeSeconds: 90 },
                { setNumber: 2, reps: 8, weightKg: 70, restTimeSeconds: 90 },
                { setNumber: 3, reps: 6, weightKg: 75, restTimeSeconds: 120 },
              ],
            },
            {
              exerciseName: 'Barbell Row',
              sets: [
                { setNumber: 1, reps: 10, weightKg: 50, restTimeSeconds: 60 },
                { setNumber: 2, reps: 10, weightKg: 55, restTimeSeconds: 60 },
              ],
            },
          ];
        }

        const estimatedCalories = Math.round(durationMinutes * 7.5);

        workoutLogsToInsert.push({
          userId,
          date: dateStr,
          workoutType: type,
          durationMinutes,
          exercises,
          estimatedCaloriesBurned: estimatedCalories,
          notes: `Solid ${type.replace('_', ' ')} session. High energy and good recovery.`,
        });
      }
    });
    await WorkoutLog.insertMany(workoutLogsToInsert);
    console.log(`[Seed] Inserted ${workoutLogsToInsert.length} workout logs.`);

    // 3D. Sleep Entries (30 days crossing midnight)
    const sleepLogsToInsert = dates.map((dateStr, idx) => {
      const prevDate = new Date(dateStr);
      prevDate.setDate(prevDate.getDate() - 1);
      const prevStr = prevDate.toISOString().split('T')[0];

      // Sleep from ~23:15 to ~07:15 (around 480 mins / 8 hrs)
      const sleepStart = new Date(`${prevStr}T23:15:00.000Z`);
      const variance = (Math.sin(idx) * 40); // +/- 40 minutes
      const durationMinutes = Math.round(460 + variance);
      const sleepEnd = new Date(sleepStart.getTime() + durationMinutes * 60 * 1000);
      const quality = Math.max(3, Math.min(5, Math.round(4 + Math.sin(idx))));

      return {
        userId,
        sleepStart,
        sleepEnd,
        durationMinutes,
        quality,
        notes: quality >= 4 ? 'Woke up refreshed with good focus' : 'Restless first hour',
      };
    });
    await SleepLog.insertMany(sleepLogsToInsert);
    console.log(`[Seed] Inserted ${sleepLogsToInsert.length} sleep records crossing midnight.`);

    // 3E. Water Consumption (30 days with multiple glasses/bottles per day)
    const waterLogsToInsert: any[] = [];
    dates.forEach((dateStr) => {
      // 5-6 logs throughout each day (total 2600ml - 3200ml)
      const times = ['08:00', '11:00', '13:30', '16:00', '19:00', '21:30'];
      times.forEach((time) => {
        waterLogsToInsert.push({
          userId,
          timestamp: new Date(`${dateStr}T${time}:00.000Z`),
          amountMl: 500, // 500ml per intake
        });
      });
    });
    await WaterLog.insertMany(waterLogsToInsert);
    console.log(`[Seed] Inserted ${waterLogsToInsert.length} hydration entries across 30 days.`);

    // 3F. Body Measurements (Weekly progress across 30 days)
    const measurementDates = [dates[0], dates[7], dates[14], dates[21], dates[29]];
    const weightProgression = [77.5, 77.0, 76.4, 75.9, 75.5]; // Healthy weight management progression
    const waistProgression = [85, 84.5, 84.0, 83.5, 83.0];

    const measurementsToInsert = measurementDates.map((d, i) => ({
      userId,
      date: d,
      weightKg: weightProgression[i],
      waistCm: waistProgression[i],
      hipCm: 98.0,
      chestCm: 102.0,
      armCm: 37.5 + (i * 0.1),
      thighCm: 56.5,
      notes: i === 0 ? 'Baseline measurement' : `Week ${i} check-in, feeling leaner and stronger`,
    }));
    await BodyMeasurement.insertMany(measurementsToInsert);
    console.log(`[Seed] Inserted ${measurementsToInsert.length} body measurements.`);

    // 3G. Fitness Goals
    const goalsToInsert = [
      { userId, goalType: 'steps', targetValue: 10000, unit: 'steps', isActive: true },
      { userId, goalType: 'calories', targetValue: 2300, unit: 'kcal', isActive: true },
      { userId, goalType: 'protein', targetValue: 140, unit: 'g', isActive: true },
      { userId, goalType: 'water', targetValue: 3000, unit: 'ml', isActive: true },
      { userId, goalType: 'sleep', targetValue: 480, unit: 'minutes', isActive: true },
      { userId, goalType: 'workouts', targetValue: 4, unit: 'sessions/week', isActive: true },
      { userId, goalType: 'weight', targetValue: 74.0, unit: 'kg', isActive: true },
    ];
    await Goal.insertMany(goalsToInsert);
    console.log(`[Seed] Inserted ${goalsToInsert.length} active fitness goals.`);

    // 3H. Workout Templates
    const templatesToInsert = [
      {
        userId,
        name: 'Full Body Strength & Power',
        category: 'strength_training',
        exercises: [
          { exerciseName: 'Barbell Back Squat', defaultSets: 4, defaultReps: 8, defaultWeightKg: 80 },
          { exerciseName: 'Flat Barbell Bench Press', defaultSets: 4, defaultReps: 8, defaultWeightKg: 70 },
          { exerciseName: 'Bent Over Barbell Row', defaultSets: 3, defaultReps: 10, defaultWeightKg: 55 },
          { exerciseName: 'Overhead Shoulder Press', defaultSets: 3, defaultReps: 10, defaultWeightKg: 40 },
        ],
      },
      {
        userId,
        name: 'HIIT Cardio Core',
        category: 'cardio',
        exercises: [
          { exerciseName: 'Treadmill Intervals', defaultSets: 8, defaultReps: 1, defaultWeightKg: 0 },
          { exerciseName: 'Hanging Leg Raises', defaultSets: 3, defaultReps: 15, defaultWeightKg: 0 },
        ],
      },
    ];
    await WorkoutTemplate.insertMany(templatesToInsert);
    console.log(`[Seed] Inserted ${templatesToInsert.length} reusable workout templates.`);

    console.log('========================================================');
    console.log('  FitPulse Database Seed Completed Successfully!');
    console.log(`  Demo User Email:    ${DEMO_EMAIL}`);
    console.log(`  Demo User Password: ${DEMO_PASSWORD}`);
    console.log('========================================================');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Failed to populate database:', error);
    process.exit(1);
  }
};

// Execute if run directly
seedDatabase();
