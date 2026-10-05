import { chromium, Page } from 'playwright';
import fs from 'fs';
import path from 'path';

interface Defect {
  id: string;
  route: string;
  breakpoint: string;
  element: string;
  measured: string;
  expected: string;
  priority: 'P0' | 'P1' | 'P2';
  description: string;
}

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

async function measurePhase0() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const defects: Defect[] = [];
  let defectSeq = 1;

  function recordDefect(
    route: string,
    breakpoint: string,
    element: string,
    measured: string,
    expected: string,
    priority: 'P0' | 'P1' | 'P2',
    description: string
  ) {
    const id = `RSP7-${String(defectSeq++).padStart(3, '0')}`;
    defects.push({ id, route, breakpoint, element, measured, expected, priority, description });
  }

  console.log('[PHASE 0] Starting exhaustive measurement audit across 15 routes and 18 viewport combinations...');

  for (const studio of STUDIOS) {
    console.log(`[PHASE 0] Auditing route: ${studio}...`);

    for (const w of WIDTHS) {
      for (const h of HEIGHTS) {
        const bp = `${w}x${h}`;
        await page.setViewportSize({ width: w, height: h });
        await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(200);

        // If inspecting an overlay
        // If studio is not home, navigate to it
        if (studio !== 'home') {
          await page.evaluate((targetStudio) => {
            // Find and click the studio tile or nav item
            const allElements = Array.from(document.querySelectorAll('div, button, a'));
            const studioTile = allElements.find((el) => {
              const text = (el.textContent || '').toLowerCase();
              return text.includes(`gs-${targetStudio}`) || text.includes(targetStudio);
            });
            if (studioTile) {
              (studioTile as HTMLElement).click();
            }
          }, studio);
          await page.waitForTimeout(300);
        }

        // Measure Horizontal Overflow
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
          recordDefect(
            studio,
            bp,
            'document.scrollWidth',
            `${overflow.scrollWidth}px (overflow: +${overflow.diff}px)`,
            `${overflow.innerWidth}px (zero overflow)`,
            'P0',
            `Horizontal overflow detected on ${studio} at ${bp}`
          );
        }

        // Measure clipped or overflowing interactive elements
        const clippedElements = await page.evaluate(() => {
          const interactive = Array.from(document.querySelectorAll('button, a, input, select, textarea'));
          const bad: Array<{ selector: string; right: number; innerWidth: number }> = [];
          for (const el of interactive) {
            const rect = el.getBoundingClientRect();
            if (rect.right > window.innerWidth + 1) {
              bad.push({
                selector: el.tagName.toLowerCase() + (el.className ? `.${el.className.split(' ').slice(0, 2).join('.')}` : ''),
                right: Math.round(rect.right),
                innerWidth: window.innerWidth
              });
            }
          }
          return bad;
        });

        for (const bad of clippedElements) {
          recordDefect(
            studio,
            bp,
            bad.selector,
            `right edge at ${bad.right}px exceeds viewport ${bad.innerWidth}px`,
            `fully within [0, ${bad.innerWidth}]`,
            'P0',
            `Interactive element clipped/overflowing viewport on ${studio} at ${bp}`
          );
        }

        // Audit Tap Targets (< 44x44px at touch viewports w <= 414)
        if (w <= 414 && h === 740) {
          const smallTargets = await page.evaluate(() => {
            const interactive = Array.from(document.querySelectorAll('button, a, input[type="button"], input[type="submit"]'));
            const violations: Array<{ text: string; width: number; height: number; classNames: string }> = [];
            for (const el of interactive) {
              const rect = el.getBoundingClientRect();
              // Only visible elements
              if (rect.width > 0 && rect.height > 0 && rect.top < window.innerHeight && rect.bottom > 0) {
                if (rect.width < 44 || rect.height < 44) {
                  violations.push({
                    text: (el.textContent || el.getAttribute('title') || el.getAttribute('aria-label') || '').trim().slice(0, 25),
                    width: Math.round(rect.width),
                    height: Math.round(rect.height),
                    classNames: el.className.split(' ').slice(0, 3).join(' ')
                  });
                }
              }
            }
            return violations;
          });

          for (const st of smallTargets.slice(0, 8)) { // Sample first several key violations per studio
            recordDefect(
              studio,
              bp,
              `button[${st.text || st.classNames}]`,
              `${st.width}×${st.height}px`,
              `≥ 44×44px tap hit area`,
              'P1',
              `Interactive tap target smaller than 44px on coarse pointer at ${bp}`
            );
          }
        }
      }
    }
  }

  // Audit Modals: Open Command Palette, Notices Modal, Settings Modal, Install Banner
  console.log('[PHASE 0] Auditing overlays and modals...');
  for (const overlay of ['commandPalette', 'settings', 'notices', 'installBanner']) {
    for (const w of [320, 360, 390]) {
      const h = 740;
      const bp = `${w}x${h}`;
      await page.setViewportSize({ width: w, height: h });
      await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(200);

      if (overlay === 'commandPalette') {
        // Trigger command palette
        await page.keyboard.press('Control+KeyK');
        await page.waitForTimeout(300);
      } else if (overlay === 'settings') {
        // Click settings button
        await page.evaluate(() => {
          const btn = document.querySelector('button[title*="Settings"]') as HTMLElement;
          if (btn) btn.click();
        });
        await page.waitForTimeout(300);
      } else if (overlay === 'notices') {
        // Click notices modal button in footer or evaluate
        await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const btn = buttons.find(b => b.textContent?.includes('Open Source Notices'));
          if (btn) btn.click();
        });
        await page.waitForTimeout(300);
      }

      // Check overflow & modal dimensions
      const modalMetrics = await page.evaluate(() => {
        const modal = document.querySelector('.neu-flat.rounded-2xl, .neu-flat.rounded-3xl, .neu-card');
        if (!modal) return null;
        const rect = modal.getBoundingClientRect();
        return {
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          overflow: document.documentElement.scrollWidth - window.innerWidth,
        };
      });

      if (modalMetrics && modalMetrics.overflow > 1) {
        recordDefect(
          `overlay:${overlay}`,
          bp,
          `.modal-dialog`,
          `overflow +${modalMetrics.overflow}px`,
          `zero overflow, full-screen sheet <480px`,
          'P0',
          `Overlay ${overlay} causes horizontal overflow at ${bp}`
        );
      }
    }
  }

  console.log(`[PHASE 0] Completed measurement audit. Recorded ${defects.length} defects.`);
  const outputPath = path.resolve('scratch_tests/defect_ledger.json');
  fs.writeFileSync(outputPath, JSON.stringify(defects, null, 2));
  console.log(`[PHASE 0] Written defect ledger to ${outputPath}`);

  await browser.close();
}

measurePhase0().catch((err) => {
  console.error('[PHASE 0] Audit failed:', err);
  process.exit(1);
});
