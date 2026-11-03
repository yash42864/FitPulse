import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IActivityLog extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  date: string; // ISO date string YYYY-MM-DD
  steps: number;
  distanceKm: number;
  estimatedCaloriesBurned: number;
  source: 'manual' | 'sync' | 'wearable';
  createdAt: Date;
  updatedAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    date: {
      type: String, // Stored as YYYY-MM-DD for deterministic calendar grouping
      required: [true, 'Date is required (YYYY-MM-DD)'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'],
      index: true,
    },
    steps: {
      type: Number,
      required: [true, 'Step count is required'],
      min: [0, 'Steps cannot be negative'],
      max: [200000, 'Step count exceeds realistic single-day limit'],
    },
    distanceKm: {
      type: Number,
      required: true,
      min: [0, 'Distance cannot be negative'],
    },
    estimatedCaloriesBurned: {
      type: Number,
      required: true,
      min: [0, 'Calories burned cannot be negative'],
    },
    source: {
      type: String,
      enum: ['manual', 'sync', 'wearable'],
      default: 'manual',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to guarantee unique daily record per user and fast querying
ActivityLogSchema.index({ userId: 1, date: -1 }, { unique: true });

export const ActivityLog = mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
