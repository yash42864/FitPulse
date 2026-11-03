import mongoose, { Types } from 'mongoose';
import { ActivityLog } from '../models/ActivityLog.js';
import { MealLog } from '../models/MealLog.js';
import { WorkoutLog } from '../models/WorkoutLog.js';
import { SleepLog } from '../models/SleepLog.js';
import { WaterLog } from '../models/WaterLog.js';
import { BodyMeasurement } from '../models/BodyMeasurement.js';
import { Goal } from '../models/Goal.js';
import { User } from '../models/User.js';

/**
 * FitPulse Advanced MongoDB Aggregation Pipelines
 * Academic Implementation & Demonstration Service
 */
export class AnalyticsService {
  /**
   * PIPELINE 1: Weekly Step Analysis
   * Groups step entries by calendar day, computes stats, comparison with goal
   */
  static async getWeeklyStepAnalysis(userId: string, startDate?: string, endDate?: string) {
    const userObjectId = new Types.ObjectId(userId);
    
    // Default to last 7 days if not provided
    const matchFilter: any = { userId: userObjectId };
    if (startDate && endDate) {
      matchFilter.date = { $gte: startDate, $lte: endDate };
    }

    const pipeline: mongoose.PipelineStage[] = [
      { $match: matchFilter },
      { $sort: { date: 1 } },
      {
        $group: {
          _id: '$date',
          totalSteps: { $sum: '$steps' },
          totalDistanceKm: { $sum: '$distanceKm' },
          totalCaloriesBurned: { $sum: '$estimatedCaloriesBurned' },
          logCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          steps: '$totalSteps',
          distanceKm: { $round: ['$totalDistanceKm', 2] },
          caloriesBurned: '$totalCaloriesBurned',
        },
      },
      { $sort: { date: 1 } },
    ];

    const dailyBreakdown = await ActivityLog.aggregate(pipeline);

    // Compute summary stats with facet/aggregation
    const summaryPipeline: mongoose.PipelineStage[] = [
      { $match: matchFilter },
      {
        $group: {
          _id: null,
          totalSteps: { $sum: '$steps' },
          avgDailySteps: { $avg: '$steps' },
          maxSteps: { $max: '$steps' },
          minSteps: { $min: '$steps' },
          totalDistanceKm: { $sum: '$distanceKm' },
          totalCaloriesBurned: { $sum: '$estimatedCaloriesBurned' },
          activeDaysCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          totalSteps: 1,
          avgDailySteps: { $round: ['$avgDailySteps', 0] },
          maxSteps: 1,
          minSteps: 1,
          totalDistanceKm: { $round: ['$totalDistanceKm', 2] },
          totalCaloriesBurned: 1,
          activeDaysCount: 1,
        },
      },
    ];

    const summaryResult = await ActivityLog.aggregate(summaryPipeline);
    const summary = summaryResult[0] || {
      totalSteps: 0,
      avgDailySteps: 0,
      maxSteps: 0,
      minSteps: 0,
      totalDistanceKm: 0,
      totalCaloriesBurned: 0,
      activeDaysCount: 0,
    };

    return { dailyBreakdown, summary };
  }

