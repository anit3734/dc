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
const CHAR_LIST = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split("");
const MAX_COMPANIES_PER_ROC = 5000;
const PAGES_PER_CHAR = 100;

// Load previous state to allow pausing/resuming
function loadState() {
  if (fs.existsSync(STATE_FILE)) {
    return JSON.parse(fs.readFileSync(STATE_FILE, "utf-8"));
  }
  return { currentRocIndex: 0, currentCharIndex: 0, currentPage: 1, totalSaved: 0, discoveredRocs: [] };
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

async function discoverRocs(page) {
    console.log("🔍 Discovering Global ROC Registries...");
    await page.goto("https://www.zaubacorp.com/companies-list", { waitUntil: "domcontentloaded" });
    const rocs = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a[href*="/roc-"]'));
        return links.map(a => {
            const href = a.getAttribute('href');
            const match = href.match(/roc-([^/]+)-company/);
            return match ? match[1] : null;
        }).filter(Boolean);
    });
    const uniqueRocs = [...new Set(rocs)];
    console.log(`✨ Identified ${uniqueRocs.length} unique ROCs.`);
    return uniqueRocs;
}

async function runBackendScraper() {
  console.log("==========================================");
  console.log("🚀 ZAUBA-SCOPE STEALTH AUTOCRAWLER 🚀");
  console.log("==========================================");

  let state = loadState();
  
  // Launch stealth browser
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  if (!state.discoveredRocs || state.discoveredRocs.length === 0) {
      state.discoveredRocs = await discoverRocs(page);
      saveState(state);
  }

  const activeRocs = state.discoveredRocs.length > 0 ? state.discoveredRocs : TARGET_ROCS;
  console.log(`Resuming: ROC[${state.currentRocIndex}] (${activeRocs[state.currentRocIndex]}), CHAR[${CHAR_LIST[state.currentCharIndex]}], PAGE[${state.currentPage}], Total: ${state.totalSaved}\n`);

  try {
    for (let i = state.currentRocIndex; i < activeRocs.length; i++) {
        const roc = activeRocs[i];
        
        for (let c = state.currentCharIndex; c < CHAR_LIST.length; c++) {
            const char = CHAR_LIST[c];
            console.log(`\n▶ [${roc}] Rotating Target: "${char}"`);

            for (let p = state.currentPage; p <= PAGES_PER_CHAR; p++) {
                 const url = `https://www.zaubacorp.com/company-list/roc-${roc}/company-start-with-${char}/p-${p}-company.html`;
                 console.log(`[GET] ${url}`);

                 try {
                    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
                    await page.waitForSelector("table tbody tr", { timeout: 15000 });
                 } catch (e) {
                    console.log("❌ Table missing or Cloudflare Blocked. Taking 30s breather...");
                    await page.waitForTimeout(30000);
                    // Check if page actually exists (could be end of pagination)
                    const noResults = await page.evaluate(() => document.body.innerText.includes("No records found"));
                    if (noResults) break; 
                    
                    p--; // retry same page
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
                     console.log("⚠️ No valid rows found. Ending char rotation.");
                     break;
                 }
                 
                 console.log(`Found ${rows.length} valid companies. Deep scraping...`);
                 let addedThisPage = 0;

                 for (const item of rows) {
                    try {
                        let companyUrl = null;
                        try {
                            const ddgUrl = `https://html.duckduckgo.com/html/?q=site:zaubacorp.com/company+${encodeURIComponent(item.name + " " + item.cin)}`;
                            await page.goto(ddgUrl, { waitUntil: "commit", timeout: 20000 });
                            const ddgHtml = await page.content();
                            const match = ddgHtml.match(/href="([^"]*?zaubacorp\.com\/company\/[^"]+)"/);
                            
                            if (match) {
                                companyUrl = decodeURIComponent(match[1]);
                                if (companyUrl.startsWith('//')) companyUrl = "https:" + companyUrl;
                                if (companyUrl.includes("uddg=")) companyUrl = decodeURIComponent(companyUrl.split("uddg=")[1].split("&")[0]);
                            }
                        } catch (ddgError) {
                            // Silent fallback to derived URL
                        }
                        
                        if (!companyUrl) companyUrl = `https://www.zaubacorp.com/company/${item.name.replace(/\s+/g, '-').toUpperCase()}/${item.cin}`;

                        // Use more resilient navigation
                        await page.goto(companyUrl, { waitUntil: "domcontentloaded", timeout: 45000 }).catch(() => {
                           return page.goto(companyUrl, { waitUntil: "commit", timeout: 60000 });
                        });
                        
                        const deepData = await page.evaluate(() => {
                            const details = { 
                                category: "", sub_category: "", class: "", auth_cap: 0, paid_cap: 0, 
                                address: "", email: "", directors: [], charges: [],
                                listed: "", roc: "", reg_no: "", inc_date: "", age: "",
                                nic_code: "", nic_desc: "", members: "",
                                telephone: ""
                            };
                            const tables = Array.from(document.querySelectorAll('table'));
                            tables.forEach((table, tableIdx) => {
                                const rows = Array.from(table.querySelectorAll('tr'));
                                const firstRowText = rows[0]?.textContent?.toLowerCase() || "";
                                
                                // Standard Detail Extraction
                                rows.forEach(row => {
                                    const cells = Array.from(row.querySelectorAll('td'));
                                    cells.forEach((cell, idx) => {
                                        const text = cell.textContent?.trim() || "";
                                        let val = cells[idx+1]?.textContent?.trim() || "";
                                        if (val.includes("Click here to see more")) val = val.split("Click here to see more")[0].trim();
                                        
                                        if (text.includes("Whether listed or not")) details.listed = val;
                                        if (text.includes("ROC")) details.roc = val;
                                        if (text.includes("Registration Number")) details.reg_no = val;
                                        if (text.includes("Company Category")) details.category = val;
                                        if (text.includes("Company Sub Category")) details.sub_category = val;
                                        if (text.includes("Class of Company")) details.class = val;
                                        if (text.includes("Date of Incorporation")) details.inc_date = val;
                                        if (text.includes("Age of Company")) details.age = val;
                                        if (text.includes("Number of Members")) details.members = val;
                                        if (text.includes("Authorized Capital")) details.auth_cap = parseFloat(val.replace(/[^0-9.]/g, '') || "0");
                                        if (text.includes("Paid up capital")) details.paid_cap = parseFloat(val.replace(/[^0-9.]/g, '') || "0");
                                        if (text.includes("Email ID")) details.email = val.toLowerCase().match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i)?.[0] || val;
                                        if (text.includes("Address")) details.address = val;
                                        if (text.includes("Telephone") || text.includes("Phone") || text.includes("Mobile")) {
                                             if (!details.telephone) details.telephone = val;
                                        }

                                        if (text.includes("Activity")) {
                                            const activityText = val;
                                            const nicMatch = activityText.match(/NIC Code:\s*(\d+)/i);
                                            const descMatch = activityText.match(/NIC Description:\s*(.*)/i);
                                            if (nicMatch) details.nic_code = nicMatch[1];
                                            if (descMatch) details.nic_desc = descMatch[1].trim();
                                        }
                                    });
                                });

                                // Director Extraction
                                if (firstRowText.includes("din") || firstRowText.includes("director")) {
                                    rows.slice(1).forEach(row => {
                                        const cols = Array.from(row.querySelectorAll('td'));
                                        if (cols.length >= 3) {
                                            const link = cols[1].querySelector('a')?.getAttribute('href');
                                            details.directors.push({
                                                din: cols[0].textContent.trim(),
                                                name: cols[1].textContent.trim(),
                                                designation: cols[2].textContent.trim(),
                                                appointment_date: cols[3]?.textContent?.trim() || "",
                                                profile_url: link ? (link.startsWith('http') ? link : "https://www.zaubacorp.com" + link) : ""
                                            });
                                        }
                                    });
                                }

                                // Charge Extraction
                                if (firstRowText.includes("charge id") || firstRowText.includes("assets under charge")) {
                                    rows.slice(1).forEach(row => {
                                        const cols = Array.from(row.querySelectorAll('td'));
                                        if (cols.length >= 5) {
                                            details.charges.push({
                                                charge_id: cols[0].textContent.trim(),
                                                date: cols[1].textContent.trim(),
                                                amount: parseFloat(cols[5]?.textContent?.replace(/[^0-9.]/g, '') || "0"),
                                                holder: cols[6]?.textContent?.trim() || "",
                                                status: cols[7]?.textContent?.trim() || "Open"
                                            });
                                        }
                                    });
                                }
                            });
                            return details;
                        });

                        // Deep Scrape Individual Directors for Address/Contact
                        for (const director of deepData.directors) {
                            if (director.profile_url) {
                                console.log(`  🔍 Tracking Identity: ${director.name}...`);
                                try {
                                    await page.goto(director.profile_url, { waitUntil: "domcontentloaded", timeout: 20000 });
                                    const personalInfo = await page.evaluate(() => {
                                        const tables = Array.from(document.querySelectorAll('table'));
                                        let address = "";
                                        tables.forEach(table => {
                                            if (table.textContent.toLowerCase().includes("residential address")) {
                                                const rows = Array.from(table.querySelectorAll('tr'));
                                                rows.forEach(row => {
                                                    if (row.textContent.toLowerCase().includes("residential address")) {
                                                        address = row.querySelector('td:nth-child(2)')?.textContent?.trim() || "";
                                                    }
                                                });
                                            }
                                        });
                                        return { address };
                                    });
                                    director.address = personalInfo.address;
                                    await page.goBack(); // Back to company page
                                } catch (e) {
                                    console.log(`    ⚠️ Director deep-dive bypassed: ${e.message}`);
                                }
                            }
                        }

                        // Atomic Sync with Relational Cleanup
                        await prisma.$transaction([
                            prisma.director.deleteMany({ where: { company_id: item.cin } }),
                            prisma.charge.deleteMany({ where: { company_id: item.cin } }),
                            prisma.company.upsert({
                                where: { cin: item.cin },
                                update: { 
                                    name: item.name, status: item.status, state: item.state,
                                    category: deepData.category, sub_category: deepData.sub_category, class: deepData.class,
                                    authorized_capital: deepData.auth_cap, paid_up_capital: deepData.paid_cap, address: deepData.address, email: deepData.email,
                                    listed: deepData.listed, roc: deepData.roc, registration_no: deepData.reg_no,
                                    incorporation_date: deepData.inc_date, age: deepData.age, nic_code: deepData.nic_code,
                                    nic_description: deepData.nic_desc, num_members: deepData.members,
                                    directors: {
                                        create: deepData.directors.map(d => ({
                                            din: d.din,
                                            name: d.name,
                                            designation: d.designation,
                                            appointment_date: d.appointment_date,
                                            address: d.address,
                                            contact_no: d.contact_no
                                        }))
                                    },
                                    charges: {
                                        create: deepData.charges
                                    }
                                },
                                create: {
                                    cin: item.cin, name: item.name, state: item.state, status: item.status, registration_date: new Date().toISOString(),
                                    category: deepData.category, sub_category: deepData.sub_category, class: deepData.class,
                                    authorized_capital: deepData.auth_cap, paid_up_capital: deepData.paid_cap, address: deepData.address, email: deepData.email,
                                    listed: deepData.listed, roc: deepData.roc, registration_no: deepData.reg_no,
                                    incorporation_date: deepData.inc_date, age: deepData.age, nic_code: deepData.nic_code,
                                    nic_description: deepData.nic_desc, num_members: deepData.members,
                                    directors: {
                                        create: deepData.directors.map(d => ({
                                            din: d.din,
                                            name: d.name,
                                            designation: d.designation,
                                            appointment_date: d.appointment_date,
                                            address: d.address,
                                            contact_no: d.contact_no
                                        }))
                                    },
                                    charges: {
                                        create: deepData.charges
                                    }
                                }
                            })
                        ]);

                        addedThisPage++;
                        await page.goBack();
                    } catch (e) {
                        console.error(`  [ERR] Sub-scrape failed:`, e.message);
                    }
                 }

                 state.totalSaved += addedThisPage;
                 state.currentPage = p + 1;
                 saveState(state);
                 console.log(`✅ Progress: +${addedThisPage} | Grand Total: ${state.totalSaved}`);

                 await page.waitForTimeout(1000 + Math.random() * 2000);
            }

            state.currentCharIndex = c + 1;
            state.currentPage = 1;
            saveState(state);
        }

        state.currentRocIndex = i + 1;
        state.currentCharIndex = 0;
        saveState(state);
    }
    console.log("\n🎯 Mission Accomplished!");
  } catch(err) {
      console.error("\n💥 Fatal: ", err.message);
  } finally {
      await browser.close();
      await prisma.$disconnect();
  }
}


runBackendScraper();
