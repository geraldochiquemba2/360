const fs = require('fs');
const path = require('path');

const projectRoot = 'c:/Users/geral/Desktop/360/360/artifacts/carreira-360/src/pages/candidate';
const files = ['dashboard.tsx', 'opportunities-list.tsx', 'tracks-list.tsx'];

files.forEach(file => {
    const filePath = path.join(projectRoot, file);
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix 1: Remove fixed max-width and truncate from the Page Title to prevent clipping on mobile
    content = content.replace(
        'truncate max-w-[180px] sm:max-w-none">',
        'leading-tight">'
    );
    
    // Fix 2: Remove truncate from the Welcome message and ensure it wraps nicely
    content = content.replace(
        'truncate text-xs sm:text-base">',
        'text-xs sm:text-base leading-relaxed">'
    );
    
    // Fix 3: For the welcome message, let's remove truncate and ensure it can span multiple lines if needed
    // The previous replace might have been specific, let's try a broader one for the 'p' tag in headers
    content = content.replace(
        'truncate text-xs sm:text-base">Bem-vindo',
        'text-xs sm:text-base leading-relaxed">Bem-vindo'
    );

    // Fix 4: Ensure the parent div of the text doesn't constrain it too much
    content = content.replace(
        '<div>\n              <h1',
        '<div className="flex-1 min-w-0">\n              <h1'
    );

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Optimized header responsiveness in ${file}`);
});
