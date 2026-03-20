const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listDbs() {
  try {
    const dbs = await prisma.$queryRawUnsafe('SHOW DATABASES;');
    const filtered = dbs.filter(d => d.Database.toLowerCase().includes('zauba'));
    console.log('Zauba Databases:', JSON.stringify(filtered, null, 2));
    
    // Also check for 'corp' or 'saas'
    const others = dbs.filter(d => d.Database.toLowerCase().includes('corp') || d.Database.toLowerCase().includes('saas'));
    console.log('Potential Candidates:', JSON.stringify(others, null, 2));
  } catch (e) {
    console.error('ERROR:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

listDbs();
