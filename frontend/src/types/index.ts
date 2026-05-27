export type QuestionType = 'MCQ' | 'Short Answer' | 'Long Answer' | 'True/False' | 'Fill in the Blank';
export type Difficulty = 'Easy' | 'Moderate' | 'Hard';
export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'mixed';
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface AssignmentFormData {
  title: string;
  subject: string;
  dueDate: string;
  questionTypes: QuestionType[];
  numQuestions: number;
  totalMarks: number;
  difficulty: DifficultyLevel;
  additionalInstructions: string;
  file?: File | null;
}

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

export interface Assignment {
  _id: string;
  title: string;
  subject: string;
  dueDate: string;
  questionTypes: QuestionType[];
  numQuestions: number;
  totalMarks: number;
  difficulty: DifficultyLevel;
  additionalInstructions?: string;
  jobId?: string;
  status: JobStatus;
  generatedPaper?: GeneratedPaper;
  createdAt: string;
  updatedAt: string;
}

export interface WSProgressMessage {
  type: 'job:progress' | 'job:completed' | 'job:failed';
  assignmentId: string;
  progress?: number;
  message?: string;
  paper?: GeneratedPaper;
  error?: string;
}

export interface StudentInfo {
  name: string;
  rollNumber: string;
  section: string;
}
