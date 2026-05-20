// Rasterizes public/favicon.svg into the PNG icons the PWA manifest needs.
// Run from the project root:  node scripts/generate-icons.mjs
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const svg = readFileSync(join(root, 'public', 'favicon.svg'));

const targets = [
  ['pwa-192x192.png', 192],
  ['pwa-512x512.png', 512],
  ['apple-touch-icon.png', 180],
];

for (const [name, size] of targets) {
  await sharp(svg)
    .resize(size, size)
    .flatten({ background: '#0b1220' })
    .png()
    .toFile(join(root, 'public', name));
  console.log('wrote public/' + name);
}
