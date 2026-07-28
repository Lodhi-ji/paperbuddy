import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  await prisma.user.update({
    where: { email: 'accountant@greenwood.com' },
    data: { status: 'active' }
  });
  console.log('Status updated to active.');
}
main().catch(console.error).finally(() => prisma.$disconnect());
