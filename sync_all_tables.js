const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function run() {
  try {
    console.log("Checking and syncing Director table...");
    const directorCols = [
      { name: "din", type: "VARCHAR(191)" },
      { name: "designation", type: "VARCHAR(191)" },
      { name: "appointment_date", type: "VARCHAR(191)" },
      { name: "address", type: "TEXT" },
      { name: "contact_no", type: "VARCHAR(191)" }
    ];

    for (const col of directorCols) {
      try {
        await prisma.$executeRawUnsafe(`ALTER TABLE Director ADD COLUMN \`${col.name}\` ${col.type} NULL;`);
        console.log(`Added column to Director: ${col.name}`);
      } catch (e) {
        console.log(`Director.${col.name} already exists or error: ${e.message}`);
      }
    }

    console.log("Checking and syncing Charge table...");
    const chargeCols = [
      { name: "charge_id", type: "VARCHAR(191)" },
      { name: "date", type: "VARCHAR(191)" },
      { name: "amount", type: "DOUBLE" },
      { name: "holder", type: "VARCHAR(191)" },
      { name: "status", type: "VARCHAR(191)" }
    ];

    for (const col of chargeCols) {
      try {
        await prisma.$executeRawUnsafe(`ALTER TABLE Charge ADD COLUMN \`${col.name}\` ${col.type} NULL;`);
        console.log(`Added column to Charge: ${col.name}`);
      } catch (e) {
        console.log(`Charge.${col.name} already exists or error: ${e.message}`);
      }
    }

    console.log("Final Validation...");
    const dCols = await prisma.$queryRaw`SHOW COLUMNS FROM Director`;
    console.log("Director Columns:", dCols.map(c => c.Field).join(", "));
    
    const cCols = await prisma.$queryRaw`SHOW COLUMNS FROM Charge`;
    console.log("Charge Columns:", cCols.map(c => c.Field).join(", "));

  } catch (e) {
    console.error("FATAL ERROR:", e);
  } finally {
    await prisma.$disconnect();
  }
}
run();
