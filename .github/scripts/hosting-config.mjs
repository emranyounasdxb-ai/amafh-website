import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

export const beginMarker = '\n# BEGIN AMAFH STATIC WEBSITE\n';
export const endMarker = '# END AMAFH STATIC WEBSITE\n';
const hash = value => createHash('sha256').update(value).digest('hex');
const reviewedPhp85Hash = 'f1595a72d369e70524b3aa9d8ee7eb0af48ae133cdab3b08e87328da0b6a65d7';
const originalHostingHash = 'bfb806291904a4fdbb2126804ef489c27404bd5c2095cef9142bbac9fee6037b';

// The exact cPanel PHP 8.5 configuration reviewed from the failed deployment.
// Unknown changes must still stop deployment for review.
export function mergeHostingConfig(existing, apacheRules) {
  if (existing.includes(beginMarker)) {
    assert.equal(existing.split(beginMarker).length, 2, 'Duplicate AMAFH start marker');
    assert.equal(existing.split(endMarker).length, 2, 'Missing or duplicate AMAFH end marker');
    const start = existing.indexOf(beginMarker);
    const end = existing.indexOf(endMarker) + endMarker.length;
    assert(end > start + beginMarker.length, 'Invalid AMAFH marker order');
    const before = existing.slice(0, start);
    const after = existing.slice(end);
    const legacy = after === '' && hash(before) === originalHostingHash;
    assert(legacy || hash(existing) === reviewedPhp85Hash, 'Existing cPanel directives changed; review required');
    return before + beginMarker + apacheRules.trimEnd() + '\n' + endMarker + after;
  }
  assert.equal(hash(existing), originalHostingHash, 'Existing cPanel directives changed; review required');
  return existing + beginMarker + apacheRules.trimEnd() + '\n' + endMarker;
}
