import { Request, Response, NextFunction } from 'express';
import { ActivityLog } from '../models/ActivityLog.js';
import { ActivityLogSchema } from '../validators/schemas.js';
import { calculateDistanceKm, calculateWalkingCalories } from '../utils/calculations.js';

export const getActivityLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 30, 100);
    const skip = (page - 1) * limit;

    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    const query: any = { userId };
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    const [logs, total] = await Promise.all([
      ActivityLog.find(query).sort({ date: -1 }).skip(skip).limit(limit),
      ActivityLog.countDocuments(query),
    ]);

    // Calculate current streak
    const allRecentDates = await ActivityLog.find({ userId }).sort({ date: -1 }).select('date steps').limit(60);
    let currentStreak = 0;
    const todayStr = new Date().toISOString().split('T')[0];
    let checkDate = new Date(todayStr);

    for (let i = 0; i < allRecentDates.length; i++) {
      const expectedStr = checkDate.toISOString().split('T')[0];
      const match = allRecentDates.find((item) => item.date === expectedStr);
      if (match && match.steps > 0) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // If today has no entry yet, check yesterday before breaking streak
        if (i === 0 && expectedStr === todayStr) {
          checkDate.setDate(checkDate.getDate() - 1);
          continue;
        }
        break;
      }
    }

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      currentStreak,
    });
  } catch (error) {
    next(error);
  }
};

export const createOrUpdateActivityLog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const validatedData = ActivityLogSchema.parse(req.body);

    // Calculate distance and calories if not manually supplied
    const distanceKm = validatedData.distanceKm !== undefined
      ? validatedData.distanceKm
      : calculateDistanceKm(validatedData.steps, req.user?.height);

    const estimatedCaloriesBurned = validatedData.estimatedCaloriesBurned !== undefined
      ? validatedData.estimatedCaloriesBurned
      : calculateWalkingCalories(validatedData.steps, req.user?.currentWeight || 70);

    const log = await ActivityLog.findOneAndUpdate(
      { userId, date: validatedData.date },
      {
        $set: {
          steps: validatedData.steps,
          distanceKm,
          estimatedCaloriesBurned,
          source: validatedData.source || 'manual',
        },
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Activity log saved successfully',
      data: log,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteActivityLog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const deleted = await ActivityLog.findOneAndDelete({ _id: id, userId });
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Activity record not found or unauthorized' });
      return;
    }

    res.status(200).json({ success: true, message: 'Activity record deleted successfully' });
  } catch (error) {
    next(error);
  }
};
