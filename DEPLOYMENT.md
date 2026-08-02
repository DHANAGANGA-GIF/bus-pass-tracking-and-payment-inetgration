# 🚀 BusPass Pro — Enterprise Deployment Guide

This document contains step-by-step instructions for deploying the **BusPass Pro** monorepo to production environments across **Render**, **Vercel**, and **Docker / Kubernetes**.

---

## 🏗️ Architecture Overview

- **Frontend**: React + Vite + Tailwind CSS (`apps/web`) → Static SPA deployed to Vercel or Served via Nginx.
- **Backend API**: Express.js + Socket.IO + Prisma ORM (`apps/api`) → Node.js container deployed to Render or Docker.
- **Database**: PostgreSQL (`Neon`).
- **Cache**: Redis (`Upstash`).
- **Shared Utilities**: TypeScript contracts & Zod schemas (`packages/shared`).

---

## 🟢 Option 1: Render Deployment (Backend)

### Step 1: Create a Render Web Service
1. Log in to [Render.com](https://render.com).
2. Click **New** → **Blueprint**.
3. Select this repository (`bus-pass-tracking-and-payment-inetgration`).
4. Render will automatically detect the `render.yaml` and provision the web service.

### Step 2: Provision Infrastructure
1. Create a **PostgreSQL** database on [Neon.tech](https://neon.tech) and get the connection string.
2. Create a **Redis** instance on [Upstash](https://upstash.com) and get the connection string.
3. Add these credentials to the Render environment variables for your Web Service.

### Step 3: Configure API Service
1. Ensure the Web Service is using the `Dockerfile.api`.
2. Set environment variables (refer to `ENVIRONMENT.md`).
3. Set Health Check path: `/health` (Port 5000).

---

## ⚡ Option 2: Vercel Deployment (Frontend Web App)

### Step 1: Connect Repository
1. Import repository in [Vercel Dashboard](https://vercel.com).
2. Select **Framework Preset**: Vite.
3. Root Directory: `./` (or `apps/web`).

### Step 2: Configure Build Settings
- **Build Command**: `npm run build --workspace=@bus-pass/shared && npm run build --workspace=@bus-pass/web`
- **Output Directory**: `apps/web/dist`

### Step 3: Environment Variables
Add the following in Vercel settings:
```env
VITE_API_URL=https://your-api-domain.onrender.com/api
VITE_SOCKET_URL=https://your-api-domain.onrender.com
VITE_APP_NAME=BusPass Pro
```

---

## 🐳 Option 3: Docker & Docker Compose (Self-Hosted Production)

Run the entire production stack locally or on a VPS:

```bash
# 1. Clone repository
git clone https://github.com/DHANAGANGA-GIF/bus-pass-tracking-and-payment-inetgration.git
cd bus-pass-tracking-and-payment-inetgration

# 2. Copy production environment file
cp .env.production.example .env.production

# 3. Start services with Docker Compose
docker-compose -f docker-compose.prod.yml up -d --build
```

Access services:
- **Web Portal & Reverse Proxy**: `http://localhost:80`
- **API Health Check**: `http://localhost:5000/api/health`
