const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const count = await prisma.company.count();
    console.log('Total Companies:', count);
    const sample = await prisma.company.findFirst();
    console.log('Sample Company:', sample ? sample.name : 'NONE');
  } catch (e) {
    console.error('DB ERROR:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
