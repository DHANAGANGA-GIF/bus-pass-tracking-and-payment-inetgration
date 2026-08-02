# 📖 BusPass Pro — REST API Reference

All API requests must be prefixed with `/api`. Protected routes require a Bearer Access Token in the `Authorization` header (`Bearer <access_token>`).

---

## 🟢 Health & Monitoring

### `GET /api/health`
Returns system health status.
- **Response**: `{ "status": "OK", "message": "BusPass API Server is healthy and running." }`

---

## 🔒 Authentication Routes

### `POST /api/auth/register`
Register a new passenger account.
- **Body**: `{ "fullName": "...", "email": "...", "phoneNumber": "9876543210", "password": "...", "confirmPassword": "..." }`

### `POST /api/auth/login`
Authenticate user credentials and obtain JWT tokens.
- **Body**: `{ "emailOrPhone": "...", "password": "..." }`

### `GET /api/auth/me`
Retrieve currently logged-in user profile.

---

## 🚌 Bus Routes & Fares

### `GET /api/routes`
List all active bus routes (Cached).

### `POST /api/routes` (Admin Only)
Create a new bus route.

---

## 🎟️ Pass Bookings

### `POST /api/bookings`
Initiate a new bus pass booking and generate a pending digital pass.

### `GET /api/bookings/user`
List all bookings for the authenticated user.

---

## 💳 Payments

### `POST /api/payments/initialize`
Create Razorpay / Stripe gateway order.

### `POST /api/payments/verify`
Verify payment signature and activate bus pass.

---

## 🤖 AI Assistant

### `POST /api/ai/query`
Ask the AI assistant a question regarding pass fares, routes, or renewal guidelines.
- **Body**: `{ "prompt": "How do I renew my monthly pass?" }`

---

## 🛠️ Admin Dashboard CRUD & Reports

- `GET /api/admin/stats` — Dashboard metrics & revenue.
- `GET /api/admin/users` — List users.
- `GET /api/admin/stops` — Stops CRUD.
- `GET /api/admin/drivers` — Drivers CRUD.
- `GET /api/admin/buses` — Buses CRUD.
- `GET /api/admin/export/passes.csv` — Download passes CSV report.
