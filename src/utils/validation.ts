import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { SignPetitionRequest } from '../types';

// Valid country codes from the frontend
const VALID_COUNTRY_CODES = [
  'US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'CH', 'AT', 'SE', 'NO', 'DK', 'FI', 'IE', 'PT', 'GR', 'PL', 'CZ', 'HU', 'RO', 'BG', 'HR', 'SI', 'SK', 'LT', 'LV', 'EE', 'JP', 'KR', 'CN', 'IN', 'SG', 'HK', 'TW', 'TH', 'MY', 'ID', 'PH', 'VN', 'BR', 'AR', 'CL', 'CO', 'MX', 'PE', 'ZA', 'EG', 'NG', 'KE', 'MA', 'TN', 'DZ', 'IL', 'AE', 'SA', 'TR', 'RU', 'UA', 'BY', 'KZ', 'UZ', 'NZ', 'FJ', 'PG', 'Other'
];

export const validateSignPetition = [
  body('first_name')
    .isLength({ min: 2, max: 50 })
    .trim()
    .escape()
    .withMessage('First name is required and must be 2-50 characters'),
  
  body('last_name')
    .isLength({ min: 2, max: 50 })
    .trim()
    .escape()
    .withMessage('Last name is required and must be 2-50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  
  body('country')
    .isLength({ min: 2, max: 2 })
    .isUppercase()
    .isIn(VALID_COUNTRY_CODES)
    .withMessage('Country must be a valid 2-letter country code'),
  
  body('city')
    .isLength({ min: 2, max: 100 })
    .trim()
    .escape()
    .withMessage('City is required and must be 2-100 characters'),
  
  body('state')
    .optional()
    .isLength({ min: 2, max: 50 })
    .trim()
    .escape()
    .withMessage('State must be 2-50 characters if provided'),
  
  body('consent_news')
    .optional()
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
  body.first_name = body.first_name?.trim().replace(/[<>]/g, '') || '';
  body.last_name = body.last_name?.trim().replace(/[<>]/g, '') || '';
  body.country = body.country?.trim().toUpperCase() || '';
  body.city = body.city?.trim().replace(/[<>]/g, '') || '';
  body.state = body.state?.trim().replace(/[<>]/g, '') || undefined;
  
  req.body = body;
  next();
};
