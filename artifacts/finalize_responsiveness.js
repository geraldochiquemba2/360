const fs = require('fs');
const path = require('path');

const projectRoot = 'c:/Users/geral/Desktop/360/360/artifacts/carreira-360/src/pages/candidate';
const files = ['dashboard.tsx', 'opportunities-list.tsx', 'tracks-list.tsx'];

files.forEach(file => {
    const filePath = path.join(projectRoot, file);
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix 1: Remove 'flex' from the root container to prevent ghost margins with the fixed sidebar
    content = content.replace(
        'flex font-sans text-[#001F33] relative overflow-x-hidden',
        'block font-sans text-[#001F33] relative overflow-x-hidden'
    );
    
    // Fix 2: Ensure the main element takes full width on mobile
    content = content.replace(
        'className="flex-1 md:ml-72 min-h-screen"',
        'className="w-full md:pl-72 min-h-screen"'
    );
    
    // Fix 3: Ensure the header container is also full-width and doesn't conflict
    content = content.replace(
        'className="w-full md:ml-72 min-h-screen"', // in case I already ran it
        'className="w-full md:pl-72 min-h-screen"'
    );

    // Fix 4: If we used md:ml-72, let's use md:pl-72 instead to be safer with fixed sidebars
    content = content.replace(
        'md:ml-72',
        'md:pl-72'
    );

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Finalized responsiveness in ${file}`);
});
