import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { SignPetitionRequest } from '../types';

export const validateSignPetition = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  
  body('full_name')
    .isLength({ min: 1, max: 100 })
    .trim()
    .escape()
    .withMessage('Full name is required and must be less than 100 characters'),
  
  body('country')
    .optional()
    .isLength({ min: 2, max: 2 })
    .isUppercase()
    .withMessage('Country must be a 2-letter country code'),
  
  body('consent_news')
    .isBoolean()
    .withMessage('Consent news must be a boolean'),
  
  body('turnstileToken')
    .notEmpty()
    .withMessage('Turnstile token is required'),
];

export const validateAdminApiKey = (req: Request, res: Response, next: NextFunction): void => {
  const apiKey = req.headers['x-api-key'] as string;
  
  if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
    res.status(401).json({
      ok: false,
      error: 'Unauthorized - Invalid API key'
    });
    return;
  }
  
  next();
};

export const validateAdminAuth = (req: Request, res: Response, next: NextFunction) => {
  // Check for JWT token first
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // JWT authentication will be handled by middleware
    return next();
  }
  
  // Fallback to API key authentication
  const apiKey = req.headers['x-api-key'] as string;
  if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({
      ok: false,
      error: 'Unauthorized - JWT token or API key required'
    });
  }
  
  next();
};

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    res.status(400).json({
      ok: false,
      error: 'Invalid input',
      details: errors.array()
    });
    return;
  }
  
  next();
};

export const sanitizeSignPetitionRequest = (req: Request, _res: Response, next: NextFunction): void => {
  const body = req.body as SignPetitionRequest;
  
  // Sanitize inputs
  body.full_name = body.full_name?.trim().replace(/[<>]/g, '') || '';
  body.country = body.country?.trim().toUpperCase() || undefined;
  
  req.body = body;
  next();
};
