'use client';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { assignmentSchema, AssignmentSchema } from '@/lib/validation';
import { useAppStore } from '@/store/useAppStore';
import { assignmentApi } from '@/lib/api';
import { useWebSocket } from '@/hooks/useWebSocket';
import { QuestionType } from '@/types';
import { useState } from 'react';

const QUESTION_TYPES: QuestionType[] = [
  'MCQ', 'Short Answer', 'Long Answer', 'True/False', 'Fill in the Blank',
];
const DIFFICULTIES = ['easy', 'medium', 'hard', 'mixed'] as const;

export default function AssignmentForm() {
  const { joinAssignment, leaveAssignment } = useWebSocket();
  const {
    setStep, setIsGenerating, setCurrentAssignmentId,
    setError, error, setGenerationProgress, setGenerationMessage,
  } = useAppStore();

  const [file, setFile] = useState<File | null>(null);

  const {
    register, handleSubmit, control, watch,
    formState: { errors, isSubmitting },
  } = useForm<AssignmentSchema>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      title: '', subject: '', dueDate: '',
      questionTypes: [], numQuestions: 10,
      totalMarks: 50, difficulty: 'mixed',
      additionalInstructions: '',
    },
  });

  const numQuestions = watch('numQuestions');
  const totalMarks = watch('totalMarks');

  const onSubmit = async (data: AssignmentSchema) => {
    setError(null);
    setIsGenerating(true);
    setGenerationProgress(0);
    setGenerationMessage('Submitting assignment...');
    setStep('generating');

    try {
      const result = await assignmentApi.create(data);
      const { assignmentId } = result.data;
      setCurrentAssignmentId(assignmentId);
      joinAssignment(assignmentId);
    } catch (err: any) {
      setError(err.message || 'Failed to create assignment');
      setIsGenerating(false);
      setStep('form');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 80px' }}>
      <div className="animate-fade-in-up stagger-1" style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: '-0.03em', color: '#1a1a1a' }}>
          Create Assignment
        </h1>
        <p style={{ color: '#888780', marginTop: 6, fontSize: 14 }}>
          Fill in the details — AI will generate a structured question paper.
        </p>
      </div>

      {error && (
        <div style={{
          background: '#FCEBEB', border: '1px solid #F7C1C1', borderRadius: 10,
          padding: '12px 16px', marginBottom: 24, color: '#A32D2D', fontSize: 14,
        }}>⚠ {error}</div>
      )}

      {/* Card */}
      <div className="animate-fade-in-up stagger-2" style={{
        background: '#fff', border: '1px solid #E8E6DF',
        borderRadius: 16, padding: 32, marginBottom: 20,
      }}>
        {/* Basic Info */}
        <SectionLabel icon="📋" text="Basic Information" />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <FieldWrap label="Assignment Title *" error={errors.title?.message}>
            <input {...register('title')} placeholder="e.g. Mid-Term Examination" className="field-input" />
          </FieldWrap>
          <FieldWrap label="Subject *" error={errors.subject?.message}>
            <input {...register('subject')} placeholder="e.g. Mathematics" className="field-input" />
          </FieldWrap>
        </div>

        <FieldWrap label="Due Date *" error={errors.dueDate?.message} style={{ marginBottom: 24 }}>
          <input type="date" {...register('dueDate')} className="field-input" />
        </FieldWrap>

        <Divider />

        {/* Question Config */}
        <SectionLabel icon="❓" text="Question Configuration" />

        <Controller
          name="questionTypes"
          control={control}
          render={({ field }) => (
            <FieldWrap label="Question Types *" error={errors.questionTypes?.message} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {QUESTION_TYPES.map((t) => {
                  const active = field.value.includes(t);
                  return (
                    <button key={t} type="button"
                      onClick={() => {
                        field.onChange(
                          active ? field.value.filter((v) => v !== t) : [...field.value, t]
                        );
                      }}
                      style={{
                        borderRadius: 999, padding: '6px 16px', fontSize: 13, cursor: 'pointer',
                        border: `1px solid ${active ? '#1D9E75' : '#D3D1C7'}`,
                        background: active ? '#E1F5EE' : '#fff',
                        color: active ? '#0F6E56' : '#444441',
                        fontWeight: active ? 600 : 400,
                        transition: 'all 0.15s',
                      }}>{t}</button>
                  );
                })}
              </div>
            </FieldWrap>
          )}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 16 }}>
          <FieldWrap label={`Number of Questions: ${numQuestions}`}>
            <input type="range" min={1} max={30} step={1}
              {...register('numQuestions', { valueAsNumber: true })}
              style={{ width: '100%', marginTop: 8 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#888780', marginTop: 2 }}>
              <span>1</span><span>30</span>
            </div>
          </FieldWrap>
          <FieldWrap label={`Total Marks: ${totalMarks}`}>
            <input type="range" min={10} max={200} step={5}
              {...register('totalMarks', { valueAsNumber: true })}
              style={{ width: '100%', marginTop: 8 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#888780', marginTop: 2 }}>
              <span>10</span><span>200</span>
            </div>
          </FieldWrap>
        </div>

        <Controller
          name="difficulty"
          control={control}
          render={({ field }) => (
            <FieldWrap label="Difficulty Level" style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                {DIFFICULTIES.map((d) => (
                  <button key={d} type="button"
                    onClick={() => field.onChange(d)}
                    style={{
                      borderRadius: 8, padding: '8px 16px', fontSize: 13,
                      border: `1px solid ${field.value === d ? '#1D9E75' : '#D3D1C7'}`,
                      background: field.value === d ? '#1D9E75' : '#fff',
                      color: field.value === d ? '#fff' : '#444441',
                      fontWeight: field.value === d ? 600 : 400,
                      cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.15s',
                    }}>{d}</button>
                ))}
              </div>
            </FieldWrap>
          )}
        />

        <Divider />

        {/* Additional */}
        <SectionLabel icon="📎" text="Additional Details" />

        <FieldWrap label="Upload Reference File (PDF / Text) — Optional" style={{ marginBottom: 16 }}>
          <label style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px', border: '1px dashed #C4C0B8',
            borderRadius: 8, cursor: 'pointer', fontSize: 13, color: '#888780',
          }}>
            <span>📁</span>
            {file ? file.name : 'Choose file or drag here (.pdf, .txt)'}
            <input type="file" accept=".pdf,.txt,.doc,.docx" style={{ display: 'none' }}
              onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </label>
        </FieldWrap>

        <FieldWrap label="Additional Instructions">
          <textarea
            {...register('additionalInstructions')}
            placeholder="e.g. Focus on chapters 3-5, include diagram questions..."
            rows={3}
            className="field-input"
            style={{ resize: 'vertical' }}
          />
        </FieldWrap>
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-primary animate-fade-in-up stagger-3" style={{ width: '100%', padding: 16, fontSize: 16 }}>
        {isSubmitting ? 'Submitting…' : '✦ Generate Question Paper with AI'}
      </button>
    </form>
  );
}

function SectionLabel({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color: '#5F5E5A', letterSpacing: '0.07em', textTransform: 'uppercase' }}>{text}</span>
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: '#F0EDE6', margin: '24px 0' }} />;
}

function FieldWrap({ label, error, children, style }: {
  label: string; error?: string; children: React.ReactNode; style?: React.CSSProperties;
}) {
  return (
    <div style={{ marginBottom: 0, ...style }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#444441', marginBottom: 6 }}>{label}</label>
      {children}
      {error && <p style={{ fontSize: 12, color: '#A32D2D', marginTop: 4 }}>{error}</p>}
    </div>
  );
}
