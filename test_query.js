const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function run() {
  try {
    const companies = await prisma.company.findMany({ take: 1 });
    console.log("Success findMany. Companies:", companies.length);
  } catch (e) {
    console.error("PRISMA ERROR:", e);
  } finally {
    await prisma.$disconnect();
  }
}
run();
