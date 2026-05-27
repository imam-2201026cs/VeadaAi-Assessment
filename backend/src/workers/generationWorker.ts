import 'dotenv/config';
import { Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis';
import { generateQuestionPaper } from '../services/aiService';
import { emitProgress, emitCompleted, emitFailed } from '../services/websocket';
import { AssignmentModel } from '../models/Assignment';
import { connectDB } from '../config/database';
import { GENERATION_QUEUE } from '../services/queue';
import { JobData } from '../types';

const processJob = async (job: Job<JobData>): Promise<void> => {
  const { assignmentId, input } = job.data;

  console.log(`🔧 Processing job ${job.id} for assignment ${assignmentId}`);

  try {
    // Update status to processing
    await AssignmentModel.findByIdAndUpdate(assignmentId, { status: 'processing' });
    emitProgress(assignmentId, 5, 'Job picked up by worker...');

    await job.updateProgress(5);

    const paper = await generateQuestionPaper(input, async (pct, msg) => {
      await job.updateProgress(pct);
      emitProgress(assignmentId, pct, msg);
    });

    // Store result in MongoDB
    await AssignmentModel.findByIdAndUpdate(assignmentId, {
      status: 'completed',
      generatedPaper: paper,
    });

    await job.updateProgress(100);
    emitCompleted(assignmentId, paper);

    console.log(`✅ Job ${job.id} completed for assignment ${assignmentId}`);
  } catch (err: any) {
    console.error(`❌ Job ${job.id} failed:`, err.message);

    await AssignmentModel.findByIdAndUpdate(assignmentId, {
      status: 'failed',
    });

    emitFailed(assignmentId, err.message || 'Generation failed');
    throw err;
  }
};

const startWorker = async (): Promise<void> => {
  await connectDB();

  const worker = new Worker<JobData>(GENERATION_QUEUE, processJob, {
    connection: redisConnection,
    concurrency: 3,
  });

  worker.on('completed', (job) => {
    console.log(`✅ Worker completed job ${job.id}`);
  });

  worker.on('failed', (job, err) => {
    console.error(`❌ Worker failed job ${job?.id}:`, err.message);
  });

  worker.on('active', (job) => {
    console.log(`🔧 Worker started job ${job.id}`);
  });

  console.log('🚀 Generation worker started');
};

startWorker().catch(console.error);
