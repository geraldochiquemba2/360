const fs = require('fs');

const path = 'c:/Users/geral/Desktop/360/360/artifacts/carreira-360/src/pages/candidate/topic-view.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add "CRIADOR DO TÓPICO" label above the author initial box
const target = '<div className="h-20 w-20 sm:h-24 sm:w-24 bg-[#EBDCC6]';
const replacement = '<span className="text-[10px] font-black uppercase text-[#0EA5E9] tracking-widest block mb-4">Criador do Tópico</span>\n               <div className="h-20 w-20 sm:h-24 sm:w-24 bg-[#EBDCC6]';

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(path, content, 'utf8');
    console.log('Creator label added successfully.');
} else {
    console.log('Target string not found for creator label.');
}
