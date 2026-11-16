// Runs the DAX formatter over every ```dax block in content/ and fails if any
// formula that passes the syntax checker can't be formatted, formats
// differently a second time, or comes out with a syntax error.
// Run: npm run check:dax-format

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { checkDax } from '../lib/dax-syntax.ts';
import { formatDax } from '../lib/dax-format.ts';

const files: string[] = [];
const walk = (dir: string) => {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.mdx')) files.push(p);
  }
};
walk('content');

let checked = 0;
const failures: string[] = [];
for (const file of files) {
  const md = readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  for (const block of md.matchAll(/```dax[^\n]*\n([\s\S]*?)```/g)) {
    for (const chunk of block[1].split(/\n\s*\n/)) {
      const src = chunk.trim();
      if (!src) continue;
      // Deliberately broken examples are skipped: the tool won't format them either.
      if (checkDax(src, 'standard').issues.some((i) => i.severity === 'error')) continue;
      checked++;
      const out = formatDax(src);
      const first = src.split('\n')[0];
      if (out === null) failures.push(`${file}: refused to format "${first}"`);
      else if (formatDax(out) !== out) failures.push(`${file}: formats differently a second time "${first}"`);
      else if (checkDax(out, 'standard').issues.some((i) => i.severity === 'error')) failures.push(`${file}: output has a syntax error "${first}"`);
    }
  }
}

if (failures.length) {
  console.error(`DAX format check failed: ${failures.length} of ${checked} formulas.\n${failures.join('\n')}`);
  process.exit(1);
}
console.log(`DAX format check passed — ${checked} formulas formatted cleanly.`);
