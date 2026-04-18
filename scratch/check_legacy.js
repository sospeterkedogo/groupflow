
import fs from 'fs';
import path from 'path';

const legacyStrings = [
  'Multiplayer active',
  'Drag and drop to collaborate',
  'Researcher',
  'Mission Protocol',
  'Roster',
  'Independent Specialist',
  'distributed modules',
  'academic field',
  'System sync'
];

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  legacyStrings.forEach(str => {
    if (content.toLowerCase().includes(str.toLowerCase())) {
      console.log(`Found "${str}" in ${filePath}`);
    }
  });
}

function traverse(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        traverse(fullPath);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      checkFile(fullPath);
    }
  });
}

traverse('src');
