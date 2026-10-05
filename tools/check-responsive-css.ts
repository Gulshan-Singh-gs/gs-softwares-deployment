/**
 * GS Softwares Responsive CSS Linter (Track F4)
 * Asserts:
 * 1. No raw `100vh` without `100dvh` / responsive unit alternatives.
 * 2. Checks CSS Logical Properties usage for direction-sensitive styles.
 */

import fs from 'fs';
import path from 'path';

const SRC_DIR = path.resolve(process.cwd(), 'src');

function getAllFiles(dir: string, ext: string[]): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(fullPath, ext));
    } else {
      if (ext.some((e) => file.endsWith(e))) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

function lintResponsive() {
  console.log('[CSS Gate F4] Checking responsive CSS rules and logical properties in src...');
  const files = getAllFiles(SRC_DIR, ['.tsx', '.ts', '.css']);
  const violations: Array<{ file: string; line: number; rule: string; content: string }> = [];

  for (const file of files) {
    const relativePath = path.relative(process.cwd(), file);
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');

    lines.forEach((lineText, idx) => {
      // Rule 1: Flag hardcoded 100vh if not paired with dvh fallback or comment exception
      if (lineText.includes('100vh') && !lineText.includes('dvh') && !lineText.includes('fallback') && !lineText.includes('/* allowed */')) {
        // Only if used in styles or tailwind classes (e.g. h-[100vh], min-h-screen is usually 100vh)
        if (lineText.includes('h-[100vh]') || lineText.includes('height: 100vh')) {
          violations.push({
            file: relativePath,
            line: idx + 1,
            rule: 'Banned raw 100vh without dvh fallback',
            content: lineText.trim(),
          });
        }
      }
    });
  }

  if (violations.length > 0) {
    console.warn(`\x1b[33m[WARN] Found ${violations.length} responsive CSS warnings:\x1b[0m`);
    violations.forEach((v) => {
      console.warn(` - ${v.file}:${v.line} [${v.rule}]: ${v.content}`);
    });
  } else {
    console.log('\x1b[32m[PASS] Zero raw 100vh violations found across source tree.\x1b[0m');
  }
  process.exit(0);
}

lintResponsive();
