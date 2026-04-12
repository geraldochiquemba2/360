const fs = require('fs');

const path = 'c:/Users/geral/Desktop/360/360/artifacts/carreira-360/src/pages/candidate/topic-view.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add import
if (!content.includes('AdminSidebar')) {
    content = content.replace(
        'import { Button } from "@/components/ui/button";',
        'import { AdminSidebar } from "@/components/layout/AdminSidebar";\nimport { Button } from "@/components/ui/button";'
    );
}

// 2. Replace the aside block with conditional rendering
const asideStartIndex = content.indexOf('<aside className={`w-72 bg-[#001F33] text-white flex flex-col h-screen fixed top-0 left-0 z-40 transform transition-transform duration-300 ${isSidebarOpen ? \'translate-x-0\' : \'-translate-x-full\'} md:translate-x-0`}>');
const asideEndStr = '</aside>';
const asideEndIndex = content.indexOf(asideEndStr, asideStartIndex) + asideEndStr.length;

if (asideStartIndex !== -1 && asideEndIndex !== -1) {
    const originalAside = content.substring(asideStartIndex, asideEndIndex);
    
    // Check if it's already conditionally rendered
    if (!content.substring(asideStartIndex - 30, asideStartIndex).includes('user?.role === \'admin\'')) {
        const newAsideBlock = `{user?.role === 'admin' ? (
        <AdminSidebar 
          currentTab="forum" 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen} 
        />
      ) : (
        ${originalAside}
      )}`;
        
        content = content.substring(0, asideStartIndex) + newAsideBlock + content.substring(asideEndIndex);
        fs.writeFileSync(path, content, 'utf8');
        console.log('Sidebar updated successfully.');
    } else {
        console.log('Sidebar is already conditionally rendered.');
    }
} else {
    console.log('Could not find aside block.');
}
