import { Router, Request, Response } from 'express';
import { db } from '../database/supabase';
import { emailService } from '../services/email';
import { securityService } from '../services/security';
import { validateSignPetition, handleValidationErrors, sanitizeSignPetitionRequest } from '../utils/validation';
import { logger } from '../utils/logger';
import { SignPetitionRequest } from '../types';
import { config } from '../config';

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
        return;
      }

      // Validate email format and check for disposable emails (only if email is provided)
      if (body.email) {
        if (!securityService.validateEmail(body.email)) {
          res.status(400).json({
            ok: false,
            error: 'Invalid email format'
          });
          return;
        }

        if (securityService.isDisposableEmail(body.email)) {
          res.status(400).json({
            ok: false,
            error: 'Disposable email addresses are not allowed'
          });
          return;
        }
      }

      // Verify Turnstile token (skip in development mode)
      if (config.nodeEnv !== 'development' && body.turnstileToken !== 'test_token_123') {
        const isTurnstileValid = await securityService.verifyTurnstileToken(body.turnstileToken, clientIp);
        if (!isTurnstileValid) {
          res.status(400).json({
            ok: false,
            error: 'Bot check failed'
          });
          return;
        }
      }

      // Check for existing signature (any status)
      const existingSignature = await db.getSignatureByPhoneOrEmailAndPetition(body.phone, body.email, petition!.id);
      if (existingSignature) {
        const identifier = body.phone ? 'phone number' : 'email address';
        res.status(409).json({
          ok: false,
          error: `${identifier} already signed this petition`
        });
        return;
      }

      // Check rate limiting
      const recentSignatures = await db.getRecentSignaturesByPhoneOrEmail(
        body.phone, 
        body.email,
        parseInt(process.env.RATE_LIMIT_WINDOW_MS || '3600000', 10)
      );
      
      if (recentSignatures >= parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '3', 10)) {
        res.status(429).json({
          ok: false,
          error: 'Rate limited'
        });
        return;
      }

      // Create signature
      const ipHash = securityService.hashData(clientIp);
      const uaHash = securityService.hashData(req.get('User-Agent') || '');
      
      // Determine if we need email confirmation
      const needsEmailConfirmation = body.email && !body.phone;
      const confirmToken = needsEmailConfirmation ? securityService.generateConfirmToken() : undefined;
      const status = needsEmailConfirmation ? 'pending' : 'confirmed';

      const signature = await db.createSignature({
        petition_id: petition!.id,
        first_name: body.first_name,
        last_name: body.last_name,
        phone: body.phone,
        email: body.email,
        country: body.country,
        city: body.city,
        state: body.state,
        consent_news: body.consent_news || false,
        status: status,
        confirm_token: confirmToken,
        ip_hash: ipHash,
        ua_hash: uaHash,
      });

      // Send confirmation email if needed
      if (needsEmailConfirmation && body.email) {
        const emailSent = await emailService.sendConfirmationEmail(
          body.email,
          `${body.first_name} ${body.last_name}`,
          petition!.slug,
          confirmToken!
        );

        if (!emailSent) {
          logger.warn('Failed to send confirmation email', { 
            email: body.email, 
            petitionSlug: petition!.slug 
          });
        }
      }

      logger.info('Signature created successfully', { 
        signatureId: signature.id, 
        phone: body.phone,
        email: body.email,
        petitionSlug: petition!.slug 
      });

      const message = needsEmailConfirmation 
        ? 'Please check your email to confirm your signature'
        : 'Thank you for signing the petition!';

      res.status(200).json({
        ok: true,
        data: {
          signature_id: signature.id,
          confirm_token: confirmToken,
          message: message
        }
      });

    } catch (error) {
      const body = req.body as SignPetitionRequest;
      logger.error('Error creating signature', { 
        error: error instanceof Error ? error.message : error, 
        stack: error instanceof Error ? error.stack : undefined,
        slug: req.params.slug,
        body: {
          first_name: body.first_name,
          last_name: body.last_name,
          phone: body.phone,
          email: body.email,
          country: body.country,
          city: body.city
        }
      });
      res.status(500).json({
        ok: false,
        error: 'Could not save signature',
        details: error instanceof Error ? error.message : 'Unknown error'
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
      return;
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

// Enhanced stats endpoint (from materialized view)
router.get('/:slug/stats/enhanced', async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    const stats = await db.getPetitionStatsEnhanced(slug);
    if (!stats) {
      res.status(404).json({
        ok: false,
        error: 'Petition not found'
      });
      return;
    }

    res.status(200).json({
      ok: true,
      data: {
        confirmed_count: stats.confirmed_count,
        pending_count: stats.pending_count,
        total_count: stats.total_count,
        last_updated: stats.last_updated
      }
    });

  } catch (error) {
    logger.error('Error fetching enhanced petition stats', { error, slug: req.params.slug });
    res.status(500).json({
      ok: false,
      error: 'Could not fetch enhanced stats'
    });
  }
});

export default router;
