import { Router, Request, Response } from 'express';
import { db } from '../database/supabase';
import { emailService } from '../services/email';
import { logger } from '../utils/logger';

const router = Router();

// GET /api/confirm?token=...
router.get('/', async (req: Request, res: Response) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      logger.warn('Confirm request without token');
      return res.redirect('/expired');
    }

    logger.info('Confirm token request', { token: token.substring(0, 10) + '...' });

    // Confirm signature
    const signature = await db.confirmSignature(token);
    
    if (!signature) {
      logger.warn('Invalid or expired confirm token', { token: token.substring(0, 10) + '...' });
      return res.redirect('/expired');
    }

    // Get petition info for thank you email
    const petition = await db.getPetitionBySlug(signature.petition_id);
    if (petition) {
      // Send thank you email
      const emailSent = await emailService.sendThankYouEmail(
        signature.email,
        signature.full_name,
        petition.slug
      );

      if (!emailSent) {
        logger.warn('Failed to send thank you email', { 
          email: signature.email, 
          petitionSlug: petition.slug 
        });
      }
    }

    logger.info('Signature confirmed successfully', { 
      signatureId: signature.id, 
      email: signature.email 
    });

    res.redirect('/thank-you');

  } catch (error) {
    logger.error('Error confirming signature', { error, token: req.query.token });
    res.redirect('/expired');
  }
});

export default router;
