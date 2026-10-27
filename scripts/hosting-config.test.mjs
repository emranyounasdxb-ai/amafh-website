import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { mergeHostingConfig, beginMarker, endMarker } from '../.github/scripts/hosting-config.mjs';

const reviewed = await fs.readFile(new URL('../docs/deployment/reviewed-cpanel-php85.htaccess', import.meta.url), 'utf8');
const rules = await fs.readFile(new URL('../docs/deployment/apache.htaccess', import.meta.url), 'utf8');

test('reviewed PHP 8.5 hosting configuration stays byte-for-byte unchanged', () => {
  assert.equal(mergeHostingConfig(reviewed, rules), reviewed);
});

test('only AMAFH managed rules change; cPanel PHP handler stays in place', () => {
  const replacement = rules + '\n# reviewed website rule change\n';
  const updated = mergeHostingConfig(reviewed, replacement);
  assert.equal(updated.split(endMarker)[1], reviewed.split(endMarker)[1]);
  assert.equal(updated.split(beginMarker)[0], reviewed.split(beginMarker)[0]);
  assert(updated.includes(replacement.trimEnd()));
});

test('unreviewed PHP versions and extra hosting directives stop deployment', () => {
  for (const changed of [reviewed.replaceAll('ea-php85', 'ea-php84'), reviewed + '\nOptions +Indexes\n', '']) {
    assert.throws(() => mergeHostingConfig(changed, rules), /review required/);
  }
});

test('missing, repeated and out-of-order markers stop deployment', () => {
  for (const changed of [reviewed.replace(endMarker, ''), reviewed + beginMarker, reviewed + endMarker, endMarker + beginMarker]) {
    assert.throws(() => mergeHostingConfig(changed, rules));
  }
});
