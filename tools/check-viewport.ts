import { chromium } from 'playwright';

const WIDTHS = [320, 360, 390, 414, 768, 1024];
const HEIGHTS = [640, 740, 844];
const STUDIOS = [
  'home',
  'pixels',
  'canvas',
  'pdf',
  'video',
  'audio',
  'text',
  'archive',
  'qr',
  'spreadsheet',
  'ebook',
  'presentation',
  'security',
  'hash',
  'bridge'
];

async function runCheck() {
  console.log('[CI GATE F1] Verifying zero horizontal overflow across all routes & viewports...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const violations: Array<{ route: string; bp: string; scrollWidth: number; innerWidth: number; diff: number }> = [];

  for (const studio of STUDIOS) {
    for (const w of WIDTHS) {
      for (const h of HEIGHTS) {
        const bp = `${w}x${h}`;
        await page.setViewportSize({ width: w, height: h });
        await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(150);

        if (studio !== 'home') {
          await page.evaluate((target) => {
            const allElements = Array.from(document.querySelectorAll('div, button, a'));
            const studioTile = allElements.find((el) => {
              const text = (el.textContent || '').toLowerCase();
              return text.includes(`gs-${target}`) || text.includes(target);
            });
            if (studioTile) {
              (studioTile as HTMLElement).click();
            }
          }, studio);
          await page.waitForTimeout(200);
        }

        const overflow = await page.evaluate(() => {
          const docScroll = document.documentElement.scrollWidth;
          const bodyScroll = document.body.scrollWidth;
          const maxScroll = Math.max(docScroll, bodyScroll);
          const diff = maxScroll - window.innerWidth;
          return {
            diff,
            scrollWidth: maxScroll,
            innerWidth: window.innerWidth,
          };
        });

        if (overflow.diff > 1) {
          violations.push({
            route: studio,
            bp,
            scrollWidth: overflow.scrollWidth,
            innerWidth: overflow.innerWidth,
            diff: overflow.diff,
          });
        }
      }
    }
  }

  await browser.close();

  if (violations.length > 0) {
    console.error(`\x1b[31m[FAIL] Found ${violations.length} horizontal overflow violations:\x1b[0m`);
    violations.forEach((v) => {
      console.error(` - Route '${v.route}' at ${v.bp}: scrollWidth=${v.scrollWidth}px > innerWidth=${v.innerWidth}px (+${v.diff}px)`);
    });
    process.exit(1);
  } else {
    console.log('\x1b[32m[PASS] Zero horizontal overflow detected across all routes and viewport matrices.\x1b[0m');
    process.exit(0);
  }
}

runCheck().catch((err) => {
  console.error('[CI GATE F1] Fatal error:', err);
  process.exit(1);
});
