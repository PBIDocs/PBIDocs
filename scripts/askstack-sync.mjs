#!/usr/bin/env node
// Copied from the askstack repo (scripts/ingest.mjs). Update both together.
// Reads a Fumadocs content folder (.mdx/.md), splits pages into sections by
// ## / ### headings, chunks long sections, and sends them to /admin/ingest.
//
// Usage (PowerShell):
//   $env:ADMIN_TOKEN = "your-admin-token"
//   node scripts/ingest.mjs --dir "C:\path\to\PBIDocs\content\docs" --site pbidocs `
//     --base-url https://pbidocs.com --api https://askstack-api.<you>.workers.dev
//
// Options:
//   --route /docs     URL prefix Fumadocs serves pages under (default /docs)
//   --dry-run         Parse and report chunks without sending anything
//   --full            Re-send every page, not just pages that changed since the last sync
//   --allow-mass-delete  Allow removing more than a quarter of the indexed pages
//
// Only pages whose content changed since the last sync are re-embedded. Chunks of
// deleted pages, and the leftover tail of pages that got shorter, are removed.
// Chunk ids are deterministic (site + url + position), so updates happen in place.

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const MAX_CHARS = 2400;   // ~600 tokens
const TARGET_CHARS = 1800;
const MIN_CHARS = 80;
const BATCH = 25;

const args = parseArgs(process.argv.slice(2));
const dir = args.dir;
const site = args.site;
const baseUrl = (args["base-url"] ?? "").replace(/\/$/, "");
const route = (args.route ?? "/docs").replace(/\/$/, "");
const api = (args.api ?? "").replace(/\/$/, "");
const dryRun = !!args["dry-run"];
const full = !!args.full;
const token = process.env.ADMIN_TOKEN;

if (!dir || !site || !baseUrl || (!dryRun && (!api || !token))) {
  console.error("Required: --dir, --site, --base-url, and (unless --dry-run) --api plus the ADMIN_TOKEN env var.");
  process.exit(1);
}

const files = (await readdir(dir, { recursive: true }))
  .filter((f) => /\.(mdx|md)$/i.test(f))
  .map((f) => f.replace(/\\/g, "/"));

if (files.length === 0) {
  console.error(`No .mdx or .md files found in ${dir}. Check --dir.`);
  process.exit(1);
}

const pages = [];
for (const rel of files) {
  const raw = await readFile(path.join(dir, rel), "utf8");
  const url = pageUrl(rel);
  const { title, body } = parsePage(raw, rel);
  const sections = splitSections(body, title);
  const chunks = [];
  for (const s of sections) {
    for (const text of chunkSection(s.text)) {
      if (text.length < MIN_CHARS) continue;
      chunks.push({ id: chunkId(url, chunks.length), site, url, title, heading: s.heading, text });
    }
  }
  const hash = crypto.createHash("sha1")
    .update(JSON.stringify(chunks.map((c) => [c.title, c.heading, c.text])))
    .digest("hex");
  pages.push({ url, hash, chunks });
}

const allChunks = pages.flatMap((p) => p.chunks);
console.log(`${files.length} pages -> ${allChunks.length} chunks`);

if (dryRun) {
  for (const c of allChunks.slice(0, 5)) {
    console.log(`\n--- ${c.url}  [${c.heading}]  (${c.text.length} chars)\n${c.text.slice(0, 300)}...`);
  }
  process.exit(0);
}

// Compare with what's already indexed
const indexed = (await requestWithRetry("GET", `${api}/admin/pages?site=${encodeURIComponent(site)}`)).pages;
const before = new Map(indexed.map((p) => [p.url, p]));
const current = new Set(pages.map((p) => p.url));

const changed = pages.filter((p) => full || before.get(p.url)?.hash !== p.hash);
const removed = indexed.filter((p) => !current.has(p.url));

if (removed.length > 10 && removed.length > indexed.length / 4 && !args["allow-mass-delete"]) {
  console.error(`${removed.length} of ${indexed.length} indexed pages are missing from ${dir}.`);
  console.error("That looks like the wrong folder. Re-run with --allow-mass-delete if it's intended.");
  process.exit(1);
}

console.log(`${changed.length} changed or new, ${pages.length - changed.length} unchanged, ${removed.length} removed`);

// 1. Embed and upsert chunks of changed pages
const toSend = changed.flatMap((p) => p.chunks);
let sent = 0;
for (let b = 0; b < toSend.length; b += BATCH) {
  const res = await requestWithRetry("POST", `${api}/admin/ingest`, { chunks: toSend.slice(b, b + BATCH) });
  sent += res.upserted ?? 0;
  process.stdout.write(`\rUpserted ${sent}/${toSend.length}`);
}
if (toSend.length) process.stdout.write("\n");

