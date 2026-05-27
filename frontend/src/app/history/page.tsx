'use client';
import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { assignmentApi } from '@/lib/api';
import { Assignment } from '@/types';
import Navbar from '@/components/ui/Navbar';
import Link from 'next/link';

const statusColors: Record<string, { bg: string; color: string; border: string }> = {
  pending:    { bg: '#FFF8E6', color: '#854F0B', border: '#FAC775' },
  processing: { bg: '#E6F1FB', color: '#185FA5', border: '#B5D4F4' },
  completed:  { bg: '#EAF3DE', color: '#3B6D11', border: '#C0DD97' },
  failed:     { bg: '#FCEBEB', color: '#A32D2D', border: '#F7C1C1' },
};

export default function HistoryPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setGeneratedPaper, setStep } = useAppStore();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await assignmentApi.list();
        setAssignments(res.data || []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleView = async (assignment: Assignment) => {
    if (assignment.status === 'completed' && assignment.generatedPaper) {
      setGeneratedPaper(assignment.generatedPaper);
      setStep('output');
      window.location.href = '/';
    } else {
      const res = await assignmentApi.getById(assignment._id);
      if (res.data?.generatedPaper) {
        setGeneratedPaper(res.data.generatedPaper);
        setStep('output');
        window.location.href = '/';
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this assignment?')) return;
    await assignmentApi.delete(id);
    setAssignments((prev) => prev.filter((a) => a._id !== id));
  };

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, letterSpacing: '-0.03em' }}>Assignment History</h1>
            <p style={{ color: '#888780', marginTop: 5, fontSize: 14 }}>All previously generated question papers</p>
          </div>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <button className="btn-primary" style={{ padding: '10px 20px', fontSize: 13 }}>+ New Assignment</button>
          </Link>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: 60, color: '#888780' }}>Loading assignments…</div>
        )}

        {error && (
          <div style={{ background: '#FCEBEB', border: '1px solid #F7C1C1', borderRadius: 10, padding: '14px 18px', color: '#A32D2D', fontSize: 14 }}>
            ⚠ {error} — make sure the backend is running.
          </div>
        )}

        {!loading && !error && assignments.length === 0 && (
          <div style={{ textAlign: 'center', padding: 80, color: '#888780' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <p style={{ fontSize: 15 }}>No assignments yet. Create your first one!</p>
            <Link href="/"><button className="btn-primary" style={{ marginTop: 16, padding: '10px 24px' }}>Create Assignment</button></Link>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {assignments.map((a) => {
            const sc = statusColors[a.status] || statusColors.pending;
            return (
              <div key={a._id} style={{
                background: '#fff', border: '1px solid #E8E6DF', borderRadius: 12,
                padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16,
                transition: 'box-shadow 0.15s',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.title}</h3>
                    <span style={{
                      background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`,
                      borderRadius: 999, fontSize: 10, fontWeight: 700,
                      padding: '2px 8px', textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0,
                    }}>{a.status}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#888780', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <span>📚 {a.subject}</span>
                    <span>❓ {a.numQuestions} questions</span>
                    <span>📊 {a.totalMarks} marks</span>
                    <span>🕐 {new Date(a.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  {a.status === 'completed' && (
                    <button onClick={() => handleView(a)} className="btn-primary" style={{ padding: '7px 14px', fontSize: 12 }}>
                      View Paper
                    </button>
                  )}
                  <button onClick={() => handleDelete(a._id)} className="btn-secondary" style={{ padding: '7px 12px', fontSize: 12, color: '#A32D2D', borderColor: '#F7C1C1' }}>
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
