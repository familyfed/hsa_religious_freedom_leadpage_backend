import crypto from 'crypto';
import { config } from '../config';
import { logger } from '../utils/logger';

export class SecurityService {
  async verifyTurnstileToken(token: string, ip: string): Promise<boolean> {
    try {
      // Check if secret key is configured
      if (!config.security.turnstile.secretKey) {
        logger.error('Turnstile secret key not configured');
        return false;
      }

      // Check if token is provided
      if (!token || token.trim() === '') {
        logger.warn('Turnstile token is empty or missing', { ip });
        return false;
      }

      const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          secret: config.security.turnstile.secretKey,
          response: token,
          remoteip: ip,
        }),
      });

      if (!response.ok) {
        logger.error('Turnstile verification request failed', { 
          status: response.status,
          statusText: response.statusText,
          ip 
        });
        return false;
      }

      const result = await response.json() as any;
      
      if (!result.success) {
        logger.warn('Turnstile verification failed', { 
          token: token.substring(0, 10) + '...',
          ip,
          errors: result['error-codes'],
          success: result.success
        });
        return false;
      }

      logger.info('Turnstile verification successful', { ip });
      return true;
    } catch (error) {
      logger.error('Error verifying Turnstile token', { error: error instanceof Error ? error.message : String(error), ip });
      return false;
    }
  }

  generateConfirmToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  hashData(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  isDisposableEmail(email: string): boolean {
    const disposableDomains = [
      '10minutemail.com',
      'tempmail.org',
      'guerrillamail.com',
      'mailinator.com',
      'yopmail.com',
      'temp-mail.org',
      'throwaway.email',
      'getnada.com',
      'maildrop.cc',
      'sharklasers.com',
    ];

    const domain = email.split('@')[1]?.toLowerCase();
    return disposableDomains.includes(domain || '');
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  sanitizeInput(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  }
}

export const securityService = new SecurityService();
