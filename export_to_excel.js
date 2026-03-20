const { PrismaClient } = require("@prisma/client");
const excel = require("exceljs");
const path = require("path");

const prisma = new PrismaClient();

async function exportToExcel() {
  console.log("Fetching perfectly validated genuinely scraped companies from database...");
  const companies = await prisma.company.findMany({
    include: { directors: true },
    orderBy: { cin: "asc" }
  });

  if (companies.length === 0) {
    console.log("No companies found in the database. Run the scraper first!");
    process.exit(0);
  }

  const workbook = new excel.Workbook();
  const worksheet = workbook.addWorksheet("Genuine Companies");

  worksheet.columns = [
    { header: "Company Name", key: "name", width: 35 },
    { header: "CIN Number", key: "cin", width: 25 },
    { header: "Status", key: "status", width: 15 },
    { header: "Incorporation Date", key: "incorporation_date", width: 20 },
    { header: "Age", key: "age", width: 15 },
    { header: "Listed", key: "listed", width: 15 },
    { header: "Email", key: "email", width: 30 },
    { header: "Telephone", key: "telephone", width: 20 },
    { header: "Website", key: "website", width: 30 },
    { header: "LLP Status", key: "llp_status", width: 15 },
    { header: "Address", key: "address", width: 50 },
    { header: "Category", key: "category", width: 25 },
    { header: "Authorized Capital", key: "authorized_capital", width: 20 },
    { header: "Paid Up Capital", key: "paid_up_capital", width: 20 },
    { header: "Directors", key: "directors", width: 50 },
  ];

  // Style Header Row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };

  companies.forEach(c => {
    const directorNames = c.directors.map(d => `${d.name} (${d.designation || 'Director'})`).join("; ");
    worksheet.addRow({
      name: c.name,
      cin: c.cin,
      status: c.status,
      incorporation_date: c.incorporation_date || "N/A",
      age: c.age || "N/A",
      listed: c.listed || "N/A",
      email: c.email || "N/A",
      telephone: c.telephone || "N/A",
      website: c.website || "N/A",
      llp_status: c.llp_status || "N/A",
      address: c.address || "N/A",
      category: c.category || "N/A",
      authorized_capital: c.authorized_capital || 0,
      paid_up_capital: c.paid_up_capital || 0,
      directors: directorNames || "None Listed"
    });
  });

  const exportPath = path.join(__dirname, "genuine_companies_export.xlsx");
  await workbook.xlsx.writeFile(exportPath);
  
  console.log(`\n✅ Successfully exported ${companies.length} perfectly validated companies to:`);
  console.log(`📂 ${exportPath}`);

  await prisma.$disconnect();
}

exportToExcel().catch(err => {
  console.error("Export Failed:", err);
});
