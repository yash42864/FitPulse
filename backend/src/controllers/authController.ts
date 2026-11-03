import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { RegisterSchema, LoginSchema } from '../validators/schemas.js';
import { generateToken, setAuthCookie, clearAuthCookie } from '../utils/token.js';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validatedData = RegisterSchema.parse(req.body);

    const existingUser = await User.findOne({ email: validatedData.email.toLowerCase() });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(validatedData.password, salt);

    const user = await User.create({
      name: validatedData.name,
      email: validatedData.email.toLowerCase(),
      passwordHash,
      dateOfBirth: validatedData.dateOfBirth ? new Date(validatedData.dateOfBirth) : undefined,
      height: validatedData.height,
      currentWeight: validatedData.currentWeight,
      activityLevel: validatedData.activityLevel || 'moderately_active',
      fitnessGoal: validatedData.fitnessGoal || 'general_fitness',
      timezone: validatedData.timezone || 'UTC',
      preferences: {
        measurementUnits: 'metric',
        dailyStepGoal: 10000,
        dailyCalorieGoal: 2200,
        dailyWaterGoal: 2500,
        dailySleepGoal: 480,
      },
    });

    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      timezone: user.timezone,
    });

    setAuthCookie(res, token);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        height: user.height,
        currentWeight: user.currentWeight,
        fitnessGoal: user.fitnessGoal,
        activityLevel: user.activityLevel,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validatedData = LoginSchema.parse(req.body);

    const user = await User.findOne({ email: validatedData.email.toLowerCase() }).select('+passwordHash');
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    const isMatch = await bcrypt.compare(validatedData.password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      timezone: user.timezone,
    });

    setAuthCookie(res, token);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        height: user.height,
        currentWeight: user.currentWeight,
        fitnessGoal: user.fitnessGoal,
        activityLevel: user.activityLevel,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  clearAuthCookie(res);
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};
