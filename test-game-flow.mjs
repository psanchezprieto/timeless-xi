import puppeteer from 'puppeteer-core';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: 'new',
    args: ['--no-sandbox'],
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:5174', { waitUntil: 'networkidle2' });

  console.log('✓ Page loaded');

  // Wait for country picker to load
  await page.waitForSelector('[data-testid="country-picker"], .country-grid', { timeout: 5000 }).catch(() => {});

  // Get first country button and click it
  const countryButton = await page.$('button:has(> div):first-child');
  if (countryButton) {
    await countryButton.click();
    console.log('✓ Selected a country');
  }

  // Wait a moment and take screenshots at different stages
  await page.screenshot({ path: '/tmp/game-after-country.png' });
  console.log('✓ Took screenshot after country selection');

  await browser.close();
  console.log('✓ Test complete');
})().catch(err => {
  console.error('Test failed:', err.message);
  process.exit(1);
});
