import { Response } from 'express';
import QRCode from 'qrcode';
import crypto from 'node:crypto';
import { prisma } from '../config/db.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { CreateBookingSchema, DURATION_DISCOUNTS, DURATION_DAYS, PassDuration } from '@bus-pass/shared';
import { generateHmacSignature } from '../utils/security.js';
import { emitToAdmin, emitToUser } from '../socket/index.js';
import { sendEmail, getEmailTemplate } from '../services/notification.service.js';
import type { PrismaClient } from '@prisma/client';

export async function createBooking(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const validated = CreateBookingSchema.parse(req.body);

    const route = await prisma.route.findUnique({ where: { id: validated.routeId } });
    if (!route || !route.isActive) {
      return res.status(404).json({ success: false, message: 'Active route not found.' });
    }

    // Calculate fare based on duration discount rate
    const durationEnum = validated.duration as PassDuration;
    const multiplier = DURATION_DISCOUNTS[durationEnum] || 1.0;
    const days = DURATION_DAYS[durationEnum] || 30;

    let baseFare = route.baseMonthlyFare * multiplier;
    if (validated.passengerType === 'STUDENT') baseFare *= 0.5; // 50% student discount
    if (validated.passengerType === 'SENIOR_CITIZEN') baseFare *= 0.7; // 30% senior discount

    const startDate = new Date(validated.startDate);
    const expiryDate = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000);

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    // Atomic Booking & Digital Bus Pass Creation
    const result = await prisma.$transaction(async (tx: PrismaClient) => {
      const booking = await tx.booking.create({
        data: {
          userId: req.user!.id,
          routeId: route.id,
          duration: durationEnum,
          passengerType: validated.passengerType,
          fareAmount: baseFare,
          status: 'PENDING',
          startDate,
          expiryDate
        }
      });

      // Pass number format: BP-2026-XXXXXX
      const passNumber = `BP-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

      // HMAC signed QR payload
      const qrPayload = JSON.stringify({
        passNumber,
        userId: user?.id,
        passengerName: user?.fullName,
        routeCode: route.routeCode,
        source: route.source,
        destination: route.destination,
        expiryDate: expiryDate.toISOString()
      });

      const verificationHash = generateHmacSignature(qrPayload);
      const fullQrData = JSON.stringify({ data: qrPayload, sig: verificationHash });

      const qrCodeData = await QRCode.toDataURL(fullQrData);

      const busPass = await tx.busPass.create({
        data: {
          passNumber,
          userId: req.user!.id,
          routeId: route.id,
          bookingId: booking.id,
          duration: durationEnum,
          startDate,
          expiryDate,
          status: 'PENDING',
          fareAmount: baseFare,
          qrCodeData,
          barcodeData: passNumber,
          verificationHash,
          passengerName: user?.fullName || 'Passenger',
          passengerPhoto: user?.profilePhotoUrl || null
        }
      });

      return { booking, busPass };
    });

    // Notify User & Admin via Realtime Socket
    emitToUser(req.user.id, 'booking_created', {
      bookingId: result.booking.id,
      passNumber: result.busPass.passNumber,
      amount: baseFare
    });

    emitToAdmin('new_booking_alert', {
      bookingId: result.booking.id,
      passengerName: user?.fullName,
      routeCode: route.routeCode,
      amount: baseFare
    });

    // Send Booking Confirmation Email
    const emailHtml = getEmailTemplate(
      'Bus Pass Booking Initiated',
      `<p>Hello <strong>${user?.fullName}</strong>,</p>
       <p>Your bus pass application for Route <strong>${route.routeCode} (${route.source} → ${route.destination})</strong> has been received.</p>
       <p><strong>Pass Number:</strong> ${result.busPass.passNumber}</p>
       <p><strong>Duration:</strong> ${validated.duration} (${days} Days)</p>
       <p><strong>Amount:</strong> ₹${baseFare.toFixed(2)}</p>
       <p>Please complete payment to activate your digital pass.</p>`
    );
    sendEmail(user!.email, `Booking Confirmation: ${result.busPass.passNumber}`, emailHtml);

    return res.status(201).json({
      success: true,
      message: 'Pass booking initiated successfully. Proceed to payment.',
      data: result
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Booking failed.' });
  }
}

export async function getUserBookings(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.id },
      include: {
        route: true,
        busPass: true,
        payment: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({ success: true, data: bookings });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getBookingById(req: AuthenticatedRequest, res: Response) {
  try {
    const id = req.params.id as string;
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        route: true,
        busPass: true,
        payment: true
      }
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    return res.status(200).json({ success: true, data: booking });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
