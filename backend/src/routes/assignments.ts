import { Router } from 'express';
import {
  createAssignment,
  getAssignment,
  listAssignments,
  getJobStatus,
  deleteAssignment,
} from '../controllers/assignmentController';
import { validateAssignment, handleValidationErrors } from '../middleware/validation';

const router = Router();

// POST /api/assignments - Create assignment and queue generation
router.post('/', validateAssignment, handleValidationErrors, createAssignment);

// GET /api/assignments - List all assignments
router.get('/', listAssignments);

// GET /api/assignments/:id - Get single assignment with paper
router.get('/:id', getAssignment);

// GET /api/assignments/:id/status - Get job status
router.get('/:id/status', getJobStatus);

// DELETE /api/assignments/:id - Delete assignment
router.delete('/:id', deleteAssignment);

export default router;
