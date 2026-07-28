export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
  STAFF = 'STAFF'
}

export enum PassDuration {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  HALF_YEARLY = 'HALF_YEARLY',
  YEARLY = 'YEARLY'
}

export enum PassStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export enum PaymentMethod {
  UPI = 'UPI',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  NET_BANKING = 'NET_BANKING',
  WALLET = 'WALLET',
  RAZORPAY = 'RAZORPAY',
  STRIPE = 'STRIPE'
}

export enum GovtIdType {
  AADHAAR = 'AADHAAR',
  PAN = 'PAN',
  PASSPORT = 'PASSPORT',
  DRIVING_LICENSE = 'DRIVING_LICENSE',
  VOTER_ID = 'VOTER_ID'
}

export enum NotificationType {
  SYSTEM = 'SYSTEM',
  BOOKING = 'BOOKING',
  PAYMENT = 'PAYMENT',
  SECURITY = 'SECURITY',
  ADMIN_ALERT = 'ADMIN_ALERT',
  EXPIRY_REMINDER = 'EXPIRY_REMINDER'
}

export const DURATION_DISCOUNTS: Record<PassDuration, number> = {
  [PassDuration.MONTHLY]: 1.0,      // base (1x base monthly rate)
  [PassDuration.QUARTERLY]: 2.7,    // 10% discount (3 months * 0.9)
  [PassDuration.HALF_YEARLY]: 5.1,  // 15% discount (6 months * 0.85)
  [PassDuration.YEARLY]: 9.6        // 20% discount (12 months * 0.80)
};

export const DURATION_DAYS: Record<PassDuration, number> = {
  [PassDuration.MONTHLY]: 30,
  [PassDuration.QUARTERLY]: 90,
  [PassDuration.HALF_YEARLY]: 180,
  [PassDuration.YEARLY]: 365
};
