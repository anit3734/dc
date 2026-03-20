const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAll() {
  try {
    const companies = await prisma.company.count();
    const users = await prisma.user.count();
    const payments = await prisma.payment.count();
    const downloads = await prisma.download.count();
    
    console.log('--- DB INTEGRITY STATUS ---');
    console.log('Companies:', companies);
    console.log('Users:', users);
    console.log('Payments:', payments);
    console.log('Downloads:', downloads);
  } catch (e) {
    console.error('ERROR:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAll();
