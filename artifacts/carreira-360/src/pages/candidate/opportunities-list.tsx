import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, Building2, Calendar, LayoutDashboard, MessageSquare, Users, Award, LogOut, Menu, X, Filter } from "lucide-react";
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
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-12">
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
              <h1 className="text-3xl sm:text-4xl font-display uppercase tracking-tight mb-2 text-[#001F33]">Oportunidades</h1>
              <p className="text-[#001F33]/60 font-medium max-w-2xl text-xs sm:text-sm">
                Explora as melhores vagas de emprego, estágios e bolsas de estudo selecionadas para o teu perfil.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
             <div className="flex items-center gap-2 bg-white/50 border-2 border-[#8B4513]/20 rounded-xl px-4 h-11">
                <Filter size={14} className="text-[#001F33]/40" />
                <Select defaultValue={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="border-none bg-transparent shadow-none h-auto p-0 text-xs font-bold uppercase tracking-widest text-[#001F33] min-w-[120px]">
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
            <div className="grid gap-6">
              {opportunities
                .filter(op => selectedType === 'all' || op.type?.toLowerCase() === selectedType.toLowerCase())
                .map((op) => (
                <motion.div 
                  key={op.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white overflow-hidden rounded-2xl sm:rounded-3xl shadow-sm border-2 border-[#8B4513] hover:shadow-md transition-all group flex flex-col md:flex-row gap-0 md:gap-6 justify-between items-start md:items-center"
                >
                  {op.imageUrl && (
                    <div className="w-full md:w-32 h-24 md:h-32 shrink-0 overflow-hidden">
                       <img src={getFileUrl(op.imageUrl)} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className={`p-4 sm:p-8 flex-1 w-full ${!op.imageUrl ? 'bg-white' : ''}`}>
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${
                        op.type === 'bolsa' ? 'bg-[#F97316]/20 text-[#F97316] border-[#F97316]/30' : 'bg-[#0EA5E9]/20 text-[#0EA5E9] border-[#0EA5E9]/30'
                      }`}>
                        {op.type}
                      </span>
                      <span className="text-[10px] text-[#001F33]/70 font-black tracking-wider uppercase">• {new Date(op.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-display uppercase text-[#001F33] group-hover:text-[#0EA5E9] transition-colors mb-4">{op.title}</h3>
                    <div className="flex flex-wrap gap-x-6 gap-y-3">
                      <span className="flex items-center text-xs font-bold text-[#001F33]"><Building2 size={16} className="mr-2 text-[#0EA5E9]" /> {op.company}</span>
                      <span className="flex items-center text-xs font-bold text-[#001F33]"><MapPin size={16} className="mr-2 text-[#0EA5E9]" /> {op.location}</span>
                      <span className="flex items-center text-xs font-bold text-[#F97316]"><Calendar size={16} className="mr-2" /> Prazo: {op.deadline ? new Date(op.deadline).toLocaleDateString() : 'Indefinido'}</span>
                    </div>
                  </div>
                  <div className="w-full md:w-auto">
                    {op.link && (
                      <Button className="w-full md:w-auto bg-[#001F33] hover:bg-[#0EA5E9] text-white uppercase font-bold text-xs tracking-widest h-14 px-10 shadow-lg shadow-[#001F33]/10" asChild>
                        <a href={op.link} target="_blank">Candidatar Agora</a>
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
