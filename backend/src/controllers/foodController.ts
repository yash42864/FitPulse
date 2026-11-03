import { Request, Response, NextFunction } from 'express';
import { FoodItem } from '../models/FoodItem.js';
import { FoodItemInputSchema } from '../validators/schemas.js';

export const getFoods = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const q = (req.query.q as string || '').trim();
    const category = req.query.category as string;
    const userId = req.user?.id;

    const filter: any = {
      $or: [
        { isPublic: true },
        ...(userId ? [{ createdBy: userId }] : []),
      ],
    };

    if (category) {
      filter.category = category;
    }

    if (q) {
      filter.$text = { $search: q };
    }

    const foods = await FoodItem.find(filter)
      .sort(q ? { score: { $meta: 'textScore' } } : { name: 1 })
      .limit(50);

    // If text search returned 0 items (e.g. partial match), fallback to regex
    if (q && foods.length === 0) {
      const regexFilter = {
        $and: [
          { $or: [{ isPublic: true }, ...(userId ? [{ createdBy: userId }] : [])] },
          { name: { $regex: q, $options: 'i' } },
        ],
      };
      const regexFoods = await FoodItem.find(regexFilter).limit(50);
      res.status(200).json({ success: true, count: regexFoods.length, data: regexFoods });
      return;
    }

    res.status(200).json({
      success: true,
      count: foods.length,
      data: foods,
    });
  } catch (error) {
    next(error);
  }
};

export const createFood = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validatedData = FoodItemInputSchema.parse(req.body);

    const food = await FoodItem.create({
      ...validatedData,
      createdBy: req.user?.id,
      isPublic: false, // user created foods are private by default
    });

    res.status(201).json({
      success: true,
      message: 'Custom food item created',
      data: food,
    });
  } catch (error) {
    next(error);
  }
};
