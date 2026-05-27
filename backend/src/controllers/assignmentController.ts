import { Request, Response } from 'express';
import { AssignmentModel } from '../models/Assignment';
import { addGenerationJob } from '../services/queue';
import { redisClient } from '../config/redis';
import { AssignmentInput } from '../types';

const CACHE_TTL = 3600; // 1 hour

export const createAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    const input: AssignmentInput = req.body;

    const assignment = await AssignmentModel.create({
      ...input,
      status: 'pending',
    });

    // Add to BullMQ queue
    const jobId = await addGenerationJob({
      assignmentId: assignment._id.toString(),
      input,
    });

    // Update with jobId
    await AssignmentModel.findByIdAndUpdate(assignment._id, { jobId });

    res.status(201).json({
      success: true,
      data: {
        assignmentId: assignment._id.toString(),
        jobId,
        status: 'pending',
      },
    });
  } catch (err: any) {
    console.error('createAssignment error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

export const getAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check Redis cache first
    const cached = await redisClient.get(`assignment:${id}`);
    if (cached) {
      res.json({ success: true, data: JSON.parse(cached), fromCache: true });
      return;
    }

    const assignment = await AssignmentModel.findById(id).lean();
    if (!assignment) {
      res.status(404).json({ success: false, message: 'Assignment not found' });
      return;
    }

    // Cache if completed
    if (assignment.status === 'completed') {
      await redisClient.setEx(`assignment:${id}`, CACHE_TTL, JSON.stringify(assignment));
    }

    res.json({ success: true, data: assignment });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

export const listAssignments = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [assignments, total] = await Promise.all([
      AssignmentModel.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-generatedPaper')
        .lean(),
      AssignmentModel.countDocuments(),
    ]);

    res.json({
      success: true,
      data: assignments,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

export const getJobStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check Redis for job state
    const jobState = await redisClient.get(`job:${id}`);

    const assignment = await AssignmentModel.findById(id)
      .select('status jobId createdAt updatedAt')
      .lean();

    if (!assignment) {
      res.status(404).json({ success: false, message: 'Assignment not found' });
      return;
    }

    res.json({
      success: true,
      data: {
        assignmentId: id,
        status: assignment.status,
        jobId: assignment.jobId,
        jobState: jobState ? JSON.parse(jobState) : null,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

export const deleteAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await AssignmentModel.findByIdAndDelete(id);
    await redisClient.del(`assignment:${id}`);
    res.json({ success: true, message: 'Assignment deleted' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
