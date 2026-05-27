import { Server as HTTPServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import { WSMessage } from '../types';

let io: SocketServer;

export const initializeWebSocket = (server: HTTPServer): SocketServer => {
  io = new SocketServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    socket.on('join:assignment', (assignmentId: string) => {
      socket.join(`assignment:${assignmentId}`);
      console.log(`Socket ${socket.id} joined room: assignment:${assignmentId}`);
    });

    socket.on('leave:assignment', (assignmentId: string) => {
      socket.leave(`assignment:${assignmentId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const emitToAssignment = (assignmentId: string, message: WSMessage): void => {
  if (!io) return;
  io.to(`assignment:${assignmentId}`).emit(message.type, message);
};

export const emitProgress = (assignmentId: string, progress: number, message: string): void => {
  emitToAssignment(assignmentId, {
    type: 'job:progress',
    assignmentId,
    progress,
    message,
  });
};

export const emitCompleted = (assignmentId: string, paper: any): void => {
  emitToAssignment(assignmentId, {
    type: 'job:completed',
    assignmentId,
    progress: 100,
    paper,
  });
};

export const emitFailed = (assignmentId: string, error: string): void => {
  emitToAssignment(assignmentId, {
    type: 'job:failed',
    assignmentId,
    error,
  });
};

export const getIO = (): SocketServer => io;
