import { Router } from 'express';
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
  verifyPayment,
  razorpayWebhook
} from '../controllers/payment.controller.js';
import { 
  getDashboardStats, 
  getAllUsers, 
  toggleUserSuspension, 
  getAllPasses, 
  reviewPass,
  verifyQrCode,
  getAllStops,
  createStop,
  updateStop,
  deleteStop,
  getAllDrivers,
  createDriver,
  updateDriver,
  deleteDriver,
  getAllBuses,
  createBus,
  updateBus,
  deleteBus,
  exportPassesCsv
} from '../controllers/admin.controller.js';
import { handleAiAssistantQuery } from '../controllers/aiController.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { aiRateLimiter } from '../middleware/rateLimiter.js';
import { cacheMiddleware } from '../middleware/cache.js';

const router = Router();

// Health Monitoring
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'BusPass API Server is healthy and running.' });
});
router.get('/health/liveness', (req, res) => res.status(200).json({ status: 'UP' }));
router.get('/health/readiness', (req, res) => res.status(200).json({ status: 'READY' }));

// Auth Routes
router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/send-otp', sendOtp);
router.post('/auth/verify-otp', verifyOtp);
router.post('/auth/refresh-token', refreshToken);
router.get('/auth/me', authenticate as any, getCurrentUser as any);

// OAuth
router.get('/auth/google', googleLogin);
router.get('/auth/google/callback', googleCallback);

// AI Assistant
router.post('/ai/query', aiRateLimiter as any, handleAiAssistantQuery as any);

// Payments
router.post('/payments/initialize', authenticate as any, initializePayment as any);
router.post('/payments/verify', authenticate as any, verifyPayment as any);
router.post('/webhook/razorpay', razorpayWebhook);

// Routes
router.get('/routes', cacheMiddleware(30) as any, getRoutes);
router.get('/routes/:id', getRouteById);
router.post('/routes', authenticate as any, authorize(['ADMIN', 'SUPER_ADMIN']) as any, createRoute);
router.put('/routes/:id', authenticate as any, authorize(['ADMIN', 'SUPER_ADMIN']) as any, updateRoute);
router.delete('/routes/:id', authenticate as any, authorize(['ADMIN', 'SUPER_ADMIN']) as any, deleteRoute);

// Bookings
router.post('/bookings', authenticate as any, createBooking as any);
router.get('/bookings/user', authenticate as any, getUserBookings as any);
router.get('/bookings/:id', authenticate as any, getBookingById as any);

// Admin Routes
router.get('/admin/stats', authenticate as any, authorize(['ADMIN', 'SUPER_ADMIN']) as any, getDashboardStats);
router.get('/admin/users', authenticate as any, authorize(['ADMIN', 'SUPER_ADMIN']) as any, getAllUsers);
router.put('/admin/users/:userId/suspend', authenticate as any, authorize(['ADMIN', 'SUPER_ADMIN']) as any, toggleUserSuspension);
router.get('/admin/passes', authenticate as any, authorize(['ADMIN', 'SUPER_ADMIN']) as any, getAllPasses);
router.post('/admin/passes/review', authenticate as any, authorize(['ADMIN', 'SUPER_ADMIN']) as any, reviewPass);
router.post('/admin/verify-qr', authenticate as any, authorize(['ADMIN', 'SUPER_ADMIN', 'STAFF']) as any, verifyQrCode);

// Admin Stops
router.get('/admin/stops', authenticate as any, authorize(['ADMIN', 'SUPER_ADMIN']) as any, getAllStops);
router.post('/admin/stops', authenticate as any, authorize(['ADMIN', 'SUPER_ADMIN']) as any, createStop);
router.put('/admin/stops/:id', authenticate as any, authorize(['ADMIN', 'SUPER_ADMIN']) as any, updateStop);
router.delete('/admin/stops/:id', authenticate as any, authorize(['ADMIN', 'SUPER_ADMIN']) as any, deleteStop);

// Admin Drivers
router.get('/admin/drivers', authenticate as any, authorize(['ADMIN', 'SUPER_ADMIN']) as any, getAllDrivers);
router.post('/admin/drivers', authenticate as any, authorize(['ADMIN', 'SUPER_ADMIN']) as any, createDriver);
router.put('/admin/drivers/:id', authenticate as any, authorize(['ADMIN', 'SUPER_ADMIN']) as any, updateDriver);
router.delete('/admin/drivers/:id', authenticate as any, authorize(['ADMIN', 'SUPER_ADMIN']) as any, deleteDriver);

// Admin Buses
router.get('/admin/buses', authenticate as any, authorize(['ADMIN', 'SUPER_ADMIN']) as any, getAllBuses);
router.post('/admin/buses', authenticate as any, authorize(['ADMIN', 'SUPER_ADMIN']) as any, createBus);
router.put('/admin/buses/:id', authenticate as any, authorize(['ADMIN', 'SUPER_ADMIN']) as any, updateBus);
router.delete('/admin/buses/:id', authenticate as any, authorize(['ADMIN', 'SUPER_ADMIN']) as any, deleteBus);

// Reports & Export
router.get('/admin/export/passes.csv', authenticate as any, authorize(['ADMIN', 'SUPER_ADMIN']) as any, exportPassesCsv);

export default router;