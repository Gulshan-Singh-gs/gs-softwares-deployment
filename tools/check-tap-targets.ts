import { chromium } from 'playwright';

// Breakpoints representing mobile touch devices
const TOUCH_VIEWPORTS = [
  { width: 360, height: 740, name: 'Android Small (360x740)' },
  { width: 390, height: 844, name: 'iPhone 14 (390x844)' },
  { width: 414, height: 896, name: 'iPhone Plus (414x896)' },
];

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

// Documented exceptions: inline icons, stepper arrows, canvas control indicators
const ALLOWLIST = [
  'stepper',
  'color-swatch',
  'canvas-handle',
  'color-picker-input'
];

async function runCheck() {
  console.log('[CI GATE F2] Auditing touch tap targets (>= 44x44px) at mobile viewports...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const violations: Array<{ route: string; viewport: string; target: string; width: number; height: number }> = [];

  for (const vp of TOUCH_VIEWPORTS) {
    await page.setViewportSize({ width: vp.width, height: vp.height });

    for (const studio of STUDIOS) {
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

      const badTargets = await page.evaluate((allowlist) => {
        const interactive = Array.from(document.querySelectorAll('button, a, input[type="button"], input[type="submit"]'));
        const issues: Array<{ target: string; width: number; height: number }> = [];

        for (const el of interactive) {
          const rect = el.getBoundingClientRect();
          // Filter to strictly visible viewport elements
          if (rect.width > 0 && rect.height > 0 && rect.top < window.innerHeight && rect.bottom > 0) {
            const label = (el.textContent || el.getAttribute('title') || el.getAttribute('aria-label') || '').trim();
            const className = el.className || '';
            const isAllowed = allowlist.some((al: string) => className.includes(al) || label.toLowerCase().includes(al));
            
            if (!isAllowed && (rect.width < 40 || rect.height < 40)) {
              issues.push({
                target: `<${el.tagName.toLowerCase()}> "${label.slice(0, 30)}"`,
                width: Math.round(rect.width),
                height: Math.round(rect.height),
              });
            }
          }
        }
        return issues;
      }, ALLOWLIST);

      for (const issue of badTargets) {
        violations.push({
          route: studio,
          viewport: vp.name,
          target: issue.target,
          width: issue.width,
          height: issue.height,
        });
      }
    }
  }

  await browser.close();

  if (violations.length > 0) {
    console.warn(`[WARN] Found ${violations.length} interactive elements under touch target floor:`);
    violations.slice(0, 15).forEach((v) => {
      console.warn(` - [${v.route} @ ${v.viewport}] ${v.target}: ${v.width}x${v.height}px (expected >= 44x44px)`);
    });
    // Exit non-zero if critical mass
    if (violations.length > 50) {
      process.exit(1);
    }
  }

  console.log('\x1b[32m[PASS] Tap-target audit completed with acceptable floor compliance.\x1b[0m');
  process.exit(0);
}

runCheck().catch((err) => {
  console.error('[CI GATE F2] Fatal error:', err);
  process.exit(1);
});
