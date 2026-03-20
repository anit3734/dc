/**
 * ZAUBA CONTACT ENRICHMENT PASS
 * Runs after the main scraper to fill in:
 *   - Email
 *   - Telephone
 *   - Website
 * Uses ZaubaCorp detail page + Google snippet fallback
 */

const { chromium } = require("playwright-extra");
const stealth = require("puppeteer-extra-plugin-stealth")();
chromium.use(stealth);

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function extractContactFromProfile(page, cin, name) {
  const slug = name.replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, "-").toUpperCase();
  const url = `https://www.zaubacorp.com/company/${slug}/${cin}`;
  
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 35000 });
    await page.waitForSelector("table", { timeout: 8000 }).catch(() => {});

    const contact = await page.evaluate(() => {
      const result = { email: "", telephone: "", website: "" };

      // Strategy 1: Scan all table cells for contact info
      const allTds = Array.from(document.querySelectorAll("td"));
      for (let i = 0; i < allTds.length; i++) {
        const label = (allTds[i]?.textContent || "").toLowerCase().trim();
        const value = (allTds[i + 1]?.textContent || "").trim();

        if ((label.includes("email") || label === "email id") && !result.email) {
          const emailMatch = value.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
          if (emailMatch) result.email = emailMatch[0].toLowerCase();
          else if (value.includes("@")) result.email = value;
        }
        if ((label.includes("telephone") || label.includes("phone") || label.includes("contact no")) && !result.telephone) {
          const phoneMatch = value.match(/[\d\s\-\+\(\)]{8,}/);
          if (phoneMatch) result.telephone = phoneMatch[0].trim();
        }
        if ((label.includes("website") || label.includes("web url") || label.includes("url")) && !result.website) {
          if (value.length > 4) result.website = value.startsWith("http") ? value : "https://" + value;
        }
      }

      // Strategy 2: Raw body text regex sweep
      const body = document.body.innerText;

      if (!result.email) {
        const emailMatch = body.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
        if (emailMatch && !emailMatch[0].includes("zaubacorp") && !emailMatch[0].includes("mca.gov")) {
          result.email = emailMatch[0].toLowerCase();
        }
      }
      if (!result.telephone) {
        // Indian phone number patterns
        const phoneMatch = body.match(/(?:\+91[\s\-]?)?[6-9]\d{9}|0\d{2,4}[\s\-]?\d{6,8}/);
        if (phoneMatch) result.telephone = phoneMatch[0].trim();
      }
      if (!result.website) {
        // Look for external links
        const links = Array.from(document.querySelectorAll('a[href^="http"]'));
        const ext = links.find((a) =>
          a.href && !a.href.includes("zaubacorp") && !a.href.includes("google") &&
          !a.href.includes("facebook") && !a.href.includes("twitter") &&
          !a.href.includes("linkedin") && !a.href.includes("mca.gov") &&
          a.href.length > 12 && !a.href.startsWith("mailto")
        );
        if (ext) result.website = ext.href;
      }

      return result;
    });

    return contact;
  } catch (e) {
    return null;
  }
}

async function enrichMissingContacts() {
  console.log("\n==============================================");
  console.log("  ZAUBA CONTACT ENRICHMENT ENGINE");
  console.log("  Target: Fill email, phone, website gaps");
  console.log("==============================================\n");

  // Get companies missing any contact field
  const companies = await prisma.company.findMany({
    where: {
      OR: [
        { email: null },
        { email: "" },
        { telephone: null },
        { telephone: "" },
      ],
    },
    select: { cin: true, name: true },
    take: 5000,
  });

  console.log(`Found ${companies.length} companies with missing contact fields.\n`);
  if (companies.length === 0) {
    console.log("✅ All companies already have complete contact data!");
    await prisma.$disconnect();
    return;
  }

  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();

  // Block images/css to speed up
  await page.route("**/*.{png,jpg,gif,svg,css,woff2}", (route) => route.abort());

  let enriched = 0;
  let unchanged = 0;

  for (let i = 0; i < companies.length; i++) {
    const { cin, name } = companies[i];
    process.stdout.write(`[${i + 1}/${companies.length}] ${cin} ${name.slice(0, 40).padEnd(40)}... `);

    const contact = await extractContactFromProfile(page, cin, name);

    if (!contact) {
      process.stdout.write("⚠️ Skipped\n");
      unchanged++;
      continue;
    }

    const updateData = {};
    if (contact.email) updateData.email = contact.email;
    if (contact.telephone) updateData.telephone = contact.telephone;
    if (contact.website) updateData.website = contact.website;

    if (Object.keys(updateData).length > 0) {
      await prisma.company.update({ where: { cin }, data: updateData });
      const tags = [
        contact.email ? "✉" : "",
        contact.telephone ? "📞" : "",
        contact.website ? "🌐" : "",
      ].filter(Boolean).join("");
      process.stdout.write(`✅ ${tags}\n`);
      enriched++;
    } else {
      process.stdout.write("— No new data\n");
      unchanged++;
    }

    // Progress report every 50
    if ((i + 1) % 50 === 0) {
      console.log(`\n📊 Progress: ${enriched} enriched, ${unchanged} unchanged, ${i + 1} total processed\n`);
    }

    await delay(600 + Math.random() * 1000);
  }

  await browser.close();
  await prisma.$disconnect();

  console.log(`\n✅ ENRICHMENT COMPLETE`);
  console.log(`   Enriched: ${enriched} companies`);
  console.log(`   No new data: ${unchanged} companies`);
}

enrichMissingContacts().catch((e) => {
  console.error("Fatal:", e.message);
  process.exit(1);
});
