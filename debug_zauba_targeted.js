const { chromium } = require("playwright-extra");
const stealth = require("puppeteer-extra-plugin-stealth")();
chromium.use(stealth);

async function debug() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const url = "https://www.zaubacorp.com/company/TATA-CONSULTANCY-SERVICES-LIMITED/L22210MH1995PLC084781";
  console.log(`Targeting Contact/Director/Charges at ${url}...`);
  
  await page.goto(url, { waitUntil: "networkidle" });
  
  const results = await page.evaluate(() => {
    const data = {};
    
    // Find Contact Details
    const contactHeader = Array.from(document.querySelectorAll('h4, h2, h3, b')).find(el => el.textContent.includes('Contact Details'));
    if (contactHeader) {
      let next = contactHeader.nextElementSibling;
      while (next && next.tagName !== 'TABLE') next = next.nextElementSibling;
      if (next) {
        data.contactTable = Array.from(next.querySelectorAll('tr')).map(tr => Array.from(tr.querySelectorAll('td')).map(td => td.textContent.trim()));
      }
    }
    
    // Find Directors
    const directorHeader = Array.from(document.querySelectorAll('h4, h2, h3, b')).find(el => el.textContent.includes('Directors'));
    if (directorHeader) {
      let next = directorHeader.nextElementSibling;
      while (next && next.tagName !== 'TABLE') next = next.nextElementSibling;
      if (next) {
        data.directorTable = Array.from(next.querySelectorAll('tr')).map(tr => Array.from(tr.querySelectorAll('td, th')).map(td => td.textContent.trim()));
      }
    }
    
    // Find Charges
    const chargeHeader = Array.from(document.querySelectorAll('h4, h2, h3, b')).find(el => el.textContent.includes('Charges'));
    if (chargeHeader) {
      let next = chargeHeader.nextElementSibling;
      while (next && next.tagName !== 'TABLE') next = next.nextElementSibling;
      if (next) {
        data.chargeTable = Array.from(next.querySelectorAll('tr')).map(tr => Array.from(tr.querySelectorAll('td, th')).map(td => td.textContent.trim()));
      }
    }
    
    return data;
  });
  
  console.log(JSON.stringify(results, null, 2));
  await browser.close();
}

debug();
