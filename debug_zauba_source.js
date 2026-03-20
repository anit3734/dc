const { chromium } = require("playwright-extra");
const stealth = require("puppeteer-extra-plugin-stealth")();
chromium.use(stealth);

async function debug() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const url = "https://www.zaubacorp.com/company/TATA-CONSULTANCY-SERVICES-LIMITED/L22210MH1995PLC084781";
  console.log(`Source auditing ${url}...`);
  
  await page.goto(url, { waitUntil: "networkidle" });
  
  const html = await page.content();
  
  const matches = {
    phone: html.match(/phone/gi),
    mobile: html.match(/mobile/gi),
    tel: html.match(/telephone/gi),
    contact: html.match(/contact/gi),
    click: html.match(/click/gi)
  };
  
  console.log("--- MATCH COUNTS ---");
  Object.keys(matches).forEach(k => console.log(`${k}: ${matches[k]?.length || 0}`));
  
  // Extract snippets for phone/mobile
  const lines = html.split('\n');
  console.log("\n--- RELEVANT SNIPPETS ---");
  lines.forEach(line => {
    if (line.toLowerCase().includes('phone') || line.toLowerCase().includes('mobile') || line.toLowerCase().includes('tel')) {
       console.log(`> ${line.trim().substring(0, 200)}`);
    }
  });
  
  await browser.close();
}

debug();
