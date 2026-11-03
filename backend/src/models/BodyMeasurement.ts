import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IBodyMeasurement extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  date: string; // YYYY-MM-DD
  weightKg: number;
  waistCm?: number;
  hipCm?: number;
  chestCm?: number;
  armCm?: number;
  thighCm?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BodyMeasurementSchema = new Schema<IBodyMeasurement>(
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
    weightKg: {
      type: Number,
      required: [true, 'Weight in kg is required'],
      min: [20, 'Weight must be at least 20 kg'],
      max: [500, 'Weight cannot exceed 500 kg'],
    },
    waistCm: {
      type: Number,
      min: [20, 'Waist measurement must be realistic'],
      max: [250, 'Waist measurement must be realistic'],
    },
    hipCm: {
      type: Number,
      min: [20, 'Hip measurement must be realistic'],
      max: [250, 'Hip measurement must be realistic'],
    },
    chestCm: {
      type: Number,
      min: [20, 'Chest measurement must be realistic'],
      max: [250, 'Chest measurement must be realistic'],
    },
    armCm: {
      type: Number,
      min: [10, 'Arm measurement must be realistic'],
      max: [100, 'Arm measurement must be realistic'],
    },
    thighCm: {
      type: Number,
      min: [15, 'Thigh measurement must be realistic'],
      max: [150, 'Thigh measurement must be realistic'],
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

// Compound index
BodyMeasurementSchema.index({ userId: 1, date: -1 });

export const BodyMeasurement = mongoose.model<IBodyMeasurement>('BodyMeasurement', BodyMeasurementSchema);
