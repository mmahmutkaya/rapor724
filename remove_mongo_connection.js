const fs = require('fs');

const dbPath = 'C:\\Users\\Admin\\AppData\\Roaming\\Code\\User\\globalStorage\\state.vscdb';
const buf = fs.readFileSync(dbPath);

// Use utf8 but handle errors
const text = buf.toString('utf8');

// Find the connection entry by UUID
const connId = '89c82b35-5d2e-4ed7-acb5-937d1d98b275';
const idx = text.indexOf(connId);
if (idx === -1) {
  console.log('Connection ID not found. Searching for connectionString...');
  const idx2 = text.indexOf('serverless1.bzqa6.mongodb.net');
  console.log('serverless1 found at:', idx2);
  process.exit(1);
}

console.log('Connection ID found at index:', idx);

// Find GLOBAL_SAVED_CONNECTIONS from before this index
const gscMarker = '"GLOBAL_SAVED_CONNECTIONS":';
const gscIdx = text.lastIndexOf(gscMarker, idx);
console.log('GLOBAL_SAVED_CONNECTIONS found at:', gscIdx);

// Find the opening brace of GLOBAL_SAVED_CONNECTIONS value
const gscStart = gscIdx + gscMarker.length;
console.log('GSC value starts at:', gscStart, '-> char:', buf[gscStart]);

// Find the matching closing brace
let depth = 0;
let gscEnd = -1;
for (let i = gscStart; i < text.length; i++) {
  if (text[i] === '{') depth++;
  else if (text[i] === '}') {
    depth--;
    if (depth === 0) {
      gscEnd = i + 1;
      break;
    }
  }
}

console.log('GSC value ends at:', gscEnd);
console.log('GSC value:', text.substring(gscStart, gscEnd));

const originalSegment = gscMarker + text.substring(gscStart, gscEnd);
const replacementSegment = '"GLOBAL_SAVED_CONNECTIONS":{}';
const padding = ' '.repeat(originalSegment.length - replacementSegment.length);
const paddedReplacement = '"GLOBAL_SAVED_CONNECTIONS":{' + padding + '}';

console.log('\nOriginal length:', originalSegment.length);
console.log('Replacement length:', paddedReplacement.length);
console.log('Replacement:', paddedReplacement.substring(0, 60) + '...');

// Find exact byte position in buffer
const origBytes = Buffer.from(originalSegment, 'utf8');
let bufPos = -1;
for (let i = gscIdx - 10; i < gscIdx + 10; i++) {
  let match = true;
  for (let j = 0; j < Math.min(30, origBytes.length); j++) {
    if (buf[i + j] !== origBytes[j]) { match = false; break; }
  }
  if (match) { bufPos = i; break; }
}

if (bufPos === -1) {
  console.log('\nERROR: Could not locate exact bytes. No changes made.');
  process.exit(1);
}

console.log('\nFound at buffer position:', bufPos);

// Backup
const backupPath = dbPath + '.bak_' + Date.now();
fs.copyFileSync(dbPath, backupPath);
console.log('Backup created:', backupPath);

// Apply replacement
const newBuf = Buffer.from(buf);
const replBytes = Buffer.from(paddedReplacement, 'utf8');
replBytes.copy(newBuf, bufPos);
fs.writeFileSync(dbPath, newBuf);
console.log('\nSUCCESS! Connection removed.');
console.log('Lütfen VS Code\'u yeniden başlatın.');
