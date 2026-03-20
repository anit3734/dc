const { chromium } = require("playwright-extra");
const stealth = require("puppeteer-extra-plugin-stealth")();
chromium.use(stealth);

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    await page.goto('https://www.zaubacorp.com/company/TATA-MOTORS-LIMITED/L28920MH1945PLC004520', { waitUntil: 'domcontentloaded' });
    const htmlData = await page.evaluate(() => {
      const tables = Array.from(document.querySelectorAll('table')).slice(0, 3);
      return tables.map(t => t.outerHTML).join('\n---\n');
    });
    console.log(htmlData);
  } catch (e) {
    console.error(e);
  } finally {
    await browser.close();
  }
}
test();
