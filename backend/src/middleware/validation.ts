import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validateAssignment = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 200 }).withMessage('Title too long'),

  body('subject')
    .trim()
    .notEmpty().withMessage('Subject is required')
    .isLength({ max: 100 }).withMessage('Subject too long'),

  body('dueDate')
    .notEmpty().withMessage('Due date is required')
    .isISO8601().withMessage('Invalid date format'),

  body('questionTypes')
    .isArray({ min: 1 }).withMessage('At least one question type required'),

  body('questionTypes.*')
    .isIn(['MCQ', 'Short Answer', 'Long Answer', 'True/False', 'Fill in the Blank'])
    .withMessage('Invalid question type'),

  body('numQuestions')
    .isInt({ min: 1, max: 100 }).withMessage('Number of questions must be 1-100'),

  body('totalMarks')
    .isInt({ min: 1, max: 1000 }).withMessage('Total marks must be 1-1000'),

  body('difficulty')
    .isIn(['easy', 'medium', 'hard', 'mixed']).withMessage('Invalid difficulty'),

  body('additionalInstructions')
    .optional()
    .isLength({ max: 1000 }).withMessage('Instructions too long'),
];

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      errors: errors.array().map((e) => ({ field: e.type, message: e.msg })),
    });
    return;
  }
  next();
};
