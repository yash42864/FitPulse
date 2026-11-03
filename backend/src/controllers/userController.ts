import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { MealLog } from '../models/MealLog.js';
import { WorkoutLog } from '../models/WorkoutLog.js';
import { SleepLog } from '../models/SleepLog.js';
import { WaterLog } from '../models/WaterLog.js';
import { BodyMeasurement } from '../models/BodyMeasurement.js';
import { Goal } from '../models/Goal.js';
import { UpdateProfileSchema, ChangePasswordSchema } from '../validators/schemas.js';
import { clearAuthCookie } from '../utils/token.js';

export const getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.status(200).json({ success: true, profile: user });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validatedData = UpdateProfileSchema.parse(req.body);

    const updateFields: any = {};
    if (validatedData.name !== undefined) updateFields.name = validatedData.name;
    if (validatedData.dateOfBirth !== undefined) {
      updateFields.dateOfBirth = validatedData.dateOfBirth ? new Date(validatedData.dateOfBirth) : null;
    }
    if (validatedData.height !== undefined) updateFields.height = validatedData.height;
    if (validatedData.currentWeight !== undefined) updateFields.currentWeight = validatedData.currentWeight;
    if (validatedData.activityLevel !== undefined) updateFields.activityLevel = validatedData.activityLevel;
    if (validatedData.fitnessGoal !== undefined) updateFields.fitnessGoal = validatedData.fitnessGoal;
    if (validatedData.timezone !== undefined) updateFields.timezone = validatedData.timezone;

    if (validatedData.preferences) {
      for (const [key, val] of Object.entries(validatedData.preferences)) {
        if (val !== undefined) {
          updateFields[`preferences.${key}`] = val;
        }
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user!.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { currentPassword, newPassword } = ChangePasswordSchema.parse(req.body);

    const user = await User.findById(req.user!.id).select('+passwordHash');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ success: false, message: 'Incorrect current password' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Cascade delete all user records across all collections
    await Promise.all([
      User.findByIdAndDelete(userId),
      ActivityLog.deleteMany({ userId }),
      MealLog.deleteMany({ userId }),
      WorkoutLog.deleteMany({ userId }),
      SleepLog.deleteMany({ userId }),
      WaterLog.deleteMany({ userId }),
      BodyMeasurement.deleteMany({ userId }),
      Goal.deleteMany({ userId }),
    ]);

    clearAuthCookie(res);

    res.status(200).json({
      success: true,
      message: 'Your account and all associated health data have been permanently deleted.',
    });
  } catch (error) {
    next(error);
  }
};
