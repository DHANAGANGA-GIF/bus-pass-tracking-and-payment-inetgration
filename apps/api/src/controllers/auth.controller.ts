import { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';
import { prisma } from '../config/db.js';
import {
  hashPassword,
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
  generateOtp
} from '../utils/security.js';
import { sendEmail, sendSms, getEmailTemplate } from '../services/notification.service.js';
import { emitToAdmin } from '../socket/index.js';
import { auditLogger, AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { RegisterSchema, LoginSchema, SendOtpSchema, VerifyOtpSchema, ResetPasswordSchema } from '@bus-pass/shared';
import passport from '../middleware/passport.js';
import { env } from '../config/env.js';


export async function register(req: Request, res: Response) {
  try {
    const validated = RegisterSchema.parse(req.body);

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: validated.email }, { phoneNumber: validated.phoneNumber }]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email or phone number already exists.'
      });
    }

    const passwordHash = await hashPassword(validated.password);

    const user = await prisma.user.create({
      data: {
        fullName: validated.fullName,
        email: validated.email,
        phoneNumber: validated.phoneNumber,
        passwordHash,
        role: 'USER'
      }
    });

    // Generate Email Verification OTP
    const otp = generateOtp();
    const otpHash = hashToken(otp);

    await prisma.otpRecord.create({
      data: {
        userId: user.id,
        identifier: user.email,
        otpHash,
        type: 'EMAIL_VERIFICATION',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 mins
      }
    });

    // Send Email
    const emailHtml = getEmailTemplate(
      'Welcome to BusPass Pro - Email Verification',
      `<p>Hello <strong>${user.fullName}</strong>,</p>
       <p>Thank you for registering on the BusPass Pro platform.</p>
       <p>Your 6-digit email verification code is:</p>
       <p style="text-align:center;"><span class="badge" style="font-size:24px; letter-spacing: 4px;">${otp}</span></p>
       <p>This OTP will expire in 5 minutes. Do not share it with anyone.</p>`
    );
    await sendEmail(user.email, 'Verify Your Email - BusPass Pro', emailHtml);

    // Notify Admin via Socket
    emitToAdmin('user_registered', {
      userId: user.id,
      name: user.fullName,
      email: user.email,
      registeredAt: new Date()
    });

    await auditLogger('USER_REGISTERED', req as any, { userId: user.id, email: user.email });

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Verification OTP sent to your email.',
      data: {
        userId: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber
      }
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Registration failed.' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const validated = LoginSchema.parse(req.body);

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: validated.emailOrPhone }, { phoneNumber: validated.emailOrPhone }]
      }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    if (user.isSuspended) {
      return res.status(403).json({ success: false, message: 'Account is suspended. Contact admin.' });
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return res.status(423).json({
        success: false,
        message: `Account locked due to multiple failed attempts. Try again after ${user.lockedUntil.toISOString()}`
      });
    }

    const isValid = await verifyPassword(user.passwordHash, validated.password);

    if (!isValid) {
      const failedCount = user.failedLoginCount + 1;
      let lockDate: Date | null = null;
      if (failedCount >= 5) {
        lockDate = new Date(Date.now() + 30 * 60 * 1000); // lock 30m
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginCount: failedCount,
          lockedUntil: lockDate
        }
      });

      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Reset failed count on successful login
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginCount: 0, lockedUntil: null }
    });

    // Token Family Generation
    const familyId = crypto.randomUUID();
    const accessToken = generateAccessToken({ userId: user.id, role: user.role, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, familyId });

    const refreshTokenHash = hashToken(refreshToken);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refreshTokenHash,
        familyId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    // Session Tracking
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'unknown';

    await prisma.session.create({
      data: {
        userId: user.id,
        ipAddress,
        userAgent
      }
    });

    await auditLogger('USER_LOGIN', req as any, { userId: user.id, ipAddress });

    // Send Security Email Alert for login
    const alertHtml = getEmailTemplate(
      'Security Alert: New Account Login',
      `<p>Hello <strong>${user.fullName}</strong>,</p>
       <p>We detected a new login to your BusPass Pro account.</p>
       <ul>
         <li><strong>IP Address:</strong> ${ipAddress}</li>
         <li><strong>Time:</strong> ${new Date().toISOString()}</li>
       </ul>
       <p>If this was you, no action is needed.</p>`
    );
    sendEmail(user.email, 'Security Alert: New Login - BusPass Pro', alertHtml);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          emailVerified: user.emailVerified,
          phoneNumber: user.phoneNumber,
          phoneVerified: user.phoneVerified,
          fullName: user.fullName,
          role: user.role
        }
      }
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Login failed.' });
  }
}

