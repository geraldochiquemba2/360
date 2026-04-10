import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, Building2, Calendar, ExternalLink, GraduationCap, Award, LayoutDashboard, LogOut, Users, MessageSquare, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CandidateDashboard() {
  const [location, setLocation] = useLocation();
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

  if (!user) return <div className="min-h-screen bg-[#001F33]"></div>;

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex font-sans text-[#001F33] relative overflow-x-hidden">
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

      {/* Sidebar Simples */}
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
              className={`w-full justify-start ${location === '/dashboard' ? 'bg-[#0EA5E9]/20 text-white' : 'text-white/50 hover:bg-[#0EA5E9]/10'} uppercase tracking-widest font-bold text-xs h-12`}
            >
              <LayoutDashboard className="mr-3 h-5 w-5" /> Início
            </Button>
          </Link>
          <Link href="/forum">
            <Button 
              variant="ghost" 
              onClick={() => setIsSidebarOpen(false)}
              className={`w-full justify-start ${location === '/forum' ? 'bg-[#0EA5E9]/20 text-white' : 'text-white/50 hover:bg-[#0EA5E9]/10'} uppercase tracking-widest font-bold text-xs h-12`}
            >
              <MessageSquare className="mr-3 h-5 w-5" /> Comunidade
            </Button>
          </Link>
          <Link href="/mentorship">
            <Button 
              variant="ghost" 
              onClick={() => setIsSidebarOpen(false)}
              className={`w-full justify-start ${location === '/mentorship' ? 'bg-[#0EA5E9]/20 text-white' : 'text-white/50 hover:bg-[#0EA5E9]/10'} uppercase tracking-widest font-bold text-xs h-12`}
            >
              <Users className="mr-3 h-5 w-5" /> Mentoria
            </Button>
          </Link>
          <Button variant="ghost" className="w-full justify-start text-white/50 hover:bg-[#0EA5E9]/10 uppercase tracking-widest font-bold text-xs h-12">
            <Briefcase className="mr-3 h-5 w-5" /> Minhas Vagas
          </Button>
          <Button variant="ghost" className="w-full justify-start text-white/50 hover:bg-[#0EA5E9]/10 uppercase tracking-widest font-bold text-xs h-12">
            <Award className="mr-3 h-5 w-5" /> Certificações
          </Button>
        </nav>
        <div className="p-6 border-t border-white/10">
          <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-[#F97316] hover:bg-[#F97316]/10 uppercase tracking-widest font-bold text-xs">
            <LogOut className="mr-3 h-5 w-5" /> Sair
          </Button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 md:ml-72 min-h-screen">
        <header className="p-4 sm:p-8 bg-white/50 md:bg-transparent border-b md:border-none border-[#8B4513]/50 sticky top-0 z-20 backdrop-blur-md md:backdrop-blur-none flex items-center justify-between md:block">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden text-[#001F33]"
            >
              <Menu size={24} />
            </Button>
            <div>
              <h1 className="text-2xl md:text-4xl font-display uppercase tracking-tight">Painel do Candidato</h1>
              <p className="text-[#001F33] font-bold mt-1 hidden md:block">Bem-vindo, {user.name}! Estas são as oportunidades para o teu perfil.</p>
            </div>
          </div>
          
          {/* Gamification Badge - Visible in header on desktop, maybe simplified on mobile */}
          <div className="bg-white px-4 md:px-6 py-2 md:py-4 rounded-2xl shadow-sm border border-[#8B4513]/50 flex items-center gap-3 md:gap-4 md:absolute md:right-8 md:top-8">
            <div className="h-10 w-10 md:h-12 md:w-12 bg-[#0EA5E9] rounded-xl flex items-center justify-center text-white font-display text-xl md:text-2xl shadow-lg shadow-[#0EA5E9]/30">
              {stats.level}
            </div>
            <div className="hidden sm:block">
              <p className="text-[10px] font-black uppercase text-[#001F33] tracking-widest leading-none mb-1">Nível de Carreira</p>
              <div className="w-24 md:w-32 h-2 bg-[#001F33]/5 rounded-full overflow-hidden mb-1">
                <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${(stats.xp % 500) / 5}%` }}
                   className="h-full bg-[#0EA5E9]" 
                />
              </div>
              <p className="text-[10px] font-bold text-[#0EA5E9]">{stats.xp} XP / {500 * stats.level} XP</p>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-8">
          <div className="md:hidden mb-6">
            <p className="text-[#001F33] font-bold text-sm">Bem-vindo, {user.name}!</p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Main Feed */}
            <div className="xl:col-span-2 space-y-6">
              <h2 className="text-xl font-display uppercase text-[#0EA5E9] tracking-widest">Oportunidades em Destaque</h2>
              
              {loading ? (
                <div className="flex justify-center py-10"><div className="animate-spin h-10 w-10 border-4 border-[#0EA5E9] border-t-transparent rounded-full"></div></div>
              ) : opportunities.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-2xl shadow-sm border border-[#8B4513]/50">
                  <p className="text-xl font-display uppercase text-[#001F33]/20">Sem vagas disponíveis agora.</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {opportunities.map((op) => (
                    <motion.div 
                      key={op.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white p-4 sm:p-8 rounded-2xl shadow-sm border border-[#8B4513]/50 hover:shadow-md transition-shadow group flex flex-col md:flex-row gap-6 justify-between items-center"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                            op.type === 'bolsa' ? 'bg-[#F97316]/10 text-[#F97316]' : 'bg-[#0EA5E9]/10 text-[#0EA5E9]'
                          }`}>
                            {op.type}
                          </span>
                          <span className="text-xs text-[#001F33]/30 font-bold">• {new Date(op.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h3 className="text-xl font-display uppercase text-[#001F33] group-hover:text-[#0EA5E9] transition-colors">{op.title}</h3>
                        <div className="flex flex-wrap gap-4 mt-2">
                          <span className="flex items-center text-sm font-sans text-[#001F33] font-medium"><Building2 size={14} className="mr-1.5 text-[#0EA5E9]" /> {op.company}</span>
                          <span className="flex items-center text-sm font-sans text-[#001F33] font-medium"><MapPin size={14} className="mr-1.5 text-[#0EA5E9]" /> {op.location}</span>
                          <span className="flex items-center text-sm font-sans text-[#001F33]/70 font-bold"><Calendar size={14} className="mr-1.5 text-[#F97316]" /> Prazo: {op.deadline ? new Date(op.deadline).toLocaleDateString() : 'Indefinido'}</span>
                        </div>
                      </div>
                      <div className="flex gap-3 w-full md:w-auto">
                        {op.link && (
                          <Button className="w-full md:w-auto bg-[#001F33] hover:bg-[#0EA5E9] text-white uppercase font-bold text-xs tracking-widest h-12 px-8" asChild>
                            <a href={op.link} target="_blank">Candidate-se</a>
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Career Tracks Section */}
              <div className="pt-8">
                <h2 className="text-xl font-display uppercase text-[#F97316] tracking-widest mb-6">Trilhas de Aprendizagem</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {tracks.length === 0 ? (
                    <div className="col-span-2 bg-[#001F33]/5 p-8 rounded-2xl border border-dashed border-[#001F33]/20 text-center">
                      <p className="text-[#001F33]/30 font-bold uppercase text-xs">Novas trilhas em breve</p>
                    </div>
                  ) : (
                    tracks.map((track) => (
                      <motion.div 
                        key={track.id}
                        whileHover={{ scale: 1.02 }}
                        className="bg-[#001F33] rounded-2xl overflow-hidden shadow-xl group border border-white/5"
                      >
                        <div className="h-32 bg-gray-800 relative">
                          {track.imageUrl ? (
                            <img src={track.imageUrl} alt={track.title} className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center opacity-20">
                               <GraduationCap size={48} className="text-white" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-[#001F33] to-transparent" />
                        </div>
                        <div className="p-6">
                          <h3 className="text-lg font-display uppercase text-white mb-2">{track.title}</h3>
                          <p className="text-sm text-white/50 line-clamp-2 h-10 mb-4">{track.description}</p>
                          <Button className="w-full bg-[#0EA5E9] hover:bg-white hover:text-[#001F33] text-white uppercase font-bold text-xs tracking-widest h-10">
                            Começar Agora
                          </Button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: AI Pulse */}
            <div className="space-y-8">
              <div className="bg-[#001F33] p-8 rounded-2xl text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                  <GradientPulse />
                  <h3 className="text-2xl font-display uppercase mb-4 leading-tight">Pulso de <br/><span className="text-[#0EA5E9]">Carreira IA</span></h3>
                  <p className="text-white/60 text-sm font-sans leading-relaxed">
                    A nossa IA está a analisar o teu perfil para sugerir as melhores trilhas de aprendizagem e simulações.
                  </p>
                  <div className="mt-8 pt-8 border-t border-white/10">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#F97316] mb-2">Próxima Etapa:</p>
                    <p className="text-sm font-bold uppercase">Gerar o teu novo CV →</p>
                  </div>
                </div>
                <div className="absolute -right-8 -bottom-8 opacity-10">
                  <img src="/assets/logo.png" className="h-40 object-contain" alt="" />
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#8B4513]/50">
                <h3 className="text-lg font-display uppercase text-[#001F33] mb-4">Destaque de Formação</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-[#F5F0E8] rounded-xl group hover:bg-[#0EA5E9]/10 transition-colors cursor-pointer">
                    <p className="text-[10px] font-bold uppercase text-[#0EA5E9]">Curso Recomendado</p>
                    <h4 className="font-bold uppercase text-sm mt-1">Liderança em Ambientes Digitais</h4>
                  </div>
                  <div className="p-4 bg-[#F5F0E8] rounded-xl group hover:bg-[#0EA5E9]/10 transition-colors cursor-pointer">
                    <p className="text-[10px] font-bold uppercase text-[#F97316]">Trilha Gratuita</p>
                    <h4 className="font-bold uppercase text-sm mt-1">Domínio de Soft Skills 2026</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function GradientPulse() {
  return (
    <div className="flex gap-1 mb-6">
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          animate={{
            height: [8, 16, 8],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.2,
          }}
          className="w-1.5 bg-[#0EA5E9] rounded-full"
        />
      ))}
    </div>
  );
}
