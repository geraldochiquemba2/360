import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Users, BookOpen, Briefcase, Settings, LogOut, LayoutDashboard, Menu, Plus, Trash2, ExternalLink, MapPin, Building2, Calendar, Film, Layers, UserCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<"overview" | "users" | "jobs" | "content" | "mentors">("overview");
  const [stats, setStats] = useState({ totalJovens: 0, totalMentores: 0, oportunidades: 0, simulacoes: 0 });
  const [candidates, setCandidates] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [tracks, setTracks] = useState<any[]>([]);
  const [mentors, setMentors] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [loadingOpportunities, setLoadingOpportunities] = useState(false);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [loadingMentors, setLoadingMentors] = useState(false);
  const [isAddingOpportunity, setIsAddingOpportunity] = useState(false);
  const [isAddingTrack, setIsAddingTrack] = useState(false);
  const { toast } = useToast();

  const [newTrack, setNewTrack] = useState({
    title: "",
    description: "",
    imageUrl: ""
  });

  const [selectedTrack, setSelectedTrack] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [isAddingVideo, setIsAddingVideo] = useState(false);
  const [currentModule, setCurrentModule] = useState<any>(null);

  const [newModule, setNewModule] = useState({ title: "", order: 0 });
  const [newVideo, setNewVideo] = useState({ 
    title: "", 
    url: "", 
    description: "", 
    xpPoints: 100,
    order: 0 
  });

  const [newOpportunity, setNewOpportunity] = useState({
    title: "",
    company: "",
    location: "",
    type: "emprego",
    description: "",
    requirements: "",
    link: "",
    deadline: ""
  });

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
    } else if (currentTab === "jobs") {
      fetchOpportunities();
    } else if (currentTab === "content") {
      fetchTracks();
    } else if (currentTab === "mentors") {
      fetchMentors();
    }
  }, [currentTab]);

  const fetchMentors = async () => {
    setLoadingMentors(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("/api/admin/mentors", {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMentors(data);
      }
    } catch (err) {
      console.error("Erro ao buscar mentores", err);
    } finally {
      setLoadingMentors(false);
    }
  };

  const updateMentorStatus = async (id: number, status: string) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/admin/mentors/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        toast({ title: "Sucesso", description: `Mentor atualizado para ${status}.` });
        fetchMentors();
      }
    } catch (err) {
      toast({ title: "Erro", description: "Falha ao atualizar mentor" });
    }
  };

  const fetchTracks = async () => {
    setLoadingTracks(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("/api/admin/tracks", {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTracks(data);
      }
    } catch (err) {
      console.error("Erro ao buscar trilhas", err);
    } finally {
      setLoadingTracks(false);
    }
  };

  const handleAddTrack = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("/api/admin/tracks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newTrack)
      });
      if (response.ok) {
        toast({ title: "Sucesso", description: "Trilha criada com sucesso!" });
        setIsAddingTrack(false);
        setNewTrack({ title: "", description: "", imageUrl: "" });
        fetchTracks();
      }
    } catch (err) {
      toast({ title: "Erro", description: "Falha ao criar trilha", variant: "destructive" });
    }
  };

  const fetchModules = async (trackId: number) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/admin/tracks/${trackId}/modules`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setModules(data);
      }
    } catch (err) {
      console.error("Erro ao buscar módulos");
    }
  };

  const handleAddModule = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("/api/admin/modules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ ...newModule, trackId: selectedTrack.id })
      });
      if (response.ok) {
        toast({ title: "Sucesso", description: "Módulo adicionado!" });
        setIsAddingModule(false);
        setNewModule({ title: "", order: 0 });
        fetchModules(selectedTrack.id);
      }
    } catch (err) {
      toast({ title: "Erro", description: "Falha ao criar módulo", variant: "destructive" });
    }
  };

  const handleAddVideo = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("/api/admin/videos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          ...newVideo, 
          moduleId: currentModule.id, 
          trackId: selectedTrack.id 
        })
      });
      if (response.ok) {
        toast({ title: "Vídeo Adicionado", description: `Vídeo cadastrado com ${newVideo.xpPoints} XP.` });
        setIsAddingVideo(false);
        setNewVideo({ title: "", url: "", description: "", xpPoints: 100, order: 0 });
        // Recarregar módulos (que podem conter vídeos no futuro ou apenas mensagem de sucesso)
      }
    } catch (err) {
      toast({ title: "Erro", description: "Falha ao criar vídeo" });
    }
  };

  const fetchOpportunities = async () => {
    setLoadingOpportunities(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("/api/admin/opportunities", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setOpportunities(data);
      }
    } catch (err) {
      console.error("Erro ao buscar oportunidades", err);
    } finally {
      setLoadingOpportunities(false);
    }
  };

  const handleAddOpportunity = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("/api/admin/opportunities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newOpportunity)
      });
      if (response.ok) {
        toast({ title: "Sucesso", description: "Oportunidade criada com sucesso!" });
        setIsAddingOpportunity(false);
        setNewOpportunity({ title: "", company: "", location: "", type: "emprego", description: "", requirements: "", link: "", deadline: "" });
        fetchOpportunities();
      }
    } catch (err) {
      toast({ title: "Erro", description: "Falha ao criar oportunidade", variant: "destructive" });
    }
  };

  const handleDeleteOpportunity = async (id: number) => {
    if (!confirm("Tem a certeza que deseja eliminar esta vaga?")) return;
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/admin/opportunities/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        toast({ title: "Eliminado", description: "Vaga removida com sucesso." });
        fetchOpportunities();
      }
    } catch (err) {
      toast({ title: "Erro", description: "Falha ao eliminar vaga", variant: "destructive" });
    }
  };

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
          <Button 
            variant="ghost" 
            className={`w-full justify-start ${currentTab === 'mentors' ? 'bg-[#0EA5E9] text-white' : 'text-white/80 hover:text-white hover:bg-[#0EA5E9]/20'} uppercase tracking-widest font-bold text-sm h-12`}
            onClick={() => setCurrentTab('mentors')}
          >
            <UserCheck className="mr-3 h-5 w-5" /> Mentoria
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
            {currentTab === 'mentors' && 'Gestão de Mentores'}
          </h1>
          {currentTab === 'users' && (
            <Button variant="outline" size="sm" onClick={fetchCandidates} disabled={loadingCandidates} className="border-[#0EA5E9] text-[#0EA5E9] hover:bg-[#0EA5E9] hover:text-white uppercase font-bold text-xs">
              Atualizar Lista
            </Button>
          )}
          {currentTab === 'jobs' && (
            <Dialog open={isAddingOpportunity} onOpenChange={setIsAddingOpportunity}>
              {/* ... existing dialog trigger and content ... */}
              <DialogTrigger asChild>
                <Button className="bg-[#0EA5E9] hover:bg-[#F97316] text-white uppercase font-bold text-xs tracking-widest h-10 px-6">
                  <Plus className="mr-2 h-4 w-4" /> Nova Vaga
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-white border-2 border-[#001F33]/10">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-display uppercase text-[#001F33]">Cadastrar Oportunidade</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4 font-sans">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-[#001F33]/50">Título da Vaga</label>
                    <Input placeholder="Ex: Gestor de Marketing" value={newOpportunity.title} onChange={(e) => setNewOpportunity({...newOpportunity, title: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-[#001F33]/50">Empresa</label>
                    <Input placeholder="Ex: UNITEL" value={newOpportunity.company} onChange={(e) => setNewOpportunity({...newOpportunity, company: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-[#001F33]/50">Localização</label>
                    <Input placeholder="Ex: Luanda - Kilamba" value={newOpportunity.location} onChange={(e) => setNewOpportunity({...newOpportunity, location: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-[#001F33]/50">Tipo</label>
                    <Select value={newOpportunity.type} onValueChange={(val) => setNewOpportunity({...newOpportunity, type: val})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="emprego">Emprego</SelectItem>
                        <SelectItem value="estagio">Estágio</SelectItem>
                        <SelectItem value="bolsa">Bolsa de Estudo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-xs font-bold uppercase text-[#001F33]/50">Descrição</label>
                    <Textarea placeholder="Descreve brevemente o que o candidato fará..." value={newOpportunity.description} onChange={(e) => setNewOpportunity({...newOpportunity, description: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-[#001F33]/50">Link / E-mail</label>
                    <Input placeholder="URL ou e-mail de candidatura" value={newOpportunity.link} onChange={(e) => setNewOpportunity({...newOpportunity, link: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-[#001F33]/50">Data Limite</label>
                    <Input type="date" value={newOpportunity.deadline} onChange={(e) => setNewOpportunity({...newOpportunity, deadline: e.target.value})} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsAddingOpportunity(false)} className="uppercase font-bold text-xs">Cancelar</Button>
                  <Button onClick={handleAddOpportunity} className="bg-[#001F33] hover:bg-[#0EA5E9] text-white uppercase font-bold text-xs tracking-widest px-8">Salvar Vaga</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          {currentTab === 'content' && (
            <Dialog open={isAddingTrack} onOpenChange={setIsAddingTrack}>
              <DialogTrigger asChild>
                <Button className="bg-[#0EA5E9] hover:bg-[#F97316] text-white uppercase font-bold text-xs tracking-widest h-10 px-6">
                  <Plus className="mr-2 h-4 w-4" /> Nova Trilha
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl bg-white border-2 border-[#001F33]/10">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-display uppercase text-[#001F33]">Criar Trilha Profissional</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4 font-sans">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-[#001F33]/50">Título da Trilha</label>
                    <Input placeholder="Ex: Mestre das Entrevistas" value={newTrack.title} onChange={(e) => setNewTrack({...newTrack, title: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-[#001F33]/50">Descrição Breve</label>
                    <Textarea placeholder="Explica o que o jovem vai aprender..." value={newTrack.description} onChange={(e) => setNewTrack({...newTrack, description: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-[#001F33]/50">URL da Imagem de Capa</label>
                    <Input placeholder="Link de uma imagem apelativa" value={newTrack.imageUrl} onChange={(e) => setNewTrack({...newTrack, imageUrl: e.target.value})} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsAddingTrack(false)} className="uppercase font-bold text-xs">Cancelar</Button>
                  <Button onClick={handleAddTrack} className="bg-[#001F33] hover:bg-[#0EA5E9] text-white uppercase font-bold text-xs tracking-widest px-8">Criar Trilha</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
          ) : currentTab === 'jobs' ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {loadingOpportunities ? (
                <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-4 border-[#0EA5E9] border-t-transparent rounded-full"></div></div>
              ) : opportunities.length === 0 ? (
                <div className="bg-white rounded-xl p-16 text-center shadow-sm border border-[#001F33]/5">
                  <Briefcase size={64} className="mx-auto text-[#001F33]/10 mb-4" />
                  <h3 className="text-xl font-display uppercase text-[#001F33]/40">Nenhuma vaga cadastrada</h3>
                  <p className="text-sm text-[#001F33]/60 mt-2 max-w-xs mx-auto">Começa agora mesmo a carregar empregos e bolsas de estudo para os jovens.</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-[#001F33]/5 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#001F33] text-white uppercase text-xs tracking-widest font-bold">
                          <th className="px-6 py-4">Título / Empresa</th>
                          <th className="px-6 py-4">Localização</th>
                          <th className="px-6 py-4">Tipo</th>
                          <th className="px-6 py-4">Prazo</th>
                          <th className="px-6 py-4 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#001F33]/5">
                        {opportunities.map((op) => (
                          <tr key={op.id} className="hover:bg-[#0EA5E9]/5 transition-colors group">
                            <td className="px-6 py-4">
                              <span className="block font-bold uppercase text-[#0EA5E9] leading-tight">{op.title}</span>
                              <span className="text-xs text-[#001F33]/50 flex items-center mt-1">
                                <Building2 size={12} className="mr-1" /> {op.company}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-sans text-[#001F33]/80">
                              <span className="flex items-center"><MapPin size={14} className="mr-2 text-[#001F33]/30" /> {op.location}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                op.type === 'bolsa' ? 'bg-[#F97316]/10 text-[#F97316]' : 'bg-[#0EA5E9]/10 text-[#0EA5E9]'
                              }`}>
                                {op.type}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs text-[#001F33]/50">
                              <span className="flex items-center">
                                <Calendar size={14} className="mr-2 opacity-30" />
                                {op.deadline ? new Date(op.deadline).toLocaleDateString() : 'Aberto'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" className="text-[#001F33]/30 hover:text-[#F97316]" onClick={() => handleDeleteOpportunity(op.id)}>
                                  <Trash2 size={18} />
                                </Button>
                                {op.link && (
                                  <Link href={op.link}>
                                    <a target="_blank" className="p-2 text-[#001F33]/30 hover:text-[#0EA5E9]">
                                      <ExternalLink size={18} />
                                    </a>
                                  </Link>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          ) : currentTab === 'content' ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {selectedTrack ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => setSelectedTrack(null)} className="text-[#0EA5E9] font-bold uppercase text-xs">← Voltar</Button>
                    <h2 className="text-2xl font-display uppercase">{selectedTrack.title}</h2>
                  </div>
                  
                  <div className="bg-white rounded-xl p-8 border border-[#001F33]/5 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                       <h3 className="text-lg font-display uppercase text-[#0EA5E9]">Módulos e Etapas</h3>
                       <Button onClick={() => setIsAddingModule(true)} className="bg-[#001F33] text-white uppercase text-[10px] font-bold tracking-widest px-6 h-10">
                         <Plus className="mr-2 h-4 w-4" /> Novo Módulo
                       </Button>
                    </div>

                    <div className="space-y-4">
                      {modules.length === 0 ? (
                        <div className="text-center py-10 text-[#001F33]/30 font-bold uppercase text-xs">Nenhum módulo criado nesta trilha.</div>
                      ) : (
                        modules.map((mod) => (
                          <div key={mod.id} className="border border-[#001F33]/5 rounded-xl p-6 hover:bg-[#F5F0E8]/50 transition-colors">
                            <div className="flex justify-between items-center">
                              <h4 className="font-display uppercase text-[#001F33]">{mod.title}</h4>
                              <Button onClick={() => { setCurrentModule(mod); setIsAddingVideo(true); }} variant="outline" size="sm" className="border-[#0EA5E9] text-[#0EA5E9] hover:bg-[#0EA5E9] hover:text-white uppercase font-bold text-[10px]">
                                <Plus className="mr-2 h-4 w-4" /> Adicionar Vídeo
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {loadingTracks ? (
                    <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-4 border-[#0EA5E9] border-t-transparent rounded-full"></div></div>
                  ) : tracks.length === 0 ? (
                    <div className="bg-white rounded-xl p-16 text-center shadow-sm border border-[#001F33]/5">
                      <Film size={64} className="mx-auto text-[#001F33]/10 mb-4" />
                      <h3 className="text-xl font-display uppercase text-[#001F33]/40">Nenhuma trilha criada</h3>
                      <p className="text-sm text-[#001F33]/60 mt-2 max-w-xs mx-auto">Cria o teu primeiro roteiro de aprendizagem para os jovens.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {tracks.map((track) => (
                        <motion.div 
                          key={track.id}
                          whileHover={{ y: -5 }}
                          className="bg-white rounded-xl overflow-hidden shadow-sm border border-[#001F33]/5 group"
                        >
                          <div className="h-40 bg-[#001F33] relative">
                            {track.imageUrl ? (
                              <img src={track.imageUrl} alt={track.title} className="w-full h-full object-cover opacity-60" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center opacity-20">
                                <Film size={48} className="text-white" />
                              </div>
                            )}
                            <div className="absolute top-4 right-4">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${track.isActive ? 'bg-[#0EA5E9] text-white' : 'bg-gray-500 text-white'}`}>
                                {track.isActive ? 'Ativa' : 'Inativa'}
                              </span>
                            </div>
                          </div>
                          <div className="p-6">
                            <h3 className="text-xl font-display uppercase text-[#001F33] mb-2">{track.title}</h3>
                            <p className="text-sm text-[#001F33]/60 line-clamp-2 h-10 mb-6">{track.description}</p>
                            <div className="flex justify-between items-center pt-4 border-t border-[#001F33]/5">
                              <div className="flex gap-2">
                                 <Button onClick={() => { setSelectedTrack(track); fetchModules(track.id); }} variant="ghost" size="sm" className="text-[#0EA5E9] hover:bg-[#0EA5E9]/10 uppercase font-bold text-[10px]">
                                   <Layers className="mr-1.5 h-3.5 w-3.5" /> Módulos
                                 </Button>
                              </div>
                              <Button variant="ghost" size="icon" className="text-[#001F33]/30 hover:text-[#F97316]">
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Modais de Módulos e Vídeos */}
              <Dialog open={isAddingModule} onOpenChange={setIsAddingModule}>
                <DialogContent className="max-w-md bg-white border-2 border-[#001F33]/10">
                  <DialogHeader><DialogTitle className="text-xl font-display uppercase">Novo Módulo</DialogTitle></DialogHeader>
                  <div className="space-y-4 py-4">
                    <Input placeholder="Título do Módulo (ex: Fase 1)" value={newModule.title} onChange={(e) => setNewModule({...newModule, title: e.target.value})} />
                  </div>
                  <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsAddingModule(false)} className="text-xs font-bold uppercase">Cancelar</Button>
                    <Button onClick={handleAddModule} className="bg-[#0EA5E9] text-white text-xs font-bold uppercase px-8">Criar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={isAddingVideo} onOpenChange={setIsAddingVideo}>
                <DialogContent className="max-w-xl bg-white border-2 border-[#001F33]/10">
                  <DialogHeader><DialogTitle className="text-xl font-display uppercase">Nova Etapa (Vídeo)</DialogTitle></DialogHeader>
                  <div className="space-y-4 py-4 font-sans">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-[#001F33]/50">Título do Vídeo</label>
                      <Input placeholder="Ex: Como se apresentar" value={newVideo.title} onChange={(e) => setNewVideo({...newVideo, title: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-[#0EA5E9]">Pontos de XP</label>
                        <Input type="number" value={newVideo.xpPoints} onChange={(e) => setNewVideo({...newVideo, xpPoints: parseInt(e.target.value)})} />
                        <p className="text-[10px] text-[#001F33]/50">Quanto vale esta etapa?</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-[#001F33]/50">URL do Vídeo</label>
                        <Input placeholder="Link Youtube/Vimeo" value={newVideo.url} onChange={(e) => setNewVideo({...newVideo, url: e.target.value})} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-[#001F33]/50">Descrição Breve</label>
                      <Textarea placeholder="Opcional..." value={newVideo.description} onChange={(e) => setNewVideo({...newVideo, description: e.target.value})} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsAddingVideo(false)} className="text-xs font-bold uppercase">Cancelar</Button>
                    <Button onClick={handleAddVideo} className="bg-[#001F33] text-white text-xs font-bold uppercase px-8">Salvar Etapa</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </motion.div>
          ) : currentTab === 'mentors' ? (
            <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               className="bg-white rounded-xl shadow-sm border border-[#001F33]/5 overflow-hidden font-sans"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#001F33] text-white uppercase text-xs tracking-widest font-bold">
                      <th className="px-6 py-4">Mentor / E-mail</th>
                      <th className="px-6 py-4">Especialidade / Bio</th>
                      <th className="px-6 py-4">Estado</th>
                      <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#001F33]/5">
                    {loadingMentors ? (
                      [1, 2, 3].map(i => <tr key={i} className="animate-pulse"><td colSpan={4} className="h-16 px-6 py-4 bg-[#001F33]/5">&nbsp;</td></tr>)
                    ) : mentors.length === 0 ? (
                      <tr><td colSpan={4} className="px-6 py-20 text-center text-[#001F33]/30 font-bold uppercase tracking-widest">Nenhuma solicitação de mentoria.</td></tr>
                    ) : (
                      mentors.map((m) => (
                        <tr key={m.id} className="hover:bg-[#0EA5E9]/5 transition-colors">
                          <td className="px-6 py-4">
                            <span className="block font-bold text-[#001F33] uppercase leading-tight">{m.name}</span>
                            <span className="text-xs text-[#001F33]/50">{m.email}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="block text-xs font-bold text-[#0EA5E9] uppercase">{m.specialties}</span>
                            <span className="text-[10px] text-[#001F33]/50 line-clamp-1">{m.bio || 'Sem bio...'}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                              m.status === 'ativo' ? 'bg-[#0EA5E9]/10 text-[#0EA5E9]' : 'bg-[#F97316]/10 text-[#F97316]'
                            }`}>
                              {m.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {m.status === 'pendente' ? (
                              <Button onClick={() => updateMentorStatus(m.id, 'ativo')} className="bg-[#0EA5E9] text-white text-[10px] font-bold uppercase px-4 h-9">
                                Aprovar
                              </Button>
                            ) : (
                              <Button onClick={() => updateMentorStatus(m.id, m.status === 'ativo' ? 'inativo' : 'ativo')} variant="ghost" className="text-xs text-[#001F33]/30 font-bold uppercase">
                                {m.status === 'ativo' ? 'Desativar' : 'Reativar'}
                              </Button>
                            )}
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
                Em breve poderá gerir Trilhas de Carreira e Conteúdo nesta secção.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
