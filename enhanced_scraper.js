/**
 * ZAUBA CORPORATE INTELLIGENCE ENGINE v5.1
 * 5-Strategy extraction for maximum field fill rates:
 * - Company name, CIN, Location/Address, Contact, Email
 * - LLP status, Incorporation date, Company age, Website
 * - Directors (name, DIN, designation, address)
 * - BONUS: NIC Code, Capital, Charges, RoC, Category
 */

const { chromium } = require("playwright-extra");
const stealth = require("puppeteer-extra-plugin-stealth")();
chromium.use(stealth);

const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();
const STATE_FILE = path.join(__dirname, "enhanced_scraper_state.json");

const CONFIG = {
  TARGET_ROCS: [
    "RoC-Delhi", "RoC-Mumbai", "RoC-Kolkata", "RoC-Bangalore", "RoC-Chennai",
    "RoC-Hyderabad", "RoC-Ahmedabad", "RoC-Pune", "RoC-Jaipur", "RoC-Chandigarh",
    "RoC-Kanpur", "RoC-Patna", "RoC-Gwalior", "RoC-Vijayawada", "RoC-Ernakulam",
    "RoC-Cuttack", "RoC-Coimbatore", "RoC-Jharkhand", "RoC-Shillong", "RoC-Uttarakhand",
    "RoC-Chhattisgarh", "RoC-Goa", "RoC-Jammu", "RoC-HimachalPradesh", "RoC-Pondicherry"
  ],
  CHARS: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
  PAGES_PER_CHAR: 50,
  DELAY_MIN: 700,
  DELAY_MAX: 2000,
  DEEP_SCRAPE_DIRECTORS: true,
};

function loadState() {
  if (fs.existsSync(STATE_FILE)) return JSON.parse(fs.readFileSync(STATE_FILE, "utf-8"));
  return { currentRocIndex: 0, currentCharIndex: 0, currentPage: 1, totalSaved: 0 };
}
function saveState(s) { fs.writeFileSync(STATE_FILE, JSON.stringify(s, null, 2)); }

const delay = (min, max) => new Promise(r => setTimeout(r, Math.floor(Math.random() * (max - min) + min)));

