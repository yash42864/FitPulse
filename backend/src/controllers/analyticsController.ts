import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analyticsService.js';

export const getDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const date = req.query.date as string;
    const overview = await AnalyticsService.getDashboardOverview(userId, date);
    res.status(200).json({ success: true, data: overview });
  } catch (error) {
    next(error);
  }
};

export const getStepsAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const result = await AnalyticsService.getWeeklyStepAnalysis(userId, startDate, endDate);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getNutritionAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const result = await AnalyticsService.getNutritionAnalysis(userId, startDate, endDate);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getWorkoutAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const result = await AnalyticsService.getWorkoutAnalysis(userId, startDate, endDate);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getSleepAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const result = await AnalyticsService.getSleepAnalysis(userId, startDate, endDate);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getCalorieBalanceAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const result = await AnalyticsService.getCalorieBalanceAnalysis(userId, startDate, endDate);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getMonthlyProgress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const result = await AnalyticsService.getMonthlyProgress(userId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getConsistencyScore = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const days = parseInt(req.query.days as string) || 14;
    const result = await AnalyticsService.getLifestyleConsistencyScore(userId, days);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getLeaderboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const result = await AnalyticsService.getActivityLeaderboard(days);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
