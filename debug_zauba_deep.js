const { chromium } = require("playwright-extra");
const stealth = require("puppeteer-extra-plugin-stealth")();
chromium.use(stealth);

async function debug() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const url = "https://www.zaubacorp.com/company/TATA-CONSULTANCY-SERVICES-LIMITED/L22210MH1995PLC084781";
  console.log(`Deep Checking ${url}...`);
  
  await page.goto(url, { waitUntil: "networkidle" });
  
  // 1. Identify all table headers and content
  const tables = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('table')).map((table, i) => {
      const title = table.previousElementSibling?.textContent?.trim() || `Table ${i}`;
      const rows = Array.from(table.querySelectorAll('tr')).map(tr => {
        return Array.from(tr.querySelectorAll('td, th')).map(td => td.textContent.trim());
      });
      return { title, rows };
    });
  });
  
  console.log("--- ALL TABLES ---");
  tables.forEach(t => {
    console.log(`\n[${t.title}]`);
    t.rows.forEach(r => console.log(`  ${JSON.stringify(r)}`));
  });

  // 2. Identify all buttons/links that might reveal contact info
  const elements = await page.evaluate(() => {
    const clickable = Array.from(document.querySelectorAll('a, button')).filter(el => {
      const text = el.textContent.toLowerCase();
      return text.includes('contact') || text.includes('more') || text.includes('click') || text.includes('show');
    });
    return clickable.map(el => ({
      tag: el.tagName,
      text: el.textContent.trim(),
      href: el.href,
      id: el.id,
      className: el.className
    }));
  });
  
  console.log("\n--- CLICKABLE NODES ---");
  console.log(JSON.stringify(elements, null, 2));
  
  await browser.close();
}

debug();
