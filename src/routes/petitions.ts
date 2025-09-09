import { Router, Request, Response } from 'express';
import { db } from '../database/supabase';
import { emailService } from '../services/email';
import { securityService } from '../services/security';
import { validateSignPetition, handleValidationErrors, sanitizeSignPetitionRequest } from '../utils/validation';
import { logger } from '../utils/logger';
import { SignPetitionRequest } from '../types';

const router = Router();

// POST /api/petitions/:slug/sign
router.post('/:slug/sign', 
  validateSignPetition,
  handleValidationErrors,
  sanitizeSignPetitionRequest,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { slug } = req.params;
      const body = req.body as SignPetitionRequest;
      const clientIp = req.ip || req.connection.remoteAddress || 'unknown';

      logger.info('Petition sign request', { slug, email: body.email, ip: clientIp });

      // Get petition
      const petition = await db.getPetitionBySlug(slug);
      if (!petition) {
        res.status(404).json({
          ok: false,
          error: 'Petition not found'
        });
      }

      // Validate email format and check for disposable emails
      if (!securityService.validateEmail(body.email)) {
        res.status(400).json({
          ok: false,
          error: 'Invalid email format'
        });
      }

      if (securityService.isDisposableEmail(body.email)) {
        res.status(400).json({
          ok: false,
          error: 'Disposable email addresses are not allowed'
        });
      }

      // Verify Turnstile token
      const isTurnstileValid = await securityService.verifyTurnstileToken(body.turnstileToken, clientIp);
      if (!isTurnstileValid) {
        res.status(400).json({
          ok: false,
          error: 'Bot check failed'
        });
      }

      // Check for existing pending signature
      const existingSignature = await db.getSignatureByEmailAndPetition(body.email, petition!.id);
      if (existingSignature) {
        res.status(409).json({
          ok: false,
          error: 'Duplicate pending'
        });
      }

      // Check rate limiting
      const recentSignatures = await db.getRecentSignaturesByEmail(
        body.email, 
        parseInt(process.env.RATE_LIMIT_WINDOW_MS || '3600000', 10)
      );
      
      if (recentSignatures >= parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '3', 10)) {
        res.status(429).json({
          ok: false,
          error: 'Rate limited'
        });
      }

      // Create signature
      const confirmToken = securityService.generateConfirmToken();
      const ipHash = securityService.hashData(clientIp);
      const uaHash = securityService.hashData(req.get('User-Agent') || '');

      const signature = await db.createSignature({
        petition_id: petition!.id,
        email: body.email,
        full_name: body.full_name,
        country: body.country || undefined,
        consent_news: body.consent_news,
        status: 'pending',
        confirm_token: confirmToken,
        ip_hash: ipHash,
        ua_hash: uaHash,
      });

      // Send confirmation email
      const emailSent = await emailService.sendConfirmationEmail(
        body.email,
        body.full_name,
        petition!.slug,
        confirmToken
      );

      if (!emailSent) {
        logger.warn('Failed to send confirmation email', { 
          email: body.email, 
          petitionSlug: petition!.slug 
        });
      }

      logger.info('Signature created successfully', { 
        signatureId: signature.id, 
        email: body.email, 
        petitionSlug: petition!.slug 
      });

      res.status(200).json({ ok: true });

    } catch (error) {
      logger.error('Error creating signature', { error, slug: req.params.slug });
      res.status(500).json({
        ok: false,
        error: 'Could not save signature'
      });
    }
  }
);

// GET /api/petitions/:slug/stats
router.get('/:slug/stats', async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    const stats = await db.getPetitionStats(slug);
    if (!stats) {
      res.status(404).json({
        ok: false,
        error: 'Petition not found'
      });
    }

    res.status(200).json({
      ok: true,
      data: {
        confirmed_count: stats!.confirmed_count
      }
    });

  } catch (error) {
    logger.error('Error fetching petition stats', { error, slug: req.params.slug });
    res.status(500).json({
      ok: false,
      error: 'Could not fetch stats'
    });
  }
});

export default router;
