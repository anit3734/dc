const { chromium } = require("playwright-extra");
const stealth = require("puppeteer-extra-plugin-stealth")();
chromium.use(stealth);

const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();
const STATE_FILE = path.join(__dirname, "scraper_state.json");

// Targets according to user requirements
const TARGET_ROCS = ["RoC-Chandigarh", "RoC-Kanpur", "RoC-Delhi"];
const MAX_COMPANIES_PER_ROC = 4000; // Across 3 ROCs = 12,000 Companies
const PAGES_PER_ROC = 50; // Each page usually has 50-100 companies. Adjust if needed.

// Load previous state to allow pausing/resuming
function loadState() {
  if (fs.existsSync(STATE_FILE)) {
    return JSON.parse(fs.readFileSync(STATE_FILE, "utf-8"));
  }
  return { currentRocIndex: 0, currentPage: 1, totalSaved: 0 };
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

async function runBackendScraper() {
  console.log("==========================================");
  console.log("🚀 ZAUBA-SCOPE STEALTH BACKEND CRAWLER 🚀");
  console.log("==========================================");

  let state = loadState();
  console.log(`Resuming from ROC Index: ${state.currentRocIndex}, Page: ${state.currentPage}, Total Saved: ${state.totalSaved}\n`);

  // Launch stealth browser
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    for (let i = state.currentRocIndex; i < TARGET_ROCS.length; i++) {
        const roc = TARGET_ROCS[i];
        console.log(`\n▶ Currently targeting: ${roc}`);
        let targetReached = false;

        for (let p = state.currentPage; p <= PAGES_PER_ROC; p++) {
             // https://www.zaubacorp.com/company-list/roc-RoC-Chandigarh/p-1-company.html
             const url = `https://www.zaubacorp.com/company-list/roc-${roc}/p-${p}-company.html`;
             console.log(`[GET] ${url}`);

             await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
             
             // Wait for the table, or check if cloudflare blocked us
             try {
                await page.waitForSelector("table tbody tr", { timeout: 15000 });
             } catch (e) {
                console.log("❌ Table missing or Cloudflare Blocked. Taking 30s breather...");
                await page.waitForTimeout(30000);
                // Reduce page index to retry
                p--;
                continue;
             }

             // Parse tabular company data
             const rows = await page.$$eval("table tbody tr", (els) => {
                 return els.map(tr => {
                    const cols = tr.querySelectorAll("td");
                    if (cols.length >= 4 && (cols[0]?.textContent?.trim()?.startsWith('U') || cols[0]?.textContent?.trim()?.startsWith('L'))) {
                        return {
                            cin: cols[0].textContent.trim(),
                            name: cols[1].textContent.trim(),
                            state: cols[2].textContent.trim() || "Unknown",
                            status: cols[3].textContent.trim() || "Active"
                        };
                    }
                    return null;
                 }).filter(Boolean);
             });

             if (rows.length === 0) {
                 console.log("⚠️ No valid rows found on this page. Ending pagination for this ROC.");
                 break;
             }
             
             console.log(`Found ${rows.length} valid companies on page ${p}. Proceeding to deep scrape each...`);
             let addedThisPage = 0;

             // Fast Upserts using Prisma
             for (const item of rows) {
                try {
                    // Navigate to individual company page for deep data
                    const companyUrl = `https://www.zaubacorp.com/company/${item.name.replace(/\s+/g, '-').toUpperCase()}/${item.cin}`;
                    console.log(`  [DEEP] Scaping ${item.name}...`);
                    
                    await page.goto(companyUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
                    
                    const deepData = await page.evaluate(() => {
                        const details = {
                            category: "", sub_category: "", class: "",
                            auth_cap: 0, paid_cap: 0, address: "", email: "",
                            directors: [], charges: []
                        };

                        // Extract main details from tables
                        const tables = Array.from(document.querySelectorAll('table'));
                        tables.forEach(table => {
                            const cells = Array.from(table.querySelectorAll('td'));
                            cells.forEach((cell, idx) => {
                                const text = cell.textContent?.trim() || "";
                                if (text.includes("Company Category")) details.category = cells[idx+1]?.textContent?.trim();
                                if (text.includes("Company Sub Category")) details.sub_category = cells[idx+1]?.textContent?.trim();
                                if (text.includes("Class of Company")) details.class = cells[idx+1]?.textContent?.trim();
                                if (text.includes("Authorized Capital")) details.auth_cap = parseFloat((cells[idx+1]?.textContent?.replace(/[^0-9.]/g, '') || "0"));
                                if (text.includes("Paid up capital")) details.paid_cap = parseFloat((cells[idx+1]?.textContent?.replace(/[^0-9.]/g, '') || "0"));
                                if (text.includes("Email ID")) details.email = cells[idx+1]?.textContent?.trim();
                                if (text.includes("Address")) details.address = cells[idx+1]?.textContent?.trim();
                            });
                        });

                        // Extract Directors
                        const directorRows = Array.from(document.querySelectorAll('tr[id^="director"]'));
                        details.directors = directorRows.map(row => {
                            const cols = row.querySelectorAll('td');
                            return {
                                din: cols[0]?.textContent?.trim(),
                                name: cols[1]?.textContent?.trim(),
                                designation: cols[2]?.textContent?.trim(),
                                appointment_date: cols[3]?.textContent?.trim()
                            };
                        });

                        // Extract Charges
                        const chargeTables = Array.from(document.querySelectorAll('.table-responsive table')).filter(t => t.textContent.includes("Charge ID"));
                        if (chargeTables.length > 0) {
                            const chargeRows = Array.from(chargeTables[0].querySelectorAll('tbody tr'));
                            details.charges = chargeRows.map(row => {
                                const cols = row.querySelectorAll('td');
                                return {
                                    charge_id: cols[0]?.textContent?.trim(),
                                    date: cols[1]?.textContent?.trim(),
                                    amount: parseFloat(cols[2]?.textContent?.replace(/[^0-9.]/g, '') || "0"),
                                    holder: cols[3]?.textContent?.trim(),
                                    status: cols[4]?.textContent?.trim()
                                };
                            });
                        }

                        return details;
                    });

                    await prisma.company.upsert({
                        where: { cin: item.cin },
                        update: { 
                            name: item.name, 
                            status: item.status, 
                            state: item.state,
                            category: deepData.category,
                            sub_category: deepData.sub_category,
                            class: deepData.class,
                            authorized_capital: deepData.auth_cap,
                            paid_up_capital: deepData.paid_cap,
                            address: deepData.address,
                            email: deepData.email
                        },
                        create: {
                            cin: item.cin,
                            name: item.name,
                            state: item.state,
                            status: item.status,
                            registration_date: new Date().toISOString(),
                            category: deepData.category,
                            sub_category: deepData.sub_category,
                            class: deepData.class,
                            authorized_capital: deepData.auth_cap,
                            paid_up_capital: deepData.paid_cap,
                            address: deepData.address,
                            email: deepData.email
                        }
                    });

                    // Sync Directors
                    if (deepData.directors.length > 0) {
                        await prisma.director.deleteMany({ where: { company_id: item.cin } });
                        await prisma.director.createMany({
                            data: deepData.directors.map(d => ({
                                din: d.din,
                                name: d.name,
                                designation: d.designation,
                                appointment_date: d.appointment_date,
                                company_id: item.cin
                            }))
                        });
                    }

                    // Sync Charges
                    if (deepData.charges.length > 0) {
                        await prisma.charge.deleteMany({ where: { company_id: item.cin } });
                        await prisma.charge.createMany({
                            data: deepData.charges.map(c => ({
                                charge_id: c.charge_id,
                                date: c.date,
                                amount: c.amount,
                                holder: c.holder,
                                status: c.status,
                                company_id: item.cin
                            }))
                        });
                    }

                    addedThisPage++;
                    // Back to list page for next company
                    await page.goBack();
                } catch (dbErr) {
                    console.error(`  [ERR] Failed on ${item.name}:`, dbErr.message);
                }
             }

             state.totalSaved += addedThisPage;
             state.currentPage = p + 1; // save next page
             saveState(state);

             console.log(`✅ Progress: +${addedThisPage} | Grand Total: ${state.totalSaved}`);

             // If we cross 4,000 for this ROC, move on
             if (addedThisPage === 0 || state.totalSaved >= MAX_COMPANIES_PER_ROC * (i + 1)) {
                targetReached = true;
                break; 
             }

             // Polite delay to mimic human behavior
             const delay = Math.floor(Math.random() * 3000) + 2000;
             await page.waitForTimeout(delay);
        }

        // Reset page for next ROC
        state.currentRocIndex = i + 1;
        state.currentPage = 1;
        saveState(state);

        if (state.totalSaved >= MAX_COMPANIES_PER_ROC * TARGET_ROCS.length) {
            console.log("\n🎯 Massive 12k Database completely fulfilled!");
            break;
        }
    }
  } catch(err) {
      console.error("\n💥 Backend Crawler Exception: ", err.message);
      console.log("State preserved. Rerun the script to resume.");
  }

  await browser.close();
  await prisma.$disconnect();
  console.log(`\n🛑 Scraper Offline. Total records extracted: ${state.totalSaved}`);
}

runBackendScraper();
