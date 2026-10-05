import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base deployment domain
const BASE_URL = process.env.SITE_URL || 'https://gssoftwares.com';
const TODAY = new Date().toISOString().split('T')[0];

/**
 * Array of canonical tools, studios, and pSEO micro-tool landing routes
 */
const ROUTES = [
  // Core Platform & Studios
  { loc: '/', priority: '1.0', changefreq: 'daily' },
  { loc: '/?app=pixels', priority: '0.9', changefreq: 'weekly' },
  { loc: '/?app=canvas', priority: '0.9', changefreq: 'weekly' },
  { loc: '/?app=pdf', priority: '0.9', changefreq: 'weekly' },
  { loc: '/?app=video', priority: '0.85', changefreq: 'weekly' },
  { loc: '/?app=audio', priority: '0.85', changefreq: 'weekly' },
  { loc: '/?app=text', priority: '0.85', changefreq: 'weekly' },
  { loc: '/?app=archive', priority: '0.85', changefreq: 'weekly' },
  { loc: '/?app=qr', priority: '0.85', changefreq: 'weekly' },
  { loc: '/?app=spreadsheet', priority: '0.85', changefreq: 'weekly' },
  { loc: '/?app=presentation', priority: '0.85', changefreq: 'weekly' },
  { loc: '/?app=security', priority: '0.9', changefreq: 'weekly' },
  { loc: '/?app=hash', priority: '0.9', changefreq: 'weekly' },

  // Programmatic High-Intent Micro-Tool Landing Pages
  { loc: '/?landing=metadata-scrubber', priority: '0.95', changefreq: 'weekly' },
  { loc: '/?landing=image-compressor', priority: '0.95', changefreq: 'weekly' },
  { loc: '/?landing=crop-studio', priority: '0.85', changefreq: 'weekly' },
  { loc: '/?landing=color-extractor', priority: '0.85', changefreq: 'weekly' },
  { loc: '/?landing=audio-trimmer', priority: '0.85', changefreq: 'weekly' },
  { loc: '/?landing=pdf-merger', priority: '0.95', changefreq: 'weekly' },
  { loc: '/?landing=pdf-splitter', priority: '0.95', changefreq: 'weekly' },
  { loc: '/?landing=sha256-hash-generator', priority: '0.90', changefreq: 'weekly' },
  { loc: '/?landing=file-encryptor', priority: '0.90', changefreq: 'weekly' }
];

export function generateSitemapXml() {
  const urlNodes = ROUTES.map((route) => {
    const fullUrl = `${BASE_URL}${route.loc}`;
    return `  <url>
    <loc>${fullUrl}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlNodes}
</urlset>
`;
}

// Generate and write to public/sitemap.xml
const targetPath = path.resolve(__dirname, '../public/sitemap.xml');
fs.writeFileSync(targetPath, generateSitemapXml(), 'utf-8');
console.log(`Successfully generated sitemap with ${ROUTES.length} routes at ${targetPath}`);
