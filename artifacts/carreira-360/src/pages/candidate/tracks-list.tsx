import { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { GraduationCap, Clock, Award, Menu, X, Rocket, ChevronDown, Filter, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CandidateSidebar } from "@/components/layout/CandidateSidebar";
import { useToast } from "@/hooks/use-toast";

const getFileUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("blob:") || url.startsWith("/")) return url;
  return `/attached_assets/${url}`;
};

export default function TracksListPage() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tracks, setTracks] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedStr = localStorage.getItem("user");
    if (!storedStr) {
      setLocation("/auth/login");
      return;
    }
    const parsedUser = JSON.parse(storedStr);
    setUser(parsedUser);
    fetchCategories();
    fetchTracks("all");

    // Close dropdown on click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setLocation]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/tracks/categories");
      if (response.ok) {
        setCategories(await response.json());
      }
    } catch (err) {
      console.error("Erro ao buscar categorias", err);
    }
  };

  const fetchTracks = async (category: string) => {
    setLoading(true);
    try {
      const url = category === "all" ? "/api/tracks" : `/api/tracks?category=${encodeURIComponent(category)}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setTracks(data);
      }
    } catch (err) {
      console.error("Erro ao buscar trilhas", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    fetchTracks(category);
    setIsDropdownOpen(false);
  };

  if (!user) return <div className="min-h-screen bg-[#001F33]"></div>;

  const handleStartTrack = async (trackId: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
       toast({ title: "Erro de Autenticação", description: "Faz login novamente.", variant: "destructive" });
       setLocation("/auth/login");
       return;
    }

    try {
      const response = await fetch(`/api/tracks/${trackId}/start`, {
        method: "POST",
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setLocation(`/career-tracks/viewer/${trackId}`);
      } else {
        const errData = await response.json().catch(() => ({}));
        toast({ 
          title: "Não foi possível iniciar", 
          description: errData.error || "Tenta novamente mais tarde.", 
          variant: "destructive" 
        });
      }
    } catch (err) {
      console.error("Erro ao iniciar trilha", err);
      toast({ title: "Erro de Conexão", description: "Verifica a tua internet.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-[#EBDCC6] block font-sans text-[#001F33] relative overflow-x-hidden">
      <CandidateSidebar 
        currentTab="tracks" 
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
              <h1 className="text-3xl sm:text-4xl font-display uppercase tracking-tight mb-2 text-[#001F33]">Trilhas de Aprendizagem</h1>
              <p className="text-[#001F33]/60 font-medium max-w-2xl text-xs sm:text-sm">
                Domina novas competências e acelera o teu crescimento profissional com os nossos percursos formativos estruturados.
              </p>
            </div>
          </div>
        </header>

        {/* Dynamic Dropdown Filter - Premium Style */}
        <div className="relative mb-12 z-30" ref={dropdownRef}>
           <div className="flex items-center gap-4 mb-4">
              <div className="h-10 w-10 bg-[#0EA5E9]/10 rounded-xl flex items-center justify-center text-[#0EA5E9]">
                 <Filter size={18} />
              </div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#001F33]/50">Filtrar por Especialidade</h2>
           </div>
           
           <button 
             onClick={() => setIsDropdownOpen(!isDropdownOpen)}
             className="bg-white px-6 h-14 rounded-2xl shadow-sm border border-[#001F33]/5 flex items-center justify-between min-w-[280px] hover:border-[#0EA5E9]/30 transition-all group"
           >
              <span className="text-xs font-black uppercase tracking-widest text-[#001F33]">
                 {selectedCategory === "all" ? "Todas as Especialidades" : selectedCategory}
              </span>
              <ChevronDown 
                size={18} 
                className={`text-[#0EA5E9] transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} 
              />
           </button>

           <AnimatePresence>
             {isDropdownOpen && (
               <motion.div 
                 initial={{ opacity: 0, y: 10, scale: 0.95 }}
                 animate={{ opacity: 1, y: 5, scale: 1 }}
                 exit={{ opacity: 0, y: 10, scale: 0.95 }}
                 className="absolute top-full left-0 mt-2 w-[280px] bg-white rounded-2xl shadow-2xl border border-[#001F33]/5 overflow-hidden py-2"
               >
                 <button 
                   onClick={() => handleCategoryChange("all")}
                   className={`w-full px-6 py-3.5 flex items-center justify-between text-left hover:bg-[#0EA5E9]/5 transition-colors ${selectedCategory === "all" ? 'text-[#0EA5E9]' : 'text-[#001F33]'}`}
                 >
                    <span className="text-[10px] font-black uppercase tracking-widest">Todas as Especialidades</span>
                    {selectedCategory === "all" && <Check size={14} />}
                 </button>
                 
                 {categories.map(cat => (
                   <button 
                     key={cat}
                     onClick={() => handleCategoryChange(cat)}
                     className={`w-full px-6 py-3.5 flex items-center justify-between text-left hover:bg-[#0EA5E9]/5 transition-colors border-t border-[#001F33]/5 ${selectedCategory === cat ? 'text-[#0EA5E9]' : 'text-[#001F33]'}`}
                   >
                      <span className="text-[10px] font-black uppercase tracking-widest">{cat}</span>
                      {selectedCategory === cat && <Check size={14} />}
                   </button>
                 ))}
               </motion.div>
             )}
           </AnimatePresence>
        </div>

        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-4 border-[#0EA5E9] border-t-transparent rounded-full"></div></div>
          ) : tracks.length === 0 ? (
            <div className="bg-white p-20 text-center rounded-3xl shadow-sm border border-[#001F33]/5">
               <p className="text-xl font-display uppercase text-[#001F33]/20 tracking-widest">Brevemente teremos novas trilhas para ti.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {tracks.map((track) => (
                <motion.div 
                  key={track.id}
                  whileHover={{ y: -8 }}
                  className="bg-[#001F33] rounded-[2.5rem] overflow-hidden shadow-2xl group border border-[#0EA5E9]/10 shadow-[#0EA5E9]/5 hover:border-[#0EA5E9]/40 hover:shadow-[#0EA5E9]/20 transition-all duration-300 flex flex-col h-full"
                >
                  <div className="h-48 bg-[#001F33] relative overflow-hidden">
                    {track.imageUrl ? (
                      <img src={getFileUrl(track.imageUrl)} alt={track.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-all duration-700 scale-105 group-hover:scale-110" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center pt-4 opacity-40 group-hover:opacity-60 transition-opacity">
                         <GraduationCap className="w-16 h-16 text-white" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#001F33] to-transparent" />
                    <div className="absolute bottom-6 left-8 right-8">
                      <span className="bg-[#0EA5E9] text-white text-[8px] font-black uppercase tracking-[0.3em] px-2 py-1 rounded-sm mb-2 inline-block">Trilha Ativa</span>
                      <h3 className="text-xl sm:text-2xl font-display uppercase text-white leading-tight line-clamp-2">{track.title}</h3>
                    </div>
                  </div>
                  <div className="p-8 flex-1 flex flex-col bg-[#001F33] -mt-1 relative z-10">
                    <p className="text-sm text-white/80 font-sans leading-relaxed mb-8 flex-1 line-clamp-3">
                      {track.description}
                    </p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[#0EA5E9]">
                         <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1.5" /> {track.duration || 'Flexível'}</span>
                         {track.hasCertificate !== false && (
                           <span className="flex items-center"><Award className="w-3.5 h-3.5 mr-1.5" /> Certificado</span>
                         )}
                      </div>
                      <Button onClick={() => handleStartTrack(track.id)} className="w-full bg-[#0EA5E9] hover:bg-white hover:text-[#001F33] text-white uppercase font-black text-xs tracking-widest h-12 shadow-lg shadow-[#0EA5E9]/20 transition-all rounded-xl">
                        Começar Agora
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* AI Suggestion Banner */}
        <div className="mt-16 bg-gradient-to-r from-[#F97316] to-[#001F33] rounded-[40px] p-12 text-white shadow-2xl relative overflow-hidden">
           <div className="relative z-10 max-w-xl">
              <Rocket className="mb-6 text-white" size={40} />
              <h2 className="text-3xl font-display uppercase mb-4 tracking-tight">Recomendação IA</h2>
              <p className="text-white/80 font-medium mb-8 leading-relaxed">
                Baseado no teu perfil e histórico, a nossa IA sugere que explores a trilha de **Analista Financeiro** para maximizar as tuas hipóteses no mercado.
              </p>
              <Button className="bg-white text-[#001F33] hover:bg-[#0EA5E9] hover:text-white uppercase font-black text-[10px] tracking-[0.2em] h-12 px-10 rounded-xl transition-all">
                 Explorar Sugestão
              </Button>
           </div>
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
        </div>
      </main>
    </div>
  );
}
