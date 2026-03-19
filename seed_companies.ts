// seed_companies.ts
import { chromium } from "playwright";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// The target RoC lists for Noida, Chandigarh, and Mohali. 
// Note: Noida falls under RoC-Kanpur. Mohali & Chandigarh fall under RoC-Chandigarh.
const TARGET_ROCS = ["RoC-Chandigarh", "RoC-Kanpur"];

// Target to reach ~12,000 companies. Each Zaubacorp directory page usually holds ~50-100 items.
const TOTAL_SCRAPE_TARGET = 12000;
const PAGES_PER_ROC = 150; // Approximating 150 pages * 80 items = 12000 per ROC just in case

async function runSeeder() {
  console.log("Starting Massive ZaubaCorp Scraper Pipeline...");
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });
  
  const page = await context.newPage();
  let totalSaved = 0;

  for (const roc of TARGET_ROCS) {
    if (totalSaved >= TOTAL_SCRAPE_TARGET) break;

    console.log(`\n============================`);
    console.log(`Starting extraction for ${roc}`);
    console.log(`============================\n`);

    for (let pageNum = 1; pageNum <= PAGES_PER_ROC; pageNum++) {
      if (totalSaved >= TOTAL_SCRAPE_TARGET) {
        console.log("Target of 12,000+ companies reached! Stopping.");
        break;
      }

      // Format: https://www.zaubacorp.com/company-list/roc-RoC-Chandigarh/p-1-company.html
      const url = `https://www.zaubacorp.com/company-list/roc-${roc}/p-${pageNum}-company.html`;
      console.log(`[${roc}] Fetching Page ${pageNum}...`);

      try {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
        
        // Ensure table is loaded or check if we got blocked
        const hasTable = await page.$('table tbody tr');
        if (!hasTable) {
          console.log(`[!] No table found on page ${pageNum}. Waiting 10s to bypass limits, or end of list.`);
          await page.waitForTimeout(10000);
          continue;
        }

        // Extract tabular data
        const extractedData = await page.$$eval('table tbody tr', rows => {
          return rows.map(row => {
            const cols = row.querySelectorAll('td');
            if (cols.length >= 4 && (cols[0]?.textContent?.trim()?.startsWith('U') || cols[0]?.textContent?.trim()?.startsWith('L'))) {
              return {
                cin: cols[0]?.textContent?.trim() || "",
                name: cols[1]?.textContent?.trim() || "",
                state: cols[2]?.textContent?.trim() || "Unknown",
                status: cols[3]?.textContent?.trim() || "Active",
              };
            }
            return null;
          }).filter(Boolean);
        });

        if (extractedData.length === 0) {
          console.log(`End of data for ${roc} (No rows extracted).`);
          break; // move to next ROC
        }

        // Insert to DB using raw Prisma transaction for speed
        let savedCount = 0;
        for (const record of extractedData) {
          if (!record || !record.cin) continue;
          
          try {
            await prisma.company.upsert({
              where: { cin: record.cin },
              update: {
                name: record.name,
                state: record.state,
                status: record.status,
              },
              create: {
                cin: record.cin,
                name: record.name,
                state: record.state,
                status: record.status,
                registration_date: new Date().toISOString(), // Mocking date since list doesn't have it
              },
            });
            savedCount++;
            totalSaved++;
          } catch (upsertErr) {
            // Ignore individual uniqueness or lock issues
          }
        }

        console.log(`✅ Page ${pageNum} done. Added ${savedCount} records. (Total Progress: ${totalSaved}/${TOTAL_SCRAPE_TARGET})`);
        
        // Gentle delay to avoid harsh IP bans from Cloudflare/ZaubaCorp
        await page.waitForTimeout(2000 + Math.random() * 2000);

      } catch (err: any) {
        console.error(`[Error] Failed on ${url}: ${err.message}`);
        // Let's pause a bit longer if we hit a timeout block
        await page.waitForTimeout(15000);
      }
    }
  }

  await browser.close();
  await prisma.$disconnect();
  console.log(`\n🎉 Massive Scrape Complete! Total companies stored: ${totalSaved}`);
}

runSeeder().catch(e => {
  console.error(e);
  process.exit(1);
});
