import { Request, Response } from 'express';
import crypto from 'node:crypto';
import { prisma } from '../config/db.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { InitializePaymentSchema, VerifyPaymentSchema } from '@bus-pass/shared';
import { env } from '../config/env.js';
import { emitToUser, emitToAdmin } from '../socket/index.js';
import { sendEmail, getEmailTemplate } from '../services/notification.service.js';

export async function initializePayment(req: AuthenticatedRequest, res: Response) {
  try {
    const validated = InitializePaymentSchema.parse(req.body);

    const booking = await prisma.booking.findUnique({
      where: { id: validated.bookingId },
      include: { busPass: true }
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking record not found.' });
    }

    const transactionId = `TXN-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const gatewayOrder = `ORD-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    const payment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        userId: req.user!.id,
        transactionId,
        gatewayOrder,
        amount: validated.amount,
        currency: 'INR',
        gateway: validated.gateway,
        status: 'PENDING'
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Payment initialized successfully.',
      data: {
        paymentId: payment.id,
        transactionId: payment.transactionId,
        gatewayOrder: payment.gatewayOrder,
        amount: payment.amount,
        currency: payment.currency,
        key: env.RAZORPAY_KEY_ID
      }
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Payment initialization failed.' });
  }
}

export async function verifyPayment(req: AuthenticatedRequest, res: Response) {
  try {
    const validated = VerifyPaymentSchema.parse(req.body);

    const payment = await prisma.payment.findUnique({
      where: { id: validated.paymentId },
      include: { booking: true, user: true }
    });

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found.' });
    }

    // Atomic update payment, booking, bus pass, and generate invoice
    const invoiceNumber = `INV-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const taxAmount = payment.amount * 0.18; // 18% GST
    const totalAmount = payment.amount + taxAmount;

    await prisma.$transaction(async (tx) => {
      // 1. Update Payment status
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: 'SUCCESS', paidAt: new Date() }
      });

      // 2. Update Booking & Bus Pass status to APPROVED / ACTIVE
      await tx.booking.update({
        where: { id: payment.bookingId },
        data: { status: 'APPROVED' }
      });

      await tx.busPass.update({
        where: { bookingId: payment.bookingId },
        data: { status: 'ACTIVE' }
      });

      // 3. Create Invoice Record
      await tx.invoice.create({
        data: {
          invoiceNumber,
          paymentId: payment.id,
          userId: payment.userId,
          amount: payment.amount,
          taxAmount,
          totalAmount
        }
      });
    });

    // Notify User & Admin via Socket.IO
    emitToUser(payment.userId, 'payment_success', {
      transactionId: payment.transactionId,
      amount: totalAmount,
      invoiceNumber
    });

    emitToAdmin('payment_received', {
      transactionId: payment.transactionId,
      user: payment.user.fullName,
      amount: totalAmount
    });

    // Send Payment Success Email
    const emailHtml = getEmailTemplate(
      'Payment Successful - Bus Pass Activated!',
      `<p>Hello <strong>${payment.user.fullName}</strong>,</p>
       <p>We have successfully received your payment of <strong>₹${totalAmount.toFixed(2)}</strong> (Incl. GST).</p>
       <ul>
         <li><strong>Transaction ID:</strong> ${payment.transactionId}</li>
         <li><strong>Invoice Number:</strong> ${invoiceNumber}</li>
         <li><strong>Payment Method:</strong> ${payment.gateway}</li>
       </ul>
       <p>Your digital bus pass is now <strong>ACTIVE</strong> and ready to use!</p>`
    );
    sendEmail(payment.user.email, `Payment Receipt: ${payment.transactionId}`, emailHtml);

    return res.status(200).json({
      success: true,
      message: 'Payment verified and pass activated successfully!',
      data: {
        transactionId: payment.transactionId,
        invoiceNumber,
        status: 'SUCCESS'
      }
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Payment verification failed.' });
  }
}
