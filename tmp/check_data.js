const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const companies = await prisma.company.findMany({
    take: 10,
    select: { name: true, cin: true, authorized_capital: true, paid_up_capital: true }
  });
  console.log(JSON.stringify(companies, null, 2));
  await prisma.$disconnect();
}

check();
