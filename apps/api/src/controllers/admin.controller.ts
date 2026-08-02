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

// ─── Stops CRUD ──────────────────────────────────────────────
export async function getAllStops(req: Request, res: Response) {
  try {
    const stops = await prisma.stop.findMany({ orderBy: { name: 'asc' } });
    return res.json({ success: true, data: stops });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function createStop(req: Request, res: Response) {
  try {
    const { name, code, location, latitude, longitude } = req.body;
    const stop = await prisma.stop.create({
      data: { name, code, location, latitude: latitude ? parseFloat(latitude) : null, longitude: longitude ? parseFloat(longitude) : null }
    });
    return res.status(201).json({ success: true, data: stop });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function updateStop(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const stop = await prisma.stop.update({ where: { id }, data: req.body });
    return res.json({ success: true, data: stop });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function deleteStop(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    await prisma.stop.delete({ where: { id } });
    return res.json({ success: true, message: 'Stop deleted successfully.' });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

// ─── Drivers CRUD ─────────────────────────────────────────────
export async function getAllDrivers(req: Request, res: Response) {
  try {
    const drivers = await prisma.driver.findMany({ orderBy: { fullName: 'asc' } });
    return res.json({ success: true, data: drivers });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function createDriver(req: Request, res: Response) {
  try {
    const { fullName, licenseNumber, phoneNumber, address } = req.body;
    const driver = await prisma.driver.create({
      data: { fullName, licenseNumber, phoneNumber, address }
    });
    return res.status(201).json({ success: true, data: driver });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function updateDriver(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const driver = await prisma.driver.update({ where: { id }, data: req.body });
    return res.json({ success: true, data: driver });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function deleteDriver(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    await prisma.driver.delete({ where: { id } });
    return res.json({ success: true, message: 'Driver deleted successfully.' });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

// ─── Buses CRUD ───────────────────────────────────────────────
export async function getAllBuses(req: Request, res: Response) {
  try {
    const buses = await prisma.bus.findMany({
      include: { driver: true },
      orderBy: { busNumber: 'asc' }
    });
    return res.json({ success: true, data: buses });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function createBus(req: Request, res: Response) {
  try {
    const { busNumber, registration, capacity, busType, driverId, routeId } = req.body;
    const bus = await prisma.bus.create({
      data: { busNumber, registration, capacity: capacity ? parseInt(capacity) : 40, busType, driverId, routeId }
    });
    return res.status(201).json({ success: true, data: bus });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function updateBus(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const bus = await prisma.bus.update({ where: { id }, data: req.body });
    return res.json({ success: true, data: bus });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function deleteBus(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    await prisma.bus.delete({ where: { id } });
    return res.json({ success: true, message: 'Bus deleted successfully.' });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

// ─── Export Endpoints ─────────────────────────────────────────
export async function exportPassesCsv(req: Request, res: Response) {
  try {
    const passes = await prisma.busPass.findMany({
      include: { user: true, route: true }
    });

    let csv = 'Pass Number,Passenger Name,Email,Phone,Route Code,Duration,Status,Fare,Expiry Date\n';
    passes.forEach((p) => {
      csv += `"${p.passNumber}","${p.passengerName}","${p.user.email}","${p.user.phoneNumber}","${p.route.routeCode}","${p.duration}","${p.status}",${p.fareAmount},"${p.expiryDate.toISOString()}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=bus_passes.csv');
    return res.status(200).send(csv);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