// 2. Delete chunks that no longer exist: the tail of shortened pages, and all of removed pages
const deleteIds = [];
for (const p of changed) {
  const old = before.get(p.url)?.chunk_count ?? 0;
  for (let i = p.chunks.length; i < old; i++) deleteIds.push(chunkId(p.url, i));
}
for (const p of removed) {
  for (let i = 0; i < p.chunk_count; i++) deleteIds.push(chunkId(p.url, i));
}

// 3. Record what's now indexed
const set = changed.map((p) => ({ url: p.url, hash: p.hash, chunk_count: p.chunks.length }));
const remove = removed.map((p) => p.url);
for (let i = 0; i < Math.max(deleteIds.length, 1); i += 500) {
  const ids = deleteIds.slice(i, i + 500);
  if (ids.length) await requestWithRetry("POST", `${api}/admin/pages`, { site, deleteIds: ids });
}
for (let i = 0; i < Math.max(set.length, remove.length); i += 200) {
  await requestWithRetry("POST", `${api}/admin/pages`, { site, set: set.slice(i, i + 200), remove: remove.slice(i, i + 200) });
}

console.log(`Done. ${sent} chunks upserted, ${deleteIds.length} stale chunks deleted.`);

function chunkId(url, i) {
  return crypto.createHash("sha1").update(`${site}|${url}|${i}`).digest("hex");
}

// ---------- parsing ----------

function pageUrl(rel) {
  let slug = rel.replace(/\.(mdx|md)$/i, "");
  slug = slug.replace(/(^|\/)index$/, "");
  return `${baseUrl}${route}${slug ? "/" + slug : ""}`;
}

function parsePage(raw, rel) {
  let body = raw;
  let title = "";
  const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (fm) {
    body = raw.slice(fm[0].length);
    const t = fm[1].match(/^title:\s*["']?(.+?)["']?\s*$/m);
    if (t) title = t[1];
  }
  if (!title) {
    const h1 = body.match(/^#\s+(.+)$/m);
    title = h1 ? h1[1].trim() : path.basename(rel).replace(/\.(mdx|md)$/i, "");
  }
  return { title, body: cleanMdx(body) };
}

// Strip MDX syntax outside code fences; keep code blocks intact.
function cleanMdx(body) {
  const out = [];
  let inFence = false;
  for (const line of body.split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) { inFence = !inFence; out.push(line); continue; }
    if (inFence) { out.push(line); continue; }
    if (/^\s*(import|export)\s/.test(line)) continue;
    let l = line
      .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")          // {/* comments */}
      .replace(/<\/?[A-Za-z][\w.]*(\s[^>]*)?\/?>/g, "") // JSX / HTML tags (keeps inner text)
      .replace(/!\[[^\]]*\]\([^)]*\)/g, "")            // images
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");        // links -> text
    out.push(l);
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function splitSections(body, title) {
  const sections = [];
  let current = { heading: title, lines: [] };
  let inFence = false;
  for (const line of body.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
    const h = !inFence && line.match(/^#{2,3}\s+(.+)$/);
    if (h) {
      sections.push(current);
      current = { heading: h[1].trim(), lines: [] };
    } else if (!/^#\s/.test(line) || inFence) {
      current.lines.push(line);
    }
  }
  sections.push(current);
  return sections
    .map((s) => ({ heading: s.heading, text: s.lines.join("\n").trim() }))
    .filter((s) => s.text.length > 0);
}

// Split a long section on blank lines, never inside a code fence.
function chunkSection(text) {
  if (text.length <= MAX_CHARS) return [text];
  const blocks = [];
  let buf = [];
  let inFence = false;
  for (const line of text.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
    if (!inFence && line.trim() === "" && buf.length) {
      blocks.push(buf.join("\n"));
      buf = [];
    } else {
      buf.push(line);
    }
  }
  if (buf.length) blocks.push(buf.join("\n"));

  const chunks = [];
  let cur = "";
  for (const b of blocks) {
    if (cur && cur.length + b.length > TARGET_CHARS) {
      chunks.push(cur.trim());
      cur = "";
    }
    cur += (cur ? "\n\n" : "") + b;
  }
  if (cur.trim()) chunks.push(cur.trim());
  return chunks;
}

// ---------- utils ----------

async function requestWithRetry(method, url, payload, tries = 3) {
  for (let t = 1; t <= tries; t++) {
    const res = await fetch(url, {
      method,
      headers: { "content-type": "application/json", Authorization: `Bearer ${token}` },
      ...(payload ? { body: JSON.stringify(payload) } : {}),
    });
    if (res.ok) return res.json();
    const msg = await res.text();
    if (t === tries || res.status < 500) throw new Error(`Request to ${url} failed (${res.status}): ${msg}`);
    await new Promise((r) => setTimeout(r, 1000 * t));
  }
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith("--")) continue;
    const key = argv[i].slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) out[key] = true;
    else { out[key] = next; i++; }
  }
  return out;
}
