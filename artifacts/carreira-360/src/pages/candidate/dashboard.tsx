import { CandidateSidebar } from "@/components/layout/CandidateSidebar";
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, Building2, Calendar, ExternalLink, GraduationCap, Award, LayoutDashboard, LogOut, Users, MessageSquare, Menu, X, Sparkles, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const getFileUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("blob:") || url.startsWith("/")) return url;
  return `/attached_assets/${url}`;
};

export default function CandidateDashboard() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const storedStr = localStorage.getItem("user");
    if (!storedStr) {
      setLocation("/auth/login");
      return;
    }
    const parsedUser = JSON.parse(storedStr);
    if (parsedUser.role !== "candidato") {
      setLocation("/");
      return;
    }
    setUser(parsedUser);
    fetchOpportunities();
    fetchTracks();
    fetchStats();
  }, [setLocation]);

  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [tracks, setTracks] = useState<any[]>([]);
  const [stats, setStats] = useState({ xp: 0, level: 1 });
  const [loading, setLoading] = useState(true);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiCommand, setAiCommand] = useState("");
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  const fetchStats = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("/api/tracks/my-stats", {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Erro ao buscar stats", err);
    }
  };

  const handleGeneratePersonalAI = async () => {
    if (!aiCommand.trim()) {
      toast({ variant: "destructive", title: "Erro", description: "Diz à IA o que queres aprender." });
      return;
    }
    
    setIsAiProcessing(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("/api/tracks/generate-personal-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ command: aiCommand })
      });
      
      if (response.ok) {
        toast({ title: "Trilha Personalizada Criada!", description: "A IA estruturou o teu plano de estudo." });
        setIsGeneratingAI(false);
        setAiCommand("");
        fetchTracks();
      } else {
        toast({ variant: "destructive", title: "Falha na IA", description: "Tenta simplificar o teu pedido." });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Erro de Rede" });
    } finally {
      setIsAiProcessing(false);
    }
  };

  const fetchTracks = async () => {
    try {
      const response = await fetch("/api/tracks");
      if (response.ok) {
        const data = await response.json();
        setTracks(data);
      }
    } catch (err) {
      console.error("Erro ao buscar trilhas", err);
    }
  };

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

  if (!user) return <div className="min-h-screen bg-[#001F33]"></div>;

  return (
    <div className="min-h-screen bg-[#EBDCC6] block font-sans text-[#001F33] relative overflow-x-hidden">
      {/* Overlay para mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <CandidateSidebar 
          currentTab="dashboard" 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen} 
        />

      {/* Content */}
      <main className="flex-1 md:ml-72 min-h-screen pt-32 sm:pt-40">
        {/* Header - Fixed to match profile behavior */}
        <header className="fixed top-0 left-0 md:left-72 right-0 z-40 bg-[#EBDCC6]/95 backdrop-blur-md p-6 md:p-10 border-b border-[#001F33]/5 flex items-start gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden text-[#001F33] mt-1"
          >
            <Menu size={24} />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-display uppercase tracking-tight leading-tight text-[#001F33]">Portal do Futuro</h1>
            <p className="text-[#001F33]/70 font-semibold mt-1 text-sm leading-relaxed">Olá, {user.name.split(' ')[0]}! O teu percurso profissional começa aqui.</p>
          </div>
        </header>

        <div className="p-4 md:p-10 -mt-6">
          {/* Level Badge - Now a separate card below header as requested */}
          <div className="bg-white/40 backdrop-blur-md p-6 rounded-[30px] border border-[#001F33]/5 flex items-center gap-6 mb-10 shadow-sm max-w-2xl">
            <div className="h-16 w-16 bg-[#0EA5E9] rounded-[20px] flex items-center justify-center text-white font-display text-3xl shadow-lg shadow-[#0EA5E9]/20">
              {stats.level}
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase text-[#001F33]/60 tracking-[0.2em] mb-2">Nível de Carreira</p>
              <div className="w-full h-2.5 bg-[#001F33]/5 rounded-full overflow-hidden mb-2">
                <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${(stats.xp % 500) / 5}%` }}
                   className="h-full bg-gradient-to-r from-[#0EA5E9] to-[#F97316]" 
                />
              </div>
              <p className="text-[11px] font-black text-[#0EA5E9] tracking-widest">{stats.xp} XP / {500 * stats.level} XP</p>
            </div>
          </div>

          <div className="mb-8">
            <p className="text-[#001F33] font-black uppercase text-sm tracking-widest">Bem-vindo, {user.name}!</p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
            {/* Main Feed */}
            <div className="xl:col-span-2 space-y-8">
              <h2 className="text-xl font-display uppercase text-[#0EA5E9] tracking-widest mb-6 border-b border-[#0EA5E9]/10 pb-4">Oportunidades em Destaque</h2>
              
              {loading ? (
                <div className="flex justify-center py-10"><div className="animate-spin h-10 w-10 border-4 border-[#0EA5E9] border-t-transparent rounded-full"></div></div>
              ) : opportunities.filter(op => op.title).length === 0 ? (
                <div className="bg-white p-12 text-center rounded-[30px] shadow-sm border border-[#001F33]/10">
                  <p className="text-xl font-display uppercase text-[#001F33]/20">Sem vagas disponíveis agora.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {opportunities.filter(op => op.title).slice(0, 4).map((op) => (
                    <motion.div 
                      key={op.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white p-0 overflow-hidden rounded-[40px] shadow-lg border border-[#001F33]/5 hover:shadow-2xl transition-all group flex flex-col h-full"
                    >
                      {/* Image Area */}
                      <div className="w-full h-48 shrink-0 overflow-hidden relative">
                         <img 
                            src={getFileUrl(op.imageUrl)} 
                            alt={op.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                            onError={(e: any) => e.target.src = "https://images.unsplash.com/photo-1454165833767-02484d720bed?q=80&w=2070&auto=format&fit=crop"}
                         />
                         <div className="absolute top-5 left-5">
                            <span className="px-5 py-2 bg-[#0EA5E9] text-white rounded-full text-[11px] font-black uppercase tracking-[0.2em] shadow-xl">
                              {op.type === 'bolsa' ? 'Bolsa' : 'Emprego'}
                            </span>
                         </div>
                      </div>
                      
                      {/* Content Area - Precisely matching reference image labels */}
                      <div className="p-8 flex flex-col flex-1">
                        <div className="flex items-center gap-3 text-[#0EA5E9] mb-4">
                           <Calendar size={18} />
                           <span className="text-[13px] font-black tracking-tight">{new Date(op.createdAt).toLocaleDateString()}</span>
                        </div>

                        <h3 className="text-xl font-display uppercase text-[#001F33] group-hover:text-[#0EA5E9] transition-colors leading-snug line-clamp-2 min-h-[3.5rem] mb-6 tracking-tight">
                           {op.title}
                        </h3>
                        
                        <div className="space-y-4 mb-8">
                           <div className="flex items-center gap-4">
                              <div className="h-10 w-10 bg-[#0EA5E9]/10 rounded-xl flex items-center justify-center text-[#0EA5E9] shrink-0">
                                 <Building2 size={20} />
                              </div>
                              <span className="text-[14px] font-bold text-[#001F33] truncate">{op.company || 'Empresa Confidencial'}</span>
                           </div>
                           <div className="flex items-center gap-4">
                              <div className="h-10 w-10 bg-[#0EA5E9]/10 rounded-xl flex items-center justify-center text-[#0EA5E9] shrink-0">
                                 <MapPin size={20} />
                              </div>
                              <span className="text-[14px] font-bold text-[#001F33] truncate">{op.location || 'Todo o País'}</span>
                           </div>
                           <div className="flex items-center gap-4">
                              <div className="h-10 w-10 bg-[#F97316]/10 rounded-xl flex items-center justify-center text-[#F97316] shrink-0">
                                 <Clock size={20} />
                              </div>
                              <span className="text-[14px] font-black uppercase text-[#F97316] tracking-tighter">
                                 Prazo: {op.deadline ? new Date(op.deadline).toLocaleDateString() : 'Indef.'}
                              </span>
                           </div>
                        </div>

                        <div className="mt-auto">
                          <Button 
                             className="w-full bg-[#001F33] hover:bg-[#0EA5E9] text-white uppercase font-black text-xs tracking-[0.3em] h-16 rounded-2xl transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98]" 
                             asChild
                          >
                            <a href={op.link} target="_blank">CANDIDATAR</a>
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Career Tracks Section */}
              {/* career tracks header with AI button */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-display uppercase text-[#F97316] tracking-widest">Trilhas de Aprendizagem</h2>
                <Button 
                  onClick={() => setIsGeneratingAI(true)}
                  className="bg-gradient-to-r from-[#0EA5E9] to-[#001F33] text-white text-[10px] font-black uppercase tracking-widest h-10 px-6 rounded-full shadow-lg shadow-[#0EA5E9]/20 flex items-center gap-2 hover:scale-105 transition-all"
                >
                  <Sparkles size={14} /> Gerar com IA
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {tracks.length === 0 ? (
                  <div className="col-span-2 bg-white/40 p-12 rounded-[30px] border border-dashed border-[#001F33]/10 text-center">
                    <p className="text-[#001F33]/30 font-bold uppercase text-[11px] tracking-widest">Cria a tua primeira trilha personalizada acima!</p>
                  </div>
                ) : (
                  <>
                    {tracks.map((track) => (
                      <motion.div 
                        key={track.id}
                        whileHover={{ y: -6 }}
                        className={`bg-white rounded-[40px] overflow-hidden shadow-lg border-2 ${track.userId ? 'border-[#0EA5E9]/30 bg-blue-50/20' : 'border-[#001F33]/5'} group hover:shadow-2xl transition-all duration-300`}
                      >
                        <div className="h-36 relative">
                          {track.imageUrl ? (
                            <img src={getFileUrl(track.imageUrl)} alt={track.title} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" />
                          ) : (
                            <div className="w-full h-full bg-[#001F33]/5 flex items-center justify-center">
                               <GraduationCap size={48} className="text-[#001F33]/20" />
                            </div>
                          )}
                          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent" />
                          {track.userId && (
                            <div className="absolute top-4 right-4 bg-[#0EA5E9] text-white text-[8px] font-black uppercase px-2 py-1 rounded-md shadow-lg flex items-center gap-1">
                              <Sparkles size={10} /> IA Personalizada
                            </div>
                          )}
                        </div>
                        <div className="p-8">
                          <h3 className="text-lg font-display uppercase text-[#001F33] mb-3 line-clamp-1">{track.title}</h3>
                          <div className="flex items-center gap-5 mb-6 text-[11px] font-black uppercase tracking-widest text-[#0EA5E9]">
                             <span className="flex items-center"><Clock size={14} className="mr-2" /> {track.duration || 'Flexível'}</span>
                             {track.hasCertificate !== false && !track.userId && (
                               <span className="flex items-center text-[#F97316]"><Award size={14} className="mr-2" /> Certificado</span>
                             )}
                          </div>
                          <Button 
                            onClick={() => handleStartTrack(track.id)}
                            className={`w-full ${track.userId ? 'bg-[#0EA5E9] text-white' : 'bg-[#F97316]/10 text-[#F97316]'} hover:opacity-90 uppercase font-black text-xs tracking-[0.2em] h-14 rounded-2xl transition-all`}
                          >
                            {track.userId ? 'Continuar Aprendizado' : 'Começar Trilhar'}
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </>
                )}
              </div>
            </div>
            </div>

            {/* Right Column: AI Pulse */}
            <div className="space-y-8">
              <Link href="/ai-pulse">
                <div className="bg-[#001F33] p-10 rounded-[50px] text-white shadow-2xl relative overflow-hidden cursor-pointer group hover:scale-[1.02] transition-all border border-white/10">
                  <div className="relative z-10">
                    <GradientPulse />
                    <h3 className="text-2xl font-display uppercase mb-6 leading-tight tracking-tight">Pulso de <br/><span className="text-[#0EA5E9]">Carreira IA</span></h3>
                    <p className="text-white/50 text-sm font-sans leading-relaxed">
                      Análise preditiva do teu perfil para otimizar o teu percurso profissional em tempo real.
                    </p>
                    <div className="mt-10 pt-10 border-t border-white/5 flex items-center justify-between group-hover:text-[#0EA5E9] transition-colors">
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#F97316] mb-2">Status:</p>
                        <p className="text-sm font-black uppercase tracking-widest">Análise Ativa →</p>
                      </div>
                      <Sparkles className="text-[#0EA5E9] animate-pulse" size={28} />
                    </div>
                  </div>
                </div>
              </Link>

              <div className="bg-white p-10 rounded-[40px] shadow-sm border border-[#001F33]/5">
                <h3 className="text-[11px] font-black uppercase text-[#001F33]/30 tracking-[0.3em] mb-8">Recomendações</h3>
                <div className="space-y-5">
                  <div className="p-5 bg-[#0EA5E9]/5 rounded-3xl group hover:bg-[#0EA5E9]/10 transition-all cursor-pointer border border-[#0EA5E9]/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#0EA5E9]">Curso Premium</p>
                    <h4 className="font-bold uppercase text-sm tracking-widest text-[#001F33] mt-2">Liderança Digital</h4>
                  </div>
                  <div className="p-5 bg-[#F97316]/5 rounded-3xl group hover:bg-[#F97316]/10 transition-all cursor-pointer border border-[#F97316]/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#F97316]">Soft Skills</p>
                    <h4 className="font-bold uppercase text-sm tracking-widest text-[#001F33] mt-2">Negociação 2026</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* AI Tutor Dialog */}
        <Dialog open={isGeneratingAI} onOpenChange={setIsGeneratingAI}>
          <DialogContent className="max-w-md bg-white border-none shadow-2xl rounded-[40px] p-10 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#0EA5E9]/20 to-[#001F33]/20 rounded-bl-full pointer-events-none"></div>
            
            <DialogHeader>
              <DialogTitle className="text-3xl font-display uppercase text-[#001F33] tracking-tighter flex items-center gap-3">
                <Sparkles className="text-[#0EA5E9]" /> Tutor IA Pessoal
              </DialogTitle>
            </DialogHeader>
            
            <div className="py-8 space-y-6">
              <p className="text-xs font-bold uppercase tracking-widest text-[#001F33]/60 leading-relaxed">
                Diz à IA o que queres aprender hoje. Ela irá criar uma trilha única só para ti.
              </p>
              
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0EA5E9] ml-2">O teu comando para a IA</label>
                <div className="relative group">
                  <MessageSquare className="absolute left-5 top-6 text-[#001F33]/30 group-focus-within:text-[#0EA5E9] transition-colors" size={20} />
                  <textarea 
                    disabled={isAiProcessing}
                    className="w-full pl-14 pr-6 py-6 bg-[#EBDCC6] border-2 border-[#8B4513]/20 rounded-2xl font-bold text-[#001F33] text-sm focus:border-[#0EA5E9] focus:ring-0 placeholder:text-[#001F33]/30 min-h-[120px] resize-none" 
                    placeholder="Ex: Quero aprender a usar Python para analisar dados de vendas em 3 fases rápidas."
                    value={aiCommand}
                    onChange={(e) => setAiCommand(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button 
                onClick={handleGeneratePersonalAI}
                disabled={isAiProcessing}
                className="w-full h-16 bg-[#001F33] text-white uppercase font-black tracking-[0.2em] rounded-2xl shadow-xl shadow-black/20 hover:bg-[#0EA5E9] transition-all flex items-center justify-center gap-3"
              >
                {isAiProcessing ? (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                      <Sparkles size={20} />
                    </motion.div>
                    A Criar a tua Trilha...
                  </>
                ) : (
                  <>Criar Plano de Estudo</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

function GradientPulse() {
// ... (rest of file)
  return (
    <div className="flex gap-1.5 mb-8">
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          animate={{
            height: [10, 20, 10],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.2,
          }}
          className="w-2 bg-[#0EA5E9] rounded-full"
        />
      ))}
    </div>
  );
}
