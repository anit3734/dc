import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const minCapital = parseFloat(searchParams.get("minCapital") || "0");
    const state = searchParams.get("state") || "";
    const status = searchParams.get("status") || "";

    const roc = searchParams.get("roc") || "";

    const skip = (page - 1) * limit;

    const where: any = {
      savedByUsers: { some: { userId } }
    };
    if (search) {
      const s = search.trim();
      where.OR = [
        { name: { contains: s } },
        { cin: { contains: s } },
        { address: { contains: s } },
        { directors: { some: { name: { contains: s } } } },
      ];
    }
    if (minCapital > 0) {
      where.authorized_capital = { gte: minCapital };
    }
    if (roc) where.roc = { contains: roc };
    if (state) where.state = { contains: state };
    if (status) where.status = { contains: status };

    console.log("NEXT.JS DB URL IS:", process.env.DATABASE_URL);
    // Execute sequentially to avoid connection pool exhaustion (Error 1040)
    const total = await prisma.company.count({ where });
    const companies = await (prisma.company as any).findMany({
      where,
      skip,
      take: limit,
      orderBy: { registration_date: "desc" },
      include: { directors: true },
    });

    return NextResponse.json({
      companies,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching companies:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
