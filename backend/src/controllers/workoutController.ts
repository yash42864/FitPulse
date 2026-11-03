import { Request, Response, NextFunction } from 'express';
import { WorkoutLog } from '../models/WorkoutLog.js';
import { WorkoutTemplate } from '../models/WorkoutTemplate.js';
import { WorkoutLogInputSchema, WorkoutTemplateInputSchema } from '../validators/schemas.js';
import { calculateWorkoutCalories } from '../utils/calculations.js';

export const getWorkouts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 30, 100);
    const skip = (page - 1) * limit;

    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const workoutType = req.query.workoutType as string;

    const query: any = { userId };
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }
    if (workoutType) {
      query.workoutType = workoutType;
    }

    const [workouts, total] = await Promise.all([
      WorkoutLog.find(query).sort({ date: -1, createdAt: -1 }).skip(skip).limit(limit),
      WorkoutLog.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: workouts,
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

export const createWorkout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const validatedData = WorkoutLogInputSchema.parse(req.body);

    const estimatedCalories = validatedData.estimatedCaloriesBurned !== undefined
      ? validatedData.estimatedCaloriesBurned
      : calculateWorkoutCalories(
          validatedData.workoutType,
          validatedData.durationMinutes,
          req.user?.currentWeight || 70
        );

    const workout = await WorkoutLog.create({
      userId,
      date: validatedData.date,
      workoutType: validatedData.workoutType,
      durationMinutes: validatedData.durationMinutes,
      exercises: validatedData.exercises,
      estimatedCaloriesBurned: estimatedCalories,
      notes: validatedData.notes,
    });

    res.status(201).json({
      success: true,
      message: 'Workout logged successfully',
      data: workout,
    });
  } catch (error) {
    next(error);
  }
};

export const updateWorkout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const validatedData = WorkoutLogInputSchema.parse(req.body);

    const estimatedCalories = validatedData.estimatedCaloriesBurned !== undefined
      ? validatedData.estimatedCaloriesBurned
      : calculateWorkoutCalories(
          validatedData.workoutType,
          validatedData.durationMinutes,
          req.user?.currentWeight || 70
        );

    const updated = await WorkoutLog.findOneAndUpdate(
      { _id: id, userId },
      {
        $set: {
          date: validatedData.date,
          workoutType: validatedData.workoutType,
          durationMinutes: validatedData.durationMinutes,
          exercises: validatedData.exercises,
          estimatedCaloriesBurned: estimatedCalories,
          notes: validatedData.notes,
        },
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      res.status(404).json({ success: false, message: 'Workout not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Workout updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteWorkout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const deleted = await WorkoutLog.findOneAndDelete({ _id: id, userId });
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Workout not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'Workout deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Templates
export const getTemplates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const templates = await WorkoutTemplate.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: templates });
  } catch (error) {
    next(error);
  }
};

export const createTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const validatedData = WorkoutTemplateInputSchema.parse(req.body);

    const template = await WorkoutTemplate.create({
      userId,
      name: validatedData.name,
      category: validatedData.category,
      exercises: validatedData.exercises,
    });

    res.status(201).json({ success: true, message: 'Template saved', data: template });
  } catch (error) {
    next(error);
  }
};

export const deleteTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const deleted = await WorkoutTemplate.findOneAndDelete({ _id: id, userId });
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Template not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'Template deleted' });
  } catch (error) {
    next(error);
  }
};
