# ✅ BusPass Pro — Production Deployment Checklist

Complete this verification checklist prior to promoting any deployment to production.

---

## 1. Environment & Secrets Setup
- [ ] Set `NODE_ENV=production` in environment variables.
- [ ] Set strong, unique `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` (minimum 32 characters each).
- [ ] Set `PASS_HMAC_SECRET` for secure QR code signing.
- [ ] Configure `DATABASE_URL` pointing to production PostgreSQL instance.
- [ ] Configure `REDIS_URL` for caching (or rely on built-in in-memory fallback).
- [ ] Verify `FRONTEND_URL` and `CORS_ORIGIN` match production domain names.

## 2. Database & Migrations
- [ ] Execute `npx prisma migrate deploy` in backend deployment process.
- [ ] Confirm Prisma Client is generated via `npx prisma generate`.
- [ ] Verify database connection pooling and query performance.

## 3. Security Hardening
- [ ] Verify HTTP security headers (Helmet enabled).
- [ ] Verify CORS allowed origins policy.
- [ ] Verify API Rate Limiter endpoints (Global, Auth, AI queries).
- [ ] Verify Razorpay Webhook HMAC SHA-256 signature validation.
- [ ] Verify Argon2 password hashing parameters.

## 4. Frontend & Assets
- [ ] Build production static bundle (`npm run build`).
- [ ] Verify SPA fallback routing rules in `vercel.json` and `nginx.conf`.
- [ ] Test PWA Service Worker registration (`sw.js`).
- [ ] Test React Error Boundary fallback screen.

## 5. Health & Monitoring
- [ ] Verify HTTP GET `/health` returns `200 OK`.
- [ ] Test Socket.IO real-time event delivery (`user_registered`, `pass_status_updated`).
- [ ] Verify automated background cron jobs for pass expiration.
