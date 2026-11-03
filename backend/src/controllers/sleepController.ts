import { Request, Response, NextFunction } from 'express';
import { SleepLog } from '../models/SleepLog.js';
import { SleepLogInputSchema } from '../validators/schemas.js';
import { calculateSleepDurationMinutes } from '../utils/calculations.js';

export const getSleepLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 30, 100);
    const skip = (page - 1) * limit;

    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    const query: any = { userId };
    if (startDate && endDate) {
      query.sleepStart = {
        $gte: new Date(startDate),
        $lte: new Date(endDate + 'T23:59:59.999Z'),
      };
    }

    const [logs, total] = await Promise.all([
      SleepLog.find(query).sort({ sleepStart: -1 }).skip(skip).limit(limit),
      SleepLog.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createSleepLog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const validatedData = SleepLogInputSchema.parse(req.body);

    const start = new Date(validatedData.sleepStart);
    const end = new Date(validatedData.sleepEnd);

    // Calculate duration in minutes if not supplied or verifying across midnight
    const durationMinutes = validatedData.durationMinutes !== undefined
      ? validatedData.durationMinutes
      : calculateSleepDurationMinutes(start, end);

    const sleepLog = await SleepLog.create({
      userId,
      sleepStart: start,
      sleepEnd: end,
      durationMinutes,
      quality: validatedData.quality,
      notes: validatedData.notes,
    });

    res.status(201).json({
      success: true,
      message: 'Sleep log recorded successfully',
      data: sleepLog,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSleepLog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const validatedData = SleepLogInputSchema.parse(req.body);

    const start = new Date(validatedData.sleepStart);
    const end = new Date(validatedData.sleepEnd);

    const durationMinutes = validatedData.durationMinutes !== undefined
      ? validatedData.durationMinutes
      : calculateSleepDurationMinutes(start, end);

    const updated = await SleepLog.findOneAndUpdate(
      { _id: id, userId },
      {
        $set: {
          sleepStart: start,
          sleepEnd: end,
          durationMinutes,
          quality: validatedData.quality,
          notes: validatedData.notes,
        },
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      res.status(404).json({ success: false, message: 'Sleep log not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Sleep log updated',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSleepLog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const deleted = await SleepLog.findOneAndDelete({ _id: id, userId });
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Sleep log not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'Sleep log deleted' });
  } catch (error) {
    next(error);
  }
};
