import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IWaterLog extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  timestamp: Date;
  amountMl: number;
  createdAt: Date;
  updatedAt: Date;
}

const WaterLogSchema = new Schema<IWaterLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    amountMl: {
      type: Number,
      required: [true, 'Water amount in ml is required'],
      min: [1, 'Water amount must be at least 1 ml'],
      max: [5000, 'Single water entry cannot exceed 5000 ml'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying a user's water intake by date/time
WaterLogSchema.index({ userId: 1, timestamp: -1 });

export const WaterLog = mongoose.model<IWaterLog>('WaterLog', WaterLogSchema);
