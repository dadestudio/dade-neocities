import http from "node:http";
import path from "node:path";
import { promises as fs } from "node:fs";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

const HOST = "127.0.0.1";
const PORT = 4173;
const BASE_URL = `http://${HOST}:${PORT}`;
const PASS_THRESHOLD = 0.01;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".png": "image/png",
  ".gif": "image/gif",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".mid": "audio/midi",
  ".mp3": "audio/mpeg",
  ".json": "application/json; charset=utf-8",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8"
};

const TARGETS = [
  { name: "winamp-main-1x", url: "/", selector: "#winamp-chrome" },
  { name: "winamp-eq-1x", url: "/", selector: "#winamp-eq" },
  { name: "winamp-pl-1x", url: "/", selector: "#winamp-pl" }
];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const referenceDir = path.join(repoRoot, "docs", "reference");
const diffsDir = path.join(referenceDir, "diffs");
const updateMode = process.argv.includes("--update");

function createStaticServer(rootDir) {
  return http.createServer(async (req, res) => {
    try {
      const reqUrl = new URL(req.url ?? "/", BASE_URL);
      const decodedPath = decodeURIComponent(reqUrl.pathname);
      const pathWithoutLeadingSlash = decodedPath.replace(/^\/+/, "");
      const normalizedPath = path.normalize(pathWithoutLeadingSlash);
      const candidatePath = path.resolve(rootDir, normalizedPath);
      const safeRoot = rootDir.endsWith(path.sep) ? rootDir : `${rootDir}${path.sep}`;

      if (candidatePath !== rootDir && !candidatePath.startsWith(safeRoot)) {
        res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Forbidden");
        return;
      }

      let filePath = candidatePath;
      let stat;
      try {
        stat = await fs.stat(filePath);
      } catch {
        stat = null;
      }

      if (stat?.isDirectory()) {
        filePath = path.join(filePath, "index.html");
      }

      const ext = path.extname(filePath).toLowerCase();
      const mimeType = MIME_TYPES[ext] ?? "application/octet-stream";
      const payload = await fs.readFile(filePath);
      res.writeHead(200, { "Content-Type": mimeType });
      res.end(payload);
    } catch {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not Found");
    }
  });
}

function readPng(filePath) {
  return fs.readFile(filePath).then((buffer) => PNG.sync.read(buffer));
}

async function main() {
  await fs.mkdir(referenceDir, { recursive: true });
  await fs.mkdir(diffsDir, { recursive: true });

  const server = createStaticServer(repoRoot);
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(PORT, HOST, () => resolve());
  });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: "reduce"
  });

  await context.addInitScript(() => {
    localStorage.setItem("wa_eq_open", "1");
    localStorage.setItem("wa_pl_open", "1");
    localStorage.setItem("wa_shade_main", "0");
    localStorage.setItem("wa_shade_eq", "0");
    localStorage.setItem("wa_shade_pl", "0");
    localStorage.setItem("wa_pos_main", JSON.stringify({ x: 16, y: 16 }));
    localStorage.setItem("wa_pos_eq", JSON.stringify({ x: 16, y: 200 }));
    localStorage.setItem("wa_pos_pl", JSON.stringify({ x: 320, y: 16 }));
    localStorage.setItem("wa_viz_mode", "1");
    localStorage.setItem("mix_preset", "Flat");
  });

  let failCount = 0;
  const page = await context.newPage();

  try {
    for (const target of TARGETS) {
      await page.goto(`${BASE_URL}${target.url}`, { waitUntil: "load", timeout: 15000 });
      await page.waitForTimeout(500);

      const element = await page.$(target.selector);
      if (!element) {
        console.log(`MISSING ${target.name}`);
        failCount += 1;
        continue;
      }

      const actualPath = path.join(diffsDir, `${target.name}.actual.png`);
      const baselinePath = path.join(referenceDir, `${target.name}.png`);
      const diffPath = path.join(diffsDir, `${target.name}.diff.png`);

      await element.screenshot({ path: actualPath });

      if (updateMode) {
        await fs.copyFile(actualPath, baselinePath);
        console.log(`UPDATED ${target.name}`);
        continue;
      }

      try {
        await fs.access(baselinePath);
      } catch {
        await fs.copyFile(actualPath, baselinePath);
        console.log(`BASELINE_SEEDED ${target.name}`);
        continue;
      }

      const actualPng = await readPng(actualPath);
      const refPng = await readPng(baselinePath);

      if (actualPng.width !== refPng.width || actualPng.height !== refPng.height) {
        console.log(
          `SIZE_MISMATCH ${target.name} actual=${actualPng.width}x${actualPng.height} ref=${refPng.width}x${refPng.height}`
        );
        failCount += 1;
        continue;
      }

      const diffPng = new PNG({ width: actualPng.width, height: actualPng.height });
      const mismatchedPixels = pixelmatch(actualPng.data, refPng.data, diffPng.data, actualPng.width, actualPng.height, {
        threshold: 0.1
      });
      const ratio = mismatchedPixels / (actualPng.width * actualPng.height);
      await fs.writeFile(diffPath, PNG.sync.write(diffPng));

      if (ratio <= PASS_THRESHOLD) {
        console.log(`PASS ${target.name} ratio=${(ratio * 100).toFixed(3)}%`);
      } else {
        console.log(`FAIL ${target.name} ratio=${(ratio * 100).toFixed(2)}% -> diffs/${target.name}.diff.png`);
        failCount += 1;
      }
    }
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(() => resolve()));
  }

  process.exit(failCount > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(2);
});
