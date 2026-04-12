const fs = require('fs');

const path = 'c:/Users/geral/Desktop/360/360/artifacts/carreira-360/src/pages/candidate/topic-view.tsx';
let content = fs.readFileSync(path, 'utf8');

// Align author column to the bottom (where media usually is)
const target = 'className="md:w-[200px] shrink-0 flex flex-col items-center sm:items-start md:items-center text-center sm:text-left md:text-center md:border-r-4 border-[#8B4513]/40 md:pr-8 pt-6 md:pt-12"';
const replacement = 'className="md:w-[200px] shrink-0 flex flex-col items-center sm:items-start md:items-center text-center sm:text-left md:text-center md:border-r-4 border-[#8B4513]/40 md:pr-8 pt-6 md:pt-12 md:justify-end md:pb-12"';

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(path, content, 'utf8');
    console.log('Author alignment updated to bottom.');
} else {
    console.log('Target string not found for author alignment update.');
}
