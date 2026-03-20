const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function cleanupIncompleteData() {
  console.log("==========================================");
  console.log("🛡️ ZAUBA-SCOPE DATA HYGIENE PURGE 🛡️");
  console.log("==========================================");
  console.log("🔍 Scanning for identity-only records (missing deep data)...");

  try {
    // Strategic purge of identity-only ghost records.
    // We target records missing deep intelligence signals (Reg #, Capital, or Address).
    const criteria = {
      OR: [
        { registration_no: null },
        { registration_no: "" },
        { authorized_capital: null },
        { authorized_capital: 0 },
        { address: null },
        { address: "" }
      ]
    };

    const incompleteCount = await prisma.company.count({ where: criteria });

    if (incompleteCount === 0) {
      console.log("✨ Matrix integrity verified! No identity ghosts detected.");
      return;
    }

    console.log(`⚠️ Detected ${incompleteCount} incomplete records.`);
    console.log("🚀 Executing strategic purge...");

    const deleted = await prisma.company.deleteMany({ where: criteria });

    console.log(`✅ Successfully purged ${deleted.count} identity-only records.`);
    console.log("📈 Database integrity restored.");

  } catch (error) {
    console.error("❌ Hygiene execution failed:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupIncompleteData();
