import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function run() {
  try {
    const companies = await prisma.company.findMany({ take: 1 });
    console.log("Success:", companies);
  } catch (e) {
    console.error("PRISMA ERROR:", e);
  } finally {
    await prisma.$disconnect();
  }
}
run();
