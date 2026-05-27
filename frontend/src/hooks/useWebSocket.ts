'use client';
import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppStore } from '@/store/useAppStore';
import { WSProgressMessage } from '@/types';

export const useWebSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const {
    setWsConnected,
    setGenerationProgress,
    setGenerationMessage,
    setGeneratedPaper,
    setJobStatus,
    setStep,
    setError,
    setIsGenerating,
  } = useAppStore();

  const connect = useCallback(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000';

    socketRef.current = io(wsUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      setWsConnected(true);
      console.log('🔌 WebSocket connected:', socket.id);
    });

    socket.on('disconnect', () => {
      setWsConnected(false);
      console.log('🔌 WebSocket disconnected');
    });

    socket.on('job:progress', (msg: WSProgressMessage) => {
      setGenerationProgress(msg.progress || 0);
      setGenerationMessage(msg.message || 'Processing...');
      setJobStatus('processing');
    });

    socket.on('job:completed', (msg: WSProgressMessage) => {
      setGenerationProgress(100);
      setGenerationMessage('Paper generated successfully!');
      setJobStatus('completed');
      if (msg.paper) {
        setGeneratedPaper(msg.paper);
        setStep('output');
        setIsGenerating(false);
      }
    });

    socket.on('job:failed', (msg: WSProgressMessage) => {
      setJobStatus('failed');
      setError(msg.error || 'Generation failed. Please try again.');
      setStep('form');
      setIsGenerating(false);
    });
  }, []);

  const joinAssignment = useCallback((assignmentId: string) => {
    socketRef.current?.emit('join:assignment', assignmentId);
  }, []);

  const leaveAssignment = useCallback((assignmentId: string) => {
    socketRef.current?.emit('leave:assignment', assignmentId);
  }, []);

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
  }, []);

  useEffect(() => {
    connect();
    return () => { disconnect(); };
  }, []);

  return { joinAssignment, leaveAssignment, isConnected: !!socketRef.current?.connected };
};
