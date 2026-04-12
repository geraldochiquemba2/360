const fs = require('fs');

const path = 'c:/Users/geral/Desktop/360/360/artifacts/carreira-360/src/pages/candidate/topic-view.tsx';
let content = fs.readFileSync(path, 'utf8');

// Adjust author column padding in topic header
const target = 'className="md:w-[200px] shrink-0 flex flex-col items-center sm:items-start md:items-center text-center sm:text-left md:text-center md:border-r-4 border-[#8B4513]/40 md:pr-8"';
const replacement = 'className="md:w-[200px] shrink-0 flex flex-col items-center sm:items-start md:items-center text-center sm:text-left md:text-center md:border-r-4 border-[#8B4513]/40 md:pr-8 pt-6 md:pt-12"';

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(path, content, 'utf8');
    console.log('Author position updated successfully.');
} else {
    console.log('Target string not found for author position update.');
}
