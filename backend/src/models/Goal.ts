import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IGoal extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  goalType: 'steps' | 'calories' | 'protein' | 'water' | 'sleep' | 'workouts' | 'weight';
  targetValue: number;
  unit: string;
  effectiveFrom: Date;
  effectiveTo?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const GoalSchema = new Schema<IGoal>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    goalType: {
      type: String,
      enum: ['steps', 'calories', 'protein', 'water', 'sleep', 'workouts', 'weight'],
      required: [true, 'Goal type is required'],
      index: true,
    },
    targetValue: {
      type: Number,
      required: [true, 'Target value is required'],
      min: [0.1, 'Target value must be positive'],
    },
    unit: {
      type: String,
      required: [true, 'Unit of measurement is required'],
      trim: true,
    },
    effectiveFrom: {
      type: Date,
      default: Date.now,
    },
    effectiveTo: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index
GoalSchema.index({ userId: 1, goalType: 1, isActive: -1 });

export const Goal = mongoose.model<IGoal>('Goal', GoalSchema);
