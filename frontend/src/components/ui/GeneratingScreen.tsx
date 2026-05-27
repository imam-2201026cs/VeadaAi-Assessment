'use client';
import { useAppStore } from '@/store/useAppStore';

const STEPS = [
  { pct: 0, label: 'Connecting to generation service…' },
  { pct: 10, label: 'Job added to queue…' },
  { pct: 20, label: 'Worker picked up your job…' },
  { pct: 40, label: 'Building structured AI prompt…' },
  { pct: 60, label: 'AI generating questions…' },
  { pct: 80, label: 'Organizing sections and marks…' },
  { pct: 92, label: 'Storing result to database…' },
  { pct: 100, label: 'Done! Rendering your paper…' },
];

export default function GeneratingScreen() {
  const { generationProgress, generationMessage, wsConnected } = useAppStore();

  const currentStep = [...STEPS].reverse().find((s) => generationProgress >= s.pct) || STEPS[0];

  return (
    <div style={{
      minHeight: 'calc(100vh - 62px)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 460, textAlign: 'center' }}>
        {/* Icon */}
        <div style={{
          width: 68, height: 68, background: '#1D9E75', borderRadius: 18,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 34, margin: '0 auto 28px',
          animation: 'pulse-dot 1.5s infinite',
        }}>✦</div>

        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', marginBottom: 8 }}>
          Generating Your Question Paper
        </h2>
        <p style={{ color: '#888780', fontSize: 14, marginBottom: 36, minHeight: 20 }}>
          {generationMessage || currentStep.label}
        </p>

        {/* Progress bar */}
        <div style={{ background: '#E8E6DF', borderRadius: 999, height: 8, overflow: 'hidden', marginBottom: 12 }}>
          <div style={{
            height: '100%', background: '#1D9E75', borderRadius: 999,
            width: `${generationProgress}%`, transition: 'width 0.5s ease',
          }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: wsConnected ? '#1D9E75' : '#888780' }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: wsConnected ? '#1D9E75' : '#888780',
              animation: wsConnected ? 'pulse-dot 1s infinite' : 'none',
              display: 'inline-block',
            }} />
            WebSocket · {wsConnected ? 'Live' : 'Reconnecting…'}
          </span>
          <span style={{ fontSize: 12, color: '#888780', fontWeight: 600 }}>{generationProgress}%</span>
        </div>

        {/* Steps */}
        <div style={{ textAlign: 'left' }}>
          {STEPS.slice(0, -1).map((step, i) => {
            const done = generationProgress > step.pct;
            const active = generationProgress >= step.pct && generationProgress < (STEPS[i + 1]?.pct || 101);
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '5px 0' }}>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                  background: done ? '#1D9E75' : active ? '#9FE1CB' : '#E8E6DF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, color: done ? '#fff' : '#888780',
                  transition: 'all 0.3s',
                }}>{done ? '✓' : i + 1}</div>
                <span style={{
                  fontSize: 13,
                  color: done ? '#1D9E75' : active ? '#1a1a1a' : '#B4B2A9',
                  fontWeight: active ? 600 : 400,
                  transition: 'all 0.3s',
                }}>{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
