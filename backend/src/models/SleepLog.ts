import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ISleepLog extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  sleepStart: Date;
  sleepEnd: Date;
  durationMinutes: number;
  quality: number; // 1 to 5 scale
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SleepLogSchema = new Schema<ISleepLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    sleepStart: {
      type: Date,
      required: [true, 'Sleep start timestamp is required'],
      index: true,
    },
    sleepEnd: {
      type: Date,
      required: [true, 'Sleep end timestamp is required'],
    },
    durationMinutes: {
      type: Number,
      required: [true, 'Duration in minutes is required'],
      min: [1, 'Sleep duration must be at least 1 minute'],
      max: [1440, 'Sleep duration cannot exceed 24 hours in a single entry'],
    },
    quality: {
      type: Number,
      required: [true, 'Sleep quality score (1-5) is required'],
      min: [1, 'Quality rating must be between 1 and 5'],
      max: [5, 'Quality rating must be between 1 and 5'],
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
SleepLogSchema.index({ userId: 1, sleepStart: -1 });

export const SleepLog = mongoose.model<ISleepLog>('SleepLog', SleepLogSchema);
