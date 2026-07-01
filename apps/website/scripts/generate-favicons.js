/**
 * JR Interiors — Favicon Generation Script
 * Uses sharp found in the pnpm virtual store
 */
const path = require("path");
const fs = require("fs");

const SHARP_PATH = path.join(
  __dirname,
  "../../../node_modules/.pnpm/next@16.2.9_@babel+core@7.29.7_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/sharp"
);

async function generateFavicons() {
  const sharp = require(SHARP_PATH);

  const source = path.join(__dirname, "../public/logos/icon.png");
  const faviconDir = path.join(__dirname, "../public/favicons");
  const publicDir = path.join(__dirname, "../public");

  if (!fs.existsSync(faviconDir)) {
    fs.mkdirSync(faviconDir, { recursive: true });
  }

  console.log("Generating favicons from:", source);

  const sizes = [
    { size: 16, name: "favicon-16x16.png", bg: { r: 251, g: 249, b: 248, alpha: 1 } },
    { size: 32, name: "favicon-32x32.png", bg: { r: 251, g: 249, b: 248, alpha: 1 } },
    { size: 48, name: "favicon-48x48.png", bg: { r: 251, g: 249, b: 248, alpha: 1 } },
    { size: 150, name: "mstile-150x150.png", bg: { r: 255, g: 255, b: 255, alpha: 1 } },
    { size: 180, name: "apple-touch-icon.png", bg: { r: 251, g: 249, b: 248, alpha: 1 } },
    { size: 192, name: "android-chrome-192x192.png", bg: { r: 251, g: 249, b: 248, alpha: 0 } },
    { size: 512, name: "android-chrome-512x512.png", bg: { r: 251, g: 249, b: 248, alpha: 0 } },
  ];

  for (const { size, name, bg } of sizes) {
    const outPath = path.join(faviconDir, name);
    await sharp(source)
      .resize(size, size, { fit: "contain", background: bg })
      .png()
      .toFile(outPath);
    console.log(`  ✓ ${name} (${size}x${size}px)`);
  }

  // Copy standard files to public root
  fs.copyFileSync(path.join(faviconDir, "apple-touch-icon.png"), path.join(publicDir, "apple-touch-icon.png"));
  fs.copyFileSync(path.join(faviconDir, "favicon-16x16.png"), path.join(publicDir, "favicon-16x16.png"));
  fs.copyFileSync(path.join(faviconDir, "favicon-32x32.png"), path.join(publicDir, "favicon-32x32.png"));
  console.log("  ✓ Copied standard files to public root");

  // Also create the logo-derived sizes for /logos/
  const logoDir = path.join(publicDir, "logos");
  await sharp(source).resize(512, 512, { fit: "contain", background: { r: 251, g: 249, b: 248, alpha: 0 } }).png().toFile(path.join(logoDir, "icon-512.png"));
  await sharp(source).resize(192, 192, { fit: "contain", background: { r: 251, g: 249, b: 248, alpha: 0 } }).png().toFile(path.join(logoDir, "icon-192.png"));
  console.log("  ✓ Created logo sizes");

  // Create browserconfig.xml
  const browserconfig = `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
  <msapplication>
    <tile>
      <square150x150logo src="/favicons/mstile-150x150.png"/>
      <TileColor>#3D2314</TileColor>
    </tile>
  </msapplication>
</browserconfig>`;
  fs.writeFileSync(path.join(publicDir, "browserconfig.xml"), browserconfig);
  console.log("  ✓ Created browserconfig.xml");

  console.log("\nAll favicons generated!");
}

generateFavicons().catch(console.error);
