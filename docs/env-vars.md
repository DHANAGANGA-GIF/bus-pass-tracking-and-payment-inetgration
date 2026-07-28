# Environment Variables

This document explains the environment variables used in the Bus Pass Booking Platform.

## Overview
Environment variables are used to configure the application for different environments (development, staging, production) and to keep sensitive information secure.

The application uses the `dotenv` package to load environment variables from a `.env` file at the root of each service (or the root for shared variables).

## Naming Convention
- Variables are in uppercase with underscores separating words.
- Prefixes are used to group related variables (e.g., `DB_` for database, `MAIL_` for email).

## Required Variables

### Node.js Application (Backend - apps/api)
| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| NODE_ENV | Environment mode (development, production, test) | development | Yes |
| PORT | Port number for the server | 3000 | Yes |
| DATABASE_URL | PostgreSQL connection string | `postgresql://user:password@localhost:5432/buspass?schema=public` | Yes |
| REDIS_URL | Redis connection string | `redis://localhost:6379` | Yes |
| JWT_SECRET | Secret for signing JWT access tokens | `your_super_secret_jwt_key` | Yes |
| JWT_EXPIRES_IN | Expiry time for access tokens | `15m` | Yes |
| REFRESH_TOKEN_SECRET | Secret for signing refresh tokens | `your_super_secret_refresh_token_key` | Yes |
| REFRESH_TOKEN_EXPIRES_IN | Expiry time for refresh tokens | `7d` | Yes |
| GOOGLE_CLIENT_ID | Google OAuth client ID | `your_google_client_id` | Yes (if Google OAuth enabled) |
| GOOGLE_CLIENT_SECRET | Google OAuth client secret | `your_google_client_secret` | Yes (if Google OAuth enabled) |
| GOOGLE_CALLBACK_URL | Google OAuth callback URL | `http://localhost:3000/api/auth/google/callback` | Yes (if Google OAuth enabled) |
| RAZORPAY_KEY_ID | Razorpay key ID | `your_razorpay_key_id` | Yes (if Razorpay enabled) |
| RAZORPAY_KEY_SECRET | Razorpay key secret | `your_razorpay_key_secret` | Yes (if Razorpay enabled) |
| RAZORPAY_WEBHOOK_SECRET | Razorpay webhook secret | `your_razorpay_webhook_secret` | Yes (if Razorpay enabled) |
| STRIPE_SECRET_KEY | Stripe secret key (for future use) | `your_stripe_secret_key` | No (for Stripe integration) |
| STRIPE_WEBHOOK_SECRET | Stripe webhook secret (for future use) | `your_stripe_webhook_secret` | No (for Stripe integration) |
| RESEND_API_KEY | Resend API key for sending emails | `your_resend_api_key` | Yes (if using Resend) |
| FROM_EMAIL | Default sender email address | `onboarding@resend.dev` | Yes (if using email) |
| MSG91_AUTH_KEY | MSG91 authentication key for SMS | `your_msg91_auth_key` | Yes (if using MSG91) |
| MSG91_SENDER_ID | Sender ID for SMS (must be approved) | `YOURSENDERID` | Yes (if using MSG91) |
| FCM_SERVICE_ACCOUNT_KEY | Path to Firebase service account key JSON file | `./firebase-service-account.json` | Yes (if using FCM) |
| AWS_ACCESS_KEY_ID | AWS access key ID for S3 | `your_aws_access_key_id` | Yes (if using AWS S3) |
| AWS_SECRET_ACCESS_KEY | AWS secret access key for S3 | `your_aws_secret_access_key` | Yes (if using AWS S3) |
| AWS_REGION | AWS region for S3 | `us-east-1` | Yes (if using AWS S3) |
| AWS_S3_BUCKET_NAME | S3 bucket name for file uploads | `your_bucket_name` | Yes (if using AWS S3) |
| CLOUDINARY_CLOUD_NAME | Cloudinary cloud name (alternative to AWS S3) | `your_cloudinary_cloud_name` | Yes (if using Cloudinary) |
| CLOUDINARY_API_KEY | Cloudinary API key | `your_cloudinary_api_key` | Yes (if using Cloudinary) |
| CLOUDINARY_API_SECRET | Cloudinary API secret | `your_cloudinary_api_secret` | Yes (if using Cloudinary) |
| SENTRY_DSN | Sentry DSN for error tracking | `your_sentry_dsn` | No (optional, for error monitoring) |
| ENABLE_2FA | Enable two-factor authentication | `true` | No (defaults to false) |
| RATE_LIMIT_WINDOW_MS | Rate limit window in milliseconds | `900000` (15 minutes) | No (defaults to 900000) |
| RATE_LIMIT_MAX_REQUESTS | Max requests per window | `100` | No (defaults to 100) |
| APP_URL | Base URL of the user portal | `http://localhost:3000` | Yes |
| ADMIN_APP_URL | Base URL of the admin portal | `http://localhost:3000/admin` | Yes |
| SUPER_ADMIN_APP_URL | Base URL of the super admin portal | `http://localhost:3000/super-admin` | Yes |
| API_URL | Base URL of the API server | `http://localhost:3000/api/v1` | Yes |

