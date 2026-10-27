import fs from 'node:fs/promises';
import { pages } from '../../src/routes.ts';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const exec = promisify(execFile);
const origin = 'https://amafhdubai.ae';
const releaseRoot = path.resolve('dist');
const evidenceRoot = path.resolve('artifacts/deployment');
const approvedHostingConfig = 'bfb806291904a4fdbb2126804ef489c27404bd5c2095cef9142bbac9fee6037b';
const beginMarker = '\n# BEGIN AMAFH STATIC WEBSITE\n';
const endMarker = '# END AMAFH STATIC WEBSITE\n';
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const configQuote = value => `"${value.replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`;

async function validateRelease() {
  const release = JSON.parse(await fs.readFile('artifacts/release/production-manifest.json', 'utf8'));
  assert.equal(release.origin, origin, 'Unexpected production origin');
  assert.equal(release.canonicalPages, pages.length * 2, 'Incomplete bilingual release');
  assert.equal(release.fileCount, release.files.length, 'Invalid release file count');
  assert.equal(new Set(release.files.map(file => file.path)).size, release.files.length, 'Duplicate release paths');
  for (const file of release.files) {
    assert(!file.path.startsWith('/') && !file.path.includes('\\'), 'Unsafe release path');
    assert(file.path.split('/').every(part => part && part !== '.' && part !== '..'), 'Unsafe release path');
    assert(!/(^|\/)(\.git|\.env[^/]*|node_modules|src|artifacts)(\/|$)/.test(file.path), 'Private file in release');
    const absolute = path.resolve(releaseRoot, file.path);
    assert(absolute.startsWith(releaseRoot + path.sep), 'Release file outside dist');
    const stat = await fs.lstat(absolute);
    assert(stat.isFile() && !stat.isSymbolicLink(), 'Release contains a non-regular file');
    const bytes = await fs.readFile(absolute);
    assert.equal(bytes.length, file.bytes, `Release file size changed: ${file.path}`);
    assert.equal(sha256(bytes), file.sha256, `Release file content changed: ${file.path}`);
  }
  assert(release.files.some(file => file.path === '.htaccess'), 'Missing Apache configuration');
  assert(release.files.some(file => /^assets\/index-[\w-]+\.css$/.test(file.path)), 'Missing fingerprinted stylesheet');
  console.log(`Validated ${release.files.length} production files and ${release.canonicalPages} bilingual pages.`);
  return release;
}

