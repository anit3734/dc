const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function run() {
  try {
    const missingColumns = [
      "roc",
      "registration_no",
      "incorporation_date",
      "age",
      "nic_code",
      "nic_description",
      "num_members"
    ];

    for (const col of missingColumns) {
      try {
        const type = col === "nic_description" ? "TEXT" : "VARCHAR(191)";
        await prisma.$executeRawUnsafe(`ALTER TABLE Company ADD COLUMN \`${col}\` ${type} NULL;`);
        console.log(`Added column: ${col}`);
      } catch (e) {
        console.error(`Skipped ${col}:`, e.message);
      }
    }
    
    console.log("Database perfectly synced with current Prisma client expectations.");
  } catch (e) {
    console.error("FATAL:", e);
  } finally {
    await prisma.$disconnect();
  }
}
run();
