import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Fetch latest 10 companies sorted by creation
    const latestCompanies = await prisma.company.findMany({
      take: 10,
      orderBy: {
        registration_date: 'desc'
      },
      select: {
        cin: true,
        name: true,
        state: true,
        registration_date: true
      }
    });

    return NextResponse.json(latestCompanies);
  } catch (error) {
    console.error("Logs Error:", error);
    return NextResponse.json({ message: "Error fetching logs" }, { status: 500 });
  }
}
