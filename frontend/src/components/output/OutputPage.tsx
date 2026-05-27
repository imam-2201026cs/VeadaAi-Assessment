'use client';
import { useState, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { exportToPDF } from '@/lib/exportPDF';
import { StudentInfo } from '@/types';

const diffStyle = (d: string) => {
  if (d === 'Easy') return { bg: '#EAF3DE', color: '#3B6D11', border: '#C0DD97' };
  if (d === 'Hard') return { bg: '#FCEBEB', color: '#A32D2D', border: '#F7C1C1' };
  return { bg: '#FAEEDA', color: '#854F0B', border: '#FAC775' };
};

export default function OutputPage() {
  const { generatedPaper, setStep, setGeneratedPaper, setCurrentAssignmentId } = useAppStore();
  const [studentInfo, setStudentInfo] = useState<StudentInfo>({ name: '', rollNumber: '', section: '' });
  const [exporting, setExporting] = useState(false);
  const paperRef = useRef<HTMLDivElement>(null);

  if (!generatedPaper) return null;

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      await exportToPDF(generatedPaper, studentInfo);
    } finally {
      setExporting(false);
    }
  };

  const handleRegenerate = () => {
    setGeneratedPaper(null);
    setCurrentAssignmentId(null);
    setStep('form');
  };

  return (
    <div style={{ background: '#FAFAF8', minHeight: 'calc(100vh - 62px)', paddingBottom: 80 }}>
      {/* Action Bar */}
      <div className="no-print" style={{
        background: '#fff', borderBottom: '1px solid #E8E6DF',
        padding: '12px 40px', display: 'flex', alignItems: 'center', gap: 12,
        position: 'sticky', top: 62, zIndex: 50,
      }}>
        <button onClick={() => setStep('form')} className="btn-secondary">← New Assignment</button>
        <div style={{ flex: 1, fontSize: 13, color: '#5F5E5A' }}>
          ✅ Paper generated — <strong>{generatedPaper.title}</strong>
        </div>
        <button onClick={handleRegenerate} className="btn-secondary">⟳ Regenerate</button>
        <button onClick={handleExportPDF} disabled={exporting} className="btn-primary" style={{ padding: '9px 20px', fontSize: 13 }}>
          {exporting ? 'Exporting…' : '⬇ Export PDF'}
        </button>
      </div>

      {/* Paper */}
      <div ref={paperRef} style={{ maxWidth: 780, margin: '36px auto', padding: '0 24px' }}>
        <div className="animate-fade-in-up" style={{
          background: '#fff', border: '1px solid #E0DDD6',
          borderRadius: 16, overflow: 'hidden',
          boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
        }}>
          {/* Header */}
          <div style={{ background: '#1a1a1a', padding: '32px 40px', color: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <div style={{ width: 30, height: 30, background: '#1D9E75', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, color: '#fff' }}>V</div>
              <span style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9FE1CB' }}>VedaAI Assessment</span>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 6px', letterSpacing: '-0.02em' }}>{generatedPaper.title}</h1>
            <p style={{ color: '#9FE1CB', margin: '0 0 20px', fontSize: 15 }}>{generatedPaper.subject}</p>
            <div style={{ display: 'flex', gap: 28, fontSize: 13, color: '#B4B2A9', flexWrap: 'wrap' }}>
              <span>Total Marks: <strong style={{ color: '#fff' }}>{generatedPaper.totalMarks}</strong></span>
              <span>Duration: <strong style={{ color: '#fff' }}>{generatedPaper.duration}</strong></span>
              <span>Sections: <strong style={{ color: '#fff' }}>{generatedPaper.sections?.length}</strong></span>
            </div>
          </div>

          <div style={{ padding: '32px 40px' }}>
            {/* General Instructions */}
            {generatedPaper.instructions?.length > 0 && (
              <div style={{ background: '#F7F5F0', borderRadius: 10, padding: '16px 20px', marginBottom: 28, border: '1px solid #E8E4DC' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#888780', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10 }}>General Instructions</div>
                {generatedPaper.instructions.map((inst, i) => (
                  <div key={i} style={{ fontSize: 13, color: '#444441', padding: '3px 0', display: 'flex', gap: 8 }}>
                    <span style={{ color: '#1D9E75', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                    {inst}
                  </div>
                ))}
              </div>
            )}

            {/* Student Info */}
            <div style={{ border: '1px solid #E0DDD6', borderRadius: 10, padding: '20px 24px', marginBottom: 32 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#888780', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 16 }}>Student Information</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                {(['name', 'rollNumber', 'section'] as const).map((key) => (
                  <div key={key}>
                    <div style={{ fontSize: 11, color: '#888780', marginBottom: 4, textTransform: 'capitalize' }}>
                      {key === 'rollNumber' ? 'Roll Number' : key}
                    </div>
                    <input
                      value={studentInfo[key]}
                      onChange={(e) => setStudentInfo((p) => ({ ...p, [key]: e.target.value }))}
                      placeholder={`Enter ${key === 'rollNumber' ? 'Roll No.' : key}`}
                      style={{
                        width: '100%', border: 'none', borderBottom: '1.5px solid #1D9E75',
                        background: 'transparent', padding: '5px 0', fontSize: 14,
                        outline: 'none', fontFamily: 'Georgia, serif',
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Sections */}
            {generatedPaper.sections?.map((section, si) => (
              <div key={section.id || si} style={{ marginBottom: 36 }}>
                <div style={{ background: '#F2F9F6', border: '1px solid #9FE1CB', borderRadius: 10, padding: '14px 20px', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0F6E56', margin: 0 }}>
                      Section {String.fromCharCode(65 + si)}: {section.title}
                    </h2>
                    <span style={{ fontSize: 12, color: '#1D9E75', fontWeight: 600 }}>
                      [{section.questions?.reduce((a, q) => a + q.marks, 0)} marks]
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: '#1D9E75', margin: '4px 0 0', fontStyle: 'italic' }}>{section.instruction}</p>
                </div>

                {section.questions?.map((q, qi) => {
                  const dc = diffStyle(q.difficulty);
                  return (
                    <div key={q.id || qi} style={{
                      display: 'flex', gap: 14, padding: '14px 0',
                      borderBottom: qi < section.questions.length - 1 ? '1px solid #F0EDE6' : 'none',
                    }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#1D9E75', minWidth: 30, paddingTop: 2 }}>
                        Q{qi + 1}.
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: '0 0 8px', fontSize: 15, color: '#1a1a1a', lineHeight: 1.65 }}>{q.text}</p>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span style={{
                            background: dc.bg, color: dc.color, border: `1px solid ${dc.border}`,
                            borderRadius: 999, fontSize: 10, fontWeight: 700,
                            padding: '2px 9px', letterSpacing: '0.05em', textTransform: 'uppercase',
                          }}>{q.difficulty}</span>
                          <span style={{ fontSize: 11, color: '#888780' }}>{q.type}</span>
                        </div>
                      </div>
                      <div style={{ fontSize: 13, color: '#5F5E5A', fontWeight: 600, minWidth: 40, textAlign: 'right', paddingTop: 2 }}>
                        [{q.marks}m]
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Footer */}
            <div style={{ borderTop: '1px solid #E0DDD6', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#B4B2A9' }}>Generated by VedaAI Assessment Creator</span>
              <span style={{ fontSize: 12, color: '#B4B2A9', fontWeight: 600 }}>Total: {generatedPaper.totalMarks} marks</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
