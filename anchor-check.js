// Verifies every internal #anchor link in the built site actually resolves to
// a real id in the target page's built HTML. Run after `npm run build`.
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, 'out');

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

function routeToHtmlPath(route) {
  let clean = route.split('?')[0];
  if (clean === '') clean = '/';
  const direct = path.join(OUT_DIR, clean === '/' ? 'index.html' : clean + '.html');
  if (fs.existsSync(direct)) return direct;
  const asDir = path.join(OUT_DIR, clean, 'index.html');
  if (fs.existsSync(asDir)) return asDir;
  return null;
}

const allFiles = walk(OUT_DIR);
const idCache = new Map();

function getIds(htmlPath) {
  if (idCache.has(htmlPath)) return idCache.get(htmlPath);
  const html = fs.readFileSync(htmlPath, 'utf8');
  const ids = new Set();
  const re = /\sid="([^"]+)"/g;
  let m;
  while ((m = re.exec(html))) ids.add(m[1]);
  idCache.set(htmlPath, ids);
  return ids;
}

let brokenCount = 0;
const linkRe = /href="(\/[^"#?]*)#([^"]+)"/g;

for (const file of allFiles) {
  const html = fs.readFileSync(file, 'utf8');
  let m;
  linkRe.lastIndex = 0;
  while ((m = linkRe.exec(html))) {
    const [, route, anchor] = m;
    const decodedAnchor = decodeURIComponent(anchor);
    const targetPath = routeToHtmlPath(route);
    if (!targetPath) {
      console.log(`BROKEN ROUTE: ${htmlPathToRoute(file)} -> ${route}#${anchor} (route not found)`);
      brokenCount++;
      continue;
    }
    const ids = getIds(targetPath);
    if (!ids.has(decodedAnchor) && !ids.has(anchor)) {
      console.log(`BROKEN ANCHOR: ${htmlPathToRoute(file)} -> ${route}#${anchor}`);
      brokenCount++;
    }
  }
}

if (brokenCount === 0) {
  console.log(`Anchor check passed — 0 broken anchors across ${allFiles.length} pages.`);
  process.exit(0);
} else {
  console.log(`\nAnchor check FAILED — ${brokenCount} broken anchor(s).`);
  process.exit(1);
}
