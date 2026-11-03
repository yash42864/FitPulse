import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITemplateExercise {
  exerciseName: string;
  defaultSets: number;
  defaultReps: number;
  defaultWeightKg: number;
}

export interface IWorkoutTemplate extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  category: string;
  exercises: ITemplateExercise[];
  createdAt: Date;
  updatedAt: Date;
}

const TemplateExerciseSchema = new Schema<ITemplateExercise>(
  {
    exerciseName: { type: String, required: true, trim: true },
    defaultSets: { type: Number, required: true, default: 3, min: 1 },
    defaultReps: { type: Number, required: true, default: 10, min: 1 },
    defaultWeightKg: { type: Number, required: true, default: 0, min: 0 },
  },
  { _id: false }
);

const WorkoutTemplateSchema = new Schema<IWorkoutTemplate>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Template name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      default: 'strength_training',
    },
    exercises: {
      type: [TemplateExerciseSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index
WorkoutTemplateSchema.index({ userId: 1, name: 1 });

export const WorkoutTemplate = mongoose.model<IWorkoutTemplate>('WorkoutTemplate', WorkoutTemplateSchema);
