import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, MessageSquare, Users, Briefcase, Award, LogOut, X } from "lucide-react";

interface CandidateSidebarProps {
  currentTab: string;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

export function CandidateSidebar({ currentTab, isSidebarOpen, setIsSidebarOpen }: CandidateSidebarProps) {
  const [location, setLocation] = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <aside className={`w-72 bg-[#001F33] text-white flex flex-col h-screen fixed top-0 left-0 z-40 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
      <div className="p-8 border-b border-white/10 relative flex items-center justify-between">
        <img src="/assets/logo.png" className="h-16 w-auto object-contain" alt="Logo" />
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden text-white/50 hover:text-white"
        >
          <X size={24} />
        </Button>
      </div>
      <nav className="flex-1 p-6 space-y-4">
        <Link href="/dashboard">
          <Button 
            variant="ghost" 
            onClick={() => setIsSidebarOpen(false)}
            className={`w-full justify-start ${currentTab === 'dashboard' ? 'bg-[#0EA5E9]/20 text-white' : 'text-white/50 hover:bg-[#0EA5E9]/10'} uppercase tracking-widest font-bold text-[12px] tracking-wider h-12`}
          >
            <LayoutDashboard className="mr-3 h-5 w-5" /> Início
          </Button>
        </Link>
        <Link href="/forum">
          <Button 
            variant="ghost" 
            onClick={() => setIsSidebarOpen(false)}
            className={`w-full justify-start ${currentTab === 'forum' ? 'bg-[#0EA5E9]/20 text-white' : 'text-white/50 hover:bg-[#0EA5E9]/10'} uppercase tracking-widest font-bold text-[12px] tracking-wider h-12`}
          >
            <MessageSquare className="mr-3 h-5 w-5" /> Comunidade
          </Button>
        </Link>
        <Link href="/mentorship">
          <Button 
            variant="ghost" 
            onClick={() => setIsSidebarOpen(false)}
            className={`w-full justify-start ${currentTab === 'mentors' ? 'bg-[#0EA5E9]/20 text-white' : 'text-white/50 hover:bg-[#0EA5E9]/10'} uppercase tracking-widest font-bold text-[12px] tracking-wider h-12`}
          >
            <Users className="mr-3 h-5 w-5" /> Mentoria
          </Button>
        </Link>
        <Link href="/opportunities">
          <Button 
            variant="ghost" 
            onClick={() => setIsSidebarOpen(false)}
            className={`w-full justify-start ${currentTab === 'opportunities' ? 'bg-[#0EA5E9]/20 text-white' : 'text-white/50 hover:bg-[#0EA5E9]/10'} uppercase tracking-widest font-bold text-[12px] tracking-wider h-12`}
          >
            <Briefcase className="mr-3 h-5 w-5" /> Oportunidades
          </Button>
        </Link>
        <Link href="/career-tracks">
          <Button 
            variant="ghost" 
            onClick={() => setIsSidebarOpen(false)}
            className={`w-full justify-start ${currentTab === 'tracks' ? 'bg-[#0EA5E9]/20 text-white' : 'text-white/50 hover:bg-[#0EA5E9]/10'} uppercase tracking-widest font-bold text-[12px] tracking-wider h-12`}
          >
            <Award className="mr-3 h-5 w-5" /> Trilhas
          </Button>
        </Link>
      </nav>
      <div className="p-6 border-t border-white/10">
        <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-[#F97316] hover:bg-[#F97316]/10 uppercase tracking-widest font-bold text-xs">
          <LogOut className="mr-3 h-5 w-5" /> Sair
        </Button>
      </div>
    </aside>
  );
}
