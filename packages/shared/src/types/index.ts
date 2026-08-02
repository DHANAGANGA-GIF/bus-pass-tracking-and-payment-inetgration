import { UserRole, PassDuration, PassStatus, PaymentStatus, PaymentMethod, GovtIdType, NotificationType } from '../constants/index.js';

export interface UserProfile {
  id: string;
  email: string;
  emailVerified: boolean;
  phoneNumber: string;
  phoneVerified: boolean;
  fullName: string;
  role: UserRole;
  profilePhotoUrl?: string;
  address?: string;
  district?: string;
  state?: string;
  pincode?: string;
  emergencyContact?: string;
  govtIdType?: GovtIdType;
  govtIdNumber?: string;
  studentIdNumber?: string;
  employeeIdNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Route {
  id: string;
  routeCode: string;
  source: string;
  destination: string;
  viaStops: string[];
  distanceKm: number;
  baseMonthlyFare: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusPass {
  id: string;
  passNumber: string;
  userId: string;
  routeId: string;
  bookingId: string;
  duration: PassDuration;
  startDate: string;
  expiryDate: string;
  status: PassStatus;
  fareAmount: number;
  qrCodeData: string;
  barcodeData: string;
  verificationHash: string;
  passengerName: string;
  passengerPhotoUrl?: string;
  routeDetails: {
    routeCode: string;
    source: string;
    destination: string;
  };
  createdAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  routeId: string;
  duration: PassDuration;
  passengerType: string;
  fareAmount: number;
  status: PassStatus;
  startDate: string;
  expiryDate: string;
  route?: Route;
  busPass?: BusPass;
  payment?: Payment;
  createdAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  userId: string;
  transactionId: string;
  gatewayOrder: string;
  amount: number;
  currency: string;
  gateway: PaymentMethod;
  status: PaymentStatus;
  paidAt?: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  paymentId: string;
  userId: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  pdfUrl?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
  createdAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface Stop {
  id: string;
  name: string;
  code: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Driver {
  id: string;
  fullName: string;
  licenseNumber: string;
  phoneNumber: string;
  address?: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface Bus {
  id: string;
  busNumber: string;
  registration: string;
  capacity: number;
  busType: 'EXPRESS' | 'AC' | 'REGULAR';
  driverId?: string;
  routeId?: string;
  status: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';
  driver?: Driver;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}

