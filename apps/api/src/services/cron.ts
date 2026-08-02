import { prisma } from '../config/db.js';

export function startCronJobs() {
  console.log('⏰ Starting background cron schedules...');

  // Run pass expiration check every hour
  setInterval(async () => {
    try {
      const now = new Date();
      const expiredPasses = await prisma.busPass.updateMany({
        where: {
          expiryDate: { lt: now },
          status: 'ACTIVE'
        },
        data: {
          status: 'EXPIRED'
        }
      });
      if (expiredPasses.count > 0) {
        console.log(`⏰ Cron: Updated ${expiredPasses.count} expired passes to EXPIRED.`);
      }

      // Cleanup expired OTP records
      await prisma.otpRecord.deleteMany({
        where: {
          expiresAt: { lt: now }
        }
      });
    } catch (err: any) {
      console.error('⏰ Cron job error:', err.message);
    }
  }, 60 * 60 * 1000);
}
