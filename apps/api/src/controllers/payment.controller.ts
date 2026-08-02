import { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { InitializePaymentSchema, VerifyPaymentSchema } from '@bus-pass/shared';
import { env } from '../config/env.js';

// Lazily create Razorpay client only when credentials are set
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { logger } from '../utils/logger.js';
import { sendEmail, getEmailTemplate } from '../services/notification.service.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
function getRazorpayClient(): Razorpay {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay credentials not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
  }
  return new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET,
  });
}
// Lazily create Razorpay client only when credentials are set






export async function initializePayment(req: AuthenticatedRequest, res: Response) {
  try {
    const validated = InitializePaymentSchema.parse(req.body);
    
    if (validated.amount <= 0) {
      return res.status(400).json({ success: false, message: 'Payment amount must be greater than 0' });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: validated.bookingId },
      include: { busPass: true }
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const existingPayment = await prisma.payment.findFirst({
      where: { bookingId: booking.id }
    });

    if (existingPayment) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate payment request',
        data: { paymentId: existingPayment.id }
      });
    }

    const transactionId = `PAY-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
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

    if (validated.gateway === 'RAZORPAY') {
      const isConfigured = env.RAZORPAY_KEY_ID && !env.RAZORPAY_KEY_ID.toLowerCase().includes('your_');
      let orderId = `order_mock_${Date.now()}`;
      
      if (isConfigured) {
        try {
          const razorpayClient = getRazorpayClient();
          const order = await razorpayClient.orders.create({
            amount: Math.round(validated.amount * 100),
            currency: 'INR',
            receipt: transactionId,
            notes: {
              bookingId: booking.id,
              userId: req.user!.id
            }
          });
          orderId = order.id;
        } catch (err: any) {
          logger.warn(`Razorpay client error: ${err.message}. Using mock order ID.`);
        }
      }

      await prisma.payment.update({
        where: { id: payment.id },
        data: { gatewayOrder: orderId }
      });

      return res.status(200).json({
        success: true,
        message: 'Payment order created successfully',
        data: {
          paymentId: payment.id,
          orderId: orderId,
          amount: validated.amount,
          currency: 'INR',
          key: env.RAZORPAY_KEY_ID || 'rzp_test_mock',
          description: `Bus Pass for route ${booking.routeId}`
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Payment initialized',
      data: {
        paymentId: payment.id,
        transactionId,
        gatewayOrder,
        amount: validated.amount,
        currency: 'INR'
      }
    });
  } catch (error: any) {
    logger.error(`Payment initialization error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Payment initialization failed',
      details: error.message
    });
  }
}

export async function verifyPayment(req: Request, res: Response) {
  try {
    const validated = VerifyPaymentSchema.parse(req.body);

    const payment = await prisma.payment.findUnique({
      where: { id: validated.paymentId },
      include: { booking: { include: { route: true, busPass: true } }, user: true }
    });

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    if (payment.gateway === 'RAZORPAY') {
      const isConfigured = env.RAZORPAY_KEY_ID && !env.RAZORPAY_KEY_ID.toLowerCase().includes('your_');
      if (isConfigured && validated.signature) {
        const isValid = validateRazorpaySignature(
          validated.orderId,
          validated.paymentId,
          validated.signature || ''
        );

        if (!isValid) {
          return res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }
      }
    }

    const invoiceNumber = `INV-${new Date().getFullYear()}-${payment.id.slice(0, 8)}`;
    const receiptNumber = `RCPT-${Date.now()}-${payment.id}`;

    await prisma.$transaction(async (tx: any) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: 'SUCCESS', paidAt: new Date() }
      });

      await tx.booking.update({
        where: { id: payment.bookingId },
        data: { status: 'APPROVED' }
      });

      if (payment.booking?.busPass) {
        await tx.busPass.update({
          where: { id: payment.booking.busPass.id },
          data: { status: 'ACTIVE' }
        });
      }

      await tx.invoice.create({
        data: {
          invoiceNumber,
          paymentId: payment.id,
          userId: payment.userId,
          amount: payment.amount,
          taxAmount: payment.amount * 0.18,
          totalAmount: payment.amount * 1.18
        }
      });

      await tx.receipt.create({
        data: {
          receiptNumber,
          paymentId: payment.id,
          pdfUrl: `/receipts/${receiptNumber}.pdf`
        }
      });
    });

    const emailHtml = getEmailTemplate(
      'Payment Successful - Bus Pass Activated!',
      `<p>Hello <strong>${payment.user?.fullName || 'Customer'}</strong>,</p>
       <p>We have successfully received your payment of <strong>₹${(payment.amount * 1.18).toFixed(2)}</strong> (Incl. GST).</p>
       <ul>
         <li><strong>Transaction ID:</strong> ${payment.transactionId}</li>
         <li><strong>Invoice Number:</strong> ${invoiceNumber}</li>
         <li><strong>Payment Method:</strong> ${payment.gateway}</li>
       </ul>
       <p>Your digital bus pass is now <strong>ACTIVE</strong> and ready to use!</p>`
    );
    await sendEmail(payment.user?.email || '', `Payment Receipt: ${payment.transactionId}`, emailHtml);

    return res.status(200).json({
      success: true,
      message: 'Payment verified and pass activated successfully!',
      data: {
        transactionId: payment.transactionId,
        invoiceNumber,
        receiptNumber,
        status: 'SUCCESS'
      }
    });
  } catch (error: any) {
    logger.error(`Payment verification error: ${error.message}`);
    return res.status(400).json({
      success: false,
      message: error.message || 'Payment verification failed',
      details: error.stack
    });
  }
}

export async function razorpayWebhook(req: Request, res: Response) {
  try {
    const secret = env.RAZORPAY_WEBHOOK_SECRET || 'fallback_secret';
    const signature = req.headers['x-razorpay-signature'] as string;

    if (!signature) {
      return res.status(400).json({ success: false, message: 'Missing signature header' });
    }

    const body = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );

    if (!isValid) {
      logger.warn('Invalid Razorpay webhook signature');
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    const event = req.body;
    logger.info(`Received Razorpay webhook: ${event.event}`);

    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      const paymentEntity = event.payload.payment?.entity || event.payload.order?.entity;
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;

      const payment = await prisma.payment.findFirst({
        where: { gatewayOrder: orderId },
        include: { booking: { include: { busPass: true } } }
      });

      if (payment && payment.status === 'PENDING') {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'SUCCESS', paidAt: new Date() }
        });

        await prisma.booking.update({
          where: { id: payment.bookingId },
          data: { status: 'APPROVED' }
        });

        if (payment.booking?.busPass) {
          await prisma.busPass.update({
            where: { id: payment.booking.busPass.id },
            data: { status: 'ACTIVE' }
          });
        }

        logger.info(`Payment ${paymentId} verified via webhook for order ${orderId}`);
      }
    }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    logger.error(`Webhook error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Webhook processing failed' });
  }
}

function validateRazorpaySignature(orderId: string, paymentId: string, signature: string): boolean {
  const secret = env.RAZORPAY_KEY_SECRET || 'fallback_secret';
  const text = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(text)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(signature)
  );
}