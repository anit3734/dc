const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function run() {
  try {
    const list = await prisma.$queryRaw`SHOW COLUMNS FROM Company`;
    console.log(JSON.stringify(list.map(c => c.Field), null, 2));
    
    // Also try a direct select
    const test = await prisma.$queryRaw`SELECT listed FROM Company LIMIT 1`;
    console.log("Select success:", test);
  } catch (e) {
    console.error("SELECT ERROR:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}
run();
