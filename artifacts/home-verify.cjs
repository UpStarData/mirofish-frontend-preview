// Final check for the simulation launch page: layout at 4 widths, no overflow / bleed / console errors.
// Usage: node artifacts/home-verify.cjs <baseUrl> <shotDir>
const { chromium } = require('/Users/guohui/Documents/Multica_Project/LLM-Up/agri-intel/agri-llm-demo-visual-v0810/node_modules/playwright');
const path = require('path');
const assert = require('assert');

const base = (process.argv[2] || 'http://127.0.0.1:4173/mirofish-frontend-preview/').replace(/\/$/, '');
const out = process.argv[3] || __dirname;

(async () => {
  const browser = await chromium.launch({ headless: true });
  const errors = [];
  for (const [w, h] of [[1920, 1080], [1440, 900], [1024, 768], [390, 844]]) {
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    page.on('pageerror', e => errors.push(`${w}: ${e.message}`));
    page.on('console', m => { if (m.type() === 'error') errors.push(`${w}: console ${m.text()}`); });
    await page.goto(base + '/#/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);

    // Run one demo simulation so the history rail has a real record, then come back.
    await page.fill('.composer textarea', '今年马来西亚的榴莲有多少流入国内，对红星市场到货量和批发价有什么影响');
    await page.click('.actions .send');
    await page.waitForTimeout(2500);
    await page.goto(base + '/#/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    // Fill in a brought-in seed so「相关推演建议」also renders.
    await page.evaluate(() => {
      window.postMessage({
        type: 'agrilink:simulation-context', version: 1,
        context: {
          facts: [{ id: 'real-durian-th-vn-202604', date: '2026-04-20', region: '泰国 / 越南', title: '泰越榴莲同期上市：泰国稳价高端、越南产地收购价大幅回落', confidence: 'high' }],
          relation: null, requirement: '基于已选事实，推演榴莲到货量与批发价的变化'
        }
      }, window.location.origin);
    });
    await page.waitForTimeout(700);

    assert(await page.locator('.suggest-card.cover').first().isVisible(), 'cover card missing');
    assert.strictEqual(await page.locator('.suggest-card.cover').count(), 5, 'expected five popular themes');
    assert(await page.locator('.suggest-cover svg').first().isVisible(), 'cover art missing');
    assert(await page.locator('.project-card').first().isVisible(), 'history card missing');

    const probe = await page.evaluate(() => {
      const rail = document.querySelector('.history').getBoundingClientRect();
      const cards = [...document.querySelectorAll('.project-card')].map(c => c.getBoundingClientRect());
      const covers = [...document.querySelectorAll('.suggest-cover svg')].map(s => s.getBoundingClientRect());
      return {
        overflow: document.documentElement.scrollWidth - innerWidth,
        cardBleed: cards.filter(c => c.left < rail.left - 0.5 || c.right > rail.right + 0.5).length,
        coverCount: covers.length,
        coverEmpty: covers.filter(c => c.width < 40 || c.height < 20).length
      };
    });
    assert.strictEqual(probe.overflow, 0, `horizontal overflow at ${w}: ${probe.overflow}`);
    assert.strictEqual(probe.cardBleed, 0, `history card left its column at ${w}`);
    assert.strictEqual(probe.coverEmpty, 0, `cover not rendered at ${w}`);
    console.log(`ok ${w}`, JSON.stringify(probe));
    await page.screenshot({ path: path.join(out, `launch-${w}.png`), fullPage: true });
    await page.locator('.recommend').screenshot({ path: path.join(out, `recommend-${w}.png`) });
    await page.locator('.history').screenshot({ path: path.join(out, `history-${w}.png`) });
    await page.close();
  }
  await browser.close();
  assert.deepStrictEqual(errors, [], `console/page errors: ${JSON.stringify(errors)}`);
  console.log('passed: 1920 / 1440 / 1024 / 390 — no overflow, no column bleed, covers rendered, no console errors');
})().catch(e => { console.error(e); process.exit(1); });
