const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const statuses = await prisma.company.groupBy({
    by: ['status'],
    _count: true
  });
  console.log("Distinct statuses in DB:", statuses);
}
main().catch(console.error).finally(() => prisma.$disconnect());
