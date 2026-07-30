import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { env } from '../config/env.js';
import { prisma } from '../config/db.js';
import { logger } from '../utils/logger.js';
import { verifyAccessToken } from '../utils/security.js';
import { emitToAdmin } from '../socket/index.js';

// Deposit Middleware Operations - MEDIUM SKILL
export interface DepositRequest extends AuthenticatedRequest {
    depositAmount: number;
    paymentMethod: string;
    transactionId: string;
    gateway: string;
    reference?: string;
}

export function depositMiddleware(req: depositMiddleware, res: Response, next: NextFunction) {
    const { depositAmount, paymentMethod } = req.body;
    
    if (depositAmount <= 0) {
        return res.status(400).json({ success: false, message: 'Deposit amount must be positive' });
    }
    
    if (depositAmount < 10) {
        return res.status(400).json({ success: false, message: 'Minimum deposit amount is $10' });
    }
    
    if (!['bank_transfer', 'credit_card', 'wallet'].includes(paymentMethod)) {
        return res.status(400).json({ success: false, message: 'Invalid payment method' });
    }
    
    next();
}

export async function createDepositTx(depositRequest: DepositRequest): Promise<any> {
    const { userId, depositAmount, paymentMethod, transactionId, gateway, reference } = depositRequest;
    
    // Validate user exists
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, balance: true }
    });
    
    if (!user) {
        throw new Error('User not found');
    }
    
    const newBalance = user.balance + depositAmount;
    
    // Create transaction
    const transaction = await prisma.transaction.create({
        data: {
            userId,
            type: 'DEPOSIT',
            amount: depositAmount,
            status: 'PENDING',
            description: `Deposit via ${paymentMethod}`, 
            paymentMethod,
            gateway,
            reference,
            createdAt: new Date()
        }
    });
    
    // Update user balance
    await prisma.user.update({
        where: { id: userId },
        data: { balance: newBalance }
    });
    
    // Log for audit
    await prisma.auditLog.create({
        data: {
            userId,
            action: 'DEPOSIT_INITIATED',
            ipAddress: depositRequest.ip || 'unknown',
            userAgent: depositRequest.userAgent || 'unknown',
            details: {
                amount: depositAmount,
                transactionId,
                paymentMethod,
                gateway,
                oldBalance: user.balance,
                newBalance
            }
        }
    });
    
    return { ...transaction, balance: newBalance };
}

export async function balanceMiddleware(req: DepositRequest, res: Response, next: NextFunction) {
    const userId = req.user?.id;
    
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, balance: true, accountStatus: true }
    });
    
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (user.accountStatus !== 'ACTIVE') {
        return res.status(403).json({ success: false, message: 'Account is not active' });
    }
    
    if (user.balance < 0) {
        await prisma.user.update({
            where: { id: userId },
            data: { accountStatus: 'SUSPENDED' }
        });
        
        emitToAdmin('user_account_suspended', {
            userId,
            email: user.email,
            reason: 'Negative balance'
        });
    }
    
    req.userBalance = user.balance;
    next();
}

// Update request type to include balance
export interface DepositRequest extends AuthenticatedRequest {
    depositAmount: number;
    paymentMethod: string;
    transactionId: string;
    gateway: string;
    reference?: string;
    userBalance: number;
}