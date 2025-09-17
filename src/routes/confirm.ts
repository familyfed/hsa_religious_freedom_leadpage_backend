import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger';
import { db } from '../database/supabase';
import { emailService } from '../services/email';

const router = Router();

// GET /api/confirm?token=...
// Handle email confirmation for email-based signatures
router.get('/', async (req: Request, res: Response) => {
  try {
    const { token } = req.query;
    
    if (!token || typeof token !== 'string') {
      logger.warn('Confirm route accessed without token');
      res.redirect('https://staging.petition.motherofpeace.com/thank-you?error=invalid_token');
      return;
    }

    logger.info('Email confirmation attempt', { token: token.substring(0, 10) + '...' });

    // Find signature by confirm token
    const signature = await db.getSignatureByConfirmToken(token);
    
    if (!signature) {
      logger.warn('Invalid confirm token', { token: token.substring(0, 10) + '...' });
      res.redirect('https://staging.petition.motherofpeace.com/thank-you?error=invalid_token');
      return;
    }

    if (signature.status === 'confirmed') {
      logger.info('Signature already confirmed', { signatureId: signature.id });
      res.redirect('https://staging.petition.motherofpeace.com/thank-you?already_confirmed=true');
      return;
    }

    // Check if token is expired (24 hours)
    const tokenAge = Date.now() - new Date(signature.created_at).getTime();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    if (tokenAge > maxAge) {
      logger.warn('Confirm token expired', { 
        signatureId: signature.id, 
        age: Math.round(tokenAge / (60 * 60 * 1000)) + ' hours' 
      });
      res.redirect('https://staging.petition.motherofpeace.com/thank-you?error=expired_token');
      return;
    }

    // Confirm the signature
    const confirmed = await db.confirmSignature(signature.id);
    
    if (!confirmed) {
      logger.error('Failed to confirm signature', { signatureId: signature.id });
      res.redirect('https://staging.petition.motherofpeace.com/thank-you?error=confirmation_failed');
      return;
    }

    logger.info('Signature confirmed successfully', { 
      signatureId: signature.id,
      email: signature.email 
    });

    // Send thank you email
    if (signature.email) {
      try {
        await emailService.sendThankYouEmail(
          signature.email,
          `${signature.first_name} ${signature.last_name}`,
          'petition-for-the-mother-of-peace'
        );
      } catch (error) {
        logger.error('Failed to send thank you email', { 
          error, 
          signatureId: signature.id,
          email: signature.email 
        });
        // Don't fail the confirmation if email fails
      }
    }

    // Redirect to frontend thank you page
    res.redirect('https://staging.petition.motherofpeace.com/thank-you?confirmed=true');

  } catch (error) {
    logger.error('Error in confirm route', { error });
    res.redirect('https://staging.petition.motherofpeace.com/thank-you?error=server_error');
  }
});

export default router;
