import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { pages, origin, pathFor } from '../src/routes.ts';

const root = path.resolve('dist');
const robots = await fs.readFile(path.join(root, 'robots.txt'), 'utf8');
assert(robots.includes('Allow: /') && !robots.includes('Disallow: /'), 'Build with VITE_SITE_INDEXABLE=true before preparing a release');
assert(robots.includes(`Sitemap: ${origin}/sitemap.xml`), 'Production sitemap origin differs');
for (const locale of ['en', 'ar']) for (const page of pages) {
  const html = await fs.readFile(path.join(root, locale, page, 'index.html'), 'utf8');
  assert(html.includes('name="robots" content="index, follow"'), `Production indexability ${pathFor(locale, page)}`);
  assert(!html.includes('name="robots" content="noindex'), `Unexpected preview meta ${pathFor(locale, page)}`);
  assert(html.includes(`rel="canonical" href="${origin + pathFor(locale, page)}"`), `Production canonical ${pathFor(locale, page)}`);
  if (page !== 'workplace-policy') assert(html.includes('id="decision-explorer"') && html.includes('id="decision-desk"'), `Latest content absent ${pathFor(locale, page)}`);
}
for (const file of ['404.html', 'en/404/index.html', 'ar/404/index.html']) {
  const html = await fs.readFile(path.join(root, file), 'utf8');
  assert(html.includes('name="robots" content="noindex, follow"'), `Error page must remain noindex ${file}`);
}
await fs.copyFile('docs/deployment/apache.htaccess', path.join(root, '.htaccess'));
const files = [];
async function walk(folder) {
  for (const entry of await fs.readdir(folder, { withFileTypes: true })) {
    const absolute = path.join(folder, entry.name);
    assert(!entry.isSymbolicLink(), `Do not ship symbolic links: ${absolute}`);
    if (entry.isDirectory()) await walk(absolute);
    else if (entry.isFile()) {
      const relative = path.relative(root, absolute).replaceAll('\\', '/');
      assert(!relative.split('/').some(part => ['src', 'node_modules', '.env', 'artifacts'].includes(part)), `Non-public file in release: ${relative}`);
      const bytes = await fs.readFile(absolute);
      files.push({ path: relative, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
    }
  }
}
await walk(root);
files.sort((a, b) => a.path.localeCompare(b.path));
assert(files.some(file => file.path === '.htaccess'), 'Hidden hosting file missing');
const manifest = {
  preparedAt: new Date().toISOString(), origin, status: 'prepared-not-deployed',
  canonicalPages: pages.length * 2, sourceDirectory: root,
  fileCount: files.length, totalBytes: files.reduce((sum, file) => sum + file.bytes, 0),
  deploymentGate: 'Verify the logged-in cPanel domain document root and existing .htaccess before uploading or extracting.',
  files,
};
await fs.mkdir('artifacts/release', { recursive: true });
await fs.writeFile('artifacts/release/production-manifest.json', JSON.stringify(manifest, null, 2));
console.log(`PASS: ${manifest.canonicalPages} indexable pages, non-indexable error pages, ${manifest.fileCount} public release files. Not deployed.`);
