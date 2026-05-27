import mongoose, { Schema, Document } from 'mongoose';
import { Assignment, QuestionType, DifficultyLevel, JobStatus } from '../types';

export interface AssignmentDocument extends Omit<Assignment, '_id'>, Document {}

const QuestionSchema = new Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  type: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Moderate', 'Hard'], required: true },
  marks: { type: Number, required: true, min: 1 },
});

const SectionSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  instruction: { type: String, required: true },
  questions: [QuestionSchema],
});

const GeneratedPaperSchema = new Schema({
  title: String,
  subject: String,
  totalMarks: Number,
  duration: String,
  instructions: [String],
  sections: [SectionSchema],
});

const AssignmentSchema = new Schema<AssignmentDocument>(
  {
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    dueDate: { type: Date, required: true },
    questionTypes: {
      type: [String],
      required: true,
      validate: { validator: (v: string[]) => v.length > 0, message: 'At least one question type required' },
    },
    numQuestions: { type: Number, required: true, min: 1, max: 100 },
    totalMarks: { type: Number, required: true, min: 1, max: 1000 },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'mixed'],
      default: 'mixed',
    },
    additionalInstructions: { type: String, default: '' },
    jobId: { type: String },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    generatedPaper: { type: GeneratedPaperSchema, default: null },
  },
  { timestamps: true }
);

export const AssignmentModel = mongoose.model<AssignmentDocument>('Assignment', AssignmentSchema);
