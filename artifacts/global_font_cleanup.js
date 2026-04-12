const fs = require('fs');
const path = require('path');

const srcDir = 'c:/Users/geral/Desktop/360/360/artifacts/carreira-360/src';

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

const allFiles = getAllFiles(srcDir);

allFiles.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // 1. Replace super bold weights
  content = content.replace(/font-black/g, 'font-bold');
  content = content.replace(/font-extrabold/g, 'font-bold');
  
  // 2. Reduce font-display usage if it was used for weight (it's now Inter anyway, but let's be clean)
  // content = content.replace(/font-display/g, 'font-sans'); // Optional, keep if display has other styles

  // 3. Specifically look for uppercase + font-bold combinations that were previously font-black
  // and maybe turn them into just font-bold without uppercase for readability if they are long
  // For now, let's stick to reducing the weight first as requested.

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated legibility in: ${path.relative(srcDir, filePath)}`);
  }
});
