import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IFoodItem extends Document {
  _id: Types.ObjectId;
  name: string;
  category: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  createdBy?: Types.ObjectId | null;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FoodItemSchema = new Schema<IFoodItem>(
  {
    name: {
      type: String,
      required: [true, 'Food name is required'],
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true,
    },
    servingSize: {
      type: Number,
      required: [true, 'Serving size is required'],
      min: [0.1, 'Serving size must be greater than zero'],
    },
    servingUnit: {
      type: String,
      required: [true, 'Serving unit is required'],
      trim: true,
    },
    calories: {
      type: Number,
      required: [true, 'Calories amount is required'],
      min: [0, 'Calories cannot be negative'],
    },
    protein: {
      type: Number,
      required: [true, 'Protein amount is required'],
      min: [0, 'Protein cannot be negative'],
    },
    carbs: {
      type: Number,
      required: [true, 'Carbohydrates amount is required'],
      min: [0, 'Carbohydrates cannot be negative'],
    },
    fat: {
      type: Number,
      required: [true, 'Fat amount is required'],
      min: [0, 'Fat cannot be negative'],
    },
    fiber: {
      type: Number,
      default: 0,
      min: [0, 'Fiber cannot be negative'],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Text index for searching food catalog
FoodItemSchema.index({ name: 'text', category: 'text' });

export const FoodItem = mongoose.model<IFoodItem>('FoodItem', FoodItemSchema);