// ─── Deep Profile Scrape with 5-Strategy Contact Extraction ──────────────────
async function scrapeCompanyProfile(page, cin, name) {
  const slug = name.replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, "-").toUpperCase();
  const urls = [
    `https://www.zaubacorp.com/company/${slug}/${cin}`,
    `https://www.zaubacorp.com/company/${cin}`,
  ];

  let loaded = false;
  for (const url of urls) {
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 38000 });
      await page.waitForSelector("table", { timeout: 7000 }).catch(() => {});
      loaded = true;
      break;
    } catch {}
  }
  if (!loaded) return null;

  return page.evaluate(() => {
    const r = {
      address: "", email: "", telephone: "", website: "",
      listed: "", roc: "", registration_no: "", category: "",
      sub_category: "", class_of_company: "", incorporation_date: "", age: "",
      num_members: "", llp_status: "", authorized_capital: 0, paid_up_capital: 0,
      nic_code: "", nic_description: "", directors: [], charges: [],
    };

    const clean = s => (s || "").replace(/\s+/g, " ").replace(/click here to see more/gi, "").trim();

    // ── STRATEGY 1 & 2: Full table scan (all rows, all adjacent pair combos) ──
    const allTables = Array.from(document.querySelectorAll("table"));
    allTables.forEach(table => {
      const headerText = (table.querySelector("tr")?.textContent || "").toLowerCase();

      // Directors table
      if (headerText.includes("din") || headerText.includes("director")) {
        Array.from(table.querySelectorAll("tr")).slice(1).forEach(row => {
          const cols = Array.from(row.querySelectorAll("td"));
          if (cols.length >= 2) {
            const d = {
              din: clean(cols[0]?.textContent),
              name: clean(cols[1]?.textContent),
              designation: clean(cols[2]?.textContent) || "Director",
              appointment_date: clean(cols[3]?.textContent) || "",
              profile_url: cols[1]?.querySelector("a")?.href || "",
            };
            if (d.name && !r.directors.find(x => x.din === d.din)) r.directors.push(d);
          }
        });
        return; // don't also parse directors as key/value pairs
      }

      // Charges table
      if (headerText.includes("charge id") || headerText.includes("assets under charge")) {
        Array.from(table.querySelectorAll("tr")).slice(1).forEach(row => {
          const cols = Array.from(row.querySelectorAll("td"));
          if (cols.length >= 3) {
            r.charges.push({
              charge_id: clean(cols[0]?.textContent),
              date: clean(cols[1]?.textContent),
              amount: parseFloat(clean(cols[5]?.textContent).replace(/[^0-9.]/g, "") || "0") || 0,
              holder: clean(cols[6]?.textContent) || "",
              status: clean(cols[7]?.textContent) || "Open",
            });
          }
        });
        return;
      }

      // Key-value table — scan all adjacent td pairs
      Array.from(table.querySelectorAll("tr")).forEach(row => {
        const cells = Array.from(row.querySelectorAll("td"));
        for (let i = 0; i < cells.length - 1; i++) {
          const key = (cells[i]?.textContent || "").toLowerCase().trim();
          let val = clean(cells[i + 1]?.textContent);
          if (!key || !val) continue;

          if (key.includes("whether listed") || key === "listed or not") r.listed = r.listed || val;
          if (key === "roc" || key === "roc code" || (key.includes("roc") && key.length < 20)) r.roc = r.roc || val;
          if (key.includes("registration number") || key === "reg no") r.registration_no = r.registration_no || val;
          if (key === "company category" || key === "category") r.category = r.category || val;
          if (key.includes("sub category")) r.sub_category = r.sub_category || val;
          if (key.includes("class of company")) r.class_of_company = r.class_of_company || val;
          if (key.includes("date of incorporation")) r.incorporation_date = r.incorporation_date || val;
          if (key.includes("age of company") || key === "age") r.age = r.age || val;
          if (key.includes("number of members")) r.num_members = r.num_members || val;
          if (key.includes("llp") && val.length < 60) r.llp_status = r.llp_status || val;

          if (key.includes("authorized capital") || key.includes("authorised capital")) {
            r.authorized_capital = r.authorized_capital || (parseFloat(val.replace(/[^0-9.]/g, "") || "0") || 0);
          }
          if (key.includes("paid up capital") || key.includes("paid-up capital")) {
            r.paid_up_capital = r.paid_up_capital || (parseFloat(val.replace(/[^0-9.]/g, "") || "0") || 0);
          }

          // Address — prefer "registered address"
          if (key.includes("registered address")) r.address = val;
          else if (key === "address" && !r.address) r.address = val;

          // Email — catch all possible label variations
          if (key === "email" || key === "email id" || key === "e-mail" || key.includes("email id")) {
            const m = val.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
            if (m) r.email = r.email || m[0].toLowerCase();
            else if (val.includes("@") && !r.email) r.email = val;
          }

          // Phone
          if (key === "telephone" || key === "phone" || key === "tel" || key === "mobile" ||
              key.includes("telephone") || key.includes("phone no") || key.includes("mobile no") ||
              key.includes("contact no")) {
            if (!r.telephone && val.length >= 6) r.telephone = val;
          }

          // Website
          if (key === "website" || key === "web url" || key === "webpage" || key === "url" ||
              key.includes("website") || key.includes("web url")) {
            if (!r.website && val.length > 4) {
              r.website = val.startsWith("http") ? val : "https://" + val.replace(/^www\./i, "www.");
            }
          }

          // NIC
          if (key.includes("nic code") || key.includes("nic description") || key.includes("activity")) {
            const nicMatch = val.match(/(\d{4,6})/);
            if (nicMatch && !r.nic_code) r.nic_code = nicMatch[1];
            if (val.length > 10 && !r.nic_description) r.nic_description = val;
          }
        }
      });
    });

    // ── STRATEGY 3: Body text regex sweep ────────────────────────────────────
    const body = document.body.innerText;

    if (!r.email) {
      const allEmails = body.match(/[a-zA-Z0-9._%+\-]{2,}@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g) || [];
      const filtered = allEmails.filter(m =>
        !m.includes("zaubacorp") && !m.includes("mca.gov") && !m.includes("example") && !m.includes("@2")
      );
      if (filtered.length) r.email = filtered[0].toLowerCase();
    }

    if (!r.telephone) {
      const phoneMatch = body.match(/(?:(?:\+91|0091|91)[\s\-]?)?[6-9]\d{9}|0\d{2,4}[\-\s]?\d{6,8}/);
      if (phoneMatch) r.telephone = phoneMatch[0].trim();
    }

    if (!r.address) {
      const addrMatch = body.match(/(?:Address|Regd\. Address)[:\s]+([^\n]{20,250})/i);
      if (addrMatch) r.address = addrMatch[1].trim();
    }

    // ── STRATEGY 4: External website link hunting ─────────────────────────────
    if (!r.website) {
      const BLOCKLIST = ["zaubacorp", "google", "facebook", "twitter", "linkedin", "instagram",
        "youtube", "mca.gov", "whatsapp", "t.me", "api.", "cdn.", "ajax", "jquery"];
      const links = Array.from(document.querySelectorAll("a[href]"));
      const ext = links.find(a => {
        const h = a.href || "";
        return h.startsWith("http") && !BLOCKLIST.some(b => h.includes(b)) && h.length > 12 && !h.startsWith("mailto");
      });
      if (ext) r.website = ext.href;
    }

    // ── STRATEGY 5: JSON-LD structured data ──────────────────────────────────
    try {
      Array.from(document.querySelectorAll('script[type="application/ld+json"]')).forEach(s => {
        const json = JSON.parse(s.textContent);
        if (json.email && !r.email) r.email = json.email;
        if (json.telephone && !r.telephone) r.telephone = json.telephone;
        if (json.url && !r.website) r.website = json.url;
        if (json.address?.streetAddress && !r.address) {
          r.address = [json.address.streetAddress, json.address.addressLocality, json.address.postalCode].filter(Boolean).join(", ");
        }
      });
    } catch {}

    return r;
  });
}

