// Smoke test for the launch page changes: suggestion cards, confirm dialog, launch flow, rail containment.
// Usage: node artifacts/home-smoke.cjs <baseUrl>
const { chromium } = require('/Users/guohui/Documents/Multica_Project/LLM-Up/agri-intel/agri-llm-demo-visual-v0810/node_modules/playwright');
const assert = require('assert');

const base = (process.argv[2] || 'http://127.0.0.1:4173/mirofish-frontend-preview/').replace(/\/$/, '');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const errors = [];
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console ' + m.text()); });

  await page.goto(base + '/#/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  const covers = page.locator('.suggest-card.cover');
  assert.strictEqual(await covers.count(), 5, 'five popular themes with covers');
  assert.strictEqual(await page.locator('.suggest-cover svg').count(), 5, 'five cover graphics');
  const titles = await page.locator('.suggest-card.cover .suggest-title').allInnerTexts();
  assert(titles.every(t => t.trim().length > 0), 'every cover card has a title');

  // Clicking a cover fills the requirement box.
  await covers.nth(2).click();
  await page.waitForTimeout(200);
  assert.strictEqual((await page.inputValue('.composer textarea')).trim(), titles[2].trim(), 'suggestion fills textarea');

  // A second click with text present asks before overwriting.
  await covers.nth(0).click();
  await page.waitForTimeout(250);
  assert(await page.getByText('是否覆盖当前内容？').isVisible(), 'overwrite confirm shown');
  await page.getByRole('button', { name: '确认' }).click();
  await page.waitForTimeout(200);
  assert.strictEqual((await page.inputValue('.composer textarea')).trim(), titles[0].trim(), 'confirm replaces textarea');

  // Launch still reaches the workbench.
  await page.click('.actions .send');
  await page.waitForSelector('.main-view', { timeout: 15000 });
  assert(await page.locator('.main-view .brand').isVisible(), 'process page loaded');

  // Coming back to the launch page keeps the history card inside its column.
  await page.goto(base + '/#/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  const layout = await page.evaluate(() => {
    const rail = document.querySelector('.history').getBoundingClientRect();
    const cards = [...document.querySelectorAll('.project-card')].map(c => c.getBoundingClientRect());
    return {
      count: cards.length,
      bleed: cards.filter(c => c.left < rail.left - 0.5 || c.right > rail.right + 0.5).length,
      overflow: document.documentElement.scrollWidth - innerWidth
    };
  });
  assert(layout.count >= 1, 'history record present');
  assert.strictEqual(layout.bleed, 0, 'history card stays inside its column');
  assert.strictEqual(layout.overflow, 0, 'no horizontal overflow');

  await browser.close();
  assert.deepStrictEqual(errors, [], `errors: ${JSON.stringify(errors)}`);
  console.log('smoke passed:', JSON.stringify(layout));
})().catch(e => { console.error(e); process.exit(1); });
