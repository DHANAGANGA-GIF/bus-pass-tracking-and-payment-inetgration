import { Router } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import {
  register,
  login,
  sendOtp,
  verifyOtp,
  refreshToken,
  getCurrentUser,
  googleLogin,
  googleCallback
} from '../controllers/auth.controller.js';
import {
  getRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute
} from '../controllers/route.controller.js';
import {
  createBooking,
  getUserBookings,
  getBookingById
} from '../controllers/booking.controller.js';
import {
  initializePayment,
  verifyPayment
} from '../controllers/payment.controller.js';
import {
  getDashboardStats,
  getAllUsers,
  toggleUserSuspension,
  getAllPasses,
  reviewPass,
  verifyQrCode
} from '../controllers/admin.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

// Health Check
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'BusPass API Server is healthy and running.' });
});

// Auth Routes
router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/send-otp', sendOtp);
router.post('/auth/verify-otp', verifyOtp);
router.post('/auth/refresh-token', refreshToken);
router.get('/auth/me', authenticate as any, getCurrentUser as any);

// Google OAuth Routes
router.get('/auth/google', googleLogin);
router.get('/auth/google/callback', googleCallback);

// Swagger Documentation
router.get('/api/docs', (req, res) => {
  const filePath = path.join(process.cwd(), '../../docs/openapi.yaml');
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    res.setHeader('Content-Type', 'application/yaml');
    res.send(content);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load API documentation' });
  }
});

// Route Management Routes
router.get('/routes', getRoutes);
router.get('/routes/:id', getRouteById);
router.post('/routes', authenticate as any, authorize(['ADMIN', 'SUPER_ADMIN']) as any, createRoute);
router.put('/routes/:id', authenticate as any, authorize(['ADMIN', 'SUPER_ADMIN']) as any, updateRoute);
router.delete('/routes/:id', authenticate as any, authorize(['ADMIN', 'SUPER_ADMIN']) as any, deleteRoute);

// Booking Routes
router.post('/bookings', authenticate as any, createBooking as any);
router.get('/bookings/user', authenticate as any, getUserBookings as any);
router.get('/bookings/:id', authenticate as any, getBookingById as any);

// Payment Routes
router.post('/payments/initialize', authenticate as any, initializePayment as any);
router.post('/payments/verify', authenticate as any, verifyPayment as any);

// Admin Routes
router.get('/admin/stats', authenticate as any, authorize(['ADMIN', 'SUPER_ADMIN']) as any, getDashboardStats);
router.get('/admin/users', authenticate as any, authorize(['ADMIN', 'SUPER_ADMIN']) as any, getAllUsers);
router.put('/admin/users/:userId/suspend', authenticate as any, authorize(['ADMIN', 'SUPER_ADMIN']) as any, toggleUserSuspension);
router.get('/admin/passes', authenticate as any, authorize(['ADMIN', 'SUPER_ADMIN']) as any, getAllPasses);
router.post('/admin/passes/review', authenticate as any, authorize(['ADMIN', 'SUPER_ADMIN']) as any, reviewPass);
router.post('/admin/verify-qr', authenticate as any, authorize(['ADMIN', 'SUPER_ADMIN', 'STAFF']) as any, verifyQrCode);

export default router;