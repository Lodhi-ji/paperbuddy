import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const usersCount = await prisma.user.count();
  const schoolCount = await prisma.school.count();
  const studentsCount = await prisma.student.count();
  const feeTypesCount = await prisma.feeType.count();
  
  console.log(`Users: ${usersCount}, Schools: ${schoolCount}, Students: ${studentsCount}, FeeTypes: ${feeTypesCount}`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
