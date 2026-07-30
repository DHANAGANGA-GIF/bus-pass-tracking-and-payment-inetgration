
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.string().default('587'),
  SMTP_USER: z.string().default('demo@gmail.com'),
  SMTP_PASS: z.string().default('app-password'),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
  RAZORPAY_KEY_ID: z.string().default('rzp_test_mockkey123'),
  RAZORPAY_KEY_SECRET: z.string().default('rzp_secret_mock456'),
  RAZORPAY_WEBHOOK_SECRET: z.string().default('whsec_mock_razorpay'),
  STRIPE_SECRET_KEY: z.string().default('sk_test_mock789'),
  STRIPE_WEBHOOK_SECRET: z.string().default('whsec_mock'),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  CORS_ORIGIN: z.string().optional(), // comma-separated list for production
  PASS_HMAC_SECRET: z.string().min(16, 'PASS_HMAC_SECRET must be at least 16 characters').default('bus-pass-hmac-secret-signature-key-2026'),
  LOG_LEVEL: z.string().default('info'),
  // Google OAuth - required, must NOT be placeholder values
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required and must not be a placeholder'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required and must not be a placeholder'),
  GOOGLE_CALLBACK_URL: z.string().url().default('http://localhost:5000/api/auth/google/callback'),
});

export const env = envSchema.parse(process.env);
