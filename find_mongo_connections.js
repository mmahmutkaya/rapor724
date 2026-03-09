const fs = require('fs');
const path = require('path');

// Search these locations for mdb.presetConnections
const settingsPaths = [
  'C:\\Users\\Admin\\AppData\\Roaming\\Code\\User\\settings.json',
  'C:\\github\\rapor724\\.vscode\\settings.json',
  'C:\\github\\excelMongo\\.vscode\\settings.json',
  'C:\\mahmut\\excelMongo\\.vscode\\settings.json',
  'C:\\mahmut\\rapor724-1\\.vscode\\settings.json',
  'C:\\mahmut\\rapor724\\.vscode\\settings.json',
];

console.log('=== Searching for mdb.presetConnections ===\n');

let found = false;
for (const p of settingsPaths) {
  try {
    const content = fs.readFileSync(p, 'utf8');
    if (content.includes('presetConnections')) {
      console.log('FOUND in:', p);
      console.log('Content:', content);
      found = true;
    } else {
      console.log('Not in:', p);
    }
  } catch(e) {
    console.log('Cannot read:', p, '-', e.code);
  }
}

if (!found) {
  console.log('\nNot found in known locations. Checking all workspace state.vscdb files...');

  // Also check if a preset connection is stored in workspace state
  const workspacePaths = [
    'C:\\Users\\Admin\\AppData\\Roaming\\Code\\User\\workspaceStorage\\56dfdb98724f1e79c92967a9789923b9\\state.vscdb',
    'C:\\Users\\Admin\\AppData\\Roaming\\Code\\User\\workspaceStorage\\5c44c8f21522ad1001588e3fb0070f52\\state.vscdb',
    'C:\\Users\\Admin\\AppData\\Roaming\\Code\\User\\workspaceStorage\\196af2e342c67e70f0f5dfe7ec1fde22\\state.vscdb',
    'C:\\Users\\Admin\\AppData\\Roaming\\Code\\User\\workspaceStorage\\967d8f0ec1e5e224e9e51096d54959c6\\state.vscdb',
    'C:\\Users\\Admin\\AppData\\Roaming\\Code\\User\\workspaceStorage\\dee498c9dda1c45d178e1e60ba985d71\\state.vscdb',
  ];

  for (const p of workspacePaths) {
    try {
      const buf = fs.readFileSync(p);
      const text = buf.toString('utf8');
      if (text.includes('presetConnections') || text.includes('Preset Connection')) {
        console.log('\nFOUND in workspace state:', p);
        const idx = text.indexOf('Preset Connection');
        if (idx >= 0) {
          console.log('Context:', text.substring(Math.max(0, idx-100), idx+200).replace(/[\x00-\x1F]/g, ' '));
        }
      }
    } catch(e) {
      console.log('Cannot read:', p, '-', e.code);
    }
  }
}