// ─── Director Deep Dive ───────────────────────────────────────────────────────
async function scrapeDirectorProfile(page, profileUrl) {
  if (!profileUrl) return {};
  try {
    await page.goto(profileUrl, { waitUntil: "domcontentloaded", timeout: 20000 });
    return page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll("table tr"));
      let address = "", contact = "";
      rows.forEach(row => {
        const cells = Array.from(row.querySelectorAll("td"));
        if (cells.length < 2) return;
        const key = (cells[0]?.textContent || "").toLowerCase();
        const val = (cells[1]?.textContent || "").trim();
        if (key.includes("residential address") || key.includes("address")) address = address || val;
        if (key.includes("phone") || key.includes("mobile")) contact = contact || val;
      });
      return { address, contact };
    });
  } catch { return {}; }
}

// ─── Extract Company List ─────────────────────────────────────────────────────
async function extractCompanyList(page) {
  return page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll("table tbody tr"));
    return rows.map(row => {
      const cells = Array.from(row.querySelectorAll("td"));
      if (cells.length < 4) return null;
      const cin = cells[0]?.textContent?.trim();
      if (!cin || (!cin.startsWith("U") && !cin.startsWith("L"))) return null;
      return {
        cin,
        name: cells[1]?.textContent?.trim() || "",
        state: cells[2]?.textContent?.trim() || "Unknown",
        status: cells[3]?.textContent?.trim() || "Active",
      };
    }).filter(Boolean);
  });
}

// ─── Save to Database ─────────────────────────────────────────────────────────
async function saveCompany(item, d) {
  if (!d) {
    await prisma.company.upsert({
      where: { cin: item.cin },
      update: { name: item.name, status: item.status, state: item.state },
      create: { cin: item.cin, name: item.name, state: item.state, status: item.status, registration_date: new Date().toISOString().slice(0, 10) },
    });
    return;
  }

  const directorData = (d.directors || []).map(dir => ({
    din: dir.din, name: dir.name, designation: dir.designation,
    appointment_date: dir.appointment_date, address: dir.address || "", contact_no: dir.contact || "",
  }));

  const payload = {
    name: item.name, status: item.status, state: item.state,
    listed: d.listed, roc: d.roc, registration_no: d.registration_no,
    category: d.category, sub_category: d.sub_category, class: d.class_of_company,
    incorporation_date: d.incorporation_date, age: d.age,
    nic_code: d.nic_code, nic_description: d.nic_description, num_members: d.num_members,
    authorized_capital: d.authorized_capital, paid_up_capital: d.paid_up_capital,
    address: d.address, email: d.email, telephone: d.telephone,
    website: d.website, llp_status: d.llp_status,
  };

  await prisma.$transaction([
    prisma.director.deleteMany({ where: { company_id: item.cin } }),
    prisma.charge.deleteMany({ where: { company_id: item.cin } }),
    prisma.company.upsert({
      where: { cin: item.cin },
      update: { ...payload, directors: { create: directorData }, charges: { create: d.charges || [] } },
      create: { cin: item.cin, registration_date: new Date().toISOString().slice(0, 10), ...payload, directors: { create: directorData }, charges: { create: d.charges || [] } },
    }),
  ]);
}

