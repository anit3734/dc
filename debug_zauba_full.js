const { chromium } = require("playwright-extra");
const stealth = require("puppeteer-extra-plugin-stealth")();
chromium.use(stealth);

async function debug() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const url = "https://www.zaubacorp.com/company/TATA-CONSULTANCY-SERVICES-LIMITED/L22210MH1995PLC084781";
  console.log(`Auditing all tables at ${url}...`);
  
  await page.goto(url, { waitUntil: "networkidle" });
  
  const tables = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('table')).map((table, i) => {
      // Look for a heading before this table (up to 3 levels up)
      let heading = "No Heading Found";
      let prev = table.previousElementSibling;
      while (prev && !['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'B', 'STRONG'].includes(prev.tagName)) {
         if (prev.querySelector('h1, h2, h3, h4, h5, h6, b, strong')) {
             heading = prev.querySelector('h1, h2, h3, h4, h5, h6, b, strong').textContent.trim();
             break;
         }
         prev = prev.previousElementSibling;
      }
      if (prev && heading === "No Heading Found") heading = prev.textContent.trim();
      
      const rows = Array.from(table.querySelectorAll('tr')).map(tr => {
        return Array.from(tr.querySelectorAll('td, th')).map(td => td.textContent.trim());
      });
      return { index: i, heading, rows };
    });
  });
  
  tables.forEach(t => {
    console.log(`\n[TABLE ${t.index}] Heading: ${t.heading}`);
    t.rows.forEach(r => console.log(`  ${JSON.stringify(r)}`));
  });
  
  await browser.close();
}

debug();
