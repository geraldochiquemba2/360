const fs = require('fs');
const path = require('path');

const srcDir = 'c:/Users/geral/Desktop/360/360/artifacts/carreira-360/src';
const oldColor = /#F5F0E8/gi; 
const newColor = '#EBDCC6';

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            walkDir(filePath);
        } else if (filePath.endsWith('.tsx') || filePath.endsWith('.css') || filePath.endsWith('.ts')) {
            let content = fs.readFileSync(filePath, 'utf8');
            if (oldColor.test(content)) {
                console.log(`Replacing color in: ${filePath}`);
                const newContent = content.replace(oldColor, newColor);
                fs.writeFileSync(filePath, newContent);
            }
        }
    });
}

console.log('Starting global color migration...');
walkDir(srcDir);
console.log('Migration complete!');