export async function sendOtp(req: Request, res: Response) {
  try {
    const validated = SendOtpSchema.parse(req.body);
    const otp = generateOtp();
    const otpHash = hashToken(otp);

    await prisma.otpRecord.create({
      data: {
        identifier: validated.identifier,
        otpHash,
        type: 'LOGIN',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000)
      }
    });

    if (validated.type === 'EMAIL') {
      const emailHtml = getEmailTemplate(
        'One-Time Password (OTP)',
        `<p>Your 6-digit login OTP is:</p>
         <p style="text-align:center;"><span class="badge" style="font-size:24px;">${otp}</span></p>
         <p>Valid for 5 minutes.</p>`
      );
      await sendEmail(validated.identifier, 'Your OTP Code - BusPass Pro', emailHtml);
    } else {
      await sendSms(validated.identifier, `Your BusPass Pro OTP is ${otp}. Valid for 5 minutes.`);
    }

    return res.status(200).json({
      success: true,
      message: `OTP sent successfully to ${validated.identifier}`
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to send OTP.' });
  }
}

export async function verifyOtp(req: Request, res: Response) {
  try {
    const validated = VerifyOtpSchema.parse(req.body);
    const otpHash = hashToken(validated.otp);

    const record = await prisma.otpRecord.findFirst({
      where: {
        identifier: validated.identifier,
        otpHash,
        isUsed: false,
        expiresAt: { gt: new Date() }
      }
    });

    if (!record) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
    }

    await prisma.otpRecord.update({
      where: { id: record.id },
      data: { isUsed: true }
    });

    // Mark email or phone verified if record user matches
    if (record.userId) {
      await prisma.user.update({
        where: { id: record.userId },
        data: { emailVerified: true, phoneVerified: true }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully.'
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'OTP verification failed.' });
  }
}

export async function refreshToken(req: Request, res: Response) {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Refresh token required.' });
    }

    const decoded = verifyRefreshToken(token);
    const tokenHash = hashToken(token);

    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash }
    });

    if (!storedToken || storedToken.isRevoked) {
      // Reuse attack detected -> revoke family!
      if (decoded.familyId) {
        await prisma.refreshToken.updateMany({
          where: { familyId: decoded.familyId },
          data: { isRevoked: true }
        });
      }
      return res.status(403).json({ success: false, message: 'Security alert: Invalid token reuse. Please log in again.' });
    }

    // Revoke old token
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true }
    });

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Issue new pair with same family ID
    const newAccessToken = generateAccessToken({ userId: user.id, role: user.role, email: user.email });
    const newRefreshToken = generateRefreshToken({ userId: user.id, familyId: decoded.familyId });

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(newRefreshToken),
        familyId: decoded.familyId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error: any) {
    return res.status(401).json({ success: false, message: 'Invalid refresh token.' });
  }
}

export async function getCurrentUser(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        phoneNumber: user.phoneNumber,
        phoneVerified: user.phoneVerified,
        fullName: user.fullName,
        role: user.role,
        profilePhotoUrl: user.profilePhotoUrl,
        address: user.address,
        district: user.district,
        state: user.state,
        pincode: user.pincode,
        emergencyContact: user.emergencyContact,
        govtIdType: user.govtIdType,
        govtIdNumber: user.govtIdNumber,
        studentIdNumber: user.studentIdNumber,
        employeeIdNumber: user.employeeIdNumber,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Google OAuth Routes
export const googleLogin = (req: Request, res: Response, next: NextFunction) => {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    return res.status(501).json({
      success: false,
      message: 'Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.'
    });
  }
  return passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
};

export const googleCallback = (req: Request, res: Response, next: NextFunction) => {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    return res.redirect(`${env.FRONTEND_URL}/login?error=oauth_not_configured`);
  }
  passport.authenticate('google', { session: false }, (err: any, user: any) => {
    if (err || !user) {
      return res.redirect(`${env.FRONTEND_URL}/login?error=oauth_failed`);
    }
    res.cookie('accessToken', user.accessToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 15 * 60 * 1000
    });
    res.cookie('refreshToken', user.refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    res.redirect(
      `${env.FRONTEND_URL}/dashboard?accessToken=${encodeURIComponent(user.accessToken)}&refreshToken=${encodeURIComponent(user.refreshToken)}`
    );
  })(req, res, next);
};

export const linkedinLogin = (req: Request, res: Response) => {
  res.status(501).json({ success: false, message: 'LinkedIn OAuth not implemented yet.' });
};

export const linkedinCallback = (req: Request, res: Response) => {
  res.status(501).json({ success: false, message: 'LinkedIn OAuth not implemented yet.' });
};
