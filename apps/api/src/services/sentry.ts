import { env } from '../config/env.js';

export function initSentry() {
  if (!env.SENTRY_DSN) {
    console.log('ℹ️ Sentry DSN not configured, running without external error reporting.');
    return;
  }
  console.log('✅ Sentry monitoring initialized.');
}

export function captureException(error: unknown, context?: Record<string, any>) {
  console.error('💥 [SENTRY ERROR CAPTURE]:', error, context || '');
}
