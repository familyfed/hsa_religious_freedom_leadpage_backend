import { Resend } from 'resend';
import { config } from '../config';
import { db } from '../database/supabase';
import { logger } from '../utils/logger';

const resend = new Resend(config.email.resendApiKey);

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export class EmailService {
  async sendConfirmationEmail(
    to: string,
    fullName: string,
    petitionSlug: string,
    confirmToken: string
  ): Promise<boolean> {
    const confirmUrl = `${config.appOrigin}/api/confirm?token=${confirmToken}`;
    
    const template = this.getConfirmEmailTemplate(fullName, confirmUrl);
    
    try {
      const { data, error } = await resend.emails.send({
        from: config.email.from,
        to,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      // Log email attempt
      await db.logEmail({
        to_email: to,
        template: 'confirm',
        meta: {
          petition_slug: petitionSlug,
          confirm_token: confirmToken,
          resend_id: data?.id,
        },
        success: !error,
        error: error?.message || undefined,
      });

      if (error) {
        logger.error('Failed to send confirmation email', { error, to, petitionSlug });
        return false;
      }

      logger.info('Confirmation email sent successfully', { to, petitionSlug, resendId: data?.id });
      return true;
    } catch (error) {
      logger.error('Error sending confirmation email', { error, to, petitionSlug });
      
      await db.logEmail({
        to_email: to,
        template: 'confirm',
        meta: { petition_slug: petitionSlug, confirm_token: confirmToken },
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return false;
    }
  }

  async sendThankYouEmail(
    to: string,
    fullName: string,
    petitionSlug: string
  ): Promise<boolean> {
    const template = this.getThankYouEmailTemplate(fullName);
    
    try {
      const { data, error } = await resend.emails.send({
        from: config.email.from,
        to,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      // Log email attempt
      await db.logEmail({
        to_email: to,
        template: 'thank_you',
        meta: { petition_slug: petitionSlug },
        success: !error,
        error: error?.message || undefined,
      });

      if (error) {
        logger.error('Failed to send thank you email', { error, to, petitionSlug });
        return false;
      }

      logger.info('Thank you email sent successfully', { to, petitionSlug, resendId: data?.id });
      return true;
    } catch (error) {
      logger.error('Error sending thank you email', { error, to, petitionSlug });
      
      await db.logEmail({
        to_email: to,
        template: 'thank_you',
        meta: { petition_slug: petitionSlug },
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return false;
    }
  }

  private getConfirmEmailTemplate(fullName: string, confirmUrl: string): EmailTemplate {
    return {
      subject: 'Please confirm your petition signature',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirm Your Signature</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #f8f9fa; padding: 30px; border-radius: 8px; text-align: center;">
            <h1 style="color: #2c3e50; margin-bottom: 20px;">Thank you for signing!</h1>
            <p style="font-size: 16px; margin-bottom: 30px;">Hi ${fullName},</p>
            <p style="font-size: 16px; margin-bottom: 30px;">
              Thank you for adding your voice to our petition. To complete your signature, please click the button below:
            </p>
            <a href="${confirmUrl}" 
               style="display: inline-block; background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0;">
              Confirm Your Signature
            </a>
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              If the button doesn't work, you can copy and paste this link into your browser:<br>
              <a href="${confirmUrl}" style="color: #007bff;">${confirmUrl}</a>
            </p>
            <p style="font-size: 12px; color: #999; margin-top: 30px;">
              This confirmation link will expire in 24 hours.
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
        Thank you for signing!
        
        Hi ${fullName},
        
        Thank you for adding your voice to our petition. To complete your signature, please visit this link:
        
        ${confirmUrl}
        
        This confirmation link will expire in 24 hours.
        
        Best regards,
        The Petition Team
      `,
    };
  }

  private getThankYouEmailTemplate(fullName: string): EmailTemplate {
    return {
      subject: 'Your signature has been confirmed!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Signature Confirmed</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #f8f9fa; padding: 30px; border-radius: 8px; text-align: center;">
            <h1 style="color: #28a745; margin-bottom: 20px;">✓ Signature Confirmed!</h1>
            <p style="font-size: 16px; margin-bottom: 30px;">Hi ${fullName},</p>
            <p style="font-size: 16px; margin-bottom: 30px;">
              Your signature has been successfully confirmed and added to our petition. Thank you for standing with us!
            </p>
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p style="font-size: 14px; color: #666; margin: 0;">
                Your voice matters. Together, we can make a difference.
              </p>
            </div>
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              Thank you for your support!
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
        Signature Confirmed!
        
        Hi ${fullName},
        
        Your signature has been successfully confirmed and added to our petition. Thank you for standing with us!
        
        Your voice matters. Together, we can make a difference.
        
        Thank you for your support!
        
        Best regards,
        The Petition Team
      `,
    };
  }
}

export const emailService = new EmailService();
