import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, MessageSquare, Users, Briefcase, Award, LogOut, X, Sparkles, User } from "lucide-react";

interface CandidateSidebarProps {
  currentTab: string;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  onNavigateRequest?: (href: string) => void;
}

export function CandidateSidebar({ currentTab, isSidebarOpen, setIsSidebarOpen, onNavigateRequest }: CandidateSidebarProps) {
  const [location, setLocation] = useLocation();

  const navigate = (href: string) => {
    setIsSidebarOpen(false);
    if (onNavigateRequest) {
      onNavigateRequest(href);
    } else {
      setLocation(href);
    }
  };

  const handleLogout = () => {
    if (onNavigateRequest) {
      onNavigateRequest("LOGOUT");
    } else {
      localStorage.clear();
      window.location.href = "/";
    }
  };

  return (
    <aside className={`w-72 bg-[#001F33] text-white flex flex-col h-screen fixed top-0 left-0 z-50 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
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
        <Button 
          variant="ghost" 
          onClick={() => navigate("/dashboard")}
          className={`w-full justify-start ${currentTab === 'dashboard' ? 'bg-[#0EA5E9]/20 text-white' : 'text-white/50 hover:bg-[#0EA5E9]/10'} uppercase tracking-widest font-bold text-[12px] tracking-wider h-12`}
        >
          <LayoutDashboard className="mr-3 h-5 w-5" /> Início
        </Button>
        <Button 
          variant="ghost" 
          onClick={() => navigate("/forum")}
          className={`w-full justify-start ${currentTab === 'forum' ? 'bg-[#0EA5E9]/20 text-white' : 'text-white/50 hover:bg-[#0EA5E9]/10'} uppercase tracking-widest font-bold text-[12px] tracking-wider h-12`}
        >
          <MessageSquare className="mr-3 h-5 w-5" /> Comunidade
        </Button>
        <Button 
          variant="ghost" 
          onClick={() => navigate("/mentorship")}
          className={`w-full justify-start ${currentTab === 'mentors' ? 'bg-[#0EA5E9]/20 text-white' : 'text-white/50 hover:bg-[#0EA5E9]/10'} uppercase tracking-widest font-bold text-[12px] tracking-wider h-12`}
        >
          <Users className="mr-3 h-5 w-5" /> Mentoria
        </Button>
        <Button 
          variant="ghost" 
          onClick={() => navigate("/opportunities")}
          className={`w-full justify-start ${currentTab === 'opportunities' ? 'bg-[#0EA5E9]/20 text-white' : 'text-white/50 hover:bg-[#0EA5E9]/10'} uppercase tracking-widest font-bold text-[12px] tracking-wider h-12`}
        >
          <Briefcase className="mr-3 h-5 w-5" /> Oportunidades
        </Button>
        <Button 
          variant="ghost" 
          onClick={() => navigate("/career-tracks")}
          className={`w-full justify-start ${currentTab === 'tracks' ? 'bg-[#0EA5E9]/20 text-white' : 'text-white/50 hover:bg-[#0EA5E9]/10'} uppercase tracking-widest font-bold text-[12px] tracking-wider h-12`}
        >
          <Award className="mr-3 h-5 w-5" /> Trilhas
        </Button>
        <Button 
          variant="ghost" 
          onClick={() => navigate("/profile")}
          className={`w-full justify-start ${currentTab === 'profile' ? 'bg-[#0EA5E9]/20 text-white' : 'text-white/50 hover:bg-[#0EA5E9]/10'} uppercase tracking-widest font-bold text-[12px] tracking-wider h-12`}
        >
          <User className="mr-3 h-5 w-5" /> O Meu Perfil
        </Button>
        <Button 
          variant="ghost" 
          onClick={() => navigate("/ai-pulse")}
          className={`w-full justify-start ${currentTab === 'ai-pulse' ? 'bg-[#0EA5E9]/20 text-white' : 'text-white/50 hover:bg-[#0EA5E9]/10'} uppercase tracking-widest font-bold text-[12px] tracking-wider h-12`}
        >
          <Sparkles className={`mr-3 h-5 w-5 ${currentTab === 'ai-pulse' ? '' : 'text-[#0EA5E9]'}`} /> Pulso IA
        </Button>
      </nav>
      <div className="p-6 border-t border-white/10">
        <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-[#F97316] hover:bg-[#F97316]/10 uppercase tracking-widest font-bold text-xs">
          <LogOut className="mr-3 h-5 w-5" /> Sair
        </Button>
      </div>
    </aside>
  );
}
