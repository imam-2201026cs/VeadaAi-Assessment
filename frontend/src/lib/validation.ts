import { z } from 'zod';

export const assignmentSchema = z.object({
  title: z
    .string()
    .min(1, 'Assignment title is required')
    .max(200, 'Title too long'),

  subject: z
    .string()
    .min(1, 'Subject is required')
    .max(100, 'Subject too long'),

  dueDate: z
    .string()
    .min(1, 'Due date is required'),

  questionTypes: z
    .array(z.enum(['MCQ', 'Short Answer', 'Long Answer', 'True/False', 'Fill in the Blank']))
    .min(1, 'Select at least one question type'),

  numQuestions: z
    .number()
    .int()
    .min(1, 'Minimum 1 question')
    .max(100, 'Maximum 100 questions'),

  totalMarks: z
    .number()
    .int()
    .min(1, 'Minimum 1 mark')
    .max(1000, 'Maximum 1000 marks'),

  difficulty: z.enum(['easy', 'medium', 'hard', 'mixed']),

  additionalInstructions: z.string().max(1000).optional().default(''),
});

export type AssignmentSchema = z.infer<typeof assignmentSchema>;
