import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    // Get live DB counts explicitly saved by THIS specific user
    const totalEntities = await prisma.company.count({
      where: { savedByUsers: { some: { userId } } }
    });
    
    // Get count of user's companies with deep data (address or financials present)
    const successDataCount = await prisma.company.count({
        where: {
            savedByUsers: { some: { userId } },
            OR: [
                { address: { not: null } },
                { email: { not: null } },
                { telephone: { not: null } }
            ]
        }
    });

    const failedScrapCount = totalEntities - successDataCount;

    return NextResponse.json({
      totalScraped: totalEntities,
      successCount: successDataCount,
      failedCount: failedScrapCount,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error("Scraper Stats Error:", error);
    return NextResponse.json({ message: "Error fetching scraper stats" }, { status: 500 });
  }
}
