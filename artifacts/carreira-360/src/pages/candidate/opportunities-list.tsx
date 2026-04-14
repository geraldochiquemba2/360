import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, Building2, Calendar, Clock, LayoutDashboard, MessageSquare, Users, Award, LogOut, Menu, X, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CandidateSidebar } from "@/components/layout/CandidateSidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const getFileUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("blob:") || url.startsWith("/")) return url;
  return `/attached_assets/${url}`;
};

export default function OpportunitiesPage() {
  const [location, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    const storedStr = localStorage.getItem("user");
    if (!storedStr) {
      setLocation("/auth/login");
      return;
    }
    const parsedUser = JSON.parse(storedStr);
    setUser(parsedUser);
    fetchOpportunities();
  }, [setLocation]);

  const fetchOpportunities = async () => {
    try {
      const response = await fetch("/api/opportunities");
      if (response.ok) {
        const data = await response.json();
        setOpportunities(data);
      }
    } catch (err) {
      console.error("Erro ao buscar vagas", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setLocation("/");
  };

  if (!user) return <div className="min-h-screen bg-[#001F33]"></div>;

  return (
    <div className="min-h-screen bg-[#EBDCC6] block font-sans text-[#001F33] relative overflow-x-hidden">
      <CandidateSidebar 
        currentTab="opportunities" 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen} 
      />

      <main className="md:ml-72 min-h-screen p-4 sm:p-10">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden text-[#001F33]"
            >
              <Menu size={24} />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-4xl font-display uppercase tracking-tight mb-1 sm:mb-2 text-[#001F33]">Oportunidades</h1>
              <p className="text-[#001F33]/60 font-medium max-w-2xl text-[10px] sm:text-sm">
                Explora as melhores vagas de emprego, estágios e bolsas de estudo selecionadas para o teu perfil.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
             <div className="flex items-center gap-2 bg-white/50 border-2 border-[#8B4513]/10 rounded-xl px-3 sm:px-4 h-10 sm:h-11">
                <Filter size={12} className="text-[#001F33]/40" />
                <Select defaultValue={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="border-none bg-transparent shadow-none h-auto p-0 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#001F33] min-w-[100px] sm:min-w-[120px]">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 border-[#8B4513] rounded-xl shadow-xl max-h-[300px]">
                    <SelectItem value="all" className="text-[10px] font-black uppercase tracking-widest p-3">Todas as Vagas</SelectItem>
                    <SelectItem value="emprego" className="text-[10px] font-black uppercase tracking-widest p-3">Emprego</SelectItem>
                    <SelectItem value="estágio" className="text-[10px] font-black uppercase tracking-widest p-3">Estágio</SelectItem>
                    <SelectItem value="bolsa" className="text-[10px] font-black uppercase tracking-widest p-3">Bolsa de Estudo</SelectItem>
                  </SelectContent>
                </Select>
             </div>
          </div>
        </header>

        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-4 border-[#0EA5E9] border-t-transparent rounded-full"></div></div>
          ) : opportunities.length === 0 ? (
            <div className="bg-white p-20 text-center rounded-3xl shadow-sm border-2 border-[#8B4513]">
              <p className="text-xl font-display uppercase text-[#001F33]/20 tracking-widest">Ainda não existem vagas publicadas.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
              {opportunities
                .filter(op => selectedType === 'all' || op.type?.toLowerCase() === selectedType.toLowerCase())
                .map((op) => (
                <motion.div 
                  key={op.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white overflow-hidden rounded-2xl sm:rounded-3xl shadow-sm border border-[#001F33]/5 hover:border-[#0EA5E9]/30 hover:shadow-xl transition-all duration-500 group flex flex-col h-full"
                >
                  <div className={`w-full h-28 sm:h-44 shrink-0 overflow-hidden relative border-b border-[#001F33]/5 ${!op.imageUrl ? 'bg-gradient-to-br from-[#001F33] to-[#0EA5E9]' : ''}`}>
                    {op.imageUrl ? (
                       <img src={getFileUrl(op.imageUrl)} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                       <div className="w-full h-full flex items-center justify-center opacity-20">
                          <Briefcase className="w-8 h-8 sm:w-16 sm:h-16 text-white" />
                       </div>
                    )}
                    <div className="absolute top-2 sm:top-4 left-2 sm:left-4">
                      <span className={`px-2 sm:px-4 py-0.5 sm:py-1.5 rounded-full text-[7px] sm:text-[9px] font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] shadow-lg ${
                        op.type === 'bolsa' ? 'bg-[#F97316] text-white' : 'bg-[#0EA5E9] text-white'
                      }`}>
                        {op.type}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 sm:p-6 flex-1 flex flex-col">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                        <span className="text-[8px] sm:text-xs text-[#001F33] font-black tracking-wider uppercase flex items-center gap-1 sm:gap-2">
                          <Calendar className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-[#0EA5E9]" /> {new Date(op.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <h3 className="text-xs sm:text-xl font-display uppercase text-[#001F33] group-hover:text-[#0EA5E9] transition-colors mb-3 sm:mb-4 leading-tight min-h-[2rem] sm:min-h-[2.5rem] line-clamp-2">
                        {op.title}
                      </h3>
                      
                      <div className="space-y-1.5 sm:space-y-2.5 mb-4 sm:mb-6">
                        <div className="flex items-center text-[9px] sm:text-[13px] font-bold text-[#001F33]">
                          <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-md sm:rounded-lg bg-[#0EA5E9]/10 flex items-center justify-center mr-2 sm:mr-3">
                            <Building2 className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-[#0EA5E9]" />
                          </div>
                          <span className="truncate">{op.company}</span>
                        </div>
                        <div className="flex items-center text-[9px] sm:text-[13px] font-bold text-[#001F33]">
                          <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-md sm:rounded-lg bg-[#0EA5E9]/10 flex items-center justify-center mr-2 sm:mr-3">
                            <MapPin className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-[#0EA5E9]" />
                          </div>
                          <span className="truncate">{op.location}</span>
                        </div>
                        <div className="flex items-center text-[9px] sm:text-[13px] font-bold text-[#F97316]">
                          <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-md sm:rounded-lg bg-[#F97316]/10 flex items-center justify-center mr-2 sm:mr-3">
                            <Clock className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                          </div>
                          <span className="truncate">Prazo: {op.deadline ? new Date(op.deadline).toLocaleDateString() : 'Indef.'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto">
                      {op.link && (
                        <Button className="w-full bg-[#001F33] hover:bg-[#0EA5E9] text-white uppercase font-bold text-[8px] sm:text-[10px] tracking-[0.1em] sm:tracking-[0.2em] h-10 sm:h-12 rounded-lg sm:rounded-xl shadow-lg shadow-[#001F33]/5 transition-all hover:-translate-y-0.5 active:scale-95" asChild>
                          <a href={op.link} target="_blank">Candidatar</a>
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
