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

  // 1. Add Icons
  if (!content.includes('Menu,')) {
    content = content.replace(/Users2/g, 'Users2, Menu, X');
  }

  // 2. Add State
  if (!content.includes('isSidebarOpen')) {
    content = content.replace(/const \[user, setUser\] = useState<any>\(null\);/, 'const [user, setUser] = useState<any>(null);\n  const [isSidebarOpen, setIsSidebarOpen] = useState(false);');
  }

  // 3. Main wrapper and Sidebar
  if (!content.includes('AnimatePresence')) {
     // Ensure AnimatePresence is imported
  }

  // Standardizing the entire return block layout shell via regex is complex, 
  // so I'll target specific markers.

  // Overlay and Sidebar
  const sidebarStart = '<aside className="w-64';
  if (content.includes(sidebarStart)) {
    const responsiveShell = `
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
        </div>`;
    
    // Replace until first nav start
    content = content.replace(/<aside className="w-64[\s\S]*?<nav/, responsiveShell + '\n        <nav');
  }

  // Main padding
  content = content.replace(/className="flex-1 ml-64 p-10/g, 'className="flex-1 md:ml-72 p-6 sm:p-10');
  content = content.replace(/className="flex-1 ml-64 p-8/g, 'className="flex-1 md:ml-72 p-6 sm:p-8');

  // Header Menu Button
  if (!content.includes('setIsSidebarOpen(true)')) {
    const menuBtn = `
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden text-[#001F33]"
            >
              <Menu size={24} />
            </Button>`;
    
    // Inject at start of header
    content = content.replace(/<header className="[\s\S]*?">/, (match) => match + menuBtn);
    // Close the div we opened for the menu button and title
    content = content.replace(/<\/header>/, '</div>\n        </header>');
  }

  fs.writeFileSync(filePath, content);
  console.log(`Responsive layout applied to ${relPath}`);
});
