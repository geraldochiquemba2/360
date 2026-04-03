import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, Briefcase, Settings, LogOut, LayoutDashboard, Menu } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<"overview" | "users" | "jobs" | "content">("overview");
  const [stats, setStats] = useState({ totalJovens: 0, totalMentores: 0, oportunidades: 0, simulacoes: 0 });
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  useEffect(() => {
    // Basic auth check
    const storedStr = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    
    if (!token || !storedStr) {
      setLocation("/auth/login");
      return;
    }
    
    const parsedUser = JSON.parse(storedStr);
    if (parsedUser.role !== "admin") {
      setLocation("/");
      return;
    }
    setUser(parsedUser);

    // Fetch stats
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/stats", {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Erro ao carregar estatísticas", err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [setLocation]);

  const fetchCandidates = async () => {
    setLoadingCandidates(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("/api/admin/candidates", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCandidates(data);
      }
    } catch (err) {
      console.error("Erro ao buscar candidatos", err);
    } finally {
      setLoadingCandidates(false);
    }
  };

  useEffect(() => {
    if (currentTab === "users") {
      fetchCandidates();
    }
  }, [currentTab]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setLocation("/");
  };

  if (!user) return <div className="min-h-screen bg-[#001F33]"></div>;

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex font-sans font-medium text-[#001F33]">
      {/* Sidebar Mobile Toggle */}
      <button 
        className="md:hidden fixed top-4 right-4 z-50 bg-[#0EA5E9] text-white p-2 rounded-md"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <Menu />
      </button>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 bg-[#001F33] text-white w-72 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 z-40 flex flex-col`}>
        <div className="p-6 border-b border-white/10 flex flex-col items-center">
          <img src="/assets/logo.png" alt="Carreira 360" className="h-16 w-auto object-contain mb-4" />
          <p className="text-white/50 text-xs uppercase tracking-widest font-bold">Painel de Controlo</p>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-2 px-4">
          <Button 
            variant="ghost" 
            className={`w-full justify-start ${currentTab === 'overview' ? 'bg-[#0EA5E9] text-white' : 'text-white/80 hover:text-white hover:bg-[#0EA5E9]/20'} uppercase tracking-widest font-bold text-sm h-12`}
            onClick={() => setCurrentTab('overview')}
          >
            <LayoutDashboard className="mr-3 h-5 w-5" /> Visão Geral
          </Button>
          <Button 
            variant="ghost" 
            className={`w-full justify-start ${currentTab === 'users' ? 'bg-[#0EA5E9] text-white' : 'text-white/80 hover:text-white hover:bg-[#0EA5E9]/20'} uppercase tracking-widest font-bold text-sm h-12`}
            onClick={() => setCurrentTab('users')}
          >
            <Users className="mr-3 h-5 w-5" /> Utilizadores
          </Button>
          <Button 
            variant="ghost" 
            className={`w-full justify-start ${currentTab === 'jobs' ? 'bg-[#0EA5E9] text-white' : 'text-white/80 hover:text-white hover:bg-[#0EA5E9]/20'} uppercase tracking-widest font-bold text-sm h-12`}
            onClick={() => setCurrentTab('jobs')}
          >
            <Briefcase className="mr-3 h-5 w-5" /> Oportunidades
          </Button>
          <Button 
            variant="ghost" 
            className={`w-full justify-start ${currentTab === 'content' ? 'bg-[#0EA5E9] text-white' : 'text-white/80 hover:text-white hover:bg-[#0EA5E9]/20'} uppercase tracking-widest font-bold text-sm h-12`}
            onClick={() => setCurrentTab('content')}
          >
            <BookOpen className="mr-3 h-5 w-5" /> Trilhas & Conteúdo
          </Button>
        </div>

        <div className="p-4 border-t border-white/10 flex flex-col gap-2">
          <div className="px-4 py-2">
            <p className="text-sm font-bold text-white uppercase tracking-widest truncate">{user.name}</p>
            <p className="text-xs text-[#0EA5E9] truncate font-bold">{user.email}</p>
          </div>
          <Button variant="ghost" className="w-full justify-start text-[#F97316] hover:bg-[#F97316]/20 hover:text-[#F97316] uppercase tracking-widest font-bold text-sm" onClick={handleLogout}>
            <LogOut className="mr-3 h-5 w-5" /> Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 flex flex-col transition-all duration-300 md:ml-72 min-h-screen`}>
        <header className="h-20 bg-white border-b border-[#001F33]/10 flex items-center px-8 shadow-sm justify-between">
          <h1 className="text-2xl font-display uppercase text-[#001F33]">
            {currentTab === 'overview' && 'Visão Geral'}
            {currentTab === 'users' && 'Lista de Utilizadores'}
            {currentTab === 'jobs' && 'Oportunidades'}
            {currentTab === 'content' && 'Trilhas & Conteúdo'}
          </h1>
          {currentTab === 'users' && (
            <Button variant="outline" size="sm" onClick={fetchCandidates} disabled={loadingCandidates} className="border-[#0EA5E9] text-[#0EA5E9] hover:bg-[#0EA5E9] hover:text-white uppercase font-bold text-xs">
              Atualizar Lista
            </Button>
          )}
        </header>
        
        <div className="flex-1 p-6 md:p-8 overflow-auto">
          {currentTab === 'overview' ? (
            <>
              {/* Welcome Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#001F33] rounded-xl p-8 text-white shadow-xl mb-8 border-l-4 border-[#0EA5E9] relative overflow-hidden"
              >
                <div className="relative z-10">
                  <h2 className="text-4xl font-display uppercase mb-2">Bem-vindo, {user.name.split(' ')[0]}!</h2>
                  <p className="text-white/60 font-sans max-w-xl">
                    Este é o centro de comando do Carreira 360º. Aqui podes gerir todos os módulos, mentorias e candidatos.
                  </p>
                </div>
                <div className="absolute top-[-50%] right-[-10%] opacity-10">
                  <img src="/assets/logo.png" className="h-64 object-contain" alt="" />
                </div>
              </motion.div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                {[
                  { title: "Total Jovens", value: loadingStats ? "..." : stats.totalJovens.toString(), sub: "Candidatos registados", icon: Users, color: "text-[#0EA5E9]" },
                  { title: "Mentores", value: loadingStats ? "..." : stats.totalMentores.toString(), sub: "A aguardar aprovação: 0", icon: Users, color: "text-[#F97316]" },
                  { title: "Oportunidades", value: stats.oportunidades.toString(), sub: "Vagas e Bolsas Ativas", icon: Briefcase, color: "text-[#0EA5E9]" },
                  { title: "Simulações", value: stats.simulacoes.toString(), sub: "Entrevistas realizadas", icon: BookOpen, color: "text-[#F97316]" },
                ].map((stat, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i }}
                    className="bg-white rounded-xl p-6 shadow-sm border border-[#001F33]/5"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-[#001F33]/50 font-bold uppercase tracking-widest text-xs mb-1">{stat.title}</p>
                        <h3 className="text-4xl font-display text-[#001F33]">{stat.value}</h3>
                      </div>
                      <div className={`p-3 rounded-lg bg-[#001F33]/5 ${stat.color}`}>
                        <stat.icon size={24} />
                      </div>
                    </div>
                    <p className="text-xs text-[#001F33]/50 font-bold uppercase">{stat.sub}</p>
                  </motion.div>
                ))}
              </div>
              
              <div className="bg-white rounded-xl p-8 shadow-sm border border-[#001F33]/5 text-center py-16">
                <h3 className="text-2xl font-display uppercase mb-4 text-[#0EA5E9]">Módulos em Construção</h3>
                <p className="text-[#001F33]/60 max-w-md mx-auto">
                  A gestão de vagas e ferramentas de IA (Trilhas e CV) estão programadas para as próximas etapas de implementação.
                </p>
              </div>
            </>
          ) : currentTab === 'users' ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-sm border border-[#001F33]/5 overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#001F33] text-white uppercase text-xs tracking-widest font-bold">
                      <th className="px-6 py-4">Nome</th>
                      <th className="px-6 py-4">E-mail</th>
                      <th className="px-6 py-4">Telemóvel</th>
                      <th className="px-6 py-4">Área / Formação</th>
                      <th className="px-6 py-4">Data Registo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#001F33]/5">
                    {loadingCandidates ? (
                      [...Array(3)].map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan={5} className="px-6 py-4 bg-[#001F33]/5">&nbsp;</td>
                        </tr>
                      ))
                    ) : candidates.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-[#001F33]/40 font-bold uppercase tracking-widest">
                          Nenhum jovem registado até ao momento.
                        </td>
                      </tr>
                    ) : (
                      candidates.map((c) => (
                        <tr key={c.id} className="hover:bg-[#0EA5E9]/5 transition-colors group">
                          <td className="px-6 py-4 font-bold uppercase text-[#0EA5E9]">{c.name}</td>
                          <td className="px-6 py-4 text-[#001F33]/80">{c.email}</td>
                          <td className="px-6 py-4 font-mono text-sm">{c.phone || '---'}</td>
                          <td className="px-6 py-4">
                            <span className="block font-bold text-[#F97316] text-[10px] uppercase">{c.areaOfInterest || 'N/A'}</span>
                            <span className="text-xs text-[#001F33]/50">{c.formation || 'N/A'}</span>
                          </td>
                          <td className="px-6 py-4 text-xs text-[#001F33]/50">
                            {new Date(c.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          ) : (
            <div className="bg-white rounded-xl p-8 shadow-sm border border-[#001F33]/5 text-center py-20">
              <h3 className="text-2xl font-display uppercase mb-4 text-[#0EA5E9]">Página em Desenvolvimento</h3>
              <p className="text-[#001F33]/60 max-w-md mx-auto">
                Em breve poderá gerir {currentTab === 'jobs' ? 'Vagas e Oportunidades' : 'Vídeos e Trilhas de Carreira'} nesta secção.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
