import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger';
import { db } from '../database/supabase';
import { emailService } from '../services/email';
import { config } from '../config';

const router = Router();

// GET /api/confirm?token=...
// Handle email confirmation for email-based signatures
router.get('/', async (req: Request, res: Response) => {
  // Determine frontend URL based on environment
  const frontendUrl = config.nodeEnv === 'production' 
    ? 'https://petition.motherofpeace.com'
    : 'https://staging.petition.motherofpeace.com';
    
  try {
    const { token } = req.query;
    
    if (!token || typeof token !== 'string') {
      logger.warn('Confirm route accessed without token');
      res.redirect(`${frontendUrl}/thank-you?error=invalid_token`);
      return;
    }

    logger.info('Email confirmation attempt', { token: token.substring(0, 10) + '...' });

    // Find signature by confirm token
    const signature = await db.getSignatureByConfirmToken(token);
    
    if (!signature) {
      logger.warn('Invalid confirm token', { token: token.substring(0, 10) + '...' });
      res.redirect(`${frontendUrl}/thank-you?error=invalid_token`);
      return;
    }

    if (signature.status === 'confirmed') {
      logger.info('Signature already confirmed', { signatureId: signature.id });
      res.redirect(`${frontendUrl}/thank-you?already_confirmed=true`);
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
      res.redirect(`${frontendUrl}/thank-you?error=expired_token`);
      return;
    }

    // Confirm the signature
    const confirmed = await db.confirmSignature(signature.id);
    
    if (!confirmed) {
      logger.error('Failed to confirm signature', { signatureId: signature.id });
      res.redirect(`${frontendUrl}/thank-you?error=confirmation_failed`);
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
    res.redirect(`${frontendUrl}/thank-you?confirmed=true`);

  } catch (error) {
    logger.error('Error in confirm route', { error });
    res.redirect(`${frontendUrl}/thank-you?error=server_error`);
  }
});

// POST /api/confirm/resend
// Resend confirmation email for pending signatures
router.post('/resend', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email || typeof email !== 'string') {
      res.status(400).json({
        ok: false,
        error: 'Email address is required'
      });
      return;
    }

    logger.info('Resend confirmation request', { email });

    // Find pending signature by email
    const signature = await db.getSignatureByEmailAndPetition(email, 'petition-for-the-mother-of-peace');
    
    if (!signature) {
      logger.warn('No pending signature found for resend', { email });
      res.status(404).json({
        ok: false,
        error: 'No pending signature found for this email address'
      });
      return;
    }

    if (signature.status !== 'pending') {
      logger.warn('Signature is not pending, cannot resend', { 
        email, 
        status: signature.status 
      });
      res.status(400).json({
        ok: false,
        error: 'Signature is already confirmed or not pending'
      });
      return;
    }

    // Check if token is expired (24 hours)
    const tokenAge = Date.now() - new Date(signature.created_at).getTime();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    if (tokenAge > maxAge) {
      logger.warn('Confirm token expired, cannot resend', { 
        email,
        age: Math.round(tokenAge / (60 * 60 * 1000)) + ' hours' 
      });
      res.status(400).json({
        ok: false,
        error: 'Confirmation token has expired. Please sign the petition again.'
      });
      return;
    }

    // Resend confirmation email
    if (signature.confirm_token) {
      try {
        await emailService.sendConfirmationEmail(
          signature.email!,
          `${signature.first_name} ${signature.last_name}`,
          'petition-for-the-mother-of-peace',
          signature.confirm_token
        );
        
        logger.info('Confirmation email resent successfully', { 
          email,
          signatureId: signature.id 
        });
        
        res.status(200).json({
          ok: true,
          message: 'Confirmation email has been resent. Please check your inbox.'
        });
        return;
      } catch (error) {
        logger.error('Failed to resend confirmation email', { 
          error, 
          email,
          signatureId: signature.id 
        });
        res.status(500).json({
          ok: false,
          error: 'Failed to resend confirmation email. Please try again later.'
        });
        return;
      }
    } else {
      logger.error('No confirm token found for signature', { 
        email,
        signatureId: signature.id 
      });
      res.status(500).json({
        ok: false,
        error: 'No confirmation token found. Please sign the petition again.'
      });
      return;
    }

  } catch (error) {
    logger.error('Error in resend route', { error });
    res.status(500).json({
      ok: false,
      error: 'Internal server error. Please try again later.'
    });
  }
});

export default router;
