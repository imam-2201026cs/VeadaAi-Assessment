import { Queue, Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis';
import { JobData } from '../types';

export const GENERATION_QUEUE = 'question-generation';

export const generationQueue = new Queue<JobData>(GENERATION_QUEUE, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

export const addGenerationJob = async (data: JobData): Promise<string> => {
  const job = await generationQueue.add('generate', data, {
    priority: 1,
  });
  return job.id!;
};