async function verifyPublicFiles(files, commit) {
  let next = 0;
  let verified = 0;
  const failures = [];
  await Promise.all(Array.from({ length: Math.min(4, files.length) }, async () => {
    while (next < files.length) {
      const file = files[next++];
      const publicPath = file.path.endsWith('/index.html') ? file.path.slice(0, -10) : file.path;
      const url = new URL(publicPath, origin + '/');
      url.searchParams.set('release', commit);
      try {
        const response = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0', Accept: '*/*', 'Cache-Control': 'no-cache' },
          signal: AbortSignal.timeout(45000),
        });
        assert.equal(response.status, 200, `HTTP ${response.status}: ${publicPath}`);
        const bytes = Buffer.from(await response.arrayBuffer());
        assert.equal(bytes.length, file.bytes, `Public file size mismatch: ${publicPath}`);
        assert.equal(sha256(bytes), file.sha256, `Public file hash mismatch: ${publicPath}`);
        verified++;
        if (verified % 40 === 0 || verified === files.length) console.log(`HTTPS verified ${verified}/${files.length} files.`);
      } catch (error) {
        failures.push(`${publicPath}: ${error.message}`);
      }
    }
  }));
  assert.equal(failures.length, 0, `Live verification failed:\n${failures.join('\n')}`);
  return verified;
}

async function deploy(release) {
  assert.equal(process.env.GITHUB_REF, 'refs/heads/main', 'Only main may deploy');
  const commit = process.env.GITHUB_SHA;
  assert(/^[a-f0-9]{40}$/.test(commit || ''), 'Missing exact GitHub release commit');
  const server = process.env.FTP_SERVER;
  const port = process.env.FTP_PORT;
  const username = process.env.FTP_USERNAME;
  const password = process.env.FTP_PASSWORD;
  assert(/^[a-zA-Z0-9.-]+$/.test(server || ''), 'Invalid FTP server');
  assert(/^\d+$/.test(port || '') && Number(port) > 0 && Number(port) <= 65535, 'Invalid FTP port');
  assert(username && password && !/[\r\n]/.test(username + password), 'Missing or invalid FTP credentials');
  const ftpRoot = `ftp://${server}:${port}/`;
  const temporary = await fs.mkdtemp(path.join(os.tmpdir(), 'amafh-ftps-'));
  await fs.mkdir(evidenceRoot, { recursive: true });
  const auth = path.join(temporary, 'auth.conf');
  await fs.writeFile(auth, `user = ${configQuote(`${username}:${password}`)}\n`, { mode: 0o600 });
  const safeError = value => [password, username, server].reduce((text, secret) => text.replaceAll(secret, '***'), String(value));
  const common = ['--fail', '--silent', '--show-error', '--ssl-reqd', '--ftp-pasv', '--globoff',
    '--connect-timeout', '20', '--max-time', '120', '--config', auth];
  async function curl(args) {
    try {
      return await exec('curl', [...common, ...args], { maxBuffer: 1024 * 1024 });
    } catch (error) {
      throw new Error(`FTPS transfer failed (curl ${error.code}): ${safeError(error.stderr || 'No diagnostic returned')}`);
    }
  }
  async function upload(files, label) {
    for (let start = 0; start < files.length; start += 60) {
      const batch = files.slice(start, start + 60);
      const config = path.join(temporary, 'uploads.conf');
      await fs.writeFile(config, batch.map(file =>
        `url = ${configQuote(ftpRoot + file.path.split('/').map(encodeURIComponent).join('/'))}\n` +
        `upload-file = ${configQuote(path.join(releaseRoot, file.path))}\n`).join(''), { mode: 0o600 });
      await curl(['--fail-early', '--ftp-create-dirs',
        '--retry', '2', '--retry-delay', '2', '--config', config]);
      console.log(`${label}: uploaded ${Math.min(start + batch.length, files.length)}/${files.length} files.`);
    }
  }
  try {
    const listing = await curl(['--list-only', ftpRoot]);
    const names = listing.stdout.split(/\r?\n/).filter(Boolean);
    const allowed = new Set(['.', '..', '.well-known', 'cgi-bin', '.ftpquota', ...release.files.map(file => file.path.split('/')[0])]);
    assert(names.every(name => allowed.has(name)), 'Unexpected existing FTP root files require review before deployment');
    await fs.writeFile(path.join(evidenceRoot, 'root-files.json'), JSON.stringify(names, null, 2));
    const originalPath = path.join(evidenceRoot, 'existing.htaccess');
    await curl(['--output', originalPath, ftpRoot + '.htaccess']);
    const existing = await fs.readFile(originalPath, 'utf8');
    const original = existing.includes(beginMarker) ? existing.split(beginMarker)[0] : existing;
    if (existing.includes(beginMarker)) assert(existing.endsWith(endMarker) && existing.split(beginMarker).length === 2, 'Unexpected hosting configuration after AMAFH rules');
    assert.equal(sha256(Buffer.from(original)), approvedHostingConfig, 'Existing cPanel directives changed; review required');
    const apacheRules = await fs.readFile(path.join(releaseRoot, '.htaccess'), 'utf8');
    const merged = original + beginMarker + apacheRules.trimEnd() + '\n' + endMarker;
    await fs.writeFile(path.join(releaseRoot, '.htaccess'), merged);
    await fs.writeFile(path.join(evidenceRoot, 'deployed.htaccess'), merged);
    const htaccess = { path: '.htaccess', bytes: Buffer.byteLength(merged), sha256: sha256(Buffer.from(merged)) };
    console.log('Reviewed cPanel configuration preserved; no remote deletion commands are used.');

    // Prove the FTP account root serves the approved domain before the bulk upload.
    const proof = release.files.find(file => /^assets\/index-[\w-]+\.css$/.test(file.path));
    await upload([proof], 'Document root proof');
    await verifyPublicFiles([proof], commit);
    console.log('FTP destination verified against the live domain by SHA256.');

    const assets = release.files.filter(file => file.path !== '.htaccess' && !file.path.endsWith('.html'));
    const pages = release.files.filter(file => file.path.endsWith('.html'));
    await upload(assets.filter(file => file !== proof), 'Assets');
    await verifyPublicFiles(assets, commit);
    await upload(pages, 'HTML pages');
    await upload([htaccess], 'Apache configuration');
    const uploadedConfig = path.join(temporary, 'remote.htaccess');
    await curl(['--output', uploadedConfig, ftpRoot + '.htaccess']);
    assert.equal(sha256(await fs.readFile(uploadedConfig)), htaccess.sha256, 'Remote Apache configuration differs');
    await verifyPublicFiles(pages, commit);

    const headers = { 'User-Agent': 'Mozilla/5.0', Accept: 'text/html', 'Cache-Control': 'no-cache' };
    const homepage = await fetch(origin + '/', { headers, signal: AbortSignal.timeout(30000) });
    assert.equal(homepage.status, 200, 'Homepage unavailable');
    assert.equal(new URL(homepage.url).pathname, '/en/', 'Missing root language redirect');
    const www = await fetch('https://www.amafhdubai.ae/', { headers, signal: AbortSignal.timeout(30000) });
    assert.equal(www.status, 200, 'WWW entry point unavailable');
    assert.equal(new URL(www.url).origin, origin, 'Missing WWW canonical redirect');
    const http = await fetch('http://amafhdubai.ae/', { headers, signal: AbortSignal.timeout(30000) });
    assert.equal(http.status, 200, 'HTTP entry point unavailable');
    assert.equal(new URL(http.url).protocol, 'https:', 'Missing HTTPS redirect');
    const missing = await fetch(`${origin}/amafh-release-check-missing-${commit}/`, { headers, signal: AbortSignal.timeout(30000) });
    assert.equal(missing.status, 404, 'Missing-page response must be HTTP 404');
    assert((await missing.text()).includes('noindex, follow'), 'Missing custom non-indexable 404 page');

    const report = { deployedAt: new Date().toISOString(), origin, commit, workflowRun: process.env.GITHUB_RUN_ID,
      status: 'deployed-and-https-verified', canonicalPages: release.canonicalPages, publicFilesVerified: assets.length + pages.length,
      serverFilesDeleted: 0, hostingDirectivesPreserved: true, htaccess, files: release.files.filter(file => file.path !== '.htaccess') };
    await fs.writeFile(path.join(evidenceRoot, 'deployment.json'), JSON.stringify(report, null, 2));
    console.log(`PASS: deployed commit ${commit}; ${report.publicFilesVerified} public files match the release over HTTPS.`);
    console.log(`PASS: ${release.canonicalPages} bilingual pages, canonical redirects and custom HTTP 404 verified.`);
    if (process.env.GITHUB_STEP_SUMMARY) await fs.appendFile(process.env.GITHUB_STEP_SUMMARY,
      `## AMAFH production deployment\n\n- Website: ${origin}\n- Commit: \`${commit}\`\n- Pages: ${release.canonicalPages} (English + Arabic)\n- Public files verified by SHA256: ${report.publicFilesVerified}\n- Existing cPanel directives preserved\n- Remote files deleted: 0\n`);
  } finally {
    await fs.rm(temporary, { recursive: true, force: true });
  }
}

try {
  const release = await validateRelease();
  if (!process.argv.includes('--validate-only')) await deploy(release);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
