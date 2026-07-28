import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Run every day at midnight (00:00)
export const initPenaltyCron = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Running daily periodic penalty check...');
    try {
      const now = new Date();
      
      const dueFees = await prisma.studentFee.findMany({
        where: {
          status: { notIn: ['PAID', 'WAIVED'] },
          nextPenaltyDate: { lte: now },
          periodicPenaltyAmount: { not: null },
          periodicPenaltyDays: { not: null }
        }
      });

      if (dueFees.length === 0) {
        console.log('[CRON] No periodic penalties to apply today.');
        return;
      }

      console.log(`[CRON] Applying periodic penalties to ${dueFees.length} fees.`);

      for (const fee of dueFees) {
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + fee.periodicPenaltyDays);

        await prisma.studentFee.update({
          where: { id: fee.id },
          data: {
            penaltyAmount: { increment: fee.periodicPenaltyAmount },
            nextPenaltyDate: nextDate
          }
        });
      }

      console.log('[CRON] Finished applying periodic penalties.');
    } catch (error) {
      console.error('[CRON] Error applying periodic penalties:', error);
    }
  });
  console.log('[CRON] Penalty cron job initialized.');
};
