import { body, validationResult } from 'express-validator'

export const validateRequest =(req, res, next) => {
  const errors =validationResult(req)
  console.log("here")
  console.log(errors.array()); 
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    })
  }
  next()  
} 

export const validateRegister = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match')
      }
      return true
    }),
  body('role')
    .optional()
    .isIn(['admin', 'developer', 'viewer'])
    .withMessage('Invalid role')
]

export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
]

export const validateProject = [
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Project name must be between 1 and 100 characters')
    .trim(),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('type')
    .isIn(['web', 'mobile', 'desktop', 'api', 'other'])
    .withMessage('Invalid project type'),
  body('complexity')
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid complexity level')
]

export const validateComponent = [
  body('title')
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters')
    .trim(),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('type')
    .isIn(['component', 'folder'])
    .withMessage('Invalid component type'),
  body('priority')
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid priority level'),
  body('status')
    .isIn(['backlog', 'dev-ready', 'dev-progress', 'dev-done', 'completed'])
    .withMessage('Invalid status')
]

export const validateIssue = [
  body('title')
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters')
    .trim(),
  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('priority')
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid priority level'),
  body('status')
    .isIn(['backlog', 'dev-ready', 'dev-progress', 'dev-done', 'completed'])
    .withMessage('Invalid status'),
  body('type')
    .optional()
    .isIn(['bug', 'feature', 'task', 'improvement'])
    .withMessage('Invalid issue type')
]

export const validateMilestone = [
  body('title')
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters')
    .trim(),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('status')
    .isIn(['not-started', 'in-progress', 'completed'])
    .withMessage('Invalid status'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid due date format')
]