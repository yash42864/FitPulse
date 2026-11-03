import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IWorkoutSet {
  setNumber: number;
  reps: number;
  weightKg: number;
  restTimeSeconds?: number;
}

export interface IExerciseEntry {
  exerciseName: string;
  sets: IWorkoutSet[];
  notes?: string;
}

export interface IWorkoutLog extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  date: string; // YYYY-MM-DD
  workoutType: 'strength_training' | 'cardio' | 'yoga' | 'pilates' | 'walking' | 'running' | 'cycling' | 'mobility' | 'custom';
  durationMinutes: number;
  exercises: IExerciseEntry[];
  estimatedCaloriesBurned: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WorkoutSetSchema = new Schema<IWorkoutSet>(
  {
    setNumber: { type: Number, required: true, min: 1 },
    reps: { type: Number, required: true, min: 0 },
    weightKg: { type: Number, required: true, min: 0, default: 0 },
    restTimeSeconds: { type: Number, default: 60, min: 0 },
  },
  { _id: false }
);

const ExerciseEntrySchema = new Schema<IExerciseEntry>(
  {
    exerciseName: { type: String, required: true, trim: true },
    sets: [WorkoutSetSchema],
    notes: { type: String, trim: true },
  },
  { _id: true }
);

const WorkoutLogSchema = new Schema<IWorkoutLog>(
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
    workoutType: {
      type: String,
      enum: ['strength_training', 'cardio', 'yoga', 'pilates', 'walking', 'running', 'cycling', 'mobility', 'custom'],
      required: [true, 'Workout type is required'],
      index: true,
    },
    durationMinutes: {
      type: Number,
      required: [true, 'Duration in minutes is required'],
      min: [1, 'Workout duration must be at least 1 minute'],
    },
    exercises: {
      type: [ExerciseEntrySchema],
      default: [],
    },
    estimatedCaloriesBurned: {
      type: Number,
      required: [true, 'Estimated calories burned is required'],
      min: 0,
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
WorkoutLogSchema.index({ userId: 1, date: -1 });
WorkoutLogSchema.index({ userId: 1, workoutType: 1 });

export const WorkoutLog = mongoose.model<IWorkoutLog>('WorkoutLog', WorkoutLogSchema);
