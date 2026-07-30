import dotenv from 'dotenv';
import path from 'node:path';
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { PrismaClient } from '@prisma/client';
import * as argon2 from '@node-rs/argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Database Seeding...');

  const adminPasswordHash = await argon2.hash('Admin@12345');
  const userPasswordHash = await argon2.hash('User@12345');

  // Seed Super Admin
  const admin = await prisma.user.upsert({
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
  console.log('✅ Created Super Admin:', admin.email);

  // Seed Staff Validator
  const staff = await prisma.user.upsert({
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
  console.log('✅ Created Staff User:', staff.email);

  // Seed Demo Commuter User
  const user = await prisma.user.upsert({
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
  console.log('✅ Created Demo User:', user.email);

  // Seed Bus Routes
  const routesData = [
    {
      routeCode: 'R-101',
      source: 'Central Bus Station',
      destination: 'Tech Park Metro',
      viaStops: ['City Center', 'University Gate', 'Financial District'],
      distanceKm: 24.5,
      baseMonthlyFare: 1200.0,
      isActive: true
    },
    {
      routeCode: 'R-202',
      source: 'North Terminal',
      destination: 'South Industrial Estate',
      viaStops: ['Ring Road', 'Airport Junction', 'Port Road'],
      distanceKm: 35.0,
      baseMonthlyFare: 1650.0,
      isActive: true
    },
    {
      routeCode: 'R-303',
      source: 'Suburban Hub',
      destination: 'Central Rail Terminus',
      viaStops: ['Old City', 'Market Square', 'Civil Lines'],
      distanceKm: 18.2,
      baseMonthlyFare: 950.0,
      isActive: true
    },
    {
      routeCode: 'R-404',
      source: 'East Corridor Expressway',
      destination: 'West Highway Interchange',
      viaStops: ['Outer Ring Road', 'Knowledge Park', 'Cyber City'],
      distanceKm: 42.0,
      baseMonthlyFare: 2100.0,
      isActive: true
    }
  ];

  for (const r of routesData) {
    await prisma.route.upsert({
      where: { routeCode: r.routeCode },
      update: {},
      create: {
        ...r,
        viaStops: JSON.stringify(r.viaStops)
      }
    });
  }
  console.log('✅ Created 4 High-Volume Bus Routes');

  console.log('✨ Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
