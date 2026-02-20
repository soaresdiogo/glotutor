import { Resend } from 'resend';
import { env } from '@/env';

export interface EmailService {
  sendMfaCodeEmail(to: string, code: string): Promise<void>;
  sendPasswordResetEmail(to: string, resetLink: string): Promise<void>;
  sendVerificationEmail(to: string, verifyLink: string): Promise<void>;
  sendPaymentLinkEmail(to: string, paymentLink: string): Promise<void>;
}

/**
 * Email service using Resend.
 * Set RESEND_API_KEY and EMAIL_FROM (e.g. "Glotutor <no-reply@yourdomain.com>") in .env.
 * EMAIL_FROM must use a domain verified in your Resend dashboard.
 */
class ResendEmailService implements EmailService {
  private readonly resend: Resend | null;
  private readonly fromAddress: string;

  constructor() {
    const apiKey = env.RESEND_API_KEY;
    this.resend = apiKey ? new Resend(apiKey) : null;
    this.fromAddress = env.EMAIL_FROM;
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    if (!this.resend) {
      console.warn(
        '[EmailService] RESEND_API_KEY not set, skipping email to',
        to,
      );
      return;
    }

    const { data, error } = await this.resend.emails.send({
      from: this.fromAddress,
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error('[EmailService] Resend failed:', { to, subject, error });
      throw new Error('Failed to send email.', { cause: error });
    }

    if (process.env.NODE_ENV === 'development' && data?.id) {
      console.log('[EmailService] Sent to', to, 'id:', data.id);
    }
  }

  async sendMfaCodeEmail(to: string, code: string): Promise<void> {
    const subject = 'Your login verification code';
    const html = `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #fff; border-radius: 8px; padding: 32px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="font-size: 24px; margin-bottom: 24px; color: #111;">Verification code</h1>
            <p style="font-size: 16px; margin-bottom: 24px;">Use the code below to complete sign in:</p>
            <div style="text-align: center; margin: 32px 0;">
              <div style="display: inline-block; background: #f3f4f6; border: 2px dashed #0ea5e9; border-radius: 8px; padding: 20px 40px;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #111; font-family: 'Courier New', monospace;">${code}</span>
              </div>
            </div>
            <p style="font-size: 14px; color: #6b7280;">This code expires in 10 minutes. If you didn't request it, ignore this email.</p>
          </div>
        </body>
      </html>
    `;
    await this.send(to, subject, html);
  }

  async sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
    const subject = 'Reset your password';
    const html = `
      <p>You requested a password reset.</p>
      <p><a href="${resetLink}" style="display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset password</a></p>
      <p>Or copy this link: ${resetLink}</p>
      <p style="font-size: 14px; color: #6b7280;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
    `;
    await this.send(to, subject, html);
  }

  async sendVerificationEmail(to: string, verifyLink: string): Promise<void> {
    const subject = 'Verify your email address';
    const html = `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #fff; border-radius: 8px; padding: 32px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="font-size: 24px; margin-bottom: 24px; color: #111;">Verify your email</h1>
            <p style="font-size: 16px; margin-bottom: 24px;">Thanks for signing up. Click the button below to verify your email.</p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${verifyLink}" style="display: inline-block; background: #0ea5e9; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Verify my email</a>
            </div>
            <p style="font-size: 14px; color: #6b7280;">This link expires in 24 hours. If you didn't create an account, ignore this email.</p>
          </div>
        </body>
      </html>
    `;
    await this.send(to, subject, html);
  }

  async sendPaymentLinkEmail(to: string, paymentLink: string): Promise<void> {
    const subject = 'Complete your subscription';
    const html = `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #fff; border-radius: 8px; padding: 32px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="font-size: 24px; margin-bottom: 24px; color: #111;">Complete your signup</h1>
            <p style="font-size: 16px; margin-bottom: 24px;">Click the button below to complete your subscription and payment. You will be redirected to our secure checkout.</p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${paymentLink}" style="display: inline-block; background: #0ea5e9; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Continue to payment</a>
            </div>
            <p style="font-size: 14px; color: #6b7280;">This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
            <p style="font-size: 14px; color: #6b7280; margin-top: 16px;">Or copy and paste this link into your browser:</p>
            <p style="font-size: 12px; word-break: break-all; color: #6b7280;">${paymentLink}</p>
          </div>
        </body>
      </html>
    `;
    await this.send(to, subject, html);
  }
}

export const emailService = new ResendEmailService();