  /**
   * PIPELINE 2: Nutrition Analysis
   * Uses $unwind, $group, and $sum to calculate calories, macronutrients, and meal distribution
   */
  static async getNutritionAnalysis(userId: string, startDate?: string, endDate?: string) {
    const userObjectId = new Types.ObjectId(userId);
    const matchFilter: any = { userId: userObjectId };
    if (startDate && endDate) {
      matchFilter.date = { $gte: startDate, $lte: endDate };
    }

    // Pipeline 2A: Daily macro & calorie totals
    const dailyNutrition = await MealLog.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$date',
          totalCalories: { $sum: '$totalCalories' },
          totalProtein: { $sum: '$totalProtein' },
          totalCarbs: { $sum: '$totalCarbs' },
          totalFat: { $sum: '$totalFat' },
          totalFiber: { $sum: '$totalFiber' },
          mealsCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          calories: { $round: ['$totalCalories', 0] },
          protein: { $round: ['$totalProtein', 1] },
          carbs: { $round: ['$totalCarbs', 1] },
          fat: { $round: ['$totalFat', 1] },
          fiber: { $round: ['$totalFiber', 1] },
          mealsCount: 1,
        },
      },
      { $sort: { date: 1 } },
    ]);

    // Pipeline 2B: Unwind items to analyze meal distribution and item level totals
    const categoryDistribution = await MealLog.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$mealType',
          totalCalories: { $sum: '$totalCalories' },
          totalProtein: { $sum: '$totalProtein' },
          totalCarbs: { $sum: '$totalCarbs' },
          totalFat: { $sum: '$totalFat' },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          mealType: '$_id',
          calories: { $round: ['$totalCalories', 0] },
          protein: { $round: ['$totalProtein', 1] },
          carbs: { $round: ['$totalCarbs', 1] },
          fat: { $round: ['$totalFat', 1] },
          count: 1,
        },
      },
    ]);

    // Pipeline 2C: Overall Macro Averages
    const averagesResult = await MealLog.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$date',
          dayCalories: { $sum: '$totalCalories' },
          dayProtein: { $sum: '$totalProtein' },
          dayCarbs: { $sum: '$totalCarbs' },
          dayFat: { $sum: '$totalFat' },
        },
      },
      {
        $group: {
          _id: null,
          avgDailyCalories: { $avg: '$dayCalories' },
          avgDailyProtein: { $avg: '$dayProtein' },
          avgDailyCarbs: { $avg: '$dayCarbs' },
          avgDailyFat: { $avg: '$dayFat' },
          loggedDays: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          avgDailyCalories: { $round: ['$avgDailyCalories', 0] },
          avgDailyProtein: { $round: ['$avgDailyProtein', 1] },
          avgDailyCarbs: { $round: ['$avgDailyCarbs', 1] },
          avgDailyFat: { $round: ['$avgDailyFat', 1] },
          loggedDays: 1,
        },
      },
    ]);

    return {
      dailyNutrition,
      categoryDistribution,
      averages: averagesResult[0] || {
        avgDailyCalories: 0,
        avgDailyProtein: 0,
        avgDailyCarbs: 0,
        avgDailyFat: 0,
        loggedDays: 0,
      },
    };
  }

  /**
   * PIPELINE 3: Workout Analysis
   * Groups workouts by category, calculates frequency, total duration, and volume
   */
  static async getWorkoutAnalysis(userId: string, startDate?: string, endDate?: string) {
    const userObjectId = new Types.ObjectId(userId);
    const matchFilter: any = { userId: userObjectId };
    if (startDate && endDate) {
      matchFilter.date = { $gte: startDate, $lte: endDate };
    }

    // Category aggregation
    const categoryStats = await WorkoutLog.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$workoutType',
          sessionCount: { $sum: 1 },
          totalDurationMinutes: { $sum: '$durationMinutes' },
          avgDurationMinutes: { $avg: '$durationMinutes' },
          totalCaloriesBurned: { $sum: '$estimatedCaloriesBurned' },
        },
      },
      {
        $project: {
          _id: 0,
          workoutType: '$_id',
          sessionCount: 1,
          totalDurationMinutes: 1,
          avgDurationMinutes: { $round: ['$avgDurationMinutes', 1] },
          totalCaloriesBurned: 1,
        },
      },
      { $sort: { sessionCount: -1 } },
    ]);

    // Training volume aggregation by unwinding exercises and sets
    const volumeStats = await WorkoutLog.aggregate([
      { $match: matchFilter },
      { $unwind: '$exercises' },
      { $unwind: '$exercises.sets' },
      {
        $project: {
          exerciseName: '$exercises.exerciseName',
          setVolume: {
            $multiply: [
              { $ifNull: ['$exercises.sets.reps', 0] },
              { $ifNull: ['$exercises.sets.weightKg', 0] },
            ],
          },
          weight: '$exercises.sets.weightKg',
          reps: '$exercises.sets.reps',
        },
      },
      {
        $group: {
          _id: '$exerciseName',
          totalVolumeKg: { $sum: '$setVolume' },
          maxWeightLifted: { $max: '$weight' },
          totalSets: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          exerciseName: '$_id',
          totalVolumeKg: { $round: ['$totalVolumeKg', 1] },
          maxWeightLifted: 1,
          totalSets: 1,
        },
      },
      { $sort: { totalVolumeKg: -1 } },
      { $limit: 10 },
    ]);

    // Overall workout timeline
    const timeline = await WorkoutLog.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$date',
          durationMinutes: { $sum: '$durationMinutes' },
          caloriesBurned: { $sum: '$estimatedCaloriesBurned' },
          workoutsCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          durationMinutes: 1,
          caloriesBurned: 1,
          workoutsCount: 1,
        },
      },
      { $sort: { date: 1 } },
    ]);

    return { categoryStats, volumeStats, timeline };
  }

  /**
   * PIPELINE 4: Sleep Analysis
   * Calculates average sleep duration, sleep quality, and bedtime consistency
   */
  static async getSleepAnalysis(userId: string, startDate?: string, endDate?: string) {
    const userObjectId = new Types.ObjectId(userId);
    const matchFilter: any = { userId: userObjectId };
    if (startDate && endDate) {
      matchFilter.sleepStart = {
        $gte: new Date(startDate),
        $lte: new Date(endDate + 'T23:59:59.999Z'),
      };
    }

    const trends = await SleepLog.aggregate([
      { $match: matchFilter },
      { $sort: { sleepStart: 1 } },
      {
        $project: {
          _id: 1,
          sleepStart: 1,
          sleepEnd: 1,
          durationMinutes: 1,
          durationHours: { $round: [{ $divide: ['$durationMinutes', 60] }, 1] },
          quality: 1,
          notes: 1,
          dateStr: {
            $dateToString: { format: '%Y-%m-%d', date: '$sleepStart' },
          },
        },
      },
    ]);

    const stats = await SleepLog.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: null,
          avgDurationMinutes: { $avg: '$durationMinutes' },
          avgQuality: { $avg: '$quality' },
          minDurationMinutes: { $min: '$durationMinutes' },
          maxDurationMinutes: { $max: '$durationMinutes' },
          totalEntries: { $sum: 1 },
          stdDevDuration: { $stdDevPop: '$durationMinutes' },
        },
      },
      {
        $project: {
          _id: 0,
          avgDurationMinutes: { $round: ['$avgDurationMinutes', 1] },
          avgDurationHours: { $round: [{ $divide: ['$avgDurationMinutes', 60] }, 1] },
          avgQuality: { $round: ['$avgQuality', 1] },
          minDurationMinutes: 1,
          maxDurationMinutes: 1,
          totalEntries: 1,
          // Sleep consistency score (0-100%): lower stdDev means higher consistency
          sleepConsistencyScore: {
            $max: [
              0,
              {
                $round: [
                  {
                    $subtract: [
                      100,
                      { $multiply: [{ $ifNull: ['$stdDevDuration', 0] }, 0.5] },
                    ],
                  },
                  0,
                ],
              },
            ],
          },
        },
      },
    ]);

    return {
      trends,
      stats: stats[0] || {
        avgDurationMinutes: 0,
        avgDurationHours: 0,
        avgQuality: 0,
        minDurationMinutes: 0,
        maxDurationMinutes: 0,
        totalEntries: 0,
        sleepConsistencyScore: 0,
      },
    };
  }

  /**
   * PIPELINE 5: Calorie Balance Analysis
   * Joins daily intake and expenditure using $lookup and $project
   */
  static async getCalorieBalanceAnalysis(userId: string, startDate?: string, endDate?: string) {
    const userObjectId = new Types.ObjectId(userId);
    const matchFilter: any = { userId: userObjectId };
    if (startDate && endDate) {
      matchFilter.date = { $gte: startDate, $lte: endDate };
    }

    // Start from ActivityLog and join MealLog & WorkoutLog by date and user
    const calorieBalance = await ActivityLog.aggregate([
      { $match: matchFilter },
      // Lookup meals on same date
      {
        $lookup: {
          from: 'meallogs',
          let: { logDate: '$date', uId: '$userId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$userId', '$$uId'] },
                    { $eq: ['$date', '$$logDate'] },
                  ],
                },
              },
            },
            {
              $group: {
                _id: null,
                totalConsumed: { $sum: '$totalCalories' },
              },
            },
          ],
          as: 'mealData',
        },
      },
      // Lookup workouts on same date
      {
        $lookup: {
          from: 'workoutlogs',
          let: { logDate: '$date', uId: '$userId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$userId', '$$uId'] },
                    { $eq: ['$date', '$$logDate'] },
                  ],
                },
              },
            },
            {
              $group: {
                _id: null,
                workoutBurned: { $sum: '$estimatedCaloriesBurned' },
              },
            },
          ],
          as: 'workoutData',
        },
      },
      {
        $project: {
          _id: 0,
          date: '$date',
          walkingBurned: '$estimatedCaloriesBurned',
          workoutBurned: {
            $ifNull: [{ $arrayElemAt: ['$workoutData.workoutBurned', 0] }, 0],
          },
          caloriesConsumed: {
            $ifNull: [{ $arrayElemAt: ['$mealData.totalConsumed', 0] }, 0],
          },
        },
      },
      {
        $project: {
          date: 1,
          caloriesConsumed: 1,
          walkingBurned: 1,
          workoutBurned: 1,
          totalBurned: { $add: ['$walkingBurned', '$workoutBurned'] },
          netBalance: {
            $subtract: [
              '$caloriesConsumed',
              { $add: ['$walkingBurned', '$workoutBurned'] },
            ],
          },
        },
      },
      { $sort: { date: 1 } },
    ]);

    return calorieBalance;
  }

  /**
   * PIPELINE 6: Monthly Progress
   * Calculates monthly aggregates across steps, workouts, sleep, and weight
   */
  static async getMonthlyProgress(userId: string) {
    const userObjectId = new Types.ObjectId(userId);

    // Monthly steps
    const monthlySteps = await ActivityLog.aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: { $substr: ['$date', 0, 7] }, // YYYY-MM
          totalSteps: { $sum: '$steps' },
          avgSteps: { $avg: '$steps' },
          totalCaloriesBurned: { $sum: '$estimatedCaloriesBurned' },
          daysCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Monthly workouts
    const monthlyWorkouts = await WorkoutLog.aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: { $substr: ['$date', 0, 7] },
          workoutCount: { $sum: 1 },
          totalMinutes: { $sum: '$durationMinutes' },
          totalCaloriesBurned: { $sum: '$estimatedCaloriesBurned' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Monthly body weight changes
    const monthlyWeight = await BodyMeasurement.aggregate([
      { $match: { userId: userObjectId } },
      { $sort: { date: 1 } },
      {
        $group: {
          _id: { $substr: ['$date', 0, 7] },
          firstWeight: { $first: '$weightKg' },
          lastWeight: { $last: '$weightKg' },
          avgWeight: { $avg: '$weightKg' },
          entryCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 1,
          firstWeight: 1,
          lastWeight: 1,
          avgWeight: { $round: ['$avgWeight', 1] },
          weightChange: { $round: [{ $subtract: ['$lastWeight', '$firstWeight'] }, 2] },
          entryCount: 1,
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return { monthlySteps, monthlyWorkouts, monthlyWeight };
  }

  /**
   * PIPELINE 7: Activity Leaderboard
   * Ranks step-goal completion or consistency among opted-in users (privacy-preserving)
   */
  static async getActivityLeaderboard(days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    const leaderboard = await ActivityLog.aggregate([
      { $match: { date: { $gte: startDateStr } } },
      {
        $group: {
          _id: '$userId',
          totalSteps: { $sum: '$steps' },
          activeDays: { $sum: 1 },
          avgDailySteps: { $avg: '$steps' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          _id: 1,
          // Anonymize/display first name only for privacy
          displayName: {
            $concat: [
              { $arrayElemAt: [{ $split: ['$userInfo.name', ' '] }, 0] },
              ' ',
              {
                $substrCP: [
                  { $ifNull: [{ $arrayElemAt: [{ $split: ['$userInfo.name', ' '] }, 1] }, ''] },
                  0,
                  1,
                ],
              },
              '.',
            ],
          },
          totalSteps: 1,
          avgDailySteps: { $round: ['$avgDailySteps', 0] },
          activeDays: 1,
        },
      },
      { $sort: { totalSteps: -1 } },
      { $limit: 10 },
    ]);

    return leaderboard;
  }

  /**
   * PIPELINE 8: Lifestyle Consistency Score
   * Transparent, configurable composite habit metric (0-100)
   * Formula:
   * - Step Goal Adherence (25% weight)
   * - Workout Regularity (25% weight)
   * - Sleep Target Adherence (20% weight)
   * - Hydration Consistency (15% weight)
   * - Nutrition Logging Adherence (15% weight)
   */
  static async getLifestyleConsistencyScore(userId: string, days: number = 14) {
    const userObjectId = new Types.ObjectId(userId);
    const user = await User.findById(userObjectId);
    if (!user) throw new Error('User not found');

    const stepTarget = user.preferences.dailyStepGoal || 10000;
    const waterTarget = user.preferences.dailyWaterGoal || 2500;
    const sleepTarget = user.preferences.dailySleepGoal || 480;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    // 1. Step Consistency
    const stepAgg = await ActivityLog.aggregate([
      {
        $match: {
          userId: userObjectId,
          date: { $gte: startDateStr },
        },
      },
      {
        $project: {
          ratio: { $min: [1.0, { $divide: ['$steps', stepTarget] }] },
        },
      },
      {
        $group: {
          _id: null,
          avgAdherence: { $avg: '$ratio' },
          loggedDays: { $sum: 1 },
        },
      },
    ]);
    const stepAdherence = stepAgg[0]?.avgAdherence || 0;

    // 2. Workout Consistency (Target: 4 sessions per 14 days or ~2-3/week)
    const workoutAgg = await WorkoutLog.aggregate([
      {
        $match: {
          userId: userObjectId,
          date: { $gte: startDateStr },
        },
      },
      {
        $group: {
          _id: null,
          workoutCount: { $sum: 1 },
        },
      },
    ]);
    const workoutCount = workoutAgg[0]?.workoutCount || 0;
    const expectedWorkouts = Math.max(1, Math.round((days / 7) * 3)); // Target 3 workouts/week
    const workoutAdherence = Math.min(1.0, workoutCount / expectedWorkouts);

    // 3. Sleep Adherence
    const sleepAgg = await SleepLog.aggregate([
      {
        $match: {
          userId: userObjectId,
          sleepStart: { $gte: startDate },
        },
      },
      {
        $project: {
          durationRatio: {
            $subtract: [
              1,
              {
                $min: [
                  1.0,
                  {
                    $abs: {
                      $divide: [{ $subtract: ['$durationMinutes', sleepTarget] }, sleepTarget],
                    },
                  },
                ],
              },
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgSleepAdherence: { $avg: '$durationRatio' },
        },
      },
    ]);
    const sleepAdherence = sleepAgg[0]?.avgSleepAdherence || 0;

    // 4. Hydration Adherence
    const waterAgg = await WaterLog.aggregate([
      {
        $match: {
          userId: userObjectId,
          timestamp: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          dayTotal: { $sum: '$amountMl' },
        },
      },
      {
        $project: {
          ratio: { $min: [1.0, { $divide: ['$dayTotal', waterTarget] }] },
        },
      },
      {
        $group: {
          _id: null,
          avgWaterAdherence: { $avg: '$ratio' },
        },
      },
    ]);
    const waterAdherence = waterAgg[0]?.avgWaterAdherence || 0;

    // 5. Nutrition Logging Consistency
    const mealAgg = await MealLog.aggregate([
      {
        $match: {
          userId: userObjectId,
          date: { $gte: startDateStr },
        },
      },
      {
        $group: {
          _id: '$date',
          mealsInDay: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: null,
          daysWithMeals: { $sum: 1 },
        },
      },
    ]);
    const loggedMealDays = mealAgg[0]?.daysWithMeals || 0;
    const nutritionAdherence = Math.min(1.0, loggedMealDays / days);

    // Calculate weighted consistency score
    const stepScore = Math.round(stepAdherence * 25);
    const workoutScore = Math.round(workoutAdherence * 25);
    const sleepScore = Math.round(sleepAdherence * 20);
    const waterScore = Math.round(waterAdherence * 15);
    const nutritionScore = Math.round(nutritionAdherence * 15);

    const totalScore = stepScore + workoutScore + sleepScore + waterScore + nutritionScore;

    return {
      totalScore: Math.min(100, Math.max(0, totalScore)),
      breakdown: {
        steps: { score: stepScore, max: 25, adherencePercentage: Math.round(stepAdherence * 100) },
        workouts: { score: workoutScore, max: 25, adherencePercentage: Math.round(workoutAdherence * 100) },
        sleep: { score: sleepScore, max: 20, adherencePercentage: Math.round(sleepAdherence * 100) },
        hydration: { score: waterScore, max: 15, adherencePercentage: Math.round(waterAdherence * 100) },
        nutrition: { score: nutritionScore, max: 15, adherencePercentage: Math.round(nutritionAdherence * 100) },
      },
      evaluationWindowDays: days,
      disclaimer: 'Lifestyle Consistency Score is a holistic habit-tracking metric reflecting personal log adherence, not a clinical health diagnosis.',
    };
  }

  /**
   * Main Interactive Overview Dashboard Aggregation
   * Fetches all 6 main KPI cards and summary trends in parallel from MongoDB
   */
  static async getDashboardOverview(userId: string, targetDate?: string) {
    const userObjectId = new Types.ObjectId(userId);
    const user = await User.findById(userObjectId);
    if (!user) throw new Error('User not found');

    const todayStr = targetDate || new Date().toISOString().split('T')[0];

    // Seven days range for charts
    const sevenDaysAgo = new Date(todayStr);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

    // Execute queries in parallel
    const [
      todayStepsLog,
      todayMeals,
      todayWaterAgg,
      recentSleep,
      weekWorkouts,
      weeklySteps,
      calorieBalanceWeek,
      consistencyScore,
      latestWeight,
    ] = await Promise.all([
      // 1. Steps
      ActivityLog.findOne({ userId: userObjectId, date: todayStr }),
      // 2. Nutrition
      MealLog.find({ userId: userObjectId, date: todayStr }),
      // 3. Water
      WaterLog.aggregate([
        {
          $match: {
            userId: userObjectId,
            timestamp: {
              $gte: new Date(todayStr + 'T00:00:00.000Z'),
              $lte: new Date(todayStr + 'T23:59:59.999Z'),
            },
          },
        },
        { $group: { _id: null, total: { $sum: '$amountMl' } } },
      ]),
      // 4. Sleep
      SleepLog.findOne({ userId: userObjectId }).sort({ sleepStart: -1 }),
      // 5. Workouts this week
      WorkoutLog.find({
        userId: userObjectId,
        date: { $gte: sevenDaysAgoStr, $lte: todayStr },
      }),
      // 6. Weekly steps
      this.getWeeklyStepAnalysis(userId, sevenDaysAgoStr, todayStr),
      // 7. Calorie Balance
      this.getCalorieBalanceAnalysis(userId, sevenDaysAgoStr, todayStr),
      // 8. Consistency Score
      this.getLifestyleConsistencyScore(userId, 14),
      // 9. Weight
      BodyMeasurement.findOne({ userId: userObjectId }).sort({ date: -1 }),
    ]);

    // Compute today's nutrition totals
    let consumedCalories = 0;
    let consumedProtein = 0;
    let consumedCarbs = 0;
    let consumedFat = 0;
    for (const m of todayMeals) {
      consumedCalories += m.totalCalories;
      consumedProtein += m.totalProtein;
      consumedCarbs += m.totalCarbs;
      consumedFat += m.totalFat;
    }

    const todayWater = todayWaterAgg[0]?.total || 0;
    const currentSteps = todayStepsLog?.steps || 0;
    const walkingCalories = todayStepsLog?.estimatedCaloriesBurned || 0;

    // Total exercise duration this week
    const totalExerciseDuration = weekWorkouts.reduce((acc, w) => acc + w.durationMinutes, 0);

    return {
      date: todayStr,
      user: {
        name: user.name,
        fitnessGoal: user.fitnessGoal,
        preferences: user.preferences,
      },
      kpis: {
        steps: {
          current: currentSteps,
          target: user.preferences.dailyStepGoal || 10000,
          percentage: Math.min(100, Math.round((currentSteps / (user.preferences.dailyStepGoal || 10000)) * 100)),
          distanceKm: todayStepsLog?.distanceKm || 0,
        },
        calories: {
          consumed: Math.round(consumedCalories),
          burned: Math.round(walkingCalories),
          target: user.preferences.dailyCalorieGoal || 2200,
          balance: Math.round(consumedCalories - walkingCalories),
        },
        water: {
          consumedMl: todayWater,
          targetMl: user.preferences.dailyWaterGoal || 2500,
          percentage: Math.min(100, Math.round((todayWater / (user.preferences.dailyWaterGoal || 2500)) * 100)),
        },
        sleep: {
          lastDurationMinutes: recentSleep?.durationMinutes || 0,
          lastDurationHours: recentSleep ? Number((recentSleep.durationMinutes / 60).toFixed(1)) : 0,
          targetMinutes: user.preferences.dailySleepGoal || 480,
          quality: recentSleep?.quality || 0,
        },
        workout: {
          completedThisWeek: weekWorkouts.length,
          totalDurationMinutes: totalExerciseDuration,
        },
        nutrition: {
          protein: Math.round(consumedProtein),
          proteinGoal: Math.round(user.currentWeight ? user.currentWeight * 1.6 : 120),
          carbs: Math.round(consumedCarbs),
          fat: Math.round(consumedFat),
        },
        weight: {
          currentKg: latestWeight?.weightKg || user.currentWeight || 70,
        },
      },
      visualizations: {
        weeklySteps: weeklySteps.dailyBreakdown,
        calorieBalance: calorieBalanceWeek,
        macroDistribution: [
          { name: 'Protein', value: Math.round(consumedProtein * 4), grams: Math.round(consumedProtein), color: '#A3E635' },
          { name: 'Carbs', value: Math.round(consumedCarbs * 4), grams: Math.round(consumedCarbs), color: '#8B5CF6' },
          { name: 'Fats', value: Math.round(consumedFat * 9), grams: Math.round(consumedFat), color: '#F59E0B' },
        ],
        consistencyScore,
      },
    };
  }
}
