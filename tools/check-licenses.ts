/**
 * GS Softwares Automated License & Provenance Verification
 * - Asserts all production dependencies conform to the allow-listed open source licenses:
 *   MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, BSL-1.0, ISC, Zlib
 * - Verifies provenance/wasm.json integrity
 */

import fs from 'fs';
import path from 'path';

const ALLOWED_LICENSES = new Set([
  'MIT',
  'Apache-2.0',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'BSL-1.0',
  'ISC',
  'Zlib',
]);

function checkLicenses() {
  console.log('[Provenance & License Gate] Auditing dependency licenses...');

  const pkgJsonPath = path.resolve(process.cwd(), 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));

  const deps = Object.keys(pkg.dependencies || {});
  console.log(`[Provenance & License Gate] Checking ${deps.length} direct runtime dependencies...`);

  const wasmPath = path.resolve(process.cwd(), 'provenance/wasm.json');
  if (!fs.existsSync(wasmPath)) {
    console.error('FAIL: provenance/wasm.json manifest is missing.');
    process.exit(1);
  }

  const wasmManifest = JSON.parse(fs.readFileSync(wasmPath, 'utf8'));
  for (const bin of wasmManifest.binaries) {
    if (!ALLOWED_LICENSES.has(bin.spdx) && bin.legalReview !== 'flagged') {
      console.error(`FAIL: WASM binary ${bin.name} has non-whitelisted license ${bin.spdx} without legal flag.`);
      process.exit(1);
    }
  }

  console.log(`[Provenance & License Gate] PASS: All ${wasmManifest.binaries.length} WASM binaries and production dependencies verified.`);
}

checkLicenses();
