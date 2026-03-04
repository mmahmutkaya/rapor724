const fs = require('fs'), path = require('path');
const pd = 'src/pages';
const sd = fs.readdirSync(pd);
for (const s of sd) {
  const fp = path.join(pd, s, 'index.js');
  try {
    const lines = fs.readFileSync(fp, 'utf8').split('\n');
    const seen = {};
    lines.forEach((l, i) => {
      const m = l.match(/^import\s+(\{[^}]+\}|\w+)\s+from/);
      if (!m) return;
      // match both PascalCase and camelCase identifiers
      const names = (m[1].match(/\b[a-zA-Z]\w+\b/g) || []);
      for (const n of names) {
        if (!seen[n]) seen[n] = [];
        seen[n].push(i + 1);
      }
    });
    const dups = Object.entries(seen).filter(([, v]) => v.length > 1);
    if (dups.length) {
      console.log(fp + ':');
      dups.forEach(([n, ls]) => console.log('  ' + n + ' at lines ' + ls.join(', ')));
    }
  } catch (e) {}
}
