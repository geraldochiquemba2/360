import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  Play, 
  CheckCircle2, 
  Clock, 
  Award, 
  BookOpen, 
  Lock,
  ChevronRight,
  Layout,
  Star,
  PanelRightClose,
  PanelRightOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CandidateSidebar } from "@/components/layout/CandidateSidebar";
import { MentorSidebar } from "@/components/layout/MentorSidebar";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { Menu } from "lucide-react";

export default function TrackViewer() {
  const [, params] = useRoute("/career-tracks/viewer/:id");
  const trackId = params?.id;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCurriculumOpen, setIsCurriculumOpen] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    if (trackId) {
      fetchContent();
      fetchStats();
    }
  }, [trackId]);

  const fetchContent = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/tracks/${trackId}/content`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const d = await response.json();
        setData(d);
        if (d.videos.length > 0) {
          setActiveVideo(d.videos[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("/api/tracks/my-stats", {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) setStats(await response.json());
    } catch (err) { console.error(err); }
  };

  const handleComplete = async (videoId: number) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("/api/tracks/video-complete", {
        method: "POST",
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ videoId, trackId: parseInt(trackId!) })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          toast({
            title: "Aula Concluída! 🎉",
            description: `Ganhaste +${result.xpGained} XP! Próximo nível: ${result.newLevel}`,
          });
          fetchContent(); // Refresh progress
          fetchStats(); // Update XP bar
        }
      }
    } catch (err) {
      toast({ title: "Erro", description: "Não foi possível registar o progresso.", variant: "destructive" });
    }
  };

  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  if (loading) return (
    <div className="flex h-screen bg-[#EBDCC6] items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0EA5E9]"></div>
    </div>
  );

  if (!data) return <div className="p-20 text-center font-display uppercase tracking-widest text-[#001F33]">Trilha não encontrada.</div>;

  return (
    <div className="flex min-h-screen bg-[#EBDCC6]">
      {user?.role === 'admin' ? (
        <AdminSidebar 
          currentTab="tracks" 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen} 
        />
      ) : user?.role === 'mentor' ? (
        <MentorSidebar
          currentTab="tracks"
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          user={user}
        />
      ) : (
        <CandidateSidebar 
          currentTab="tracks" 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen} 
        />
      )}
      
      <main className="flex-1 md:ml-72 flex flex-col lg:flex-row min-h-screen lg:h-screen lg:overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-[#001F33] text-white">
          <img src="/assets/logo.png" className="h-10 w-auto object-contain" alt="Logo" />
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} />
          </Button>
        </div>

        {/* Main Content Area - Video Player */}
        <div className="flex-1 min-w-0 overflow-y-auto p-4 md:p-8 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <Link href="/career-tracks">
              <Button variant="ghost" className="text-[#001F33] font-bold uppercase text-[10px] tracking-widest gap-2 hover:bg-white/50">
                <ChevronLeft size={16} /> <span className="hidden xs:inline">Voltar para Trilhas</span>
                <span className="xs:hidden">Voltar</span>
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsCurriculumOpen(!isCurriculumOpen)}
              className="hidden lg:flex border-[#001F33]/20 text-[#001F33] rounded-xl h-10 px-4 font-black uppercase text-[10px] tracking-widest gap-2 hover:bg-[#0EA5E9] hover:text-white hover:border-[#0EA5E9] transition-all"
            >
              {isCurriculumOpen ? <PanelRightClose size={14} /> : <PanelRightOpen size={14} />}
              {isCurriculumOpen ? "Ocultar Aulas" : "Ver Aulas"}
            </Button>
            {user?.role !== 'mentor' && stats && (
               <div className="flex items-center gap-2 sm:gap-4 bg-white/40 px-4 sm:px-6 py-2 rounded-full border border-white/20">
                  <div className="flex items-center gap-2">
                    <Star size={14} className="text-[#F97316]" fill="currentColor" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#001F33]">Nível {stats.level}</span>
                  </div>
                  <div className="hidden xs:block h-1.5 w-16 sm:w-24 bg-[#001F33]/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#0EA5E9] transition-all duration-1000" 
                      style={{ width: `${(stats.xp % 500) / 5}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-black tracking-widest text-[#001F33]/60">{stats.xp} XP</span>
               </div>
            )}
          </div>

          <div className="bg-[#001F33] rounded-3xl md:rounded-[40px] overflow-hidden shadow-2xl relative group border-4 md:border-8 border-white/10">
            {activeVideo ? (
              <div className="aspect-video w-full bg-black">
                <iframe 
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${getYouTubeId(activeVideo.url)}?autoplay=0&rel=0`}
                  title={activeVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            ) : (
              <div className="aspect-video flex items-center justify-center text-white/50 font-display uppercase tracking-widest">
                Nenhum vídeo disponível neste módulo.
              </div>
            )}
          </div>

          <div className="bg-white/60 backdrop-blur-md rounded-[28px] md:rounded-[32px] p-6 md:p-8 border border-white/40 shadow-xl">
             <div className="flex flex-col lg:flex-row justify-between items-start gap-4 mb-6">
               <div className="flex-1 min-w-0 w-full mb-2 lg:mb-0 lg:pr-4">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display uppercase text-[#001F33] leading-none mb-3 break-words hyphens-auto">{activeVideo?.title}</h1>
                  <p className="text-[10px] font-black text-[#0EA5E9] uppercase tracking-[0.2em] flex flex-wrap items-center gap-2">
                    <BookOpen className="shrink-0" size={14} /> <span className="truncate">Módulo: {data.modules.find((m: any) => m.id === activeVideo?.moduleId)?.title}</span>
                  </p>
               </div>
               {user?.role !== 'mentor' && activeVideo && !activeVideo.isCompleted && (
                 <div className="w-full lg:w-auto shrink-0 flex items-start">
                   <Button 
                     onClick={() => handleComplete(activeVideo.id)}
                     className="w-full lg:w-auto bg-[#0EA5E9] hover:bg-[#001F33] text-white font-black uppercase text-[10px] sm:text-xs tracking-[0.1em] sm:tracking-[0.2em] px-4 sm:px-8 h-12 sm:h-14 rounded-xl shadow-lg shadow-[#0EA5E9]/20 transition-all active:scale-95"
                   >
                     Marcar como Concluído
                   </Button>
                 </div>
               )}
               {user?.role !== 'mentor' && activeVideo?.isCompleted && (
                 <div className="flex items-center gap-2 text-[#22C55E] bg-[#22C55E]/10 px-6 h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest border border-[#22C55E]/20">
                   <CheckCircle2 size={18} /> Aula Finalizada
                 </div>
               )}
             </div>
             <p className="text-[#001F33]/70 font-medium leading-relaxed max-w-4xl">{activeVideo?.description || "Nenhuma descrição disponível para esta aula."}</p>
          </div>
        </div>

        <AnimatePresence>
          {isCurriculumOpen && (
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "auto", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="w-full lg:w-[400px] lg:h-full bg-white border-t lg:border-t-0 lg:border-l border-[#001F33]/10 flex flex-col shadow-2xl shrink-0 overflow-hidden"
            >
          <div className="p-6 md:p-8 border-b border-[#001F33]/10 bg-[#001F33] text-white">
            <h2 className="text-xl font-display uppercase tracking-widest mb-1">{data.track.title}</h2>
            <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-white/60 mt-4">
               <span className="flex items-center gap-1.5"><Layout size={12} /> {data.modules.length} Módulos</span>
               <span className="flex items-center gap-1.5"><Play size={12} /> {data.videos.length} Aulas</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-[#F8F9FA]">
            {data.modules.map((mod: any, mIdx: number) => (
              <div key={mod.id} className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#001F33]/80 ml-2">Módulo {mIdx + 1}: {mod.title}</h3>
                <div className="space-y-2">
                  {data.videos
                    .filter((v: any) => v.moduleId === mod.id)
                    .map((vid: any) => (
                      <button 
                        key={vid.id}
                        onClick={() => setActiveVideo(vid)}
                        className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all border-2 text-left group ${
                          activeVideo?.id === vid.id 
                          ? 'border-[#0EA5E9] bg-white shadow-lg' 
                          : 'border-transparent hover:bg-white hover:border-[#001F33]/10'
                        }`}
                      >
                        <div className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center transition-all ${
                          vid.isCompleted 
                          ? 'bg-[#22C55E]/10 text-[#22C55E]' 
                          : activeVideo?.id === vid.id ? 'bg-[#0EA5E9] text-white' : 'bg-[#001F33]/5 text-[#001F33]/70 group-hover:bg-[#001F33]/10'
                        }`}>
                          {vid.isCompleted ? <CheckCircle2 size={20} /> : <Play size={20} />}
                        </div>
                        <div className="flex-1">
                          <p className={`text-xs font-bold leading-tight ${activeVideo?.id === vid.id ? 'text-[#001F33]' : 'text-[#001F33]/70'}`}>{vid.title}</p>
                          <div className="flex items-center gap-3 mt-1 text-[10px] font-black uppercase tracking-widest text-[#001F33]/70">
                             <span className="flex items-center gap-1"><Clock size={10} /> {vid.duration ? `${Math.floor(vid.duration/60)}m` : '8m'}</span>
                             <span className="flex items-center gap-1"><Star size={10} /> {vid.xpPoints} XP</span>
                          </div>
                        </div>
                        <ChevronRight size={16} className={`transition-all ${activeVideo?.id === vid.id ? 'text-[#0EA5E9] translate-x-1' : 'opacity-0 group-hover:opacity-40'}`} />
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {/* Progress Summary Bottom Bar */}
          {user?.role !== 'mentor' && (
            <div className="p-6 bg-white border-t border-[#001F33]/10">
               <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#001F33]">Teu Progresso</span>
                  <span className="text-[10px] font-black text-[#0EA5E9]">{Math.round((data.videos.filter((v:any)=>v.isCompleted).length / data.videos.length) * 100)}%</span>
               </div>
               <div className="h-2 bg-[#001F33]/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(data.videos.filter((v:any)=>v.isCompleted).length / data.videos.length) * 100}%` }}
                    className="h-full bg-[#0EA5E9] shadow-[0_0_10px_rgba(14,165,233,0.5)]"
                  />
               </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  </main>
</div>
);
}
