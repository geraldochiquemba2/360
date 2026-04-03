import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Users, BookOpen, Briefcase, Settings, LogOut, LayoutDashboard, Menu, Plus, Trash2, ExternalLink, MapPin, Building2, Calendar, Film, Layers, UserCheck, Pencil, MessageSquare, MessageCircle } from "lucide-react";
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
import { ConfirmModal } from "@/components/ConfirmModal";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<"overview" | "users" | "jobs" | "content" | "mentors" | "forum">("overview");
  const [stats, setStats] = useState({ totalJovens: 0, totalMentores: 0, oportunidades: 0, simulacoes: 0 });
  const [candidates, setCandidates] = useState<any[]>([]);
  const [forumTopics, setForumTopics] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [tracks, setTracks] = useState<any[]>([]);
  const [mentors, setMentors] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [loadingOpportunities, setLoadingOpportunities] = useState(false);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [loadingMentors, setLoadingMentors] = useState(false);
  const [loadingForum, setLoadingForum] = useState(false);
  const { toast } = useToast();

  // Modais de Criação/Edição
  const [isAddingOpportunity, setIsAddingOpportunity] = useState(false);
  const [isAddingTrack, setIsAddingTrack] = useState(false);
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [isAddingVideo, setIsAddingVideo] = useState(false);
  const [videos, setVideos] = useState<any[]>([]);

  // Estados de Edição
  const [editingOpportunity, setEditingOpportunity] = useState<any>(null);
  const [editingTrack, setEditingTrack] = useState<any>(null);
  const [editingModule, setEditingModule] = useState<any>(null);
  const [editingVideo, setEditingVideo] = useState<any>(null);

  // Estados de Confirmação (Substituto do confirm)
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    variant?: "default" | "destructive";
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  const [newTrack, setNewTrack] = useState({ title: "", description: "", imageUrl: "" });
  const [selectedTrack, setSelectedTrack] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [currentModule, setCurrentModule] = useState<any>(null);
  const [newModule, setNewModule] = useState({ title: "", order: 0 });
  const [newVideo, setNewVideo] = useState({ title: "", url: "", description: "", xpPoints: 100, order: 0 });
  const [newOpportunity, setNewOpportunity] = useState({ title: "", company: "", location: "", type: "emprego", description: "", requirements: "", link: "", deadline: "" });

  useEffect(() => {
    const storedStr = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!token || !storedStr) { setLocation("/auth/login"); return; }
    const parsedUser = JSON.parse(storedStr);
    if (parsedUser.role !== "admin") { setLocation("/"); return; }
    setUser(parsedUser);
    fetchStats();
  }, [setLocation]);

  const fetchStats = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("/api/admin/stats", { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) setStats(await response.json());
    } catch (err) { console.error(err); } finally { setLoadingStats(false); }
  };

  const fetchCandidates = async () => {
    setLoadingCandidates(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("/api/admin/candidates", { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) setCandidates(await response.json());
    } catch (err) { console.error(err); } finally { setLoadingCandidates(false); }
  };

  useEffect(() => {
    if (currentTab === "users") fetchCandidates();
    else if (currentTab === "jobs") fetchOpportunities();
    else if (currentTab === "content") fetchTracks();
    else if (currentTab === "mentors") fetchMentors();
    else if (currentTab === "forum") fetchForumTopics();
  }, [currentTab]);

  const fetchMentors = async () => {
    setLoadingMentors(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("/api/admin/mentors", { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) setMentors(await response.json());
    } catch (err) { console.error(err); } finally { setLoadingMentors(false); }
  };

  const updateMentorStatus = async (id: number, status: string) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/admin/mentors/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      if (response.ok) { toast({ title: "Sucesso", description: `Mentor atualizado.` }); fetchMentors(); }
    } catch (err) { toast({ title: "Erro" }); }
  };

  const fetchForumTopics = async () => {
    setLoadingForum(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("/api/forum/topics", { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) setForumTopics(await response.json());
    } catch (err) { console.error(err); } finally { setLoadingForum(false); }
  };

  const handleDeleteTopic = async (id: number) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/admin/forum/topics/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        toast({ title: "Tópico removido com sucesso" });
        fetchForumTopics();
      }
    } catch (err) { toast({ title: "Erro ao eliminar tópico" }); }
  };

  const fetchTracks = async () => {
    setLoadingTracks(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("/api/admin/tracks", { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) setTracks(await response.json());
    } catch (err) { console.error(err); } finally { setLoadingTracks(false); }
  };

  const handleSaveTrack = async () => {
    const token = localStorage.getItem("token");
    const method = editingTrack ? "PATCH" : "POST";
    const url = editingTrack ? `/api/admin/tracks/${editingTrack.id}` : "/api/admin/tracks";
    
    try {
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(newTrack)
      });
      if (response.ok) { 
        toast({ title: editingTrack ? "Trilha Atualizada" : "Trilha Criada" }); 
        setIsAddingTrack(false); 
        setEditingTrack(null);
        setNewTrack({ title: "", description: "", imageUrl: "" }); 
        fetchTracks(); 
      }
    } catch (err) { toast({ title: "Erro" }); }
  };

  const fetchModules = async (trackId: number) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/admin/tracks/${trackId}/modules`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) setModules(await response.json());
    } catch (err) { console.error(err); }
  };

  const handleSaveModule = async () => {
    const token = localStorage.getItem("token");
    const method = editingModule ? "PATCH" : "POST";
    const url = editingModule ? `/api/admin/modules/${editingModule.id}` : "/api/admin/modules";

    try {
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ ...newModule, trackId: selectedTrack.id })
      });
      if (response.ok) { 
        toast({ title: editingModule ? "Módulo Atualizado" : "Módulo Adicionado" }); 
        setIsAddingModule(false); 
        setEditingModule(null);
        setNewModule({ title: "", order: 0 }); 
        fetchModules(selectedTrack.id); 
      }
    } catch (err) { toast({ title: "Erro" }); }
  };

  const handleSaveVideo = async () => {
    const token = localStorage.getItem("token");
    const method = editingVideo ? "PATCH" : "POST";
    const url = editingVideo ? `/api/admin/videos/${editingVideo.id}` : "/api/admin/videos";

    try {
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ ...newVideo, moduleId: currentModule.id, trackId: selectedTrack.id })
      });
      if (response.ok) { 
        toast({ title: editingVideo ? "Vídeo Atualizado" : "Vídeo Adicionado" }); 
        setIsAddingVideo(false); 
        setEditingVideo(null);
        setNewVideo({ title: "", url: "", description: "", xpPoints: 100, order: 0 }); 
        fetchVideos(currentModule.id); 
      }
    } catch (err) { toast({ title: "Erro" }); }
  };

  const handleSaveOpportunity = async () => {
    const token = localStorage.getItem("token");
    const method = editingOpportunity ? "PATCH" : "POST";
    const url = editingOpportunity ? `/api/admin/opportunities/${editingOpportunity.id}` : "/api/admin/opportunities";

    try {
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(newOpportunity)
      });
      if (response.ok) { 
        toast({ title: editingOpportunity ? "Vaga Atualizada" : "Vaga Criada" }); 
        setIsAddingOpportunity(false); 
        setEditingOpportunity(null);
        setNewOpportunity({ title: "", company: "", location: "", type: "emprego", description: "", requirements: "", link: "", deadline: "" }); 
        fetchOpportunities(); 
      }
    } catch (err) { toast({ title: "Erro" }); }
  };

  const fetchOpportunities = async () => {
    setLoadingOpportunities(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("/api/admin/opportunities", { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) setOpportunities(await response.json());
    } catch (err) { console.error(err); } finally { setLoadingOpportunities(false); }
  };

  const triggerDelete = (title: string, desc: string, onConfirm: () => void) => {
    setConfirmConfig({
      isOpen: true,
      title: title,
      description: desc,
      variant: "destructive",
      onConfirm: onConfirm
    });
  };

  const deleteOpportunity = async (id: number) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/admin/opportunities/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
      if (response.ok) { toast({ title: "Eliminado" }); fetchOpportunities(); }
    } catch (err) { toast({ title: "Erro" }); }
  };

  const deleteTrack = async (id: number) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/admin/tracks/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
      if (response.ok) { toast({ title: "Eliminado" }); fetchTracks(); }
    } catch (err) { toast({ title: "Erro" }); }
  };

  const deleteModule = async (id: number) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/admin/modules/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
      if (response.ok) { toast({ title: "Eliminado" }); fetchModules(selectedTrack.id); }
    } catch (err) { toast({ title: "Erro" }); }
  };

  const fetchVideos = async (moduleId: number) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/admin/modules/${moduleId}/videos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setVideos(await response.json());
      }
    } catch (err) { console.error("Erro ao buscar vídeos"); }
  };

  const deleteVideo = async (id: number) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/admin/videos/${id}`, { 
        method: "DELETE", 
        headers: { "Authorization": `Bearer ${token}` } 
      });
      if (response.ok) { 
        toast({ title: "Etapa Removida" }); 
        if (currentModule) fetchVideos(currentModule.id);
      }
    } catch (err) { toast({ title: "Erro ao eliminar vídeo" }); }
  };

  const handleLogout = () => { localStorage.clear(); setLocation("/"); };

  if (!user) return <div className="min-h-screen bg-[#001F33]"></div>;

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex font-sans font-medium text-[#001F33]">
      <ConfirmModal 
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig(prev => ({...prev, isOpen: false}))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        description={confirmConfig.description}
        variant={confirmConfig.variant}
        confirmText="Confirmar"
        cancelText="Voltar"
      />

      <aside className={`fixed inset-y-0 left-0 bg-[#001F33] text-white w-72 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 z-40 flex flex-col shadow-2xl`}>
        <div className="p-6 border-b border-white/10 flex flex-col items-center">
          <img src="/assets/logo.png" alt="Carreira 360" className="h-16 w-auto object-contain mb-4" />
          <p className="text-white/50 text-[10px] uppercase tracking-widest font-black">Centro Administrativo</p>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-3">
          {[
            { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'users', label: 'Utilizadores', icon: Users },
            { id: 'jobs', label: 'Vagas', icon: Briefcase },
            { id: 'content', label: 'Trilhas', icon: BookOpen },
            { id: 'mentors', label: 'Mentoria', icon: UserCheck },
            { id: 'forum', label: 'Comunidade', icon: MessageSquare },
          ].map((item) => (
            <Button 
              key={item.id}
              variant="ghost" 
              onClick={() => setCurrentTab(item.id as any)} 
              className={`w-full justify-start ${currentTab === item.id ? 'bg-[#0EA5E9]' : 'hover:bg-white/5'} text-white uppercase font-black text-xs h-12 rounded-xl transition-all shadow-sm ${currentTab === item.id ? 'shadow-lg shadow-[#0EA5E9]/30' : ''}`}
            >
              <item.icon className="mr-3 h-5 w-5" /> {item.label}
            </Button>
          ))}
        </nav>
        <div className="p-6 border-t border-white/10">
          <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-[#F97316] hover:bg-[#F97316]/10 uppercase font-black text-xs h-12 rounded-xl">
            <LogOut className="mr-3 h-5 w-5" /> Terminar Sessão
          </Button>
        </div>
      </aside>

      <main className="flex-1 md:ml-72 min-h-screen flex flex-col">
        <header className="h-20 bg-white border-b border-[#001F33]/5 flex items-center px-10 shadow-sm justify-between">
          <h1 className="text-2xl font-display uppercase text-[#001F33] tracking-tight">
            {currentTab === 'overview' && 'Visão Geral'}
            {currentTab === 'users' && 'Lista de Utilizadores'}
            {currentTab === 'jobs' && 'Gestão de Oportunidades'}
            {currentTab === 'content' && 'Produção de Trilhas'}
            {currentTab === 'mentors' && 'Moderação de Mentores'}
          </h1>
          {currentTab === 'jobs' && (
            <Button onClick={() => { setEditingOpportunity(null); setIsAddingOpportunity(true); }} className="bg-[#0EA5E9] text-white uppercase font-black text-xs px-6 h-11 rounded-full shadow-lg shadow-[#0EA5E9]/20 hover:scale-105 active:scale-95 transition-all">
              <Plus className="mr-2 h-4 w-4" /> Nova Vaga
            </Button>
          )}
          {currentTab === 'content' && !selectedTrack && (
            <Button onClick={() => { setEditingTrack(null); setIsAddingTrack(true); }} className="bg-[#0EA5E9] text-white uppercase font-black text-xs px-6 h-11 rounded-full shadow-lg shadow-[#0EA5E9]/20 hover:scale-105 active:scale-95 transition-all">
              <Plus className="mr-2 h-4 w-4" /> Nova Trilha
            </Button>
          )}
        </header>

        <div className="p-10">
          {currentTab === 'overview' && (
            <div className="space-y-10">
               <motion.div initial={{opacity:0, y: 20}} animate={{opacity:1, y: 0}} className="bg-[#001F33] p-12 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
                  <div className="relative z-10">
                    <h2 className="text-6xl font-display uppercase mb-4 tracking-tighter leading-none">Gestão Central <br/><span className="text-[#0EA5E9]">Carreira 360</span></h2>
                    <p className="text-white/70 font-medium max-w-2xl text-xl">Monitoriza o progresso dos jovens, valida mentores e mantém as oportunidades atualizadas.</p>
                  </div>
                  <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-[#0EA5E9] rounded-full blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
               </motion.div>
               <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    { label: "Jovens", val: stats.totalJovens, icon: Users, color: "bg-[#0EA5E9]" },
                    { label: "Mentores", val: stats.totalMentores, icon: UserCheck, color: "bg-[#F97316]" },
                    { label: "Vagas", val: stats.oportunidades, icon: Briefcase, color: "bg-[#0EA5E9]" },
                    { label: "Fórum", val: "Brevemente", icon: BookOpen, color: "bg-[#F97316]" }
                  ].map((s, i) => (
                    <motion.div initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} transition={{delay: i*0.1}} key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-[#001F33]/5 flex flex-col gap-2 group hover:shadow-xl transition-all">
                      <div className={`${s.color} p-4 rounded-2xl text-white w-fit shadow-lg shadow-black/10 group-hover:scale-110 transition-transform`}><s.icon size={28}/></div>
                      <div className="mt-4"><p className="text-[10px] font-black uppercase text-[#001F33]/40 tracking-widest leading-none mb-1">{s.label}</p><h4 className="text-3xl font-display text-[#001F33]">{s.val}</h4></div>
                    </motion.div>
                  ))}
               </div>
            </div>
          )}

          {currentTab === 'users' && (
            <div className="bg-white rounded-[32px] shadow-2xl overflow-hidden border border-[#001F33]/5">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#001F33] text-white uppercase text-[10px] font-black tracking-widest">
                    <tr className="h-16"><th className="px-10">Candidato</th><th className="px-10">Contacto</th><th className="px-10">Formação</th><th className="px-10">Registo</th></tr>
                  </thead>
                  <tbody className="divide-y divide-[#001F33]/5">
                    {candidates.map(c => (
                      <tr key={c.id} className="hover:bg-[#F5F0E8]/50 h-20 group transition-colors">
                        <td className="px-10 font-black uppercase text-sm text-[#001F33]">{c.name}</td>
                        <td className="px-10 text-xs font-bold text-[#001F33]/60">{c.email}</td>
                        <td className="px-10">
                          <span className="text-[10px] font-black text-[#F97316] uppercase block">{c.areaOfInterest || 'Área indefinida'}</span>
                          <span className="text-xs font-bold text-[#001F33]">{c.formation || 'N/A'}</span>
                        </td>
                        <td className="px-10 text-xs font-bold text-[#001F33]/40">{new Date(c.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {currentTab === 'jobs' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {opportunities.map(op => (
                <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} key={op.id} className="bg-white p-10 rounded-[32px] shadow-sm border border-[#001F33]/5 relative group hover:shadow-2xl transition-all">
                  <div className="flex justify-between items-start mb-8">
                    <span className="bg-[#0EA5E9]/10 text-[#0EA5E9] text-[10px] font-black uppercase px-3 py-1.5 rounded-full tracking-widest">{op.type}</span>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="text-[#0EA5E9] hover:bg-[#0EA5E9]/10 rounded-full" onClick={() => { 
                        setEditingOpportunity(op); 
                        setNewOpportunity({...op, deadline: op.deadline ? op.deadline.split('T')[0] : ""});
                        setIsAddingOpportunity(true); 
                      }}><Pencil size={20}/></Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 rounded-full" onClick={() => triggerDelete("Eliminar Vaga", `Tens a certeza que queres apagar a vaga ${op.title}?`, () => deleteOpportunity(op.id))}><Trash2 size={24}/></Button>
                    </div>
                  </div>
                  <h3 className="text-2xl font-display uppercase text-[#001F33] mb-4 group-hover:text-[#0EA5E9] transition-colors">{op.title}</h3>
                  <div className="flex items-center gap-4 text-[#001F33]/60 text-xs font-bold mb-8">
                    <span className="flex items-center gap-2"><Building2 size={16} className="text-[#0EA5E9]"/> {op.company}</span>
                    <span className="flex items-center gap-2"><MapPin size={16} className="text-[#0EA5E9]"/> {op.location}</span>
                  </div>
                  <div className="flex justify-between items-center pt-8 border-t border-[#001F33]/5">
                    <span className="text-[10px] font-black uppercase text-[#001F33]/40">Prazo: {op.deadline ? new Date(op.deadline).toLocaleDateString() : 'Indefinido'}</span>
                    <div className="h-10 w-10 rounded-full bg-[#F5F0E8] flex items-center justify-center text-[#0EA5E9] group-hover:bg-[#0EA5E9] group-hover:text-white transition-all"><ExternalLink size={16} /></div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {currentTab === 'content' && (
            <div className="space-y-10">
               {selectedTrack ? (
                 <div className="space-y-8">
                    <div className="flex items-center gap-4 mb-2">
                       <Button variant="ghost" onClick={() => setSelectedTrack(null)} className="text-[#0EA5E9] font-black uppercase text-[10px] tracking-widest">← Voltar às Trilhas</Button>
                    </div>
                    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="bg-[#001F33] p-10 rounded-[32px] text-white flex justify-between items-end shadow-xl">
                       <div className="space-y-2">
                          <p className="text-[#0EA5E9] text-[10px] font-black uppercase tracking-[0.3em]">Gestão de Módulos</p>
                          <h2 className="text-5xl font-display uppercase leading-none">{selectedTrack.title}</h2>
                       </div>
                       <Button onClick={() => { setEditingModule(null); setNewModule({title: "", order: modules.length}); setIsAddingModule(true); }} className="bg-white text-[#001F33] uppercase font-black text-xs px-8 h-12 rounded-full shadow-lg shadow-white/10 hover:scale-105 active:scale-95 transition-all">Novo Módulo</Button>
                    </motion.div>
                    
                    <div className="grid gap-4">
                      {modules.map(mod => (
                        <div key={mod.id} className="space-y-4">
                          <motion.div initial={{opacity:0, x: -20}} animate={{opacity:1, x: 0}} className="bg-white p-8 rounded-[24px] border border-[#001F33]/5 flex justify-between items-center shadow-sm hover:shadow-xl transition-all group">
                            <div className="flex items-center gap-6">
                               <div className="h-12 w-12 bg-[#F5F0E8] rounded-2xl flex items-center justify-center text-[#001F33] font-display text-xl">{mod.order + 1}</div>
                               <span className="font-display uppercase text-2xl text-[#001F33] tracking-tight">{mod.title}</span>
                            </div>
                            <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                               <Button 
                                 onClick={() => { 
                                   if (currentModule?.id === mod.id) {
                                     setCurrentModule(null);
                                     setVideos([]);
                                   } else {
                                     setCurrentModule(mod);
                                     fetchVideos(mod.id);
                                   }
                                 }} 
                                 className={`${currentModule?.id === mod.id ? 'bg-[#001F33]' : 'bg-[#0EA5E9]'} text-white text-[10px] font-black uppercase px-6 h-10 rounded-full transition-all`}
                               >
                                 {currentModule?.id === mod.id ? 'Fechar Etapas' : 'Etapas / Vídeos'}
                               </Button>
                               <Button onClick={() => { setEditingModule(mod); setNewModule({title: mod.title, order: mod.order}); setIsAddingModule(true); }} className="text-[#0EA5E9]"><Pencil size={20}/></Button>
                               <Button onClick={() => triggerDelete("Eliminar Módulo", "Isto apagará permanentemente o módulo e todos os vídeos associados.", () => deleteModule(mod.id))} className="text-red-500"><Trash2 size={22}/></Button>
                            </div>
                          </motion.div>

                          {/* Lista de Vídeos Expandida */}
                          <AnimatePresence>
                            {currentModule?.id === mod.id && (
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="pl-12 space-y-3 overflow-hidden"
                              >
                                {videos.map((vid: any) => (
                                  <div key={vid.id} className="bg-white/80 p-4 rounded-2xl border border-[#001F33]/5 flex justify-between items-center group/vid">
                                    <div className="flex items-center gap-4">
                                      <div className="h-8 w-8 bg-[#0EA5E9]/10 rounded-lg flex items-center justify-center text-[#0EA5E9]"><Film size={14} /></div>
                                      <div>
                                        <p className="font-bold text-sm text-[#001F33]">{vid.title}</p>
                                        <p className="text-[10px] font-medium text-[#001F33]/40 uppercase tracking-widest">{vid.xpPoints} XP • {vid.url.substring(0, 30)}...</p>
                                      </div>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover/vid:opacity-100 transition-opacity">
                                      <Button variant="ghost" size="icon" className="h-8 w-8 text-[#0EA5E9]" onClick={() => {
                                        setEditingVideo(vid);
                                        setNewVideo({...vid});
                                        setIsAddingVideo(true);
                                      }}><Pencil size={14}/></Button>
                                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => triggerDelete("Eliminar Etapa", "Tens a certeza que queres remover este vídeo?", () => deleteVideo(vid.id))}><Trash2 size={14}/></Button>
                                    </div>
                                  </div>
                                ))}
                                <Button 
                                  onClick={() => { setEditingVideo(null); setNewVideo({title: "", url: "", description: "", xpPoints: 100, order: videos.length}); setIsAddingVideo(true); }}
                                  variant="outline" 
                                  className="w-full border-dashed border-2 border-[#0EA5E9]/30 text-[#0EA5E9] font-black uppercase text-[10px] h-12 rounded-2xl hover:bg-[#0EA5E9]/5"
                                >
                                  <Plus size={14} className="mr-2" /> Adicionar Nova Etapa
                                </Button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   {tracks.map(t => (
                     <motion.div initial={{opacity:0, y: 30}} animate={{opacity:1, y: 0}} key={t.id} className="bg-white rounded-[40px] shadow-sm border border-[#001F33]/5 p-12 flex flex-col justify-between group h-96 relative overflow-hidden hover:shadow-2xl transition-all">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-[#0EA5E9]/5 rounded-bl-full -mr-10 -mt-10 group-hover:scale-150 group-hover:bg-[#0EA5E9]/10 transition-all duration-700"></div>
                        <div className="relative z-10">
                          <div className="flex justify-between items-start mb-6">
                             <div className="h-14 w-14 bg-[#001F33] rounded-2xl flex items-center justify-center text-[#0EA5E9] shadow-lg shadow-[#001F33]/20"><Film size={28}/></div>
                             <div className="flex gap-2">
                                <Button onClick={() => { setEditingTrack(t); setNewTrack({...t}); setIsAddingTrack(true); }} variant="ghost" size="icon" className="text-[#0EA5E9] hover:bg-[#0EA5E9]/10 rounded-full"><Pencil size={20}/></Button>
                                <Button onClick={() => triggerDelete("Eliminar Trilha", `Tens a certeza que queres apagar a trilha ${t.title}?`, () => deleteTrack(t.id))} variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 rounded-full"><Trash2 size={24}/></Button>
                             </div>
                          </div>
                          <h3 className="text-3xl font-display uppercase text-[#001F33] mb-6 tracking-tight leading-none">{t.title}</h3>
                          <p className="text-sm font-bold text-[#001F33]/60 mb-8 line-clamp-3 leading-relaxed">{t.description}</p>
                        </div>
                        <Button 
                          onClick={() => { setSelectedTrack(t); fetchModules(t.id); }} 
                          className="bg-[#001F33] text-white uppercase font-black text-xs px-10 h-14 rounded-full shadow-2xl shadow-[#001F33]/30 active:scale-95 transition-all relative z-10 border-2 border-transparent hover:border-[#0EA5E9]"
                        >
                          Gerir Conteúdo
                        </Button>
                     </motion.div>
                   ))}
                 </div>
               )}
            </div>
          )}

          {currentTab === 'mentors' && (
            <div className="bg-white rounded-[32px] shadow-2xl overflow-hidden border border-[#001F33]/5">
              <table className="w-full text-left">
                <thead className="bg-[#001F33] text-white font-black uppercase text-[10px] tracking-widest"><tr className="h-16"><th className="px-10">Mentor</th><th className="px-10">Especialidade</th><th className="px-10">Estado</th><th className="px-10 text-right">Acções de Moderação</th></tr></thead>
                <tbody className="divide-y divide-[#001F33]/5">
                  {mentors.map(m => (
                    <tr key={m.id} className="h-20 hover:bg-[#F5F0E8]/50 transition-colors">
                      <td className="px-10"><p className="font-extrabold uppercase text-sm text-[#001F33]">{m.name}</p><p className="text-[10px] font-bold text-[#001F33]/40">{m.email}</p></td>
                      <td className="px-10 text-xs font-black text-[#0EA5E9] uppercase tracking-widest">{m.specialties}</td>
                      <td className="px-10">
                        <span className={`text-[10px] font-black uppercase px-4 py-1.5 rounded-full ${m.status === 'ativo' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>{m.status}</span>
                      </td>
                      <td className="px-10 text-right">
                        <Button variant="outline" size="sm" onClick={() => updateMentorStatus(m.id, m.status === 'ativo' ? 'inativo' : 'ativo')} className="text-[10px] font-black uppercase h-10 px-6 rounded-full border-[#001F33]/20 text-[#001F33] hover:bg-[#001F33] hover:text-white transition-all select-none">{m.status === 'ativo' ? 'Suspender' : 'Aprovar Mentor'}</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {currentTab === 'forum' && (
            <div className="bg-white rounded-[32px] shadow-2xl overflow-hidden border border-[#001F33]/5">
              <table className="w-full text-left">
                <thead className="bg-[#001F33] text-white font-black uppercase text-[10px] tracking-widest"><tr className="h-16"><th className="px-10">Tópico</th><th className="px-10">Categoria</th><th className="px-10">Autor</th><th className="px-10 text-right">Acções</th></tr></thead>
                <tbody className="divide-y divide-[#001F33]/5">
                  {forumTopics.map(t => (
                    <tr key={t.id} className="h-20 hover:bg-[#F5F0E8]/50 transition-colors">
                      <td className="px-10">
                        <p className="font-extrabold uppercase text-sm text-[#001F33]">{t.title}</p>
                        <p className="text-[10px] font-bold text-[#001F33]/40 tracking-widest">{new Date(t.createdAt).toLocaleDateString()}</p>
                      </td>
                      <td className="px-10">
                        <span className="text-[10px] font-black uppercase px-4 py-1.5 rounded-full bg-[#0EA5E9]/10 text-[#0EA5E9]">{t.category}</span>
                      </td>
                      <td className="px-10">
                        <p className="text-xs font-black text-[#001F33] uppercase">{t.authorName}</p>
                      </td>
                      <td className="px-10 text-right">
                        <Button 
                          variant="ghost" 
                          onClick={() => setConfirmConfig({
                            isOpen: true,
                            title: "Eliminar Tópico?",
                            description: "Esta acção é irreversível e removerá todos os comentários associados.",
                            variant: "destructive",
                            onConfirm: () => handleDeleteTopic(t.id)
                          })}
                          className="h-11 w-11 rounded-full text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* MODAIS REPROJETADOS - CORES NAVY/CREME */}
        <Dialog open={isAddingOpportunity} onOpenChange={setIsAddingOpportunity}>
          <DialogContent className="max-w-3xl bg-white border-none shadow-2xl rounded-[40px] p-10 select-none">
            <DialogHeader><DialogTitle className="text-3xl font-display uppercase text-[#001F33] tracking-tighter">{editingOpportunity ? 'Editar Oportunidade' : 'Cadastrar Oportunidade'}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-8 py-8">
              <div className="space-y-2"><label className="text-[10px] font-black uppercase text-[#001F33] tracking-[0.2em] ml-2">Cargo / Título</label><Input className="text-[#001F33] bg-[#F5F0E8] border-none h-14 rounded-2xl font-bold px-6 focus:ring-[#0EA5E9]" value={newOpportunity.title} onChange={e => setNewOpportunity({...newOpportunity, title: e.target.value})} placeholder="Ex: Desenvolvedor React" /></div>
              <div className="space-y-2"><label className="text-[10px] font-black uppercase text-[#001F33] tracking-[0.2em] ml-2">Instituição / Empresa</label><Input className="text-[#001F33] bg-[#F5F0E8] border-none h-14 rounded-2xl font-bold px-6 focus:ring-[#0EA5E9]" value={newOpportunity.company} onChange={e => setNewOpportunity({...newOpportunity, company: e.target.value})} placeholder="Ex: Unitel" /></div>
              <div className="space-y-2"><label className="text-[10px] font-black uppercase text-[#001F33] tracking-[0.2em] ml-2">Cidade / Província</label><Input className="text-[#001F33] bg-[#F5F0E8] border-none h-14 rounded-2xl font-bold px-6 focus:ring-[#0EA5E9]" value={newOpportunity.location} onChange={e => setNewOpportunity({...newOpportunity, location: e.target.value})} placeholder="Ex: Luanda, Talatona" /></div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-[#001F33] tracking-[0.2em] ml-2">Natureza</label>
                <Select value={newOpportunity.type} onValueChange={(val) => setNewOpportunity({...newOpportunity, type: val})}>
                  <SelectTrigger className="text-[#001F33] bg-[#F5F0E8] border-none h-14 rounded-2xl font-bold px-6"><SelectValue placeholder="Tipo" /></SelectTrigger>
                  <SelectContent><SelectItem value="emprego">Emprego</SelectItem><SelectItem value="estagio">Estágio</SelectItem><SelectItem value="bolsa">Bolsa de Estudo</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2"><label className="text-[10px] font-black uppercase text-[#001F33] tracking-[0.2em] ml-2">Descritivo da Vaga</label><Textarea className="text-[#001F33] bg-[#F5F0E8] border-none min-h-[140px] rounded-3xl font-bold p-6 focus:ring-[#0EA5E9]" value={newOpportunity.description} onChange={e => setNewOpportunity({...newOpportunity, description: e.target.value})} placeholder="Quais são as responsabilidades e o que procuro?" /></div>
              <div className="space-y-2"><label className="text-[10px] font-black uppercase text-[#001F33] tracking-[0.2em] ml-2">Candidatura (URL/Email)</label><Input className="text-[#001F33] bg-[#F5F0E8] border-none h-14 rounded-2xl font-bold px-6 focus:ring-[#0EA5E9]" value={newOpportunity.link} onChange={e => setNewOpportunity({...newOpportunity, link: e.target.value})} placeholder="Onde o jovem clica?" /></div>
              <div className="space-y-2"><label className="text-[10px] font-black uppercase text-[#001F33] tracking-[0.2em] ml-2">Fecho Candidaturas</label><Input type="date" className="text-[#001F33] bg-[#F5F0E8] border-none h-14 rounded-2xl font-bold px-6 focus:ring-[#0EA5E9]" value={newOpportunity.deadline} onChange={e => setNewOpportunity({...newOpportunity, deadline: e.target.value})} /></div>
            </div>
            <DialogFooter className="mt-4"><Button onClick={handleSaveOpportunity} className="bg-[#001F33] text-white uppercase font-black text-xs w-full h-16 rounded-3xl shadow-2xl shadow-[#001F33]/30 hover:bg-[#0EA5E9] transition-all tracking-widest">{editingOpportunity ? 'Guardar Alterações' : 'Publicar Vaga Agora'}</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isAddingTrack} onOpenChange={setIsAddingTrack}>
          <DialogContent className="max-w-xl bg-white border-none shadow-2xl rounded-[40px] p-12">
            <DialogHeader><DialogTitle className="text-3xl font-display uppercase text-[#001F33] tracking-tighter">{editingTrack ? 'Editar Trilha' : 'Nova Trilha Profissional'}</DialogTitle></DialogHeader>
            <div className="space-y-8 py-8">
              <div className="space-y-2"><label className="text-[10px] font-black uppercase text-[#001F33] tracking-[0.2em] ml-2">Nome da Jornada</label><Input className="text-[#001F33] bg-[#F5F0E8] border-none h-16 rounded-2xl font-bold px-8 text-lg" value={newTrack.title} onChange={e => setNewTrack({...newTrack, title: e.target.value})} placeholder="Ex: Domínio Financeiro" /></div>
              <div className="space-y-2"><label className="text-[10px] font-black uppercase text-[#001F33] tracking-[0.2em] ml-2">Explicação Curta</label><Textarea className="text-[#001F33] bg-[#F5F0E8] border-none min-h-[120px] rounded-3xl font-bold p-8" value={newTrack.description} onChange={e => setNewTrack({...newTrack, description: e.target.value})} placeholder="O que o jovem vai atingir com isto?" /></div>
              <div className="space-y-2"><label className="text-[10px] font-black uppercase text-[#001F33] tracking-[0.2em] ml-2">Capa (Caminho da Imagem)</label><Input className="text-[#001F33] bg-[#F5F0E8] border-none h-16 rounded-2xl font-bold px-8" value={newTrack.imageUrl} onChange={e => setNewTrack({...newTrack, imageUrl: e.target.value})} placeholder="/assets/img/trilha-1.jpg" /></div>
            </div>
            <DialogFooter><Button onClick={handleSaveTrack} className="bg-[#0EA5E9] text-white uppercase font-black text-xs w-full h-16 rounded-3xl shadow-2xl shadow-[#0EA5E9]/30 hover:bg-[#001F33] transition-all tracking-[0.3em]">{editingTrack ? 'Atualizar Trilha' : 'Lançar Trilha'}</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isAddingModule} onOpenChange={setIsAddingModule}>
          <DialogContent className="max-w-md bg-white border-none shadow-2xl rounded-[40px] p-10">
            <DialogHeader><DialogTitle className="text-2xl font-display uppercase text-[#001F33] tracking-tighter">{editingModule ? 'Renomear Módulo' : 'Novo Módulo de Aprendizagem'}</DialogTitle></DialogHeader>
            <div className="py-8 space-y-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-[#001F33] tracking-widest ml-2">Nome do Módulo</label>
                  <Input className="text-[#001F33] bg-[#F5F0E8] border-none h-16 rounded-[20px] font-black px-8 text-lg" value={newModule.title} onChange={e => setNewModule({...newModule, title: e.target.value})} placeholder="Ex: Preparação Mental" />
               </div>
            </div>
            <DialogFooter><Button onClick={handleSaveModule} className="w-full bg-[#001F33] text-white uppercase font-black text-xs h-16 rounded-3xl shadow-xl hover:bg-[#0EA5E9] transition-all tracking-[0.2em]">{editingModule ? 'Actualizar Nome' : 'Confirmar Módulo'}</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isAddingVideo} onOpenChange={setIsAddingVideo}>
          <DialogContent className="max-w-2xl bg-white border-none shadow-2xl rounded-[40px] p-12">
            <DialogHeader><DialogTitle className="text-3xl font-display uppercase text-[#001F33] tracking-tighter">{editingVideo ? 'Editar Etapa' : 'Adicionar Etapa (Vídeo / Link)'}</DialogTitle></DialogHeader>
            <div className="py-10 space-y-8">
               <div className="space-y-2"><label className="text-[10px] font-black uppercase text-[#001F33] tracking-widest ml-2">Título da Etapa</label><Input className="text-[#001F33] bg-[#F5F0E8] border-none h-16 rounded-2xl font-bold px-8 text-lg" value={newVideo.title} onChange={e => setNewVideo({...newVideo, title: e.target.value})} /></div>
               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2"><label className="text-[10px] font-black uppercase text-[#001F33] tracking-widest ml-2">Fonte do Vídeo (URL)</label><Input className="text-[#001F33] bg-[#F5F0E8] border-none h-16 rounded-2xl font-bold px-8" value={newVideo.url} onChange={e => setNewVideo({...newVideo, url: e.target.value})} /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black uppercase text-[#001F33] tracking-widest ml-2">Recompensa (XP)</label><Input type="number" className="text-[#001F33] bg-[#F5F0E8] border-none h-16 rounded-2xl font-bold px-8" value={newVideo.xpPoints} onChange={e => setNewVideo({...newVideo, xpPoints: parseInt(e.target.value)})} /></div>
               </div>
               <div className="space-y-2"><label className="text-[10px] font-black uppercase text-[#001F33] tracking-widest ml-2">O que o jovem deve fazer / aprender?</label><Textarea className="text-[#001F33] bg-[#F5F0E8] border-none min-h-[140px] rounded-[32px] font-bold p-8" value={newVideo.description} onChange={e => setNewVideo({...newVideo, description: e.target.value})} placeholder="Instruções para completar esta etapa..." /></div>
            </div>
            <DialogFooter><Button onClick={handleSaveVideo} className="w-full bg-[#0EA5E9] text-white uppercase font-black text-xs h-18 rounded-[32px] shadow-2xl shadow-[#0EA5E9]/40 active:scale-95 transition-all tracking-[0.3em]">{editingVideo ? 'Guardar Etapa' : 'Vincular à Trilha'}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
