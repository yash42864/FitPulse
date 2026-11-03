import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IMealItem {
  foodItemId?: Types.ObjectId;
  name: string;
  servingSize: number;
  servingUnit: string;
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface IMealLog extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  date: string; // YYYY-MM-DD
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'drink';
  items: IMealItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  createdAt: Date;
  updatedAt: Date;
}

const MealItemSchema = new Schema<IMealItem>(
  {
    foodItemId: {
      type: Schema.Types.ObjectId,
      ref: 'FoodItem',
      required: false,
    },
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    servingSize: {
      type: Number,
      required: true,
      default: 100,
    },
    servingUnit: {
      type: String,
      required: true,
      default: 'g',
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0.01, 'Quantity must be positive'],
    },
    calories: {
      type: Number,
      required: true,
      min: 0,
    },
    protein: {
      type: Number,
      required: true,
      min: 0,
    },
    carbs: {
      type: Number,
      required: true,
      min: 0,
    },
    fat: {
      type: Number,
      required: true,
      min: 0,
    },
    fiber: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: true }
);

const MealLogSchema = new Schema<IMealLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    date: {
      type: String,
      required: [true, 'Date is required (YYYY-MM-DD)'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'],
      index: true,
    },
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack', 'drink'],
      required: [true, 'Meal type is required'],
      index: true,
    },
    items: {
      type: [MealItemSchema],
      validate: [(val: IMealItem[]) => val.length > 0, 'A meal log must contain at least one item'],
    },
    totalCalories: {
      type: Number,
      required: true,
      min: 0,
    },
    totalProtein: {
      type: Number,
      required: true,
      min: 0,
    },
    totalCarbs: {
      type: Number,
      required: true,
      min: 0,
    },
    totalFat: {
      type: Number,
      required: true,
      min: 0,
    },
    totalFiber: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
MealLogSchema.index({ userId: 1, date: -1 });
MealLogSchema.index({ userId: 1, mealType: 1, date: -1 });

export const MealLog = mongoose.model<IMealLog>('MealLog', MealLogSchema);
