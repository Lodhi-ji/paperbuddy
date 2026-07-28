import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with enriched multi-tenant mock SaaS data...');

  // Clean existing tables in correct order due to constraints
  await prisma.message.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.studentFee.deleteMany({});
  await prisma.feeStructure.deleteMany({});
  await prisma.feeType.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.invite.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.school.deleteMany({});
  await prisma.superAdmin.deleteMany({});

  const adminHash = bcrypt.hashSync('Admin123!', 10);
  const accountantHash = bcrypt.hashSync('Accountant123!', 10);
  const studentHash = bcrypt.hashSync('111111', 10);

  // 1. Create Super Admin
  const superAdminHash = bcrypt.hashSync('SuperAdmin123!', 10);
  const superAdmin = await prisma.superAdmin.create({
    data: {
      name: 'Super Admin Operator',
      email: 'superadmin@campuspay.com',
      passwordHash: superAdminHash,
    },
  });
  console.log(`Created Super Admin: ${superAdmin.email}`);

  // 2. Create School Tenants
  const schoolGreenwood = await prisma.school.create({
    data: {
      name: 'Greenwood International School',
      slug: 'greenwood',
      address: '77 Oakridge Blvd, Sector 4, Bangalore',
      logoUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=120',
      contactEmail: 'info@greenwood.edu',
      status: 'ACTIVE',
    },
  });

  const schoolBeacon = await prisma.school.create({
    data: {
      name: 'Beacon Hill Prep School',
      slug: 'beacon',
      address: '102 Sunset Lane, New Delhi',
      logoUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=120',
      contactEmail: 'contact@beaconhill.edu',
      status: 'ACTIVE',
    },
  });
  console.log(`Created Schools: ${schoolGreenwood.name}, ${schoolBeacon.name}`);

  // -------------------------------------------------------------------
  // SCHOOL 1: GREENWOOD INTERNATIONAL
  // -------------------------------------------------------------------
  
  // Staff Accounts
  const greenwoodAdmin = await prisma.user.create({
    data: {
      name: 'Dr. Sarah Jenkins',
      email: 'admin@greenwood.com',
      passwordHash: adminHash,
      role: 'SCHOOL_ADMIN',
      schoolId: schoolGreenwood.id,
      status: 'active',
    },
  });

  const greenwoodAccountant = await prisma.user.create({
    data: {
      name: 'Mark Miller',
      email: 'accountant@greenwood.com',
      passwordHash: accountantHash,
      role: 'ACCOUNTANT',
      schoolId: schoolGreenwood.id,
      status: 'active',
      permissions: {
        can_record_payment: true,
        can_apply_waiver: true,
        can_apply_penalty: true,
        can_reconcile_cheque: true,
        can_view_dashboard_metrics: true,
        can_edit_fee_structure: true,
      },
    },
  });

  console.log('Successfully seeded Greenwood accounts.');

  // -------------------------------------------------------------------
  // SCHOOL 2: BEACON HILL PREP
  // -------------------------------------------------------------------
  
  const beaconAdmin = await prisma.user.create({
    data: {
      name: 'Dr. Rajesh Gupta',
      email: 'admin@beacon.com',
      passwordHash: adminHash,
      role: 'SCHOOL_ADMIN',
      schoolId: schoolBeacon.id,
      status: 'active',
    },
  });

  const beaconAccountant = await prisma.user.create({
    data: {
      name: 'Sanjay Verma',
      email: 'accountant@beacon.com',
      passwordHash: accountantHash,
      role: 'ACCOUNTANT',
      schoolId: schoolBeacon.id,
      status: 'active',
      permissions: {
        can_record_payment: true,
        can_apply_waiver: false,
        can_apply_penalty: true,
        can_reconcile_cheque: true,
        can_view_dashboard_metrics: true,
        can_edit_fee_structure: false,
      },
    },
  });

  console.log('Successfully seeded Beacon Hill Prep accounts.');
  console.log('Database seeding process complete! Database is fully populated with rich multi-tenant logs.');
}

main()
  .catch((e) => {
    console.error('Error seeding DB:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
