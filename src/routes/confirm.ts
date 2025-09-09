import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger';

const router = Router();

// GET /api/confirm?token=...
// Note: Email confirmation is disabled for phone-based signatures
router.get('/', async (_req: Request, res: Response) => {
  try {
    logger.info('Confirm route accessed - email confirmation disabled for phone-based signatures');
    
    // Since we're using phone numbers and immediate confirmation,
    // this route just redirects to thank you page
    res.redirect('/thank-you');

  } catch (error) {
    logger.error('Error in confirm route', { error });
    res.redirect('/thank-you');
  }
});

export default router;
