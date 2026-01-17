#!/usr/bin/env node
/**
 * Asset manifest validation (no dependencies).
 *
 * What it checks:
 * 1) Every ICONS / ICONS_PNG path in lib/assets.js exists under /public
 * 2) All manifest paths are unique (no accidental collisions)
 * 3) No hardcoded "/icons/" string literals exist in app/ or components/ (except lib/assets.js)
 * 4) Warns if extra files exist in public/icons that are not referenced in the manifest
 *
 * Usage:
 *   node scripts/validate-assets.mjs
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const repoRoot = path.resolve(process.cwd());
const publicDir = path.join(repoRoot, "public");
const iconsDir = path.join(publicDir, "icons");
const assetsFile = path.join(repoRoot, "lib", "assets.js");

function fail(msg) {
  console.error(`\n❌ Asset validation failed:\n- ${msg}\n`);
  process.exit(1);
}

function warn(msg) {
  console.warn(`\n⚠️  ${msg}\n`);
}

function readText(p) {
  return fs.readFileSync(p, "utf8");
}

// -------- Parse lib/assets.js (ES export file) without importing it --------
// This is intentionally lightweight to avoid changing package.json module type.
function extractObjectLiteral(source, exportName) {
  const reBlock = new RegExp(
    String.raw`export\s+const\s+${exportName}\s*=\s*({[\s\S]*?^\s*});`,
    "m"
  );
  const m = source.match(reBlock);
  if (!m) fail(`Could not find export "${exportName}" in lib/assets.js`);
  return m[1];
}

function objectLiteralToJson(objLiteral) {
  // Convert JS object literal into JSON (best-effort).
  // Assumptions: keys are simple identifiers; values are strings or nested objects.
  let s = objLiteral.trim();

  // Quote unquoted keys:  foo: -> "foo":
  s = s.replace(/([,{]\s*)([A-Za-z0-9_]+)\s*:/g, '$1"$2":');

  // Remove trailing commas before } or ]
  s = s.replace(/,\s*([}\]])/g, "$1");

  return JSON.parse(s);
}

const assetsSource = readText(assetsFile);

const ICONS = objectLiteralToJson(extractObjectLiteral(assetsSource, "ICONS"));
let ICONS_PNG = {};
try {
  ICONS_PNG = objectLiteralToJson(extractObjectLiteral(assetsSource, "ICONS_PNG"));
} catch {
  // ICONS_PNG is optional
  ICONS_PNG = {};
}

function flattenPaths(obj, acc = []) {
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === "string") acc.push(v);
    else if (v && typeof v === "object") flattenPaths(v, acc);
  }
  return acc;
}

const manifestPaths = [
  ...flattenPaths(ICONS),
  ...flattenPaths(ICONS_PNG),
];

// 1) Basic path sanity
if (manifestPaths.length === 0) fail("No asset paths found in manifest exports.");

for (const p of manifestPaths) {
  if (!p.startsWith("/")) fail(`Manifest path must start with "/": ${p}`);
  if (!p.startsWith("/icons/")) fail(`Manifest path must live under /icons/: ${p}`);

  const diskPath = path.join(publicDir, p.replace(/^\//, ""));
  if (!fs.existsSync(diskPath)) {
    fail(`Missing file on disk for manifest path: ${p}\n  Expected: ${diskPath}`);
  }
}

// 2) Uniqueness
const seen = new Map();
for (const p of manifestPaths) {
  if (seen.has(p)) {
    fail(`Duplicate manifest path detected: ${p}\n  Used by: ${seen.get(p)} and another key`);
  }
  seen.set(p, "manifest");
}

// 3) No hardcoded icon paths in app/ or components/
function scanDir(dir) {
  const hits = [];
  const stack = [dir];
  while (stack.length) {
    const cur = stack.pop();
    const entries = fs.readdirSync(cur, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(cur, e.name);
      if (e.isDirectory()) {
        // ignore build output / deps
        if (e.name === "node_modules" || e.name === ".next") continue;
        stack.push(full);
      } else {
        if (!/\.(js|jsx|ts|tsx|mdx)$/.test(e.name)) continue;
        if (full.endsWith(path.join("lib", "assets.js"))) continue;
        const txt = readText(full);
        const hardcoded = txt.match(/["'`]\/icons\//);
        if (hardcoded) hits.push(full);
      }
    }
  }
  return hits;
}

const hardcodedHits = [
  ...scanDir(path.join(repoRoot, "app")),
  ...scanDir(path.join(repoRoot, "components")),
].filter(Boolean);

if (hardcodedHits.length) {
  fail(
    `Found hardcoded "/icons/" references. Import from "@/lib/assets" instead.\n` +
      hardcodedHits.map((p) => `  - ${path.relative(repoRoot, p)}`).join("\n")
  );
}

// 4) Warn about extras in public/icons not referenced by manifest
function listFilesRecursive(dir) {
  const out = [];
  const stack = [dir];
  while (stack.length) {
    const cur = stack.pop();
    const entries = fs.readdirSync(cur, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(cur, e.name);
      if (e.isDirectory()) stack.push(full);
      else out.push(full);
    }
  }
  return out;
}

if (fs.existsSync(iconsDir)) {
  const files = listFilesRecursive(iconsDir);
  const iconPublicPaths = files.map((p) => "/icons/" + path.relative(iconsDir, p).replace(/\\/g, "/"));
  const manifestSet = new Set(manifestPaths);
  const extras = iconPublicPaths.filter((p) => !manifestSet.has(p));

  if (extras.length) {
    warn(
      `There are ${extras.length} files in public/icons not referenced by lib/assets.js (this is OK, but may indicate drift):\n` +
        extras.slice(0, 50).map((p) => `  - ${p}`).join("\n") +
        (extras.length > 50 ? `\n  …and ${extras.length - 50} more` : "")
    );
  }
}

console.log("✅ Asset manifest validation passed.");
