const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function run() {
  const companies = await prisma.company.findMany({
    include: { directors: true },
    take: 20,
    orderBy: { cin: 'desc' }
  });

  console.log(`Verifying ${companies.length} records...`);
  let validCount = 0;

  companies.forEach(c => {
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
      validCount++;
    } else {
      console.log(`[!] Invalid Company: ${c.cin}`, { 
        contact: c.telephone || c.email, address: c.address ? "Yes" : "No", name: c.name 
      });
    }
  });

  console.log(`\nVerification Score: ${validCount} out of ${companies.length} have ALL strictly mandatory fields.`);
  await prisma.$disconnect();
}
run();