// ─── Main Runner ──────────────────────────────────────────────────────────────
async function run() {
  console.log("\n==============================================");
  console.log("  ZAUBA INTELLIGENCE ENGINE v5.1 — ENHANCED");
  console.log("  5-Strategy contact extraction for max data");
  console.log("==============================================\n");

  const state = loadState();
  console.log(`Resuming: ROC[${state.currentRocIndex}] CHAR[${state.currentCharIndex}] PAGE[${state.currentPage}] Total:${state.totalSaved}\n`);

  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  const ctx = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    viewport: { width: 1280, height: 900 },
  });
  const page = await ctx.newPage();

  // Block images/fonts to speed up
  await page.route("**/*.{png,jpg,gif,svg,woff,woff2,ttf,eot}", r => r.abort()).catch(() => {});

  try {
    for (let ri = state.currentRocIndex; ri < CONFIG.TARGET_ROCS.length; ri++) {
      const roc = CONFIG.TARGET_ROCS[ri];
      console.log(`\n╔══ RoC: ${roc} ══╗`);

      const charStart = (ri === state.currentRocIndex) ? state.currentCharIndex : 0;
      for (let ci = charStart; ci < CONFIG.CHARS.length; ci++) {
        const char = CONFIG.CHARS[ci];
        console.log(`\n▶ [${roc}] "${char}"`);

        const pageStart = (ri === state.currentRocIndex && ci === state.currentCharIndex) ? state.currentPage : 1;
        for (let p = pageStart; p <= CONFIG.PAGES_PER_CHAR; p++) {
          const listUrl = `https://www.zaubacorp.com/company-list/roc-${roc}/company-start-with-${char}/p-${p}-company.html`;
          console.log(`  [PAGE ${p}] Fetching list...`);

          try {
            await page.goto(listUrl, { waitUntil: "domcontentloaded", timeout: 40000 });

            const noData = await page.evaluate(() =>
              document.body.innerText.toLowerCase().includes("no records found") ||
              document.body.innerText.toLowerCase().includes("no company found")
            );
            if (noData) { console.log(`  ✗ End of results for "${char}".`); break; }

            await page.waitForSelector("table tbody tr", { timeout: 8000 }).catch(() => {});
            const companies = await extractCompanyList(page);
            if (!companies.length) { console.log(`  ✗ Empty listing.`); break; }

            console.log(`  Found ${companies.length} companies. Scraping deep data...`);
            let saved = 0;

            for (const company of companies) {
              process.stdout.write(`    → [${company.cin}] ${company.name.slice(0, 45).padEnd(45)} `);
              const deep = await scrapeCompanyProfile(page, company.cin, company.name);

              // Director address enrichment
              if (CONFIG.DEEP_SCRAPE_DIRECTORS && deep?.directors?.length) {
                for (const dir of deep.directors.slice(0, 2)) {
                  if (dir.profile_url) {
                    const info = await scrapeDirectorProfile(page, dir.profile_url);
                    dir.address = info.address || "";
                    dir.contact = info.contact || "";
                  }
                }
              }

              try {
                await saveCompany(company, deep);
                saved++;
                state.totalSaved++;
                const flags = deep ? [
                  deep.email ? "✉" : "·",
                  deep.telephone ? "📞" : "·",
                  deep.address ? "📍" : "·",
                  deep.website ? "🌐" : "·",
                  deep.directors?.length ? `👥${deep.directors.length}` : "·",
                  deep.incorporation_date ? "📅" : "·",
                ].join("") : "basic";
                console.log(`✓ #${state.totalSaved} ${flags}`);
              } catch (e) {
                console.log(`✗ DB: ${e.message.slice(0, 60)}`);
              }

              await delay(CONFIG.DELAY_MIN, CONFIG.DELAY_MAX);
            }

            state.currentPage = p + 1;
            saveState(state);
            console.log(`  ✅ Page ${p}: +${saved} | Grand Total: ${state.totalSaved}`);

          } catch (err) {
            console.error(`  [ERR] ${err.message.slice(0, 80)}`);
            console.log("  ⏳ Pausing 25s...");
            await delay(25000, 30000);
          }
        }

        state.currentCharIndex = ci + 1;
        state.currentPage = 1;
        saveState(state);
      }

      state.currentRocIndex = ri + 1;
      state.currentCharIndex = 0;
      state.currentPage = 1;
      saveState(state);
      console.log(`\n✅ RoC "${roc}" complete. Total: ${state.totalSaved}`);
    }

    console.log(`\n🎯 ALL RoCs COMPLETE! Grand Total: ${state.totalSaved} companies`);
  } catch (e) {
    console.error("\n💥 Fatal:", e.message);
    saveState(state);
  } finally {
    await browser.close();
    await prisma.$disconnect();
  }
}

run();
