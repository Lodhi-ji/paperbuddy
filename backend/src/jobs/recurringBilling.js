import cron from 'node-cron';
import prisma from '../db.js';

export function startRecurringBillingJob() {
  // Runs every day at midnight (0 0 * * *)
  cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Running daily recurring billing job...');
    try {
      // 1. Find all fee types that are recurring and have an interval
      const recurringFeeTypes = await prisma.feeType.findMany({
        where: { isRecurring: true, recurringIntervalDays: { not: null } },
        include: { structures: true }
      });

      if (recurringFeeTypes.length === 0) return;

      const now = new Date();

      for (const feeType of recurringFeeTypes) {
        const intervalDays = feeType.recurringIntervalDays;
        
        for (const structure of feeType.structures) {
          // Find students assigned to this class
          const students = await prisma.student.findMany({
            where: { schoolId: feeType.schoolId, class: structure.class }
          });

          for (const student of students) {
            // Find the latest StudentFee for this student and structure
            const latestFee = await prisma.studentFee.findFirst({
              where: { studentId: student.id, feeStructureId: structure.id },
              orderBy: { billingCycleStart: 'desc' }
            });

            if (latestFee) {
              const msPerDay = 1000 * 60 * 60 * 24;
              const daysSinceLastBilling = Math.floor((now.getTime() - new Date(latestFee.billingCycleStart).getTime()) / msPerDay);

              // If enough days have passed, generate a new bill
              if (daysSinceLastBilling >= intervalDays) {
                const dueDate = new Date(now);
                dueDate.setDate(dueDate.getDate() + intervalDays); // Next bill due in intervalDays

                await prisma.studentFee.create({
                  data: {
                    schoolId: feeType.schoolId,
                    studentId: student.id,
                    feeStructureId: structure.id,
                    amountDue: feeType.amount,
                    amountPaid: 0,
                    waiverAmount: 0,
                    penaltyAmount: 0,
                    dueDate: dueDate,
                    status: 'UNPAID',
                    billingCycleStart: now,
                  }
                });
                console.log(`[CRON] Auto-assigned new recurring bill (${feeType.name}) to student ${student.rollNumber}`);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('[CRON] Error in recurring billing job:', error);
    }
  });
}
