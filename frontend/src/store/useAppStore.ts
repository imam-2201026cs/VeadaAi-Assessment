import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  AssignmentFormData,
  GeneratedPaper,
  JobStatus,
  Assignment,
} from '@/types';

interface AppState {
  // Form state
  formData: AssignmentFormData;
  setFormData: (data: Partial<AssignmentFormData>) => void;
  resetForm: () => void;

  // Current assignment
  currentAssignmentId: string | null;
  setCurrentAssignmentId: (id: string | null) => void;

  // Generation state
  isGenerating: boolean;
  setIsGenerating: (v: boolean) => void;
  generationProgress: number;
  setGenerationProgress: (v: number) => void;
  generationMessage: string;
  setGenerationMessage: (v: string) => void;
  jobStatus: JobStatus | null;
  setJobStatus: (v: JobStatus | null) => void;

  // Generated paper
  generatedPaper: GeneratedPaper | null;
  setGeneratedPaper: (paper: GeneratedPaper | null) => void;

  // UI step
  step: 'form' | 'generating' | 'output';
  setStep: (s: 'form' | 'generating' | 'output') => void;

  // Error
  error: string | null;
  setError: (e: string | null) => void;

  // Assignment history
  assignments: Assignment[];
  setAssignments: (a: Assignment[]) => void;

  // WebSocket status
  wsConnected: boolean;
  setWsConnected: (v: boolean) => void;
}

const DEFAULT_FORM: AssignmentFormData = {
  title: '',
  subject: '',
  dueDate: '',
  questionTypes: [],
  numQuestions: 10,
  totalMarks: 50,
  difficulty: 'mixed',
  additionalInstructions: '',
  file: null,
};

export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      formData: { ...DEFAULT_FORM },
      setFormData: (data) =>
        set((s) => ({ formData: { ...s.formData, ...data } })),
      resetForm: () => set({ formData: { ...DEFAULT_FORM } }),

      currentAssignmentId: null,
      setCurrentAssignmentId: (id) => set({ currentAssignmentId: id }),

      isGenerating: false,
      setIsGenerating: (v) => set({ isGenerating: v }),
      generationProgress: 0,
      setGenerationProgress: (v) => set({ generationProgress: v }),
      generationMessage: '',
      setGenerationMessage: (v) => set({ generationMessage: v }),
      jobStatus: null,
      setJobStatus: (v) => set({ jobStatus: v }),

      generatedPaper: null,
      setGeneratedPaper: (paper) => set({ generatedPaper: paper }),

      step: 'form',
      setStep: (s) => set({ step: s }),

      error: null,
      setError: (e) => set({ error: e }),

      assignments: [],
      setAssignments: (a) => set({ assignments: a }),

      wsConnected: false,
      setWsConnected: (v) => set({ wsConnected: v }),
    }),
    { name: 'vedaai-store' }
  )
);
