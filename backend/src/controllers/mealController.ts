import { Request, Response, NextFunction } from 'express';
import { MealLog, IMealItem } from '../models/MealLog.js';
import { MealLogInputSchema } from '../validators/schemas.js';

export const getMeals = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const date = req.query.date as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    const query: any = { userId };
    if (date) {
      query.date = date;
    } else if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    const meals = await MealLog.find(query).sort({ date: -1, createdAt: -1 });

    // Calculate totals for response
    const dayTotals = meals.reduce(
      (acc, m) => {
        acc.calories += m.totalCalories;
        acc.protein += m.totalProtein;
        acc.carbs += m.totalCarbs;
        acc.fat += m.totalFat;
        acc.fiber += m.totalFiber;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );

    res.status(200).json({
      success: true,
      count: meals.length,
      data: meals,
      totals: {
        calories: Math.round(dayTotals.calories),
        protein: Math.round(dayTotals.protein * 10) / 10,
        carbs: Math.round(dayTotals.carbs * 10) / 10,
        fat: Math.round(dayTotals.fat * 10) / 10,
        fiber: Math.round(dayTotals.fiber * 10) / 10,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createMeal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const validatedData = MealLogInputSchema.parse(req.body);

    // Recompute totals server-side for integrity
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalFiber = 0;

    const formattedItems: IMealItem[] = validatedData.items.map((item) => {
      // If client sent base item values and quantity, compute
      const qty = item.quantity || 1;
      const cals = Math.round(item.calories * qty);
      const prot = Math.round(item.protein * qty * 10) / 10;
      const crbs = Math.round(item.carbs * qty * 10) / 10;
      const ft = Math.round(item.fat * qty * 10) / 10;
      const fbr = Math.round(item.fiber * qty * 10) / 10;

      totalCalories += cals;
      totalProtein += prot;
      totalCarbs += crbs;
      totalFat += ft;
      totalFiber += fbr;

      return {
        foodItemId: item.foodItemId as any,
        name: item.name,
        servingSize: item.servingSize,
        servingUnit: item.servingUnit,
        quantity: qty,
        calories: cals,
        protein: prot,
        carbs: crbs,
        fat: ft,
        fiber: fbr,
      };
    });

    const meal = await MealLog.create({
      userId,
      date: validatedData.date,
      mealType: validatedData.mealType,
      items: formattedItems,
      totalCalories,
      totalProtein: Math.round(totalProtein * 10) / 10,
      totalCarbs: Math.round(totalCarbs * 10) / 10,
      totalFat: Math.round(totalFat * 10) / 10,
      totalFiber: Math.round(totalFiber * 10) / 10,
    });

    res.status(201).json({
      success: true,
      message: 'Meal logged successfully',
      data: meal,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMeal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const validatedData = MealLogInputSchema.parse(req.body);

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalFiber = 0;

    const formattedItems: IMealItem[] = validatedData.items.map((item) => {
      const qty = item.quantity || 1;
      const cals = Math.round(item.calories * qty);
      const prot = Math.round(item.protein * qty * 10) / 10;
      const crbs = Math.round(item.carbs * qty * 10) / 10;
      const ft = Math.round(item.fat * qty * 10) / 10;
      const fbr = Math.round(item.fiber * qty * 10) / 10;

      totalCalories += cals;
      totalProtein += prot;
      totalCarbs += crbs;
      totalFat += ft;
      totalFiber += fbr;

      return {
        foodItemId: item.foodItemId as any,
        name: item.name,
        servingSize: item.servingSize,
        servingUnit: item.servingUnit,
        quantity: qty,
        calories: cals,
        protein: prot,
        carbs: crbs,
        fat: ft,
        fiber: fbr,
      };
    });

    const meal = await MealLog.findOneAndUpdate(
      { _id: id, userId },
      {
        $set: {
          date: validatedData.date,
          mealType: validatedData.mealType,
          items: formattedItems,
          totalCalories,
          totalProtein: Math.round(totalProtein * 10) / 10,
          totalCarbs: Math.round(totalCarbs * 10) / 10,
          totalFat: Math.round(totalFat * 10) / 10,
          totalFiber: Math.round(totalFiber * 10) / 10,
        },
      },
      { new: true, runValidators: true }
    );

    if (!meal) {
      res.status(404).json({ success: false, message: 'Meal log not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Meal updated successfully',
      data: meal,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMeal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const deleted = await MealLog.findOneAndDelete({ _id: id, userId });
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Meal not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'Meal deleted successfully' });
  } catch (error) {
    next(error);
  }
};
