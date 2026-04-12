const fs = require('fs');

const path = 'c:/Users/geral/Desktop/360/360/artifacts/carreira-360/src/pages/candidate/mentorship.tsx';
let content = fs.readFileSync(path, 'utf8');

// Fix contrast for empty state "No mentors"
content = content.replace(
    'italic text-[#001F33]/30"',
    'font-black uppercase tracking-widest text-xs text-[#001F33]/60"'
);

// Fix contrast for empty state "No sessions"
content = content.replace(
    'text-[#001F33]/30 tracking-widest"',
    'text-[#001F33]/70 tracking-widest"'
);

fs.writeFileSync(path, content, 'utf8');
console.log('Mentorship empty states contrast improved.');
