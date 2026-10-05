import fs from 'fs';

const defects = JSON.parse(fs.readFileSync('scratch_tests/defect_ledger.json', 'utf8'));

// Find unique elements causing overflow and clipping
const overflowCauses = defects.filter(d => d.priority === 'P0' && d.element !== 'document.scrollWidth');
console.log('Sample P0 element culprits:');
console.log(overflowCauses.slice(0, 15));
