import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

// Import the local generation records without publishing machine/session paths.
// Existing local records remain unchanged in the ignored artifacts directory.
const names = ['image-prompts', 'campaign-images', 'unique-image-prompts', 'unique-image-plan', 'unique-image-sources', 'unique-campaign-images', 'wide-card-image-prompts', 'wide-card-image-sources', 'all-photo-fit-prompts', 'all-photo-fit-sources'];
const root = path.resolve('.');
async function portable(value) {
  if (Array.isArray(value)) return Promise.all(value.map(portable));
  if (!value || typeof value !== 'object') return value;
  const result = {};
  for (const [key, item] of Object.entries(value)) {
    if (typeof item === 'string' && /^[A-Z]:[\\/]/i.test(item)) {
      if (key === 'source' && value.id) {
        const candidates = [value.workspaceSource, `assets/generated/unique/${value.id}.png`, `assets/generated/${value.id}.png`].filter(Boolean);
        let original;
        for (const candidate of candidates) { try { await fs.access(candidate); original = candidate; break; } catch {} }
        assert(original, `Retained original missing for ${value.id}`);
        result[key] = original.replaceAll('\\', '/');
      } else {
        const relative = path.relative(root, item).replaceAll('\\', '/');
        assert(!relative.startsWith('../') && !/^[A-Z]:/i.test(relative), `Cannot publish external path field ${key}`);
        result[key] = relative;
      }
    } else result[key] = await portable(item);
  }
  return result;
}
await fs.mkdir('assets/metadata', { recursive: true });
for (const name of names) {
  const data = JSON.parse(await fs.readFile(`artifacts/${name}.json`, 'utf8'));
  await fs.writeFile(`assets/metadata/${name}.json`, JSON.stringify(await portable(data), null, 2) + '\n');
}
console.log(`Imported ${names.length} portable image metadata files; local source records retained.`);
