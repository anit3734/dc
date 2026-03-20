const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
     const sample = await prisma.company.findFirst();
     console.log("Sample Data Check:", JSON.stringify(sample, null, 2));
  } catch (e) {
     console.error("Verification Error:", e.message);
  } finally {
     await prisma.$disconnect();
  }
}
main();
