const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixStatuses() {
  console.log("Fixing corrupted statuses in database...");
  
  // Find all companies where status contains a digit (which means it's a numeric value like 180,000)
  const corrupted = await prisma.company.findMany({
    where: {
      status: { contains: "0" } // Simple catch-all for these numbers
    }
  });

  const corrupted2 = await prisma.company.findMany({
    where: {
      status: { contains: "1" }
    }
  });
  
  // We'll just execute a raw query or updateMany for anything resembling digits
  await prisma.company.updateMany({
    where: {
      OR: [
        { status: { contains: "0" } },
        { status: { contains: "1" } },
        { status: { contains: "2" } },
        { status: { contains: "3" } },
        { status: { contains: "4" } },
        { status: { contains: "5" } },
        { status: { contains: "6" } },
        { status: { contains: "7" } },
        { status: { contains: "8" } },
        { status: { contains: "9" } },
      ]
    },
    data: {
      status: "Active" // Defaulting existing corrupted ones to Active to restore UI functionality
    }
  });
  
  console.log("Database statuses normalized to 'Active'.");
}
fixStatuses().catch(console.error).finally(() => prisma.$disconnect());
