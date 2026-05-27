import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDB } from './config/database';
import { connectRedis } from './config/redis';
import { initializeWebSocket } from './services/websocket';
import assignmentRoutes from './routes/assignments';

const app = express();
const server = http.createServer(app);

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/assignments', assignmentRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize WebSocket
initializeWebSocket(server);

// Start server
const PORT = parseInt(process.env.PORT || '5000');

const start = async () => {
  await connectDB();
  await connectRedis();

  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🔌 WebSocket ready`);
    console.log(`\n📋 API Endpoints:`);
    console.log(`   POST   /api/assignments       - Create assignment`);
    console.log(`   GET    /api/assignments        - List assignments`);
    console.log(`   GET    /api/assignments/:id    - Get assignment`);
    console.log(`   GET    /api/assignments/:id/status - Job status`);
    console.log(`   DELETE /api/assignments/:id   - Delete\n`);
  });
};

start().catch(console.error);
