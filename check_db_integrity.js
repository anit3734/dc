const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkData() {
  try {
    const total = await prisma.company.count();
    const withEmptyReg = await prisma.company.count({ where: { registration_no: "" } });
    const withNullReg = await prisma.company.count({ where: { registration_no: null } });
    const withEmptyCap = await prisma.company.count({ where: { authorized_capital: 0 } });
    
    console.log(`Total: ${total}`);
    console.log(`Empty Reg: ${withEmptyReg}`);
    console.log(`Null Reg: ${withNullReg}`);
    console.log(`Zero Capital: ${withEmptyCap}`);
    
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
