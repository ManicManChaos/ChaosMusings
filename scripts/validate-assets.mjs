// scripts/validate-assets.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT, "public");

// Adjust this if your assets file is somewhere else
const ASSETS_FILE = path.join(ROOT, "lib", "assets.js");

function fail(msg) {
  console.error(`\n❌ Asset validation failed:\n- ${msg}\n`);
  process.exit(1);
}

function ok(msg) {
  console.log(`✅ ${msg}`);
}

function existsOnDisk(publicPath) {
  // publicPath must look like "/assets/...."
  const diskPath = path.join(PUBLIC_DIR, publicPath.replace(/^\//, ""));
  return { diskPath, exists: fs.existsSync(diskPath) };
}

function extractPaths(js) {
  // grabs "/something.ext" strings
  const re = /["'`](\/[^"'`]+?\.(?:svg|png|jpg|jpeg|webp|gif|ico))["'`]/g;
  const out = new Set();
  let m;
  while ((m = re.exec(js))) out.add(m[1]);
  return [...out];
}

if (!fs.existsSync(ASSETS_FILE)) fail(`Missing assets file: ${ASSETS_FILE}`);
if (!fs.existsSync(PUBLIC_DIR)) fail(`Missing public folder: ${PUBLIC_DIR}`);

const js = fs.readFileSync(ASSETS_FILE, "utf8");
const paths = extractPaths(js);

if (!paths.length) {
  fail(
    `No asset paths found in lib/assets.js. Expect strings like "/assets/..." or "/icons/...".`
  );
}

let missing = 0;

for (const p of paths) {
  if (!p.startsWith("/")) fail(`Manifest path must start with "/": ${p}`);

  const { diskPath, exists } = existsOnDisk(p);
  if (!exists) {
    console.error(`❌ Missing file for path: ${p}\n   Expected: ${diskPath}`);
    missing++;
  }
}

if (missing) fail(`${missing} missing asset file(s).`);

ok(`All asset paths exist (${paths.length} checked).`);
process.exit(0);
