const fs = require('fs');
const path = 'c:/Users/geral/Desktop/360/360/artifacts/carreira-360/src/pages/candidate/topic-view.tsx';
let content = fs.readFileSync(path, 'utf8');

console.log('Original content length:', content.length);

// 1. Reduce overall wrapper padding
content = content.replace(/p-4 sm:p-6 pb-4/, 'p-3 sm:p-4 pb-3');

// 2. Reduce textarea min-height and padding
content = content.replace(/min-h-\[60px\] sm:min-h-\[80px\] rounded-3xl p-4 sm:p-6/, 'min-h-[50px] sm:min-h-[60px] rounded-2xl p-3 sm:p-4');

// 3. Reduce button height
content = content.replace(/h-14 sm:h-\[80px\] px-8 rounded-3xl/, 'h-12 sm:h-[60px] px-6 rounded-2xl');

fs.writeFileSync(path, content);
console.log('Modification complete: Height reduced');
