import { useState } from "react";
import { useLocation, Link } from "wouter";
import { 
  Users, 
  BookOpen, 
  Briefcase, 
  LogOut, 
  LayoutDashboard, 
  UserCheck, 
  MessageSquare, 
  X 
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminSidebarProps {
  currentTab?: string;
  onTabChange?: (tab: any) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

export function AdminSidebar({ 
  currentTab, 
  onTabChange, 
  isSidebarOpen, 
  setIsSidebarOpen 
}: AdminSidebarProps) {
  const [, setLocation] = useLocation();

  const handleTabClick = (tabId: string) => {
    if (onTabChange) {
      onTabChange(tabId);
    } else {
      setLocation(`/admin?tab=${tabId}`);
    }
    setIsSidebarOpen(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    setLocation("/");
  };

  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Utilizadores', icon: Users },
    { id: 'jobs', label: 'Vagas', icon: Briefcase },
    { id: 'content', label: 'Trilhas', icon: BookOpen },
    { id: 'mentors', label: 'Gestão de Mentores', icon: UserCheck },
    { id: 'forum', label: 'Comunidade', icon: MessageSquare },
  ];

  return (
    <aside className={`fixed inset-y-0 left-0 bg-[#001F33] text-white w-72 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 z-40 flex flex-col shadow-2xl`}>
      <div className="p-6 border-b-4 border-white/20 flex flex-col items-center relative">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsSidebarOpen(false)}
          className="absolute right-4 top-4 text-white/50 hover:text-white md:hidden"
        >
          <X size={24} />
        </Button>
        <img src="/assets/logo.png" alt="Carreira 360" className="h-16 w-auto object-contain mb-4" />
        <p className="text-white/50 text-[10px] uppercase tracking-widest font-bold">Centro Administrativo</p>
      </div>
      <nav className="flex-1 py-6 px-4 space-y-3">
        {menuItems.map((item) => (
          <Button 
            key={item.id}
            variant="ghost" 
            onClick={() => handleTabClick(item.id)} 
            className={`w-full justify-start ${currentTab === item.id ? 'bg-[#0EA5E9]' : 'hover:bg-white/5'} text-white uppercase font-bold text-xs h-12 rounded-xl transition-all shadow-sm ${currentTab === item.id ? 'shadow-lg shadow-[#0EA5E9]/30' : ''}`}
          >
            <item.icon className="mr-3 h-5 w-5" /> {item.label}
          </Button>
        ))}
      </nav>
      <div className="p-6 border-t-4 border-white/20">
        <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-[#F97316] hover:bg-[#F97316]/10 uppercase font-bold text-xs h-12 rounded-xl">
          <LogOut className="mr-3 h-5 w-5" /> Terminar Sessão
        </Button>
      </div>
    </aside>
  );
}
