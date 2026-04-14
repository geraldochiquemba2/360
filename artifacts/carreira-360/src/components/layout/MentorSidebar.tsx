import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  ClipboardList, 
  Calendar, 
  Settings, 
  LogOut, 
  X, 
  UserCircle 
} from "lucide-react";

interface MentorSidebarProps {
  currentTab: string;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  user: any;
}

export function MentorSidebar({ currentTab, isSidebarOpen, setIsSidebarOpen, user }: MentorSidebarProps) {
  const [location, setLocation] = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <aside className={`w-72 bg-[#001F33] text-white flex flex-col h-screen fixed top-0 left-0 z-40 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 border-r border-[#F97316]/20`}>
      <div className="p-8 border-b border-white/10 flex flex-col items-center relative">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsSidebarOpen(false)}
          className="absolute right-4 top-4 text-white/50 hover:text-white md:hidden"
        >
          <X size={24} />
        </Button>
        <img src="/assets/logo.png" className="h-18 w-auto object-contain mb-4" alt="Logo" />
        <span className="px-3 py-1 bg-[#F97316]/20 text-[#F97316] rounded-full text-[10px] font-bold uppercase tracking-widest block text-center">Painel do Mentor</span>
      </div>

      <nav className="flex-1 p-6 space-y-4">
        <Link href="/mentor">
          <Button 
            variant="ghost" 
            onClick={() => setIsSidebarOpen(false)}
            className={`w-full justify-start ${currentTab === 'dashboard' ? 'bg-[#F97316]/20 text-white' : 'text-white/50 hover:bg-[#F97316]/10'} uppercase tracking-widest font-bold text-[11px] h-12`}
          >
            <ClipboardList className="mr-3 h-5 w-5" /> Agendamentos
          </Button>
        </Link>

        <Link href="/mentor/availability">
          <Button 
            variant="ghost" 
            onClick={() => setIsSidebarOpen(false)}
            className={`w-full justify-start ${currentTab === 'availability' ? 'bg-[#F97316]/20 text-white' : 'text-white/50 hover:bg-[#F97316]/10'} uppercase tracking-widest font-bold text-[11px] h-12`}
          >
            <Calendar className="mr-3 h-5 w-5" /> Minha Agenda
          </Button>
        </Link>

        <div className="pt-4 mt-4 border-t border-white/5">
           <p className="text-[10px] font-bold uppercase text-white/30 tracking-[0.2em] mb-4 pl-4">Preferências</p>
           <Link href="/mentor/settings">
            <Button 
              variant="ghost" 
              onClick={() => setIsSidebarOpen(false)}
              className={`w-full justify-start ${currentTab === 'profile' || currentTab === 'settings' ? 'bg-[#F97316]/20 text-white' : 'text-white/50 hover:bg-[#F97316]/10'} uppercase tracking-widest font-bold text-[11px] h-12`}
            >
              <UserCircle className="mr-3 h-5 w-5" /> O Meu Perfil
            </Button>
          </Link>
        </div>
      </nav>

      <div className="p-6 border-t border-white/10 bg-black/20">
        <div className="mb-4 flex items-center gap-3">
           <div className="h-10 w-10 rounded-full bg-[#F97316]/20 flex items-center justify-center text-[#F97316]">
              <UserCircle size={24} />
           </div>
           <div className="overflow-hidden">
              <p className="text-xs font-bold uppercase text-white truncate">{user?.name || "Mentor"}</p>
              <p className="text-[10px] text-white/40 uppercase truncate">{user?.email}</p>
           </div>
        </div>
        <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-[#F97316] hover:bg-[#F97316]/10 uppercase tracking-widest font-bold text-xs h-10">
          <LogOut className="mr-3 h-4 w-4" /> Sair
        </Button>
      </div>
    </aside>
  );
}
