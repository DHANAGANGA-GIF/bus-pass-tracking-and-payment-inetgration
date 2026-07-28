import { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { generateHmacSignature } from '../utils/security.js';
import { PassApprovalSchema } from '@bus-pass/shared';
import { emitToUser } from '../socket/index.js';
import { sendEmail, getEmailTemplate } from '../services/notification.service.js';

export async function getDashboardStats(req: Request, res: Response) {
  try {
    const totalUsers = await prisma.user.count({ where: { role: 'USER' } });
    const totalBookings = await prisma.booking.count();
    const activePasses = await prisma.busPass.count({ where: { status: 'ACTIVE' } });
    const pendingPasses = await prisma.busPass.count({ where: { status: 'PENDING' } });

    const totalRevenueResult = await prisma.payment.aggregate({
      where: { status: 'SUCCESS' },
      _sum: { amount: true }
    });
    const totalRevenue = totalRevenueResult._sum.amount || 0;

    const recentBookings = await prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: true, route: true, busPass: true }
    });

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalBookings,
        activePasses,
        pendingPasses,
        totalRevenue,
        recentBookings
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getAllUsers(req: Request, res: Response) {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        email: true,
        emailVerified: true,
        phoneNumber: true,
        phoneVerified: true,
        role: true,
        isSuspended: true,
        createdAt: true
      }
    });
    return res.status(200).json({ success: true, data: users });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function toggleUserSuspension(req: Request, res: Response) {
  try {
    const userId = req.params.userId as string;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isSuspended: !user.isSuspended }
    });

    return res.status(200).json({
      success: true,
      message: `User status changed to ${updated.isSuspended ? 'Suspended' : 'Active'}.`,
      data: updated
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getAllPasses(req: Request, res: Response) {
  try {
    const passes = await prisma.busPass.findMany({
      include: { user: true, route: true, booking: true },
      orderBy: { createdAt: 'desc' }
    });
    return res.status(200).json({ success: true, data: passes });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function reviewPass(req: Request, res: Response) {
  try {
    const validated = PassApprovalSchema.parse(req.body);

    const pass = await prisma.busPass.findUnique({
      where: { id: validated.passId },
      include: { user: true, route: true }
    });

    if (!pass) {
      return res.status(404).json({ success: false, message: 'Bus pass not found.' });
    }

    const newStatus = validated.status === 'APPROVED' ? 'ACTIVE' : 'REJECTED';

    await prisma.$transaction([
      prisma.busPass.update({
        where: { id: pass.id },
        data: {
          status: newStatus as any,
          rejectionReason: validated.rejectionReason || null
        }
      }),
      prisma.booking.update({
        where: { id: pass.bookingId },
        data: { status: newStatus as any }
      })
    ]);

    // Emit Realtime Event
    emitToUser(pass.userId, 'pass_status_updated', {
      passId: pass.id,
      status: newStatus,
      rejectionReason: validated.rejectionReason
    });

    // Send Email Notification
    const emailHtml = getEmailTemplate(
      `Bus Pass Application ${newStatus}`,
      `<p>Hello <strong>${pass.user.fullName}</strong>,</p>
       <p>Your bus pass application (<strong>${pass.passNumber}</strong>) for Route ${pass.route.routeCode} has been <strong>${newStatus}</strong> by the administration.</p>
       ${validated.rejectionReason ? `<p><strong>Reason:</strong> ${validated.rejectionReason}</p>` : ''}`
    );
    sendEmail(pass.user.email, `Bus Pass Status Update: ${pass.passNumber}`, emailHtml);

    return res.status(200).json({
      success: true,
      message: `Pass ${newStatus.toLowerCase()} successfully.`
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function verifyQrCode(req: Request, res: Response) {
  try {
    const { qrString } = req.body;
    if (!qrString) {
      return res.status(400).json({ success: false, message: 'QR string is required.' });
    }

    let parsed: any;
    try {
      parsed = JSON.parse(qrString);
    } catch {
      return res.status(400).json({ success: false, message: 'Malformed QR Code.' });
    }

    const { data: rawData, sig } = parsed;
    const expectedSig = generateHmacSignature(rawData);

    if (sig !== expectedSig) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'FORGERY DETECTED! HMAC Signature verification failed.'
      });
    }

    const payload = JSON.parse(rawData);
    const pass = await prisma.busPass.findUnique({
      where: { passNumber: payload.passNumber },
      include: { user: true, route: true }
    });

    if (!pass) {
      return res.status(404).json({ success: false, valid: false, message: 'Pass not found in system.' });
    }

    const isExpired = new Date(pass.expiryDate) < new Date();
    const isValid = pass.status === 'ACTIVE' && !isExpired;

    return res.status(200).json({
      success: true,
      valid: isValid,
      message: isValid ? 'VALID PASS' : isExpired ? 'EXPIRED PASS' : `INVALID PASS (${pass.status})`,
      data: {
        passNumber: pass.passNumber,
        passengerName: pass.passengerName,
        passengerPhoto: pass.passengerPhoto,
        routeCode: pass.route.routeCode,
        source: pass.route.source,
        destination: pass.route.destination,
        duration: pass.duration,
        startDate: pass.startDate,
        expiryDate: pass.expiryDate,
        status: pass.status,
        isExpired
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
