import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { GraduationCap, Clock, Award, LayoutDashboard, MessageSquare, Users, LogOut, Menu, X, Rocket } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CandidateSidebar } from "@/components/layout/CandidateSidebar";

export default function TracksListPage() {
  const [location, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedStr = localStorage.getItem("user");
    if (!storedStr) {
      setLocation("/auth/login");
      return;
    }
    const parsedUser = JSON.parse(storedStr);
    setUser(parsedUser);
    fetchTracks();
  }, [setLocation]);

  const fetchTracks = async () => {
    try {
      const response = await fetch("/api/tracks");
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

  if (!user) return <div className="min-h-screen bg-[#001F33]"></div>;

  return (
    <div className="min-h-screen bg-[#EBDCC6] block font-sans text-[#001F33] relative overflow-x-hidden">
      <CandidateSidebar 
        currentTab="tracks" 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen} 
      />

      <main className="md:ml-72 min-h-screen p-8 md:p-16">
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

        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-4 border-[#0EA5E9] border-t-transparent rounded-full"></div></div>
        ) : tracks.length === 0 ? (
          <div className="bg-white p-20 text-center rounded-3xl shadow-sm border-2 border-[#8B4513]">
             <p className="text-xl font-display uppercase text-[#001F33]/20 tracking-widest">Brevemente teremos novas trilhas para ti.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tracks.map((track) => (
              <motion.div 
                key={track.id}
                whileHover={{ y: -8 }}
                className="bg-[#001F33] rounded-3xl overflow-hidden shadow-2xl group border border-white/5 flex flex-col"
              >
                <div className="h-48 bg-gray-800 relative">
                  {track.imageUrl ? (
                    <img src={track.imageUrl} alt={track.title} className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-all duration-500 scale-105 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex items-start justify-center pt-8 opacity-40 group-hover:opacity-60 transition-opacity">
                       <GraduationCap size={72} className="text-white" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#001F33] to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <span className="bg-[#0EA5E9] text-white text-[8px] font-black uppercase tracking-[0.3em] px-2 py-1 rounded-sm mb-2 inline-block">Trilha Ativa</span>
                    <h3 className="text-xl font-display uppercase text-white leading-tight">{track.title}</h3>
                  </div>
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <p className="text-sm text-white/50 font-sans leading-relaxed mb-8 flex-1 line-clamp-3">
                    {track.description}
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[#0EA5E9]">
                       <span className="flex items-start md:items-center"><Clock size={14} className="mr-1.5" /> 12 Horas</span>
                       <span className="flex items-center"><Award size={14} className="mr-1.5" /> Certificado</span>
                    </div>
                    <Button className="w-full bg-[#0EA5E9] hover:bg-white hover:text-[#001F33] text-white uppercase font-bold text-xs tracking-widest h-12 shadow-lg shadow-[#0EA5E9]/20 transition-all">
                      Começar Agora
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* AI Suggestion Banner */}
        <div className="mt-16 bg-gradient-to-r from-[#F97316] to-[#001F33] rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
           <div className="relative z-10 max-w-xl">
              <Rocket className="mb-6 text-white" size={40} />
              <h2 className="text-3xl font-display uppercase mb-4">Recomendação Personalizada</h2>
              <p className="text-white/80 font-medium mb-8 leading-relaxed">
                Baseado nos teus interesses em tecnologia, a nossa IA sugere que comeces pela trilha de "Fundamentos de Cloud".
              </p>
              <Button className="bg-white text-[#001F33] hover:bg-[#0EA5E9] hover:text-white uppercase font-bold text-xs tracking-widest h-12 px-8">
                 Ver Sugestão
              </Button>
           </div>
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        </div>
      </main>
    </div>
  );
}
