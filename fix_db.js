const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Adding columns manually to bypass connection pool issues...");
  try {
    const columns = [
      { name: "listed", type: "VARCHAR(191)" },
      { name: "roc", type: "VARCHAR(191)" },
      { name: "registration_no", type: "VARCHAR(191)" },
      { name: "incorporation_date", type: "VARCHAR(191)" },
      { name: "age", type: "VARCHAR(191)" },
      { name: "nic_code", type: "VARCHAR(191)" },
      { name: "nic_description", type: "TEXT" },
      { name: "num_members", type: "VARCHAR(191)" }
    ];

    for (const col of columns) {
      try {
        console.log(`Checking/Adding column: ${col.name}`);
        await prisma.$executeRawUnsafe(`ALTER TABLE Company ADD COLUMN ${col.name} ${col.type} NULL`);
        console.log(`✅ Added ${col.name}`);
      } catch (e) {
        if (e.message.includes("Duplicate column name")) {
          console.log(`ℹ️ ${col.name} already exists.`);
        } else {
          console.error(`❌ Error adding ${col.name}:`, e.message);
        }
      }
    }
    console.log("Done!");
  } catch (err) {
    console.error("Fatal Error:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
