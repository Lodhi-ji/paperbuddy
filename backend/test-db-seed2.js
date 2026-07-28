import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const feeTypes = await prisma.feeType.findMany({
    select: { id: true, schoolId: true, name: true, school: { select: { name: true } } }
  });
  console.log(JSON.stringify(feeTypes, null, 2));
}
main().finally(() => prisma.$disconnect());
