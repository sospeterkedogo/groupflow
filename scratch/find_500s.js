const { chromium } = require('@playwright/test');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('response', r => { if (r.status() >= 500) errors.push(r.status() + ' ' + r.url()); });
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  console.log('500s found:', JSON.stringify(errors, null, 2));
  await browser.close();
})();
