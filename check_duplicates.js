const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const duplicates = await prisma.$queryRaw`
    SELECT cin, COUNT(*) as count
    FROM Company
    GROUP BY cin
    HAVING count > 1
    LIMIT 10;
  `;
  console.log('Duplicates found:', duplicates);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
