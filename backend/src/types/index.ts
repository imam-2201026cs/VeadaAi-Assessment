export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  difficulty: Difficulty;
  marks: number;
}

export interface Section {
  id: string;
  title: string;
  instruction: string;
  questions: Question[];
}

export interface GeneratedPaper {
  title: string;
  subject: string;
  totalMarks: number;
  duration: string;
  instructions: string[];
  sections: Section[];
}

export type QuestionType =
  | 'MCQ'
  | 'Short Answer'
  | 'Long Answer'
  | 'True/False'
  | 'Fill in the Blank';

export type Difficulty = 'Easy' | 'Moderate' | 'Hard';
export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'mixed';
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface AssignmentInput {
  title: string;
  subject: string;
  dueDate: string;
  questionTypes: QuestionType[];
  numQuestions: number;
  totalMarks: number;
  difficulty: DifficultyLevel;
  additionalInstructions?: string;
}

export interface Assignment {
  _id: string;
  title: string;
  subject: string;
  dueDate: Date;
  questionTypes: QuestionType[];
  numQuestions: number;
  totalMarks: number;
  difficulty: DifficultyLevel;
  additionalInstructions?: string;
  jobId?: string;
  status: JobStatus;
  generatedPaper?: GeneratedPaper;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobData {
  assignmentId: string;
  input: AssignmentInput;
}

export interface WSMessage {
  type: 'job:progress' | 'job:completed' | 'job:failed';
  assignmentId: string;
  progress?: number;
  message?: string;
  paper?: GeneratedPaper;
  error?: string;
}
