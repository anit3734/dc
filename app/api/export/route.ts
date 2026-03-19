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

    const { format = "excel", paymentId, companyCins = [] } = await req.json().catch(() => ({}));

    if (!paymentId) {
      return NextResponse.json({ message: "Payment ID is required" }, { status: 400 });
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment || payment.userId !== userId || payment.status !== "paid") {
      return NextResponse.json({ message: "Valid payment required" }, { status: 403 });
    }

    const whereClause = companyCins.length > 0 ? { cin: { in: companyCins } } : {};
    
    const companies = await prisma.company.findMany({
      where: whereClause,
      select: {
        cin: true,
        name: true,
        state: true,
        status: true,
        registration_date: true
      }
    });

    await prisma.download.create({
      data: {
        file: `export_${Date.now()}.${format === "excel" ? "xlsx" : "csv"}`,
        userId: userId,
      }
    });

    if (format === "csv") {
      const csvData = stringify(companies, { header: true });
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
        { header: "State", key: "state", width: 15 },
        { header: "Status", key: "status", width: 15 },
        { header: "Registration Date", key: "registration_date", width: 20 },
      ];
      worksheet.addRows(companies);
      
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
