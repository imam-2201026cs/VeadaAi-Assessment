'use client';
import Link from 'next/link';
import { useAppStore } from '@/store/useAppStore';

export default function Navbar() {
  const { wsConnected } = useAppStore();

  return (
    <nav style={{
      background: '#1a1a1a',
      padding: '14px 40px',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
        <div style={{
          width: 34, height: 34, background: '#1D9E75', borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 18, color: '#fff',
        }}>V</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#fff', letterSpacing: '-0.02em' }}>VedaAI</div>
          <div style={{ fontSize: 10, color: '#9FE1CB', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Assessment Creator</div>
        </div>
      </Link>

      <div style={{ flex: 1 }} />

      <Link href="/history" style={{
        color: '#B4B2A9', fontSize: 13, textDecoration: 'none',
        padding: '6px 12px', borderRadius: 6, transition: 'color 0.15s',
      }}>History</Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: wsConnected ? '#5DCAA5' : '#888780' }}>
        <span style={{
          width: 7, height: 7, borderRadius: '50%',
          background: wsConnected ? '#1D9E75' : '#888780',
          animation: wsConnected ? 'pulse-dot 1.5s infinite' : 'none',
        }} />
        WS {wsConnected ? 'Connected' : 'Offline'}
      </div>
    </nav>
  );
}
