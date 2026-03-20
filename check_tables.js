const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTables() {
  try {
    const tables = await prisma.$queryRawUnsafe('SHOW TABLES;');
    console.log('Tables in zauba_saas:', JSON.stringify(tables, null, 2));
  } catch (e) {
    console.error('ERROR:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkTables();
