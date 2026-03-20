const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function run() {
  try {
    console.log("Adding columns manually...");
    
    // Ignore errors if columns already exist
    const queries = [
      `ALTER TABLE Company ADD COLUMN listed VARCHAR(191) NULL;`,
      `ALTER TABLE Company ADD COLUMN website VARCHAR(191) NULL;`,
      `ALTER TABLE Company ADD COLUMN telephone VARCHAR(191) NULL;`,
      `ALTER TABLE Company ADD COLUMN llp_status VARCHAR(191) NULL;`
    ];

    for (const q of queries) {
      try {
        await prisma.$executeRawUnsafe(q);
        console.log("Success:", q);
      } catch (e) {
        console.error("Skipped (probably exists):", e.message);
      }
    }
    
    console.log("Validating columns...");
    const cols = await prisma.$queryRaw`SHOW COLUMNS FROM Company`;
    console.log(cols.map(c => c.Field));
    
  } catch (e) {
    console.error("FATAL:", e);
  } finally {
    await prisma.$disconnect();
  }
}
run();
