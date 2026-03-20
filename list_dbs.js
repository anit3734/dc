const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listDbs() {
  try {
    const dbs = await prisma.$queryRawUnsafe('SHOW DATABASES;');
    console.log('Available Databases:', JSON.stringify(dbs, null, 2));
  } catch (e) {
    console.error('ERROR:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

listDbs();
