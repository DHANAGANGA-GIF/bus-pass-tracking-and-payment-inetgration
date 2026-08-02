# 🔑 BusPass Pro — Environment Variables Guide

This reference documents all environment variables required by the API and Web applications.

---

## 🛠️ API Environment Variables (`apps/api/.env`)

| Variable Name | Required | Default Value | Description |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Yes | `production` | Environment mode (`development` / `production`). |
| `PORT` | Yes | `5000` | Port for Express HTTP server. |
| `DATABASE_URL` | Yes | - | PostgreSQL connection URL. |
| `REDIS_URL` | Optional | `redis://localhost:6379` | Redis connection URL for caching. |
| `JWT_ACCESS_SECRET` | Yes | - | Secret key for signing JWT access tokens (min 32 chars). |
| `JWT_REFRESH_SECRET` | Yes | - | Secret key for signing refresh tokens (min 32 chars). |
| `JWT_ACCESS_EXPIRES_IN` | No | `15m` | Token expiration duration. |
| `JWT_REFRESH_EXPIRES_IN` | No | `7d` | Refresh token duration. |
| `PASS_HMAC_SECRET` | Yes | - | Secret key for signing digital QR codes. |
| `FRONTEND_URL` | Yes | `http://localhost:3000` | Frontend web URL allowed by CORS. |
| `RAZORPAY_KEY_ID` | Optional | - | Razorpay Key ID for payments. |
| `RAZORPAY_KEY_SECRET` | Optional | - | Razorpay Key Secret. |
| `RAZORPAY_WEBHOOK_SECRET` | Optional | - | Razorpay Webhook signature verification secret. |
| `OPENAI_API_KEY` | Optional | - | OpenAI API key for AI assistant chat. |
| `GOOGLE_CLIENT_ID` | Optional | - | Google OAuth 2.0 Client ID. |
| `GOOGLE_CLIENT_SECRET` | Optional | - | Google OAuth 2.0 Client Secret. |
| `SENTRY_DSN` | Optional | - | Sentry error monitoring DSN. |

---

## 🌐 Web Environment Variables (`apps/web/.env`)

| Variable Name | Required | Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | Yes | Base URL for API requests (e.g. `https://api.domain.com/api`). |
| `VITE_SOCKET_URL` | Yes | WebSocket server URL (e.g. `https://api.domain.com`). |
| `VITE_APP_NAME` | No | Display name of the application. |
| `VITE_GOOGLE_CLIENT_ID` | Optional | Google OAuth client ID for frontend buttons. |
