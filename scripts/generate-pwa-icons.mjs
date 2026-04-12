import sharp from "sharp";
import { readFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const publicDir = join(root, "public");

const svgBuffer = readFileSync(join(publicDir, "icon.svg"));

const sizes = [192, 512];

for (const size of sizes) {
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(join(publicDir, `pwa-icon-${size}.png`));
  console.log(`Generated pwa-icon-${size}.png`);
}

// Maskable icon: add 20% safe-zone padding on a solid background
const maskableSize = 512;
const innerSize = Math.round(maskableSize * 0.8);
const offset = Math.round((maskableSize - innerSize) / 2);

const inner = await sharp(svgBuffer).resize(innerSize, innerSize).png().toBuffer();

await sharp({
  create: {
    width: maskableSize,
    height: maskableSize,
    channels: 4,
    background: "#0e0e2e",
  },
})
  .composite([{ input: inner, left: offset, top: offset }])
  .png()
  .toFile(join(publicDir, "pwa-icon-maskable-512.png"));

console.log("Generated pwa-icon-maskable-512.png");
console.log("Done!");
