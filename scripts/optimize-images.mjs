// Optimize originals -> responsive WebP in public/img/.
// Emits src/data/images.json manifest consumed by the <Image> component.
// Skips outputs that are newer than their original, and removes outputs
// that no original produces.
import { mkdir, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "assets", "originals");
const OUT = path.join(ROOT, "public", "img");
const WIDTHS = [400, 800];
const QUALITY = 74;

const mtime = (file) => stat(file).then((s) => s.mtimeMs, () => 0);

await mkdir(OUT, { recursive: true });
const files = (await readdir(SRC)).filter((f) => /\.(jpe?g|png)$/i.test(f));
const manifest = {};
const expected = new Set();
let written = 0;

for (const file of files) {
  const src = path.join(SRC, file);
  const srcTime = await mtime(src);
  const base = file.replace(/\.[^.]+$/, "");
  const { width, height } = await sharp(src).metadata();
  const targets = [...new Set(WIDTHS.filter((w) => w < width).concat(width))];

  const urls = [];
  for (const w of targets) {
    const name = `${base}-${w}.webp`;
    const out = path.join(OUT, name);
    expected.add(name);
    urls.push({ w, url: `/img/${name}` });
    if ((await mtime(out)) > srcTime) continue;
    await sharp(src).resize({ width: w, withoutEnlargement: true }).webp({ quality: QUALITY }).toFile(out);
    written++;
  }

  manifest[file] = {
    width,
    height,
    aspectRatio: +(width / height).toFixed(4),
    srcset: urls.map((s) => `${s.url} ${s.w}w`).join(", "),
    fallback: urls.at(-1).url,
  };
}

const stale = (await readdir(OUT)).filter((f) => !expected.has(f));
await Promise.all(stale.map((f) => rm(path.join(OUT, f))));

await writeFile(path.join(ROOT, "src", "data", "images.json"), JSON.stringify(manifest, null, 2));
console.log(`images: ${files.length} originals, ${written} written, ${stale.length} removed`);
