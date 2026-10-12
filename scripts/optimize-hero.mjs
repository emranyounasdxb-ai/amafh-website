import sharp from 'sharp';
import { stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const source = new URL('../assets/source/hero.png', import.meta.url);
const destination = new URL('../public/images/hero.webp', import.meta.url);
await sharp(await import('node:fs/promises').then(fs => fs.readFile(source)))
  .resize({ width: 1440, withoutEnlargement: true })
  .webp({ quality: 86, effort: 6 })
  .toFile(fileURLToPath(destination));
const [original, optimized] = await Promise.all([stat(source), stat(destination)]);
console.log(`Hero: ${original.size} -> ${optimized.size} bytes (${Math.round((1 - optimized.size / original.size) * 100)}% smaller).`);
