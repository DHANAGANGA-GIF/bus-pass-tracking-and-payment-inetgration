# 🚌 BusPass Pro

BusPass Pro is an enterprise-grade transit booking and tracking system designed for students, employees, and regular commuters.

## 🏗️ Architecture

- **Frontend:** React, Vite, Tailwind CSS (Deployed on Vercel)
- **Backend:** Node.js, Express, Socket.IO, Prisma ORM (Deployed on Render)
- **Database:** PostgreSQL (Neon)
- **Cache:** Redis (Upstash)
- **Integrations:** Razorpay (Payments), OpenAI (Smart Assistant), Nodemailer (SMTP), Google OAuth

## ✨ Features

- **Role-based Access:** Super Admin, Staff/Conductor, and Commuters.
- **Smart Bookings:** Route selection, fare calculation, and secure checkout.
- **QR Code E-Passes:** Instant generation and verification by conductors.
- **Analytics Dashboard:** Live revenue tracking, active passes, and passenger analytics.
- **AI Assistant:** 24/7 help desk for scheduling and pass queries.
- **Real-time Updates:** WebSocket-powered alerts for pass activation and renewals.

## 🚀 Installation & Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/DHANAGANGA-GIF/bus-pass-tracking-and-payment-inetgration.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (copy `.env.example` to `.env`).
4. Push database schema:
   ```bash
   npm run db:push
   npm run db:seed
   ```
5. Start development servers:
   ```bash
   npm run dev:api
   npm run dev:web
   ```

## 🌍 Deployment

Please refer to [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions on deploying to Render (Backend) and Vercel (Frontend).

## 📸 Screenshots

*(To be added)*

## 📄 License

MIT License. See `LICENSE` for details.
