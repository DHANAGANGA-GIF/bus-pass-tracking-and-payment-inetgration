# Google OAuth Setup Guide — BusPass Pro

> **IMPORTANT**: Never hardcode credentials. Always use environment variables.  
> The server will **refuse to start** if `GOOGLE_CLIENT_ID` or `GOOGLE_CLIENT_SECRET` are missing or placeholder values.

---

## Step 1 — Create or Select a Google Cloud Project

1. Go to [https://console.cloud.google.com/](https://console.cloud.google.com/)
2. Click the project selector at the top → **"New Project"**
3. Name it `BusPass Pro` → click **Create**
4. Wait for the project to be provisioned, then select it

---

## Step 2 — Enable the Google+ / People API

1. Go to **APIs & Services → Library**
2. Search for **"Google People API"** → click it → click **Enable**
3. Also search for **"Google Identity"** → Enable it

---

## Step 3 — Configure the OAuth Consent Screen

1. Go to **APIs & Services → OAuth consent screen**
2. Choose **"External"** (or "Internal" if using Google Workspace) → click **Create**
3. Fill in the required fields:

| Field | Value |
|---|---|
| App name | BusPass Pro |
| User support email | your-support@yourdomain.com |
| App logo | (optional) |
| App domain | `https://YOUR_FRONTEND_DOMAIN` |
| Authorized domains | `YOUR_FRONTEND_DOMAIN`, `YOUR_BACKEND_DOMAIN` |
| Developer contact email | your-email@yourdomain.com |

4. Click **Save and Continue**
5. Under **Scopes**, click **Add or Remove Scopes**:
   - Check `openid`
   - Check `email`
   - Check `profile`
   → Click **Update** → **Save and Continue**
6. Under **Test Users** (while in Development/Testing mode), add test Google accounts → **Save and Continue**
7. Review and click **Back to Dashboard**

> **Production Note**: To go live, click **"Publish App"** on the consent screen page. Google may require a verification review.

---

## Step 4 — Create OAuth 2.0 Client ID

1. Go to **APIs & Services → Credentials**
2. Click **"+ Create Credentials"** → **"OAuth client ID"**
3. Set **Application type** = **Web application**
4. Set **Name** = `BusPass Pro Web Client`

### Authorized JavaScript Origins

Add ALL of the following:

**Development:**
```
http://localhost:3000
http://localhost:5000
```

**Production:**
```
https://YOUR_FRONTEND_DOMAIN
https://YOUR_BACKEND_DOMAIN
```

### Authorized Redirect URIs

Add ALL of the following:

**Development:**
```
http://localhost:5000/api/auth/google/callback
```

**Production:**
```
https://YOUR_BACKEND_DOMAIN/api/auth/google/callback
```

5. Click **Create**
6. A dialog will appear with your:
   - **Client ID** (looks like: `123456789-abc...googleusercontent.com`)
   - **Client Secret** (looks like: `GOCSPX-abc...`)
7. **Copy both values** immediately (you can also download the JSON)

---

## Step 5 — Set Environment Variables

### Development (`apps/api/.env`)

```env
GOOGLE_CLIENT_ID=123456789-abc123def456.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-YourSecretHere
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
FRONTEND_URL=http://localhost:3000
```

### Production (Railway / Render / VPS)

Set these in your deployment platform's environment variable dashboard:

```env
GOOGLE_CLIENT_ID=123456789-abc123def456.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-YourSecretHere
GOOGLE_CALLBACK_URL=https://YOUR_BACKEND_DOMAIN/api/auth/google/callback
FRONTEND_URL=https://YOUR_FRONTEND_DOMAIN
CORS_ORIGIN=https://YOUR_FRONTEND_DOMAIN
```

### Vercel (Frontend)

Set in Vercel Dashboard → Project → Settings → Environment Variables:

```
VITE_GOOGLE_CLIENT_ID=123456789-abc123def456.apps.googleusercontent.com
```

---

## Step 6 — Test the OAuth Flow

1. Start the backend: `npm run dev` in `apps/api`
2. Start the frontend: `npm run dev` in `apps/web`
3. Navigate to `http://localhost:3000/login`
4. Click **"Sign in with Google"**
5. You should be redirected to Google's OAuth consent screen
6. After selecting your Google account, you should be redirected to `http://localhost:3000/dashboard`
7. Verify your user profile is loaded in the top navbar

---

## OAuth Flow Architecture

```
Frontend (Click "Sign in with Google")
       │
       ▼
GET /api/auth/google          (PassportJS initiates Google OAuth)
       │
       ▼
Google OAuth Consent Screen
       │
       ▼
GET /api/auth/google/callback  (Google redirects back with auth code)
       │
       ▼  PassportJS exchanges code for profile
       │  Creates/updates user in DB
       │  Generates JWT access + refresh tokens
       ▼
REDIRECT → FRONTEND_URL/dashboard?accessToken=...&refreshToken=...
       │
       ▼
Frontend stores tokens in localStorage, strips URL params
       │
       ▼
User is authenticated ✓
```

---

## Verification Checklist

- [ ] OAuth Consent Screen created and configured
- [ ] OAuth Client ID created (Web Application type)
- [ ] All Authorized JavaScript Origins added (dev + prod)
- [ ] All Authorized Redirect URIs added (dev + prod)
- [ ] `GOOGLE_CLIENT_ID` set in `apps/api/.env` (never placeholder)
- [ ] `GOOGLE_CLIENT_SECRET` set in `apps/api/.env` (never placeholder)
- [ ] `GOOGLE_CALLBACK_URL` matches an Authorized Redirect URI exactly
- [ ] `FRONTEND_URL` points to the correct frontend origin
- [ ] Login flow tested end-to-end with a real Google account
- [ ] New user created in database after first Google login
- [ ] Existing user recognized on subsequent logins
- [ ] Logout clears localStorage tokens
- [ ] Refresh token rotation working

---

## Common Errors

| Error | Cause | Fix |
|---|---|---|
| `redirect_uri_mismatch` | The `GOOGLE_CALLBACK_URL` doesn't match Google Console | Add exact URL to Authorized Redirect URIs |
| `invalid_client` | Wrong Client ID or Secret | Check env vars, re-download credentials |
| `access_blocked` | App not verified (prod) | Publish app or add test user |
| Server crashes on startup | `GOOGLE_CLIENT_ID` is placeholder | Set real credentials |
| `401 Unauthorized` after redirect | Tokens not stored in localStorage | Check Dashboard OAuth token handler |
