/**
 * Конвертує всі PNG у public/images у WebP (поруч з оригіналом).
 * Запуск: npm run images:webp
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "public", "images");

async function walk(dir) {
  if (!fs.existsSync(dir)) {
    console.warn("Папка не знайдена:", dir);
    return;
  }
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      await walk(full);
      continue;
    }
    if (!e.isFile() || !/\.png$/i.test(e.name)) continue;
    const outPath = full.replace(/\.png$/i, ".webp");
    await sharp(full)
      .webp({ quality: 82, effort: 6, smartSubsample: true })
      .toFile(outPath);
    const inStat = fs.statSync(full);
    const outStat = fs.statSync(outPath);
    const saved = Math.round((1 - outStat.size / inStat.size) * 100);
    console.log(`${path.relative(root, full)} → ${path.relative(root, outPath)} (−${saved}% розміру)`);
  }
}

await walk(root);
console.log("Готово.");
