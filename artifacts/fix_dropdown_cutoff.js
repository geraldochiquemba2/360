const fs = require('fs');

const path = 'c:/Users/geral/Desktop/360/360/artifacts/carreira-360/src/pages/auth/register.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add max-h-[300px] to all SelectContent components to prevent them from hitting the screen edges
const selectContentRegex = /<SelectContent\s+className="([^"]*)"/g;
content = content.replace(selectContentRegex, (match, classes) => {
    if (!classes.includes('max-h-')) {
        return `<SelectContent className="${classes} max-h-[300px]"`;
    }
    return match;
});

fs.writeFileSync(path, content, 'utf8');
console.log('Added max-h-[300px] to all SelectContent in register.tsx');
