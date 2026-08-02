import { z } from 'zod';
import { UserRole, PassDuration, PaymentMethod, GovtIdType } from '../constants/index.js';

// Auth Schemas
export const RegisterSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().regex(/^[6-9]\d{9}$/, 'Must be a valid 10-digit Indian phone number'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 'Password must contain uppercase, lowercase, number, and special character'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export const LoginSchema = z.object({
  emailOrPhone: z.string().min(1, 'Email or phone number is required'),
  password: z.string().min(1, 'Password is required')
});

export const SendOtpSchema = z.object({
  identifier: z.string().min(1, 'Email or phone number is required'),
  type: z.enum(['EMAIL', 'SMS'])
});

export const VerifyOtpSchema = z.object({
  identifier: z.string().min(1, 'Email or phone number is required'),
  otp: z.string().length(6, 'OTP must be 6 digits')
});

export const ResetPasswordSchema = z.object({
  identifier: z.string().min(1, 'Email or phone number is required'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 'Password criteria not met')
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters')
});

// Profile Schemas
export const UpdateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  phoneNumber: z.string().regex(/^[6-9]\d{9}$/).optional(),
  address: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().regex(/^\d{6}$/, 'Must be a 6-digit pincode').optional(),
  emergencyContact: z.string().optional(),
  govtIdType: z.nativeEnum(GovtIdType).optional(),
  govtIdNumber: z.string().optional(),
  studentIdNumber: z.string().optional(),
  employeeIdNumber: z.string().optional()
});

// Route Schemas
export const CreateRouteSchema = z.object({
  routeCode: z.string().min(2, 'Route code required'),
  source: z.string().min(2, 'Source city/station required'),
  destination: z.string().min(2, 'Destination city/station required'),
  viaStops: z.array(z.string()).default([]),
  distanceKm: z.number().positive('Distance must be positive'),
  baseMonthlyFare: z.number().positive('Fare must be positive'),
  isActive: z.boolean().default(true)
});

// Booking Schemas
export const CreateBookingSchema = z.object({
  routeId: z.string().uuid('Invalid route ID'),
  duration: z.nativeEnum(PassDuration),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid start date'),
  passengerType: z.enum(['GENERAL', 'STUDENT', 'SENIOR_CITIZEN', 'GOVT_EMPLOYEE']).default('GENERAL'),
  studentIdNumber: z.string().optional(),
  employeeIdNumber: z.string().optional()
});

// Payment Schemas
export const InitializePaymentSchema = z.object({
  bookingId: z.string().uuid(),
  gateway: z.nativeEnum(PaymentMethod),
  amount: z.number().positive()
});

export const VerifyPaymentSchema = z.object({
  paymentId: z.string(),
  orderId: z.string(),
  signature: z.string().optional(), // For Razorpay
  stripePaymentIntentId: z.string().optional() // For Stripe
});

// Admin Approval Schema
export const PassApprovalSchema = z.object({
  passId: z.string().uuid(),
  status: z.enum(['APPROVED', 'REJECTED']),
  rejectionReason: z.string().optional()
});

// Admin CRUD Schemas
export const CreateStopSchema = z.object({
  name: z.string().min(2, 'Stop name required'),
  code: z.string().min(2, 'Stop code required'),
  location: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  isActive: z.boolean().default(true)
});

export const CreateDriverSchema = z.object({
  fullName: z.string().min(2, 'Full name required'),
  licenseNumber: z.string().min(3, 'License number required'),
  phoneNumber: z.string().regex(/^[6-9]\d{9}$/, 'Must be a valid 10-digit Indian phone number'),
  address: z.string().optional(),
  status: z.enum(['ACTIVE', 'ON_LEAVE', 'INACTIVE']).default('ACTIVE')
});

export const CreateBusSchema = z.object({
  busNumber: z.string().min(2, 'Bus number required'),
  registration: z.string().min(2, 'Registration required'),
  capacity: z.number().positive().default(40),
  busType: z.enum(['EXPRESS', 'AC', 'REGULAR']).default('EXPRESS'),
  driverId: z.string().optional(),
  routeId: z.string().optional(),
  status: z.enum(['ACTIVE', 'MAINTENANCE', 'INACTIVE']).default('ACTIVE')
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type SendOtpInput = z.infer<typeof SendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof VerifyOtpSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type CreateRouteInput = z.infer<typeof CreateRouteSchema>;
export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;
export type InitializePaymentInput = z.infer<typeof InitializePaymentSchema>;
export type VerifyPaymentInput = z.infer<typeof VerifyPaymentSchema>;
export type CreateStopInput = z.infer<typeof CreateStopSchema>;
export type CreateDriverInput = z.infer<typeof CreateDriverSchema>;
export type CreateBusInput = z.infer<typeof CreateBusSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

