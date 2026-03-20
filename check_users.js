const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const count = await prisma.user.count();
    console.log('Total Users:', count);
    const users = await prisma.user.findMany({ take: 5 });
    console.log('Users:', JSON.stringify(users.map(u => u.email), null, 2));
  } catch (e) {
    console.error('ERROR:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
