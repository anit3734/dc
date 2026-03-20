const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function clean() {
  console.log("Fetching all companies...");
  const allCompanies = await prisma.company.findMany({
    include: { directors: true }
  });

  const validCins = [];
  const invalidCins = [];

  for (const c of allCompanies) {
    const hasName = Boolean(c.name);
    const hasCin = Boolean(c.cin);
    const hasAddress = Boolean(c.address && c.address.trim() !== "");
    const hasContact = Boolean((c.telephone && c.telephone.trim() !== "") || (c.email && c.email.trim() !== ""));
    const hasAge = Boolean(c.age);
    const hasIncDate = Boolean(c.incorporation_date);
    const hasWebsite = Boolean(c.website);
    const hasDirector = Boolean(c.directors && c.directors.length > 0);
    const hasLLP = Boolean(c.llp_status);

    if (hasName && hasCin && hasAddress && hasContact && hasAge && hasIncDate && hasWebsite && hasDirector && hasLLP) {
      validCins.push(c.cin);
    } else {
      invalidCins.push(c.cin);
    }
  }

  console.log(`Found ${validCins.length} fully valid companies.`);
  console.log(`Found ${invalidCins.length} invalid/old companies to delete.`);

  if (invalidCins.length > 0) {
    // Delete in chunks to avoid query limits
    const chunkSize = 100;
    let deletedCount = 0;
    for (let i = 0; i < invalidCins.length; i += chunkSize) {
      const chunk = invalidCins.slice(i, i + chunkSize);
      try {
        await prisma.company.deleteMany({
          where: { cin: { in: chunk } }
        });
        deletedCount += chunk.length;
      } catch (e) {
        console.error("Error deleting chunk:", e);
      }
    }
    console.log(`Successfully deleted ${deletedCount} outdated companies.`);
  }

  console.log("Cleanup complete! Only highly genuine companies remain.");
  await prisma.$disconnect();
}

clean().catch(console.error);
