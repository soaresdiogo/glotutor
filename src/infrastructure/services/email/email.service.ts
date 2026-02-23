import { Resend } from 'resend';
import { env } from '@/env';
import {
  toLocaleCode,
  translateApiMessage,
} from '@/shared/lib/translate-api-message';

/** GloTutor brand accent color for email buttons and token box (from globals.css --accent). */
const EMAIL_ACCENT_COLOR = '#6366f1';

export interface EmailService {
  sendMfaCodeEmail(
    to: string,
    code: string,
    locale?: string | null,
  ): Promise<void>;
  sendPasswordResetEmail(
    to: string,
    resetLink: string,
    locale?: string | null,
  ): Promise<void>;
  sendVerificationEmail(
    to: string,
    verifyLink: string,
    locale?: string | null,
  ): Promise<void>;
  sendPaymentLinkEmail(
    to: string,
    paymentLink: string,
    locale?: string | null,
  ): Promise<void>;
}

/**
 * Email service using Resend.
 * Set RESEND_API_KEY and EMAIL_FROM in .env.
 * Use no-reply@ for transactional emails (e.g. "Glotutor <no-reply@glotutor.com>").
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

  async sendMfaCodeEmail(
    to: string,
    code: string,
    locale?: string | null,
  ): Promise<void> {
    const loc = toLocaleCode(locale ?? 'en');
    const subject = translateApiMessage(loc, 'email.mfaSubject');
    const title = translateApiMessage(loc, 'email.mfaTitle');
    const body = translateApiMessage(loc, 'email.mfaBody');
    const expiry = translateApiMessage(loc, 'email.mfaExpiry');
    const html = `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #fff; border-radius: 8px; padding: 32px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="font-size: 24px; margin-bottom: 24px; color: #111;">${title}</h1>
            <p style="font-size: 16px; margin-bottom: 24px;">${body}</p>
            <div style="text-align: center; margin: 32px 0;">
              <div style="display: inline-block; background: #f3f4f6; border: 2px dashed ${EMAIL_ACCENT_COLOR}; border-radius: 8px; padding: 20px 40px;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #111; font-family: 'Courier New', monospace;">${code}</span>
              </div>
            </div>
            <p style="font-size: 14px; color: #6b7280;">${expiry}</p>
          </div>
        </body>
      </html>
    `;
    await this.send(to, subject, html);
  }

  async sendPasswordResetEmail(
    to: string,
    resetLink: string,
    locale?: string | null,
  ): Promise<void> {
    const loc = toLocaleCode(locale ?? 'en');
    const subject = translateApiMessage(loc, 'email.resetSubject');
    const body = translateApiMessage(loc, 'email.resetBody');
    const button = translateApiMessage(loc, 'email.resetButton');
    const linkCopy = translateApiMessage(loc, 'email.resetLinkCopy');
    const expiry = translateApiMessage(loc, 'email.resetExpiry');
    const html = `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <p>${body}</p>
          <p><a href="${resetLink}" style="display: inline-block; background: ${EMAIL_ACCENT_COLOR}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">${button}</a></p>
          <p>${linkCopy} ${resetLink}</p>
          <p style="font-size: 14px; color: #6b7280;">${expiry}</p>
        </body>
      </html>
    `;
    await this.send(to, subject, html);
  }

  async sendVerificationEmail(
    to: string,
    verifyLink: string,
    locale?: string | null,
  ): Promise<void> {
    const loc = toLocaleCode(locale ?? 'en');
    const subject = translateApiMessage(loc, 'email.verifySubject');
    const title = translateApiMessage(loc, 'email.verifyTitle');
    const body = translateApiMessage(loc, 'email.verifyBody');
    const button = translateApiMessage(loc, 'email.verifyButton');
    const expiry = translateApiMessage(loc, 'email.verifyExpiry');
    const html = `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #fff; border-radius: 8px; padding: 32px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="font-size: 24px; margin-bottom: 24px; color: #111;">${title}</h1>
            <p style="font-size: 16px; margin-bottom: 24px;">${body}</p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${verifyLink}" style="display: inline-block; background: ${EMAIL_ACCENT_COLOR}; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">${button}</a>
            </div>
            <p style="font-size: 14px; color: #6b7280;">${expiry}</p>
          </div>
        </body>
      </html>
    `;
    await this.send(to, subject, html);
  }

  async sendPaymentLinkEmail(
    to: string,
    paymentLink: string,
    locale?: string | null,
  ): Promise<void> {
    const loc = toLocaleCode(locale ?? 'en');
    const subject = translateApiMessage(loc, 'email.paymentSubject');
    const title = translateApiMessage(loc, 'email.paymentTitle');
    const body = translateApiMessage(loc, 'email.paymentBody');
    const button = translateApiMessage(loc, 'email.paymentButton');
    const expiry = translateApiMessage(loc, 'email.paymentExpiry');
    const copyLink = translateApiMessage(loc, 'email.paymentCopyLink');
    const html = `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #fff; border-radius: 8px; padding: 32px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="font-size: 24px; margin-bottom: 24px; color: #111;">${title}</h1>
            <p style="font-size: 16px; margin-bottom: 24px;">${body}</p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${paymentLink}" style="display: inline-block; background: ${EMAIL_ACCENT_COLOR}; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">${button}</a>
            </div>
            <p style="font-size: 14px; color: #6b7280;">${expiry}</p>
            <p style="font-size: 14px; color: #6b7280; margin-top: 16px;">${copyLink}</p>
            <p style="font-size: 12px; word-break: break-all; color: #6b7280;">${paymentLink}</p>
          </div>
        </body>
      </html>
    `;
    await this.send(to, subject, html);
  }
}

export const emailService = new ResendEmailService();
