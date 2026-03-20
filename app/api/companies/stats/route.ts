import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const roc = searchParams.get("roc") || "";
    const status = searchParams.get("status") || "";

    const where: any = {};
    if (roc) where.roc = { contains: roc };
    if (status) where.status = { contains: status };

    const totalCompanies = await prisma.company.count({ where });
    
    const statusCounts = await prisma.company.groupBy({
      by: ['status'],
      where,
      _count: true,
    });

    const aggregates = await prisma.company.aggregate({
      where,
      _sum: {
        authorized_capital: true,
        paid_up_capital: true,
      },
      _count: {
        email: true,
        telephone: true,
      }
    });

    // Top 5 states (RoCs) if not filtered, else show specifics
    const stateCounts = await prisma.company.groupBy({
      by: ['roc'],
      where,
      _count: true,
      orderBy: {
        _count: {
          roc: 'desc',
        },
      },
      take: 5,
    });

    return NextResponse.json({
      totalCompanies,
      statusCounts,
      totalAuthCapital: aggregates._sum.authorized_capital || 0,
      totalPaidCapital: aggregates._sum.paid_up_capital || 0,
      emailCount: aggregates._count.email || 0,
      phoneCount: aggregates._count.telephone || 0,
      stateCounts,
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return NextResponse.json({ message: "Error fetching dashboard stats" }, { status: 500 });
  }
}
