const fs = require('fs');

const path = 'c:/Users/geral/Desktop/360/360/artifacts/carreira-360/src/pages/candidate/dashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

// Improve contrast for opportunity tags (EMPREGO, BOLSA, etc)
content = content.replace(
    /bg-\[#F97316\]\/10 text-\[#F97316\]/g,
    'bg-[#F97316]/20 text-[#F97316] border border-[#F97316]/30'
);
content = content.replace(
    /bg-\[#0EA5E9\]\/10 text-\[#0EA5E9\]/g,
    'bg-[#0EA5E9]/20 text-[#0EA5E9] border border-[#0EA5E9]/30'
);

// Improve contrast for dates
content = content.replace(
    'text-[#001F33]/30 font-bold',
    'text-[#001F33]/70 font-black'
);

fs.writeFileSync(path, content, 'utf8');
console.log('Dashboard opportunity visibility improved.');
