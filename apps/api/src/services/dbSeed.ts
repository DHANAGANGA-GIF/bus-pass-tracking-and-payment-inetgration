import { PrismaClient } from '@prisma/client';
import * as argon2 from '@node-rs/argon2';
import { logger } from '../utils/logger.js';

const prisma = new PrismaClient();

export async function ensureDatabaseSeeded() {
  try {
    const userCount = await prisma.user.count();
    if (userCount > 0) {
      logger.info('🌱 Database already seeded (' + userCount + ' users exist).');
      return;
    }

    logger.info('🌱 Database empty. Auto-seeding demo users and routes...');

    const adminPasswordHash = await argon2.hash('Admin@12345');
    const userPasswordHash = await argon2.hash('User@12345');

    // Seed Super Admin
    await prisma.user.upsert({
      where: { email: 'admin@buspass.com' },
      update: {},
      create: {
        email: 'admin@buspass.com',
        emailVerified: true,
        phoneNumber: '9876543210',
        phoneVerified: true,
        passwordHash: adminPasswordHash,
        fullName: 'Chief System Administrator',
        role: 'SUPER_ADMIN',
        district: 'Central',
        state: 'Delhi'
      }
    });

    // Seed Staff Inspector / Conductor
    await prisma.user.upsert({
      where: { email: 'conductor@buspass.com' },
      update: {},
      create: {
        email: 'conductor@buspass.com',
        emailVerified: true,
        phoneNumber: '9876543211',
        phoneVerified: true,
        passwordHash: adminPasswordHash,
        fullName: 'Transit Inspector / Conductor',
        role: 'STAFF',
        district: 'Central',
        state: 'Delhi'
      }
    });

    // Seed Demo Commuter User
    await prisma.user.upsert({
      where: { email: 'commuter@gmail.com' },
      update: {},
      create: {
        email: 'commuter@gmail.com',
        emailVerified: true,
        phoneNumber: '9123456789',
        phoneVerified: true,
        passwordHash: userPasswordHash,
        fullName: 'Rahul Sharma',
        role: 'USER',
        address: '123 Park Street, Connaught Place',
        district: 'New Delhi',
        state: 'Delhi',
        pincode: '110001',
        emergencyContact: '9876500000',
        govtIdType: 'AADHAAR',
        govtIdNumber: '1234-5678-9012'
      }
    });

    // Seed Bus Routes
    const routesData = [
      {
        routeCode: 'R-101',
        source: 'Central Bus Station',
        destination: 'Tech Park Metro',
        viaStops: JSON.stringify(['City Center', 'University Gate', 'Financial District']),
        distanceKm: 24.5,
        baseMonthlyFare: 1200.0,
        isActive: true
      },
      {
        routeCode: 'R-202',
        source: 'North Terminal',
        destination: 'South Industrial Estate',
        viaStops: JSON.stringify(['Ring Road', 'Airport Junction', 'Port Road']),
        distanceKm: 35.0,
        baseMonthlyFare: 1650.0,
        isActive: true
      },
      {
        routeCode: 'R-303',
        source: 'Suburban Hub',
        destination: 'Central Rail Terminus',
        viaStops: JSON.stringify(['Old City', 'Market Square', 'Civil Lines']),
        distanceKm: 18.2,
        baseMonthlyFare: 950.0,
        isActive: true
      },
      {
        routeCode: 'R-404',
        source: 'East Corridor Expressway',
        destination: 'West Highway Interchange',
        viaStops: JSON.stringify(['Outer Ring Road', 'Knowledge Park', 'Cyber City']),
        distanceKm: 42.0,
        baseMonthlyFare: 2100.0,
        isActive: true
      }
    ];

    for (const r of routesData) {
      await prisma.route.upsert({
        where: { routeCode: r.routeCode },
        update: {},
        create: r
      });
    }

    logger.info('✨ Auto-seeding completed successfully.');
  } catch (err: any) {
    logger.warn('⚠️ Auto-seeding encountered non-fatal error: ' + (err?.message || err));
  }
}
