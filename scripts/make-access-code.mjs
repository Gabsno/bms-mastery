// Generates the SHA-256 hash for the access-gate code.
//
// Usage:
//   node scripts/make-access-code.mjs "your new code"
//
// Copy the printed hash into ACCESS_CODE_HASH in src/config.js.
// The plain code is never stored in the project — only its hash.
import { createHash } from 'node:crypto';

const code = process.argv[2];
if (!code) {
  console.error('Usage: node scripts/make-access-code.mjs "your code"');
  process.exit(1);
}

const hash = createHash('sha256').update(code, 'utf8').digest('hex');
console.log('Access code : ' + code);
console.log('Hash        : ' + hash);
console.log('\nPaste the hash into ACCESS_CODE_HASH in src/config.js.');
