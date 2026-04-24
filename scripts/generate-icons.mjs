import sharp from "sharp";
import pngToIco from "png-to-ico";
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const svg = readFileSync(resolve(root, "public/icon.svg"));

async function generate() {
  // 1024x1024 master PNG for Tauri icon generator
  await sharp(svg, { density: 300 })
    .resize(1024, 1024)
    .png()
    .toFile(resolve(root, "src-tauri/icons/icon.png"));

  // Web favicons
  await sharp(svg, { density: 300 })
    .resize(32, 32)
    .png()
    .toFile(resolve(root, "public/favicon-32x32.png"));

  await sharp(svg, { density: 300 })
    .resize(16, 16)
    .png()
    .toFile(resolve(root, "public/favicon-16x16.png"));

  await sharp(svg, { density: 300 })
    .resize(180, 180)
    .png()
    .toFile(resolve(root, "public/apple-touch-icon.png"));

  await sharp(svg, { density: 300 })
    .resize(192, 192)
    .png()
    .toFile(resolve(root, "public/icon-192.png"));

  await sharp(svg, { density: 300 })
    .resize(512, 512)
    .png()
    .toFile(resolve(root, "public/icon-512.png"));

  console.log("Web icons generated");

  // Tauri icons
  const tauriDir = resolve(root, "src-tauri/icons");
  const sizes = [
    ["32x32.png", 32],
    ["128x128.png", 128],
    ["128x128@2x.png", 256],
    ["Square30x30Logo.png", 30],
    ["Square44x44Logo.png", 44],
    ["Square71x71Logo.png", 71],
    ["Square89x89Logo.png", 89],
    ["Square107x107Logo.png", 107],
    ["Square142x142Logo.png", 142],
    ["Square150x150Logo.png", 150],
    ["Square284x284Logo.png", 284],
    ["Square310x310Logo.png", 310],
    ["StoreLogo.png", 50],
  ];

  for (const [name, size] of sizes) {
    await sharp(svg, { density: 300 })
      .resize(size, size)
      .png()
      .toFile(resolve(tauriDir, name));
  }
  console.log("Tauri PNG icons generated");

  // Windows .exe / taskbar: use DIB-based ICO (not raw PNG-in-ICO) for reliable shell embedding.
  const icoSizes = [16, 24, 32, 48, 64, 128, 256];
  const icoPngBuffers = await Promise.all(
    icoSizes.map((s) =>
      sharp(svg, { density: 300 }).resize(s, s).png().toBuffer()
    )
  );
  const ico = await pngToIco(icoPngBuffers);
  writeFileSync(resolve(tauriDir, "icon.ico"), ico);
  console.log("ICO generated");

  // ICNS (just copy the 512 PNG — macOS will handle it)
  await sharp(svg, { density: 300 })
    .resize(512, 512)
    .png()
    .toFile(resolve(tauriDir, "icon.icns"));
  console.log("All icons generated successfully");
}

generate().catch(console.error);
