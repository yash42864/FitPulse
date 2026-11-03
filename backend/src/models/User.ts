import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IUserPreferences {
  measurementUnits: 'metric' | 'imperial';
  dailyStepGoal: number;
  dailyCalorieGoal: number;
  dailyWaterGoal: number;
  dailySleepGoal: number; // in minutes
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  dateOfBirth?: Date;
  height?: number; // in cm
  currentWeight?: number; // in kg
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';
  fitnessGoal: 'muscle_gain' | 'fat_loss' | 'weight_maintenance' | 'general_fitness' | 'improved_endurance';
  timezone: string;
  preferences: IUserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false, // Don't return password by default in queries
    },
    dateOfBirth: {
      type: Date,
    },
    height: {
      type: Number,
      min: [50, 'Height must be at least 50 cm'],
      max: [300, 'Height cannot exceed 300 cm'],
    },
    currentWeight: {
      type: Number,
      min: [20, 'Weight must be at least 20 kg'],
      max: [500, 'Weight cannot exceed 500 kg'],
    },
    activityLevel: {
      type: String,
      enum: ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active'],
      default: 'moderately_active',
    },
    fitnessGoal: {
      type: String,
      enum: ['muscle_gain', 'fat_loss', 'weight_maintenance', 'general_fitness', 'improved_endurance'],
      default: 'general_fitness',
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    preferences: {
      measurementUnits: {
        type: String,
        enum: ['metric', 'imperial'],
        default: 'metric',
      },
      dailyStepGoal: {
        type: Number,
        default: 10000,
        min: 1000,
        max: 100000,
      },
      dailyCalorieGoal: {
        type: Number,
        default: 2200,
        min: 800,
        max: 10000,
      },
      dailyWaterGoal: {
        type: Number,
        default: 2500, // ml
        min: 500,
        max: 10000,
      },
      dailySleepGoal: {
        type: Number,
        default: 480, // minutes (8 hours)
        min: 180,
        max: 900,
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret: any) => {
        delete ret.passwordHash;
        return ret;
      },
    },
  }
);

export const User = mongoose.model<IUser>('User', UserSchema);
