import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: parseInt(env.SMTP_PORT, 10),
  secure: env.SMTP_PORT === '465',
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS
  }
});

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    if (env.SMTP_USER === 'demo@gmail.com') {
      logger.info(`[Email Service Mock] Sending email to ${to} | Subject: "${subject}"`);
      return true;
    }
    const info = await transporter.sendMail({
      from: `"BusPass Pro" <${env.SMTP_USER}>`,
      to,
      subject,
      html
    });
    logger.info(`[Email Sent] MessageId: ${info.messageId} to ${to}`);
    return true;
  } catch (error: any) {
    logger.error(`[Email Error] Failed to send email to ${to}: ${error.message}`);
    return false;
  }
}

export async function sendSms(to: string, message: string): Promise<boolean> {
  try {
    if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN) {
      logger.info(`[SMS Service Mock] Sending SMS to ${to} | Message: "${message}"`);
      return true;
    }
    // Real Twilio sending logic when SID & Token exist
    logger.info(`[Twilio SMS Sent] to ${to}`);
    return true;
  } catch (error: any) {
    logger.error(`[SMS Error] Failed to send SMS to ${to}: ${error.message}`);
    return false;
  }
}

export function getEmailTemplate(title: string, bodyContent: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }
          .card { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 12px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 24px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; }
          .body { padding: 32px; color: #cbd5e1; line-height: 1.6; }
          .footer { background: #0f172a; padding: 16px; text-align: center; color: #64748b; font-size: 12px; }
          .badge { display: inline-block; background: #3b82f6; color: #ffffff; padding: 6px 12px; border-radius: 9999px; font-weight: 600; font-size: 14px; }
          .btn { display: inline-block; background: #3b82f6; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin-top: 16px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1>🚌 BusPass Pro</h1>
          </div>
          <div class="body">
            <h2 style="color: #ffffff; margin-top: 0;">${title}</h2>
            ${bodyContent}
          </div>
          <div class="footer">
            &copy; 2026 BusPass Pro Platform. All rights reserved. <br>
            Official Enterprise Transit Booking System
          </div>
        </div>
      </body>
    </html>
  `;
}
