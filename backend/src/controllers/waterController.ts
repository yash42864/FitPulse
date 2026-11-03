import { Request, Response, NextFunction } from 'express';
import { WaterLog } from '../models/WaterLog.js';
import { WaterLogInputSchema } from '../validators/schemas.js';

export const getWaterLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const dateStr = (req.query.date as string) || new Date().toISOString().split('T')[0];

    const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);

    const logs = await WaterLog.find({
      userId,
      timestamp: { $gte: startOfDay, $lte: endOfDay },
    }).sort({ timestamp: -1 });

    const totalTodayMl = logs.reduce((sum, item) => sum + item.amountMl, 0);

    // Also get last 7 days daily totals for the hydration trend
    const sevenDaysAgo = new Date(startOfDay);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const weeklyTrend = await WaterLog.aggregate([
      {
        $match: {
          userId: logs[0]?.userId || req.user!.id ? new (await import('mongoose')).default.Types.ObjectId(userId) : undefined,
          timestamp: { $gte: sevenDaysAgo, $lte: endOfDay },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          totalMl: { $sum: '$amountMl' },
        },
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          totalMl: 1,
        },
      },
      { $sort: { date: 1 } },
    ]);

    res.status(200).json({
      success: true,
      date: dateStr,
      totalTodayMl,
      entries: logs,
      weeklyTrend,
    });
  } catch (error) {
    next(error);
  }
};

export const addWaterLog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const validatedData = WaterLogInputSchema.parse(req.body);

    const timestamp = validatedData.timestamp ? new Date(validatedData.timestamp) : new Date();

    const log = await WaterLog.create({
      userId,
      timestamp,
      amountMl: validatedData.amountMl,
    });

    res.status(201).json({
      success: true,
      message: 'Water logged successfully',
      data: log,
    });
  } catch (error) {
    next(error);
  }
};

export const updateWaterLog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const validatedData = WaterLogInputSchema.parse(req.body);

    const updated = await WaterLog.findOneAndUpdate(
      { _id: id, userId },
      {
        $set: {
          amountMl: validatedData.amountMl,
          ...(validatedData.timestamp ? { timestamp: new Date(validatedData.timestamp) } : {}),
        },
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      res.status(404).json({ success: false, message: 'Water log entry not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Water entry updated',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteWaterLog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const deleted = await WaterLog.findOneAndDelete({ _id: id, userId });
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Water log entry not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'Water entry deleted' });
  } catch (error) {
    next(error);
  }
};
