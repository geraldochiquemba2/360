const fs = require('fs');
const path = require('path');

const filesToFix = [
  'artifacts/carreira-360/src/pages/candidate/forum-home.tsx',
  'artifacts/carreira-360/src/pages/candidate/topic-view.tsx',
  'artifacts/carreira-360/src/pages/candidate/mentorship.tsx'
];

filesToFix.forEach(relPath => {
  const filePath = path.join(process.cwd(), relPath);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Icons
  if (!content.includes('Menu,')) {
    content = content.replace(/Users,/g, 'Users, Menu, X,');
    content = content.replace(/LayoutDashboard,/g, 'LayoutDashboard, Menu, X,');
  }

  // 2. State
  if (!content.includes('isSidebarOpen')) {
    content = content.replace(/export default function .*?\{/, (match) => match + '\n  const [isSidebarOpen, setIsSidebarOpen] = useState(false);');
  }

  // 3. Sidebar Shell
  const sidebarMatch = /<aside className="w-64[\s\S]*?<nav/.exec(content);
  if (sidebarMatch) {
    const responsiveSidebar = `
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={\`w-72 bg-[#001F33] text-white flex flex-col h-screen fixed top-0 left-0 z-40 transform transition-transform duration-300 \${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0\`}>
        <div className="p-8 border-b border-white/10 relative flex items-center justify-between">
          <img src="/assets/logo.png" className="h-14 w-auto object-contain" alt="Logo" />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-white/50 hover:text-white"
          >
            <X size={24} />
          </Button>
        </div>
        <nav`;
    content = content.replace(/<aside className="w-64[\s\S]*?<nav/, responsiveSidebar);
  }

  // 4. Main Padding and Fixed margins
  content = content.replace(/className="flex-1 ml-64 p-10"/g, 'className="flex-1 md:ml-72 p-6 sm:p-10"');
  content = content.replace(/className="flex-1 ml-64 p-8"/g, 'className="flex-1 md:ml-72 p-6 sm:p-8"');
  content = content.replace(/flex-1 ml-64 p-10/g, 'flex-1 md:ml-72 p-6 sm:p-10'); // handles without quotes if any

  // 5. Header Toggle - Very surgical
  const menuBtn = `
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden text-[#001F33]"
          >
            <Menu size={24} />
          </Button>`;

  if (!content.includes('setIsSidebarOpen(true)')) {
     // Mentorship and ForumHome have different headers
     if (relPath.includes('mentorship') || relPath.includes('forum-home')) {
        content = content.replace(/<header className="([\s\S]*?)">([\s\S]*?)<div>/, (match, cls, start) => {
           return `<header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-12 p-6 md:p-0 backdrop-blur-md md:backdrop-blur-none sticky top-0 md:relative z-20 md:z-auto bg-white/80 md:bg-transparent border-b md:border-none border-[#8B4513]/20">\n<div className="flex items-center gap-4">${menuBtn}<div>`;
        });
        // We added a div, must close it
        content = content.replace(/<\/header>/, '</div>\n        </header>');
     } else if (relPath.includes('topic-view')) {
        content = content.replace(/<main className="([\s\S]*?)">/, (match, cls) => {
           return `<main className="flex-1 md:ml-72 p-6 sm:p-10">\n<div className="flex items-center gap-4 md:hidden mb-6">\n${menuBtn}\n<span className="font-display uppercase text-[#001F33]">Tópico</span>\n</div>`;
        });
     }
  }

  fs.writeFileSync(filePath, content);
  console.log(`Responsive layout applied to ${relPath}`);
});
