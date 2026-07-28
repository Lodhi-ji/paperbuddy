import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const feeTypes = await prisma.feeType.findMany();
  console.log("Fee Types:", feeTypes.length);
  const students = await prisma.student.findMany();
  console.log("Students:", students.length);
}
main().finally(() => prisma.$disconnect());
