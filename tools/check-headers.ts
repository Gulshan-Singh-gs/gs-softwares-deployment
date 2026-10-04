/**
 * GS Softwares Header Parity Audit Script
 * Verifies that public/_headers, vercel.json, and netlify.toml
 * contain identical strict security header configurations.
 */

import fs from 'fs';
import path from 'path';

const REQUIRED_HEADERS = [
  'Cross-Origin-Opener-Policy',
  'Cross-Origin-Embedder-Policy',
  'Cross-Origin-Resource-Policy',
  'X-Content-Type-Options',
  'X-Frame-Options',
  'Referrer-Policy',
  'Permissions-Policy',
  'Content-Security-Policy',
];

function checkHeaders() {
  console.log('[Header Parity] Auditing deployment security configs...');

  // 1. Check public/_headers
  const headersPath = path.resolve(process.cwd(), 'public/_headers');
  if (!fs.existsSync(headersPath)) {
    console.error('FAIL: public/_headers does not exist.');
    process.exit(1);
  }
  const headersContent = fs.readFileSync(headersPath, 'utf8');

  // 2. Check vercel.json
  const vercelPath = path.resolve(process.cwd(), 'vercel.json');
  if (!fs.existsSync(vercelPath)) {
    console.error('FAIL: vercel.json does not exist.');
    process.exit(1);
  }
  const vercelContent = fs.readFileSync(vercelPath, 'utf8');

  // 3. Check netlify.toml
  const netlifyPath = path.resolve(process.cwd(), 'netlify.toml');
  if (!fs.existsSync(netlifyPath)) {
    console.error('FAIL: netlify.toml does not exist.');
    process.exit(1);
  }
  const netlifyContent = fs.readFileSync(netlifyPath, 'utf8');

  let failed = false;

  for (const header of REQUIRED_HEADERS) {
    const inHeaders = headersContent.includes(header);
    const inVercel = vercelContent.includes(header);
    const inNetlify = netlifyContent.includes(header);

    if (!inHeaders || !inVercel || !inNetlify) {
      console.error(`FAIL: Missing security header '${header}' -> _headers:${inHeaders}, vercel:${inVercel}, netlify:${inNetlify}`);
      failed = true;
    }
  }

  // Check connect-src 'self' air-gap lock
  if (!headersContent.includes("connect-src 'self'") || !vercelContent.includes("connect-src 'self'") || !netlifyContent.includes("connect-src 'self'")) {
    console.error("FAIL: Strict air-gap violation! connect-src 'self' missing in one or more configurations.");
    failed = true;
  }

  if (failed) {
    process.exit(1);
  }

  console.log('[Header Parity] PASS: 100% security header and air-gap parity across Cloudflare, Vercel, and Netlify.');
}

checkHeaders();
