const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const prisma = new PrismaClient();

async function run() {
  const item = {
    cin: "U12345DL1234PTC123456",
    name: "TEST COMPANY",
    state: "Delhi",
    status: "Active"
  };
  const d = {
    listed: "Unlisted", roc: "RoC-Delhi", registration_no: "123456",
    category: "Company limited by Shares", sub_category: "Non-govt company", class_of_company: "Private",
    incorporation_date: "01-01-2000", age: "20 Years",
    nic_code: "1234", nic_description: "Test", num_members: "0",
    authorized_capital: 100000, paid_up_capital: 100000,
    address: "Test Address, Delhi", email: "test@example.com", telephone: "9876543210",
    website: "www.example.com", llp_status: "No",
    directors: [{ din: "123", name: "D1", designation: "Dir", appointment_date: "2000" }],
    charges: []
  };

  const directorData = (d.directors || []).map(dir => ({
    din: dir.din, name: dir.name, designation: dir.designation,
    appointment_date: dir.appointment_date, address: dir.address || "", contact_no: dir.contact || "",
  }));

  const payload = {
    name: item.name, status: item.status, state: item.state,
    listed: d.listed, roc: d.roc, registration_no: d.registration_no,
    category: d.category, sub_category: d.sub_category, class: d.class_of_company,
    incorporation_date: d.incorporation_date, age: d.age,
    nic_code: d.nic_code, nic_description: d.nic_description, num_members: d.num_members,
    authorized_capital: d.authorized_capital, paid_up_capital: d.paid_up_capital,
    address: d.address, email: d.email, telephone: d.telephone,
    website: d.website, llp_status: d.llp_status || "Not Available",
  };

  try {
    await prisma.$transaction([
      prisma.director.deleteMany({ where: { company_id: item.cin } }),
      prisma.charge.deleteMany({ where: { company_id: item.cin } }),
      prisma.company.upsert({
        where: { cin: item.cin },
        update: { ...payload, directors: { create: directorData }, charges: { create: d.charges || [] } },
        create: { cin: item.cin, registration_date: new Date().toISOString().slice(0, 10), ...payload, directors: { create: directorData }, charges: { create: d.charges || [] } },
      }),
    ]);
    console.log("Success");
  } catch (e) {
    fs.writeFileSync("error.log", e.message);
    console.error("Wrote error to error.log");
  } finally {
    await prisma.$disconnect();
  }
}
run();
