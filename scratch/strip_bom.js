const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

const EXTS = new Set(['.ts', '.tsx', '.js', '.mjs', '.json', '.css']);
const SKIP = ['node_modules', '.next', '.git', '.vercel'];

function walk(dir) {
  let results = [];
  for (const name of fs.readdirSync(dir)) {
    if (SKIP.includes(name)) continue;
    const full = path.join(dir, name);
    try {
      const stat = fs.statSync(full);
      if (stat.isDirectory()) results = results.concat(walk(full));
      else if (EXTS.has(path.extname(name))) results.push(full);
    } catch (e) {}
  }
  return results;
}

let fixed = 0;
for (const f of walk(root)) {
  try {
    const buf = fs.readFileSync(f);
    if (buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF) {
      fs.writeFileSync(f, buf.slice(3));
      console.log('stripped BOM:', path.relative(root, f));
      fixed++;
    }
  } catch (e) {}
}
console.log(`\nDone. Fixed ${fixed} files.`);
