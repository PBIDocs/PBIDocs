// Verifies every content page in the built site is reachable via at least one
// internal link from some other page (nav/sidebar links excluded won't matter
// since fumadocs renders sidebar links into the HTML too). Run after `npm run build`.
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, 'out');

// Pages that are intentionally not linked from in-content prose (index/hub
// pages reached via nav, or infra routes) — not "orphans" in the sense we care about.
const IGNORE_ROUTES = new Set([
  '/',
  '/docs',
]);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.name.endsWith('.html')) files.push(full);
  }
  return files;
}

function htmlPathToRoute(htmlPath) {
  let rel = path.relative(OUT_DIR, htmlPath).replace(/\\/g, '/');
  rel = rel.replace(/\.html$/, '');
  if (rel.endsWith('/index')) rel = rel.slice(0, -'/index'.length);
  if (rel === 'index') rel = '';
  return '/' + rel;
}

const allFiles = walk(OUT_DIR);
const allRoutes = new Set(allFiles.map(htmlPathToRoute));

// Only check content pages (docs + blog), not infra/utility routes.
const contentRoutes = [...allRoutes].filter(
  (r) => (r.startsWith('/docs/') || r.startsWith('/blog/') || r.startsWith('/tutorials/')) && !IGNORE_ROUTES.has(r),
);

const linkedTo = new Set();
const linkRe = /href="(\/[^"#?\s]*)/g;

for (const file of allFiles) {
  const html = fs.readFileSync(file, 'utf8');
  let m;
  linkRe.lastIndex = 0;
  while ((m = linkRe.exec(html))) {
    let route = m[1].replace(/\/$/, '');
    if (route === '') route = '/';
    linkedTo.add(route);
  }
}

const orphans = contentRoutes.filter((r) => !linkedTo.has(r));

if (orphans.length === 0) {
  console.log(`Orphan check passed — 0 orphaned content pages across ${contentRoutes.length} checked.`);
  process.exit(0);
} else {
  console.log(`Orphan check FAILED — ${orphans.length} page(s) with no incoming internal link:`);
  for (const o of orphans) console.log(`  ${o}`);
  process.exit(1);
}
