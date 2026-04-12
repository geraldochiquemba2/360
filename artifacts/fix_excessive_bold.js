const fs = require('fs');

// 1. Fix Mentorship Page
const mentorshipPath = 'c:/Users/geral/Desktop/360/360/artifacts/carreira-360/src/pages/candidate/mentorship.tsx';
let mentorshipContent = fs.readFileSync(mentorshipPath, 'utf8');

mentorshipContent = mentorshipContent.replace(
    'text-lg font-display uppercase mb-2">Prepara-te para Brilhar</h3>',
    'text-[15px] font-black uppercase tracking-wider mb-2">Prepara-te para Brilhar</h3>'
);

mentorshipContent = mentorshipContent.replace(
    'text-[10px] font-bold uppercase tracking-widest text-[#F97316]">Dica da Carreira 360º</p>',
    'text-[9px] font-black uppercase tracking-[0.2em] text-[#F97316]">Dica da Carreira 360º</p>'
);

fs.writeFileSync(mentorshipPath, mentorshipContent, 'utf8');
console.log('Mentorship tip card legibility improved.');

// 2. Fix Sidebar (Consistency)
const sidebarPath = 'c:/Users/geral/Desktop/360/360/artifacts/carreira-360/src/components/layout/CandidateSidebar.tsx';
let sidebarContent = fs.readFileSync(sidebarPath, 'utf8');

sidebarContent = sidebarContent.replace(
    /font-bold text-xs h-12/g,
    'font-black text-[12px] tracking-wider h-12'
);

fs.writeFileSync(sidebarPath, sidebarContent, 'utf8');
console.log('CandidateSidebar legibility improved.');
