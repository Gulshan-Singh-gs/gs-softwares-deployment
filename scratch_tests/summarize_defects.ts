import fs from 'fs';

const defects = JSON.parse(fs.readFileSync('scratch_tests/defect_ledger.json', 'utf8'));

const p0 = defects.filter(d => d.priority === 'P0');
const p1 = defects.filter(d => d.priority === 'P1');
const p2 = defects.filter(d => d.priority === 'P2');

console.log(`Total: ${defects.length}`);
console.log(`P0: ${p0.length}`);
console.log(`P1: ${p1.length}`);
console.log(`P2: ${p2.length}`);

// Group P0 by route and element
const p0ByRoute = {};
for (const d of p0) {
  p0ByRoute[d.route] = p0ByRoute[d.route] || [];
  p0ByRoute[d.route].push(d);
}

console.log('\n--- P0 Breakdowns by Route ---');
for (const [route, list] of Object.entries(p0ByRoute)) {
  const maxOverflow = list
    .filter(x => x.measured.includes('overflow: +'))
    .map(x => parseInt(x.measured.match(/\+(\d+)px/)?.[1] || '0', 10));
  const peak = maxOverflow.length ? Math.max(...maxOverflow) : 0;
  console.log(`Route ${route}: ${list.length} P0 defects, Peak overflow: +${peak}px`);
}
