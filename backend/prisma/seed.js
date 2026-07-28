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

  // --- Seed Fee Types ---
  const tuitionFeeType = await prisma.feeType.create({
    data: { schoolId: schoolGreenwood.id, name: 'Tuition Fee', description: 'Monthly tuition fee', isVariable: false, isRecurring: true, recurringIntervalDays: 30, amount: 5000, dueDays: 10 }
  });
  const libraryFeeType = await prisma.feeType.create({
    data: { schoolId: schoolGreenwood.id, name: 'Library Fee', description: 'Annual library fee', isVariable: false, isRecurring: true, recurringIntervalDays: 365, amount: 1200, dueDays: 30 }
  });
  const transportFeeType = await prisma.feeType.create({
    data: { schoolId: schoolGreenwood.id, name: 'Transport Fee', description: 'Optional transport fee', isVariable: true, isRecurring: true, recurringIntervalDays: 30, amount: 1500, dueDays: 5 }
  });
  const examFeeType = await prisma.feeType.create({
    data: { schoolId: schoolGreenwood.id, name: 'Examination Fee', description: 'Term examination fee', isVariable: false, isRecurring: false, amount: 800, dueDays: 15 }
  });
  const labFeeType = await prisma.feeType.create({
    data: { schoolId: schoolGreenwood.id, name: 'Laboratory Fee', description: 'Practical lab fee', isVariable: true, isRecurring: true, recurringIntervalDays: 365, amount: 2000, dueDays: 20 }
  });

  // --- Seed Fee Structures (Classes 10 and 11) ---
  const class10Tuition = await prisma.feeStructure.create({
    data: { schoolId: schoolGreenwood.id, feeTypeId: tuitionFeeType.id, class: '10', academicYear: '2026-2027' }
  });
  const class10Library = await prisma.feeStructure.create({
    data: { schoolId: schoolGreenwood.id, feeTypeId: libraryFeeType.id, class: '10', academicYear: '2026-2027' }
  });
  const class10Transport = await prisma.feeStructure.create({
    data: { schoolId: schoolGreenwood.id, feeTypeId: transportFeeType.id, class: '10', academicYear: '2026-2027' }
  });
  const class10Exam = await prisma.feeStructure.create({
    data: { schoolId: schoolGreenwood.id, feeTypeId: examFeeType.id, class: '10', academicYear: '2026-2027' }
  });

  const class11Tuition = await prisma.feeStructure.create({
    data: { schoolId: schoolGreenwood.id, feeTypeId: tuitionFeeType.id, class: '11', academicYear: '2026-2027' }
  });
  const class11Library = await prisma.feeStructure.create({
    data: { schoolId: schoolGreenwood.id, feeTypeId: libraryFeeType.id, class: '11', academicYear: '2026-2027' }
  });
  const class11Transport = await prisma.feeStructure.create({
    data: { schoolId: schoolGreenwood.id, feeTypeId: transportFeeType.id, class: '11', academicYear: '2026-2027' }
  });
  const class11Lab = await prisma.feeStructure.create({
    data: { schoolId: schoolGreenwood.id, feeTypeId: labFeeType.id, class: '11', academicYear: '2026-2027' }
  });

  // --- Seed Students ---
  const student1User = await prisma.user.create({
    data: { name: 'Rahul Sharma', email: 'student@greenwood.com', passwordHash: studentHash, role: 'STUDENT', schoolId: schoolGreenwood.id, status: 'active' }
  });
  const student1 = await prisma.student.create({
    data: {
      userId: student1User.id, schoolId: schoolGreenwood.id, rollNumber: 'GW-10-101', class: '10', section: 'A',
      guardianName: 'Rajesh Sharma', guardianPhone: '9876543210', guardianEmail: 'rajesh@example.com', gender: 'MALE',
      studentFees: {
        create: [
          { schoolId: schoolGreenwood.id, feeStructureId: class10Tuition.id, amountDue: tuitionFeeType.amount, amountPaid: 0, status: 'UNPAID', dueDate: new Date() },
          { 
            schoolId: schoolGreenwood.id, feeStructureId: class10Library.id, amountDue: libraryFeeType.amount, amountPaid: libraryFeeType.amount, status: 'PAID', dueDate: new Date(),
            transactions: { create: [{ schoolId: schoolGreenwood.id, amount: libraryFeeType.amount, method: 'CARD', status: 'SUCCESS', recordedBy: greenwoodAccountant.id }] }
          },
          { 
            schoolId: schoolGreenwood.id, feeStructureId: class10Exam.id, amountDue: examFeeType.amount, amountPaid: 200, status: 'PARTIAL', dueDate: new Date(),
            transactions: { create: [{ schoolId: schoolGreenwood.id, amount: 200, method: 'UPI', status: 'SUCCESS', recordedBy: greenwoodAccountant.id }] }
          },
        ]
      }
    }
  });

  const student2User = await prisma.user.create({
    data: { name: 'Priya Patel', email: 'priya@greenwood.com', passwordHash: studentHash, role: 'STUDENT', schoolId: schoolGreenwood.id, status: 'active' }
  });
  const student2 = await prisma.student.create({
    data: {
      userId: student2User.id, schoolId: schoolGreenwood.id, rollNumber: 'GW-11-201', class: '11', section: 'B',
      guardianName: 'Amit Patel', guardianPhone: '9123456780', guardianEmail: 'amit@example.com', gender: 'FEMALE',
      studentFees: {
        create: [
          { 
            schoolId: schoolGreenwood.id, feeStructureId: class11Tuition.id, amountDue: tuitionFeeType.amount, amountPaid: tuitionFeeType.amount, status: 'PAID', dueDate: new Date(),
            transactions: { create: [{ schoolId: schoolGreenwood.id, amount: tuitionFeeType.amount, method: 'CASH', status: 'SUCCESS', recordedBy: greenwoodAccountant.id }] }
          },
          { schoolId: schoolGreenwood.id, feeStructureId: class11Lab.id, amountDue: labFeeType.amount, amountPaid: 0, status: 'UNPAID', dueDate: new Date() },
          { schoolId: schoolGreenwood.id, feeStructureId: class11Transport.id, amountDue: transportFeeType.amount, amountPaid: 0, status: 'UNPAID', dueDate: new Date() },
        ]
      }
    }
  });

  const student3User = await prisma.user.create({
    data: { name: 'Aarav Gupta', email: 'aarav@greenwood.com', passwordHash: studentHash, role: 'STUDENT', schoolId: schoolGreenwood.id, status: 'active' }
  });
  const student3 = await prisma.student.create({
    data: {
      userId: student3User.id, schoolId: schoolGreenwood.id, rollNumber: 'GW-10-102', class: '10', section: 'A',
      guardianName: 'Sanjay Gupta', guardianPhone: '9988776655', guardianEmail: 'sanjay@example.com', gender: 'MALE',
      studentFees: {
        create: [
          { schoolId: schoolGreenwood.id, feeStructureId: class10Tuition.id, amountDue: tuitionFeeType.amount, amountPaid: 0, status: 'UNPAID', dueDate: new Date() },
          { 
            schoolId: schoolGreenwood.id, feeStructureId: class10Transport.id, amountDue: transportFeeType.amount, amountPaid: transportFeeType.amount, status: 'PAID', dueDate: new Date(),
            transactions: { create: [{ schoolId: schoolGreenwood.id, amount: transportFeeType.amount, method: 'UPI', status: 'SUCCESS', recordedBy: greenwoodAccountant.id }] }
          },
        ]
      }
    }
  });

  console.log('Successfully seeded Greenwood fee types, structures, and students.');

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
