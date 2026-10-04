/**
 * GS Softwares i18n & Translation Completeness Audit Script
 * Verifies that all required keys in en.json exist in secondary proof locales (ar.json).
 */

import fs from 'fs';
import path from 'path';

function checkI18n() {
  console.log('[i18n Audit] Verifying locale bundles...');

  const enPath = path.resolve(process.cwd(), 'src/locales/en.json');
  const arPath = path.resolve(process.cwd(), 'src/locales/ar.json');

  if (!fs.existsSync(enPath)) {
    console.error('FAIL: src/locales/en.json missing.');
    process.exit(1);
  }
  if (!fs.existsSync(arPath)) {
    console.error('FAIL: src/locales/ar.json missing.');
    process.exit(1);
  }

  const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  const ar = JSON.parse(fs.readFileSync(arPath, 'utf8'));

  const enKeys = Object.keys(en);
  const missingInAr = enKeys.filter((k) => !(k in ar));

  if (missingInAr.length > 0) {
    console.error(`FAIL: Missing keys in Arabic locale bundle: ${missingInAr.join(', ')}`);
    process.exit(1);
  }

  console.log(`[i18n Audit] PASS: 100% key parity across ${enKeys.length} strings in en.json and ar.json (RTL proof locale).`);
}

checkI18n();
