import fs from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';

const staged = execFileSync('git', ['diff', '--cached', '--name-only', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
assert(staged.length, 'Nothing is staged for the repository import');
const denied = /(^|\/)(?:node_modules|dist|artifacts|\.local|\.env[^/]*)(?:\/|$)|\.(?:pem|key|log)$/i;
const signatures = [
  ['private-key', /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/],
  ['github-token', /(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{60,})/],
  ['openai-token', /sk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{30,}/],
  ['aws-access-key', /(?:AKIA|ASIA)[A-Z0-9]{16}/],
  ['slack-token', /xox[baprs]-[A-Za-z0-9-]{24,}/],
  ['credential-in-url', /https?:\/\/[^\s/]+:[^\s/@]+@/],
];
let textFiles = 0, totalBytes = 0;
const findings = [];
for (const file of staged) {
  if (denied.test(file)) findings.push({ file, reason: 'excluded local/private path' });
  const size = (await fs.stat(file)).size;
  totalBytes += size;
  if (size >= 100 * 1024 * 1024) findings.push({ file, reason: 'GitHub file-size limit' });
  if (!/\.(?:ts|mjs|css|html|json|md|svg|htaccess)$|(?:^|\/)\.git(?:ignore|attributes)$/.test(file)) continue;
  const content = execFileSync('git', ['show', `:${file}`], { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
  textFiles++;
  for (const [reason, signature] of signatures) if (signature.test(content)) findings.push({ file, reason });
  if (/\b[A-Z]:[\\/](?:Users|Projects)[\\/]/i.test(content)) findings.push({ file, reason: 'machine-specific absolute path' });
}
await fs.mkdir('artifacts', { recursive: true });
await fs.writeFile('artifacts/github-staging-audit.json', JSON.stringify({ checkedAt: new Date().toISOString(), stagedFiles: staged.length, textFiles, totalBytes, findings, limits: 'Signature and path preflight, not a comprehensive security audit.' }, null, 2));
assert.equal(findings.length, 0, `Staging preflight failed: ${JSON.stringify(findings)}`);
console.log(`PASS: ${staged.length} explicitly staged files; ${textFiles} text files checked; no excluded paths, detected secret signatures, absolute machine paths or oversized files.`);
