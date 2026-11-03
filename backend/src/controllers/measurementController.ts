import { Request, Response, NextFunction } from 'express';
import { BodyMeasurement } from '../models/BodyMeasurement.js';
import { User } from '../models/User.js';
import { BodyMeasurementInputSchema } from '../validators/schemas.js';

export const getMeasurements = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const skip = (page - 1) * limit;

    const [measurements, total] = await Promise.all([
      BodyMeasurement.find({ userId }).sort({ date: -1 }).skip(skip).limit(limit),
      BodyMeasurement.countDocuments({ userId }),
    ]);

    // Compute progress delta between latest and oldest in history
    const allAscending = await BodyMeasurement.find({ userId }).sort({ date: 1 });
    let totalWeightChange = 0;
    if (allAscending.length >= 2) {
      totalWeightChange = Number((allAscending[allAscending.length - 1].weightKg - allAscending[0].weightKg).toFixed(1));
    }

    res.status(200).json({
      success: true,
      data: measurements,
      totalWeightChange,
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

export const addMeasurement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const validatedData = BodyMeasurementInputSchema.parse(req.body);

    const measurement = await BodyMeasurement.findOneAndUpdate(
      { userId, date: validatedData.date },
      {
        $set: {
          weightKg: validatedData.weightKg,
          waistCm: validatedData.waistCm,
          hipCm: validatedData.hipCm,
          chestCm: validatedData.chestCm,
          armCm: validatedData.armCm,
          thighCm: validatedData.thighCm,
          notes: validatedData.notes,
        },
      },
      { upsert: true, new: true, runValidators: true }
    );

    // Also update user's currentWeight on their profile
    await User.findByIdAndUpdate(userId, { currentWeight: validatedData.weightKg });

    res.status(201).json({
      success: true,
      message: 'Body measurement recorded',
      data: measurement,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMeasurement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const validatedData = BodyMeasurementInputSchema.parse(req.body);

    const updated = await BodyMeasurement.findOneAndUpdate(
      { _id: id, userId },
      {
        $set: {
          date: validatedData.date,
          weightKg: validatedData.weightKg,
          waistCm: validatedData.waistCm,
          hipCm: validatedData.hipCm,
          chestCm: validatedData.chestCm,
          armCm: validatedData.armCm,
          thighCm: validatedData.thighCm,
          notes: validatedData.notes,
        },
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      res.status(404).json({ success: false, message: 'Measurement not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Measurement updated',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMeasurement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const deleted = await BodyMeasurement.findOneAndDelete({ _id: id, userId });
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Measurement not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'Measurement deleted' });
  } catch (error) {
    next(error);
  }
};
