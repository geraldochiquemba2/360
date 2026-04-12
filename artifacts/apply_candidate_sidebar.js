const fs = require('fs');
const path = require('path');

const projectRoot = 'c:/Users/geral/Desktop/360/360/artifacts/carreira-360/src/pages/candidate';
const files = ['dashboard.tsx', 'forum-home.tsx', 'topic-view.tsx', 'mentorship.tsx'];

const importStmt = 'import { CandidateSidebar } from "@/components/layout/CandidateSidebar";\n';

files.forEach(file => {
    const filePath = path.join(projectRoot, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Add import if missing
    if (!content.includes('CandidateSidebar')) {
        content = importStmt + content;
    }

    // Determine currentTab based on file
    let currentTab = 'dashboard';
    if (file === 'forum-home.tsx' || file === 'topic-view.tsx') currentTab = 'forum';
    if (file === 'mentorship.tsx') currentTab = 'mentors';

    // Replace the Sidebar logic
    // We basically look for the <aside ...> ... </aside> block that is NOT the AdminSidebar
    // and replace it with <CandidateSidebar ... />
    
    // Pattern to find the candidate sidebar aside block
    // It usually starts with <aside className={`w-72 bg-[#001F33]
    const asideRegex = /<aside className=\{`w-72 bg-\[#001F33\][\s\S]*?<\/aside>/g;
    
    content = content.replace(asideRegex, `<CandidateSidebar 
          currentTab="${currentTab}" 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen} 
        />`);

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated sidebar in ${file}`);
});
