import { Request, Response, NextFunction } from 'express';
import { Goal } from '../models/Goal.js';
import { User } from '../models/User.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { MealLog } from '../models/MealLog.js';
import { WaterLog } from '../models/WaterLog.js';
import { SleepLog } from '../models/SleepLog.js';
import { WorkoutLog } from '../models/WorkoutLog.js';
import { BodyMeasurement } from '../models/BodyMeasurement.js';
import { GoalInputSchema } from '../validators/schemas.js';

export const getGoals = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const goals = await Goal.find({ userId }).sort({ isActive: -1, createdAt: -1 });

    const todayStr = new Date().toISOString().split('T')[0];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

    // Compute progress for each active goal
    const goalsWithProgress = await Promise.all(
      goals.map(async (goal) => {
        let current = 0;
        if (goal.goalType === 'steps') {
          const act = await ActivityLog.findOne({ userId, date: todayStr });
          current = act?.steps || 0;
        } else if (goal.goalType === 'calories') {
          const meals = await MealLog.find({ userId, date: todayStr });
          current = meals.reduce((sum, m) => sum + m.totalCalories, 0);
        } else if (goal.goalType === 'protein') {
          const meals = await MealLog.find({ userId, date: todayStr });
          current = meals.reduce((sum, m) => sum + m.totalProtein, 0);
        } else if (goal.goalType === 'water') {
          const start = new Date(`${todayStr}T00:00:00.000Z`);
          const end = new Date(`${todayStr}T23:59:59.999Z`);
          const waterLogs = await WaterLog.find({ userId, timestamp: { $gte: start, $lte: end } });
          current = waterLogs.reduce((sum, w) => sum + w.amountMl, 0);
        } else if (goal.goalType === 'sleep') {
          const recentSleep = await SleepLog.findOne({ userId }).sort({ sleepStart: -1 });
          current = recentSleep?.durationMinutes || 0;
        } else if (goal.goalType === 'workouts') {
          const weekWorkouts = await WorkoutLog.countDocuments({
            userId,
            date: { $gte: sevenDaysAgoStr, $lte: todayStr },
          });
          current = weekWorkouts;
        } else if (goal.goalType === 'weight') {
          const latestWeight = await BodyMeasurement.findOne({ userId }).sort({ date: -1 });
          current = latestWeight?.weightKg || 0;
        }

        const percentage = goal.targetValue > 0 ? Math.round((current / goal.targetValue) * 100) : 0;

        return {
          ...goal.toObject(),
          currentProgress: Math.round(current * 10) / 10,
          percentage: Math.min(200, percentage),
        };
      })
    );

    res.status(200).json({
      success: true,
      data: goalsWithProgress,
    });
  } catch (error) {
    next(error);
  }
};

export const createGoal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const validatedData = GoalInputSchema.parse(req.body);

    // Deactivate previous active goal of same type
    await Goal.updateMany(
      { userId, goalType: validatedData.goalType, isActive: true },
      { $set: { isActive: false, effectiveTo: new Date() } }
    );

    const goal = await Goal.create({
      userId,
      goalType: validatedData.goalType,
      targetValue: validatedData.targetValue,
      unit: validatedData.unit,
      effectiveFrom: validatedData.effectiveFrom ? new Date(validatedData.effectiveFrom) : new Date(),
      effectiveTo: validatedData.effectiveTo ? new Date(validatedData.effectiveTo) : undefined,
      isActive: validatedData.isActive,
    });

    // Sync preference on user profile if relevant
    const prefFieldMap: Record<string, string> = {
      steps: 'preferences.dailyStepGoal',
      calories: 'preferences.dailyCalorieGoal',
      water: 'preferences.dailyWaterGoal',
      sleep: 'preferences.dailySleepGoal',
    };

    if (prefFieldMap[validatedData.goalType]) {
      await User.findByIdAndUpdate(userId, {
        [prefFieldMap[validatedData.goalType]]: validatedData.targetValue,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Goal established successfully',
      data: goal,
    });
  } catch (error) {
    next(error);
  }
};

export const updateGoal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const validatedData = GoalInputSchema.parse(req.body);

    const updated = await Goal.findOneAndUpdate(
      { _id: id, userId },
      {
        $set: {
          goalType: validatedData.goalType,
          targetValue: validatedData.targetValue,
          unit: validatedData.unit,
          isActive: validatedData.isActive,
          effectiveTo: validatedData.effectiveTo ? new Date(validatedData.effectiveTo) : undefined,
        },
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      res.status(404).json({ success: false, message: 'Goal not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Goal updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteGoal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const deleted = await Goal.findOneAndDelete({ _id: id, userId });
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Goal not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'Goal deleted' });
  } catch (error) {
    next(error);
  }
};
