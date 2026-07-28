import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const transaction = await prisma.transaction.findFirst({
      include: {
        studentFee: {
          include: {
            student: {
              include: {
                user: true
              }
            }
          }
        }
      }
    });
    console.log(transaction);
  } catch (e) {
    console.error(e);
  }
}
main();
