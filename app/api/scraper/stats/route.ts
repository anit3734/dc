import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const statePath = path.join(process.cwd(), "scraper_state.json");
    let state = { currentRocIndex: 0, currentPage: 1, totalSaved: 0 };
    
    if (fs.existsSync(statePath)) {
      state = JSON.parse(fs.readFileSync(statePath, "utf-8"));
    }

    // Get live DB count to verify vs state
    const dbCount = await prisma.company.count();
    
    // Get count of companies with deep data (address or financials present)
    const deepDataCount = await prisma.company.count({
        where: {
            OR: [
                { address: { not: null } },
                { authorized_capital: { gt: 0 } }
            ]
        }
    });

    return NextResponse.json({
      ...state,
      dbCount,
      deepDataCount,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error("Scraper Stats Error:", error);
    return NextResponse.json({ message: "Error fetching scraper stats" }, { status: 500 });
  }
}