### Next.js Frontend (apps/web, apps/admin, apps/super-admin)
| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| NEXT_PUBLIC_API_URL | Base URL of the API server (exposed to browser) | `http://localhost:3000/api/v1` | Yes |
| NEXT_PUBLIC_APP_URL | Base URL of the application (exposed to browser) | `http://localhost:3000` | Yes |
| NEXT_PUBLIC_GOOGLE_CLIENT_ID | Google OAuth client ID (for client-side auth) | `your_google_client_id` | Yes (if Google OAuth enabled) |
| NEXT_PUBLIC_GOOGLE_CALLBACK_URL | Google OAuth callback URL | `http://localhost:3000/api/auth/google/callback` | Yes (if Google OAuth enabled) |

## Development
For development, create a `.env` file in the root of the project (or in each package/app) based on `.env.example`.

Example `.env` file:
```
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://postgres:password@localhost:5432/buspass?schema=public"
REDIS_URL=redis://localhost:6379
JWT_SECRET=supersecretkeychangemeinproduction
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=supersecretrefreshtokenchangemeinproduction
REFRESH_TOKEN_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=onboarding@resend.dev
MSG91_AUTH_KEY=your_msg91_auth_key
MSG91_SENDER_ID=YOURSENDERID
FCM_SERVICE_ACCOUNT_KEY=./firebase-service-account.json
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your_bucket_name
SENTRY_DSN=your_sentry_dsn
ENABLE_2FA=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
APP_URL=http://localhost:3000
ADMIN_APP_URL=http://localhost:3000/admin
SUPER_ADMIN_APP_URL=http://localhost:3000/super-admin
API_URL=http://localhost:3000/api/v1
```

## Production
In production, set environment variables through the hosting platform (e.g., AWS ECS, Docker Kubernetes, Vercel, etc.) or using a `.env.production` file.

**Important**: Never commit the `.env` file to version control. Only `.env.example` should be committed.

## Usage in Code
### Node.js (Backend)
```javascript
require('dotenv').config();
const port = process.env.PORT;
const databaseUrl = process.env.DATABASE_URL;
```

### Next.js (Frontend)
```javascript
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const appUrl = process.env.NEXT_PUBLIC_APP_URL;
```

## Notes
- The `NEXT_PUBLIC` prefix is required for environment variables to be exposed to the browser in Next.js.
- All secrets (like API keys, secrets, database passwords) must NOT be exposed to the client-side. Therefore, they should not have the `NEXT_PUBLIC` prefix when used in the backend.
- For Docker containers, environment variables can be passed via `-e` flag or through a `.env` file used by `docker-compose`.
- In Kubernetes, environment variables can be set via `ConfigMaps` and `Secrets`.

## Example .env.example File
See the `.env.example` file at the root of the repository for a template.