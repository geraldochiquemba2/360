const fs = require('fs');
const path = require('path');

const projectRoot = 'c:/Users/geral/Desktop/360/360/artifacts/carreira-360/src/pages/candidate';
const files = ['dashboard.tsx', 'opportunities-list.tsx', 'tracks-list.tsx'];

files.forEach(file => {
    const filePath = path.join(projectRoot, file);
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix 1: Change items-center to items-start on mobile for opportunity cards
    // This prevents the content from being shifted/centered awkwardly when stacked
    content = content.replace(
        'items-center"',
        'items-start md:items-center"'
    );
    
    // Fix 2: Ensure the text container inside the card is w-full
    content = content.replace(
        'flex-1">',
        'flex-1 w-full">'
    );

    // Fix 3: Ensure labels container is responsive
    content = content.replace(
        'justify-between items-center"',
        'justify-between items-start md:items-center"'
    );

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Improved responsiveness in ${file}`);
});
