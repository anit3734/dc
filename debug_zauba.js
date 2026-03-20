const { chromium } = require("playwright-extra");
const stealth = require("puppeteer-extra-plugin-stealth")();
chromium.use(stealth);

async function debug() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const url = "https://www.zaubacorp.com/company/TATA-CONSULTANCY-SERVICES-LIMITED/L22210MH1995PLC084781";
  console.log(`Checking ${url}...`);
  
  await page.goto(url, { waitUntil: "networkidle" });
  
  const data = await page.evaluate(() => {
    const results = [];
    document.querySelectorAll('table').forEach((table, i) => {
      const rows = Array.from(table.querySelectorAll('tr')).map(tr => {
        return Array.from(tr.querySelectorAll('td, th')).map(td => td.textContent.trim());
      });
      results.push({ tableIndex: i, rows });
    });
    return results;
  });
  
  console.log(JSON.stringify(data, null, 2));
  
  // Look for "Phone" or "Mobile" in text
  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log("\n--- TEXT SEARCH ---");
  console.log("Includes 'Phone':", bodyText.includes("Phone"));
  console.log("Includes 'Mobile':", bodyText.includes("Mobile"));
  console.log("Includes 'Contact':", bodyText.includes("Contact"));
  
  await browser.close();
}

debug();
