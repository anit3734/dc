import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import ExcelJS from "exceljs";
import { stringify } from "csv-stringify/sync";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { format = "excel", companyCins = [] } = await req.json().catch(() => ({}));

    // Bypassing payment checks for seamless direct admin/dashboard exports
    // if (!paymentId) {
    //   return NextResponse.json({ message: "Payment ID is required" }, { status: 400 });
    // }

    const whereClause: any = companyCins.length > 0 ? { cin: { in: companyCins } } : {};
    
    // Multi-tenant isolation: only retrieve companies saved by this user
    whereClause.savedByUsers = { some: { userId } };
    
    const companies = await (prisma.company as any).findMany({
      where: whereClause,
      select: {
        cin: true,
        name: true,
        listed: true,
        status: true,
        state: true,
        registration_date: true,
        roc: true,
        registration_no: true,
        category: true,
        sub_category: true,
        class: true,
        incorporation_date: true,
        age: true,
        nic_code: true,
        nic_description: true,
        num_members: true,
        authorized_capital: true,
        paid_up_capital: true,
        address: true,
        email: true,
        telephone: true,
        website: true,
        llp_status: true,
        directors: { select: { name: true } }
      }
    });

    const flatCompanies = companies.map((c: any) => ({
      ...c,
      directors: c.directors ? c.directors.map((d: any) => d.name).join(", ") : ""
    }));

    await prisma.download.create({
      data: {
        file: `export_${Date.now()}.${format === "excel" ? "xlsx" : "csv"}`,
        userId: userId,
      }
    });

    if (format === "csv") {
      const csvData = stringify(flatCompanies, { header: true });
      return new NextResponse(csvData, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="companies_export.csv"`,
        },
      });
    } else {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Companies");
      worksheet.columns = [
        { header: "CIN", key: "cin", width: 25 },
        { header: "Name", key: "name", width: 40 },
        { header: "Listed", key: "listed", width: 15 },
        { header: "Status", key: "status", width: 15 },
        { header: "State", key: "state", width: 15 },
        { header: "Registration Date", key: "registration_date", width: 15 },
        { header: "ROC", key: "roc", width: 20 },
        { header: "Registration No", key: "registration_no", width: 20 },
        { header: "Category", key: "category", width: 25 },
        { header: "Sub-Category", key: "sub_category", width: 25 },
        { header: "Class", key: "class", width: 15 },
        { header: "Incorporation Date", key: "incorporation_date", width: 20 },
        { header: "Age", key: "age", width: 25 },
        { header: "NIC Code", key: "nic_code", width: 15 },
        { header: "Activity Description", key: "nic_description", width: 50 },
        { header: "Members", key: "num_members", width: 15 },
        { header: "Auth Capital", key: "authorized_capital", width: 15 },
        { header: "Paid Capital", key: "paid_up_capital", width: 15 },
        { header: "Address", key: "address", width: 50 },
        { header: "Email", key: "email", width: 30 },
        { header: "Telephone", key: "telephone", width: 25 },
        { header: "Website", key: "website", width: 30 },
        { header: "LLP Status", key: "llp_status", width: 20 },
        { header: "Directors", key: "directors", width: 60 },
      ];
      worksheet.addRows(flatCompanies);
      
      const buffer = await workbook.xlsx.writeBuffer();
      
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="companies_export.xlsx"`,
        },
      });
    }

  } catch (error) {
    console.error("Export Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
