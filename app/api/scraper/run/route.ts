import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { chromium } from "playwright";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    // const role = (session.user as any)?.role;

    const { searchQuery = "A" } = await req.json().catch(() => ({}));

    // Launch Playwright
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });
    
    const page = await context.newPage();
    
    // 1. Search DuckDuckGo HTML specifically for the ZaubaCorp company URL using native fetch (bypasses Playwright Captcha)
    const ddgUrl = `https://html.duckduckgo.com/html/?q=site:zaubacorp.com/company+${encodeURIComponent(searchQuery)}`;
    let companyUrl: string | null = null;
    try {
      const response = await fetch(ddgUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
      const htmlText = await response.text();
      // Regex match to find Zaubacorp company domain
      const match = htmlText.match(/href="([^"]*?zaubacorp\.com\/company\/[^"]+)"/);
      if (match) {
        companyUrl = decodeURIComponent(match[1]);
        if (companyUrl.startsWith('//')) companyUrl = "https:" + companyUrl;
        // Clean duckduckgo redirect if present
        if (companyUrl.includes("uddg=")) {
          companyUrl = decodeURIComponent(companyUrl.split("uddg=")[1].split("&")[0]);
        }
      }
    } catch (e) {
      console.error("DDG Search error:", e);
    }

    if (!companyUrl) {
      await browser.close();
      return NextResponse.json({ message: "No exact company match found on ZaubaCorp." }, { status: 404 });
    }

    // 2. We have the specific Company URL. Now boot Playwright to parse ZaubaCorp exactly!
    await page.goto(companyUrl, { waitUntil: "domcontentloaded", timeout: 30000 });

    const extractedData = await page.evaluate(() => {
      // Data is typically in <p> tags or a table
      const name = document.querySelector('h1')?.textContent?.trim() || "";
      const paragraphs = Array.from(document.querySelectorAll('p'));
      
      let cin = "", status = "Active", state = "Unknown";
      
      for (const p of paragraphs) {
        const text = p.textContent || "";
        if (text.includes("CIN")) {
          const match = text.match(/([L|U]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6})/);
          if (match) cin = match[1];
        }
        if (text.includes("Status")) {
          if (text.toLowerCase().includes("strike off") || text.toLowerCase().includes("inactive")) status = "Strike Off";
          else status = "Active";
        }
        if (text.includes("State")) {
          state = text.split(":")[1]?.trim() || "Unknown";
        }
      }
      
      // Fallback to searching tables if paragraphs failed
      if (!cin) {
        const tableData = Array.from(document.querySelectorAll('td'));
        tableData.forEach((td, i) => {
          if (td.textContent?.includes("CIN")) cin = tableData[i+1]?.textContent?.trim() || cin;
          if (td.textContent?.includes("Company Status")) status = tableData[i+1]?.textContent?.trim() || status;
          if (td.textContent?.includes("RoC")) state = tableData[i+1]?.textContent?.trim() || state;
        });
      }

      if (cin && name) {
        return [{ cin, name, state, status }];
      }
      return [];
    });

    await browser.close();

    const dataToSave = extractedData.length > 0 ? extractedData : [];

    if (dataToSave.length === 0) {
       return NextResponse.json({ message: "Missing explicit table data on profile." }, { status: 403 });
    }

    // Upsert into MySQL using Prisma to avoid duplicates
    const results = [];
    for (const data of dataToSave) {
      if (data && data.cin && data.name) {
        const company = await prisma.company.upsert({
          where: { cin: data.cin },
          update: {
            name: data.name,
            state: data.state,
            status: data.status,
          },
          create: {
            cin: data.cin,
            name: data.name,
            state: data.state,
            status: data.status,
            registration_date: new Date().toISOString(),
          },
        });
        results.push(company);
      }
    }

    return NextResponse.json({
      message: "Scraping completed",
      scrapedCount: results.length,
      data: results
    });

  } catch (error) {
    console.error("Scraper Error", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
