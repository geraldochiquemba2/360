const fs = require('fs');

const path = 'c:/Users/geral/Desktop/360/360/artifacts/carreira-360/src/pages/candidate/dashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

// Improve legibility of training highlights by adding letter spacing and adjusting font pressure
content = content.replace(
    /font-bold uppercase text-sm mt-1">Liderança em Ambientes Digitais<\/h4>/g,
    'font-black uppercase text-[12px] tracking-wider text-[#001F33] mt-1">Liderança em Ambientes Digitais</h4>'
);

content = content.replace(
    /font-bold uppercase text-sm mt-1">Domínio de Soft Skills 2026<\/h4>/g,
    'font-black uppercase text-[12px] tracking-wider text-[#001F33] mt-1">Domínio de Soft Skills 2026</h4>'
);

fs.writeFileSync(path, content, 'utf8');
console.log('Training highlights legibility improved.');
