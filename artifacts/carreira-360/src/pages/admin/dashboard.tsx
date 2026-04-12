import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Users, BookOpen, Briefcase, Settings, LogOut, LayoutDashboard, Menu, Plus, Trash2, ExternalLink, MapPin, Building2, Calendar, Film, Layers, UserCheck, Pencil, MessageSquare, MessageCircle, X, Search, Check } from "lucide-react";
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
import { AdminSidebar } from "@/components/layout/AdminSidebar";

const getYouTubeVideoId = (url: string) => {
  if (!url) return null;
  // Regex mais robusta que suporta youtu.be, youtube.com, embed, watch?, v/ e parâmetros de query
  const regExp = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[1].length === 11) ? match[1] : null;
};

const getFileUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("blob:") || url.startsWith("/")) return url;
  return `/attached_assets/${url}`;
};

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
  const [searchJobs, setSearchJobs] = useState("");
  const [filterJobType, setFilterJobType] = useState("all");
  const [searchUsers, setSearchUsers] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [searchMentors, setSearchMentors] = useState("");
  const [filterMentorStatus, setFilterMentorStatus] = useState<"all" | "pendente" | "ativo" | "rejeitado">("all");
  const { toast } = useToast();

  // Modais de Criação/Edição
  const [isAddingOpportunity, setIsAddingOpportunity] = useState(false);
  const [isAddingTrack, setIsAddingTrack] = useState(false);
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [isAddingVideo, setIsAddingVideo] = useState(false);
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [videos, setVideos] = useState<any[]>([]);

  // Estados de Edição e Visualização
  const [editingOpportunity, setEditingOpportunity] = useState<any>(null);
  const [editingTrack, setEditingTrack] = useState<any>(null);
  const [editingModule, setEditingModule] = useState<any>(null);
  const [editingVideo, setEditingVideo] = useState<any>(null);
  const [viewUser, setViewUser] = useState<any>(null);
  const [isRejectingUser, setIsRejectingUser] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [userToReject, setUserToReject] = useState<number | null>(null);
  const [editingTopic, setEditingTopic] = useState<any>(null);

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

  const [newTrack, setNewTrack] = useState({ title: "", description: "", imageUrl: "", duration: "", hasCertificate: true });
  const [selectedTrack, setSelectedTrack] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [currentModule, setCurrentModule] = useState<any>(null);
  const [newModule, setNewModule] = useState({ title: "", order: 0 });
  const [newVideo, setNewVideo] = useState({ title: "", url: "", description: "", xpPoints: 100, order: 0 });
  const [newOpportunity, setNewOpportunity] = useState({ title: "", company: "", location: "", type: "emprego", description: "", requirements: "", link: "", deadline: "", imageUrl: "" });
  const [newTopic, setNewTopic] = useState({ title: "", content: "", category: "Geral", imageUrl: "", videoUrl: "" });
  const [customCategory, setCustomCategory] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab && ["overview", "users", "jobs", "content", "mentors", "forum"].includes(tab)) {
      setCurrentTab(tab as any);
    }

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

  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = (c.name?.toLowerCase() || "").includes(searchUsers.toLowerCase()) || 
                         (c.email?.toLowerCase() || "").includes(searchUsers.toLowerCase());
    const matchesRole = filterRole === 'all' ? true : 
                       (filterRole === 'candidate' ? c.role === 'candidato' : c.role === 'mentor');
    return matchesSearch && matchesRole;
  });

  const usersContent = (() => {
    if (loadingCandidates) {
      return (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[32px] border-2 border-[#8B4513] shadow-sm">
          <div className="animate-spin h-10 w-10 border-4 border-[#0EA5E9] border-t-transparent rounded-full mb-4"></div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#001F33]/50">A carregar utilizadores...</p>
        </div>
      );
    }

    if (filteredCandidates.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[32px] border-2 border-[#8B4513] shadow-sm text-center px-10">
          <Users size={48} className="text-[#001F33]/10 mb-6" />
          <h3 className="text-xl font-display uppercase text-[#001F33]">Nenhum utilizador encontrado</h3>
          <p className="text-sm font-bold text-[#001F33]/50 mt-2">Tenta mudar o perfil ou limpar a pesquisa.</p>
          {(searchUsers || filterRole !== 'all') && (
            <Button 
              variant="ghost" 
              onClick={() => { setSearchUsers(""); setFilterRole("all"); }}
              className="mt-6 text-[#0EA5E9] hover:bg-[#0EA5E9]/10 font-bold uppercase text-[10px] tracking-widest rounded-full h-11 px-8"
            >
              Limpar Filtros
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* MOBILE CARDS - Visível até ecrãs Grandes */}
        <div className="lg:hidden bg-white rounded-[32px] shadow-2xl overflow-hidden border-2 border-[#8B4513] divide-y-2 divide-[#8B4513]">
          {filteredCandidates.map(c => (
            <div key={c.id} className={`p-5 flex flex-col gap-3 ${c.status === 'pendente' ? 'bg-orange-50' : c.status === 'rejeitado' ? 'bg-red-50 opacity-60' : ''}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold uppercase text-sm text-[#001F33]">{c.name}</p>
                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full mt-1 inline-block ${c.role === 'mentor' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                    {c.role === 'mentor' ? 'Mentor' : 'Candidato'}
                  </span>
                </div>
                <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full shrink-0 ${c.status === 'pendente' ? 'bg-orange-100 text-orange-600' : c.status === 'rejeitado' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                  {c.status === 'pendente' ? 'Pendente' : c.status === 'rejeitado' ? 'Rejeitado' : 'Ativo'}
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-[#001F33]/85 break-all">{c.email}</p>
                <p className="text-xs font-bold text-[#F97316]">{c.phone || '---'}</p>
              </div>
              <div className="flex gap-4 text-xs font-bold">
                {c.cvUrl ? (
                  <a href={c.cvUrl} target="_blank" rel="noreferrer" className="text-[#0EA5E9] underline flex items-center gap-1 hover:text-[#F97316]"><ExternalLink size={12}/> CV</a>
                ) : <span className="text-[#001F33]/70">Sem CV</span>}
                {c.socialLink ? (
                  <a href={c.socialLink} target="_blank" rel="noreferrer" className="text-blue-600 underline flex items-center gap-1 hover:text-blue-800"><ExternalLink size={12}/> LinkedIn</a>
                ) : <span className="text-[#001F33]/70">Sem LinkedIn</span>}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => setViewUser(c)} size="sm" variant="outline" className="h-8 text-[9px] uppercase px-3 font-bold border-[#001F33]/20 hover:border-[#0EA5E9] hover:text-[#0EA5E9]">Detalhes</Button>
                {c.status === 'pendente' && (
                  <>
                    <Button onClick={() => handleUpdateStatus(c.id, 'ativo')} size="sm" className="h-8 bg-green-500 hover:bg-green-600 text-white font-bold text-[9px] uppercase px-3 shadow-sm">Aprovar</Button>
                    <Button onClick={() => { setUserToReject(c.id); setIsRejectingUser(true); }} size="sm" variant="destructive" className="h-8 font-bold text-[9px] uppercase px-3 shadow-sm">Rejeitar</Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* DESKTOP TABLE - Visível apenas em ecrãs XL */}
        <div className="hidden lg:block overflow-x-auto bg-white rounded-[32px] shadow-2xl border-2 border-[#8B4513]">
          <div className="min-w-[1000px]">
            <table className="w-full text-left">
              <thead className="bg-[#001F33] text-white uppercase text-[10px] font-bold tracking-widest">
                <tr className="h-16">
                  <th className="px-10 whitespace-nowrap">Candidato / Perfil</th>
                  <th className="px-10 whitespace-nowrap">E-mail / Contacto</th>
                  <th className="px-10 whitespace-nowrap">Mídia (CV / LinkedIn)</th>
                  <th className="px-10 whitespace-nowrap text-right pr-20">Gestão</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[#8B4513]">
                {filteredCandidates.map(c => (
                  <tr key={c.id} className={`hover:bg-[#EBDCC6]/50 h-24 group transition-colors ${c.status === 'pendente' ? 'bg-orange-50' : c.status === 'rejeitado' ? 'bg-red-50 opacity-60' : ''}`}>
                    <td className="px-10">
                      <span className="font-bold uppercase text-sm text-[#001F33] block mb-1">{c.name}</span>
                      <span className={`text-[9px] font-bold uppercase px-2 py-1 rounded-full ${c.role === 'mentor' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                        {c.role === 'mentor' ? 'Mentor' : 'Jovem'}
                      </span>
                    </td>
                    <td className="px-10">
                      <span className="text-xs font-bold text-[#001F33]/85 block">{c.email}</span>
                      <span className="text-xs font-bold text-[#F97316]">{c.phone || "---"}</span>
                    </td>
                    <td className="px-10 text-xs font-bold">
                      {c.cvUrl ? (
                        <a href={getFileUrl(c.cvUrl)} target="_blank" rel="noreferrer" className="text-[#0EA5E9] hover:text-[#F97316] underline flex items-center mb-1"><ExternalLink size={12} className="mr-1" /> CV Documento</a>
                      ) : <span className="text-[#001F33]/80 block mb-1">Sem CV</span>}
                      {c.socialLink ? (
                        <a href={c.socialLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 underline flex items-center"><ExternalLink size={12} className="mr-1" /> LinkedIn</a>
                      ) : <span className="text-[#001F33]/80 block">Sem Rede Social</span>}
                    </td>
                    <td className="px-10 text-right pr-10">
                      <Button 
                        onClick={() => setViewUser(c)} 
                        size="sm" 
                        variant="ghost" 
                        className={`h-11 px-6 rounded-2xl font-bold uppercase text-[10px] tracking-widest transition-all ${c.status === 'pendente' ? 'bg-[#F97316]/10 text-[#F97316] hover:bg-[#F97316]/20' : 'bg-[#0EA5E9]/10 text-[#0EA5E9] hover:bg-[#0EA5E9]/20'}`}
                      >
                        {c.status === 'pendente' ? '🕒 Analisar' : '📋 Ver Perfil'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  })();

  const mentorsContent = (() => {
    if (loadingMentors) {
      return (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[32px] border-2 border-[#8B4513] shadow-sm">
          <div className="animate-spin h-10 w-10 border-4 border-[#F97316] border-t-transparent rounded-full mb-4"></div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#001F33]/50">A carregar mentores...</p>
        </div>
      );
    }
  
    const filteredMentors = mentors.filter(m => {
      const matchesSearch = (m.name || "").toLowerCase().includes(searchMentors.toLowerCase()) || 
                           (m.email || "").toLowerCase().includes(searchMentors.toLowerCase());
      const matchesStatus = filterMentorStatus === 'all' || m.status === filterMentorStatus;
      return matchesSearch && matchesStatus;
    });

    if (filteredMentors.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[32px] border-2 border-[#8B4513] shadow-sm text-center px-10">
          <UserCheck size={48} className="text-[#001F33]/10 mb-6" />
          <h3 className="text-xl font-display uppercase text-[#001F33]">Nenhum mentor nesta categoria</h3>
          <p className="text-sm font-bold text-[#001F33]/50 mt-2">Tenta mudar o filtro ou pesquisar por outro nome.</p>
          {(searchMentors || filterMentorStatus !== 'all') && (
            <Button 
              variant="ghost" 
              onClick={() => { setSearchMentors(""); setFilterMentorStatus("all"); }}
              className="mt-6 text-[#F97316] hover:bg-[#F97316]/10 font-bold uppercase text-[10px] tracking-widest rounded-full h-11 px-8"
            >
              Limpar Pesquisa
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="space-y-6">
        {/* MOBILE CARDS */}
        <div className="lg:hidden bg-white rounded-[32px] shadow-2xl overflow-hidden border-2 border-[#8B4513] divide-y-2 divide-[#8B4513]">
          {filteredMentors.map(m => (
            <div key={m.id} className={`p-6 flex flex-col gap-4 ${m.status === 'pendente' ? 'bg-[#F97316]/5' : ''}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold uppercase text-base text-[#001F33]">{m.name}</p>
                  <p className="text-xs font-bold text-[#001F33]/60">{m.email}</p>
                </div>
                <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${m.status === 'pendente' ? 'bg-orange-100 text-orange-600' : m.status === 'rejeitado' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                  {m.status}
                </span>
              </div>
              <div className="bg-[#EBDCC6]/50 p-3 rounded-xl border border-[#8B4513]/20">
                <p className="text-[9px] font-bold uppercase text-[#001F33]/40 tracking-widest mb-1">Especialidade / Bio</p>
                <p className="text-xs font-bold text-[#001F33]/80 line-clamp-3 leading-relaxed">{m.bio || 'Sem biografia informada'}</p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-bold text-[#001F33]/50">
                {m.expertise && (
                  <span className="bg-[#0EA5E9]/5 text-[#0EA5E9] px-2 py-0.5 rounded border border-[#0EA5E9]/20 uppercase text-[9px] font-bold">{m.expertise}</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2 pt-2 border-t border-[#8B4513]/20">
                {m.status === 'pendente' && (
                  <>
                    <Button onClick={() => updateMentorStatus(m.id, 'ativo')} size="sm" className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold text-[9px] uppercase px-4 h-10 shadow-sm">Aprovar</Button>
                    <Button onClick={() => updateMentorStatus(m.id, 'rejeitado')} size="sm" variant="destructive" className="flex-1 font-bold text-[9px] uppercase px-4 h-10 shadow-sm">Rejeitar</Button>
                  </>
                )}
                {m.status === 'ativo' && (
                  <Button onClick={() => updateMentorStatus(m.id, 'rejeitado')} variant="outline" size="sm" className="w-full h-10 text-[9px] border-red-200 text-red-500 hover:bg-red-50 uppercase font-bold">Suspender Acesso</Button>
                )}
                {m.status === 'rejeitado' && (
                  <Button onClick={() => updateMentorStatus(m.id, 'ativo')} variant="outline" size="sm" className="w-full h-10 text-[9px] border-green-200 text-green-600 hover:bg-green-50 uppercase font-bold">Ativar Mentor</Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden lg:block bg-white rounded-[32px] shadow-2xl overflow-hidden border-2 border-[#8B4513]">
          <table className="w-full text-left">
            <thead className="bg-[#001F33] text-white font-bold uppercase text-[10px] tracking-widest border-b border-[#8B4513]/50">
              <tr className="h-16">
                <th className="px-10">Mentor / Cadastro</th>
                <th className="px-10">Biografia & Especialidade</th>
                <th className="px-10 text-right pr-20">Estado & Gestão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#8B4513]/50">
              {filteredMentors.map(m => (
                <tr key={m.id} className={`h-24 hover:bg-[#EBDCC6]/50 transition-colors ${m.status === 'pendente' ? 'bg-[#F97316]/5' : ''}`}>
                  <td className="px-10">
                    <p className="font-bold uppercase text-sm text-[#001F33]">{m.name}</p>
                    <p className="text-xs font-bold text-[#001F33]/60">{m.email}</p>
                  </td>
                  <td className="px-10 py-4 max-w-md">
                    {m.expertise && (
                      <span className="inline-block bg-[#0EA5E9]/10 text-[#0EA5E9] text-[9px] font-bold uppercase px-2 py-0.5 rounded mb-1.5">{m.expertise}</span>
                    )}
                    <p className="text-xs font-bold text-[#001F33]/80 line-clamp-2 leading-relaxed">{m.bio || 'Sem biografia informada'}</p>
                  </td>
                  <td className="px-10 text-right pr-10">
                    <Button 
                      onClick={() => setViewUser(m)} 
                      size="sm" 
                      variant="ghost" 
                      className={`h-11 px-6 rounded-2xl font-bold uppercase text-[10px] tracking-widest transition-all ${m.status === 'pendente' ? 'bg-[#F97316]/10 text-[#F97316] hover:bg-[#F97316]/20' : 'bg-[#0EA5E9]/10 text-[#0EA5E9] hover:bg-[#0EA5E9]/20'}`}
                    >
                      {m.status === 'pendente' ? '🕒 Analisar' : '📋 Ver Perfil'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    );
  })();

  const handleUpdateStatus = async (id: number, status: string, reason?: string) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, rejectionReason: reason })
      });
      if (response.ok) {
        toast({ title: "Sucesso", description: `Estado atualizado.` });
        setIsRejectingUser(false);
        setRejectionReason("");
        setUserToReject(null);
        fetchCandidates();
        fetchMentors();
        fetchStats();
      } else {
        throw new Error("Falha");
      }
    } catch(err: any) {
      toast({ variant: "destructive", title: "Erro", description: err.message });
    }
  };

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
      if (response.ok) { 
        toast({ title: "Sucesso", description: `Mentor atualizado.` }); 
        fetchMentors(); 
        fetchStats();
      }
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

  const handleSaveTopic = async () => {
    if (!newTopic.title.trim() || !newTopic.content.trim()) {
      toast({ variant: "destructive", title: "Erro", description: "O título e o conteúdo são obrigatórios." });
      return;
    }
    const finalCategory = newTopic.category === "_new_" ? customCategory.trim() : newTopic.category;
    if (newTopic.category === "_new_" && !finalCategory) {
      toast({ variant: "destructive", title: "Erro", description: "Por favor, introduza o nome da nova categoria." });
      return;
    }

    const token = localStorage.getItem("token");
    const method = editingTopic ? "PATCH" : "POST";
    const url = editingTopic ? `/api/forum/topics/${editingTopic.id}` : "/api/forum/topics";

    try {
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ ...newTopic, category: finalCategory })
      });
      if (response.ok) { 
        toast({ title: editingTopic ? "Tópico Atualizado" : "Tópico Criado com Sucesso" }); 
        setIsAddingTopic(false); 
        setEditingTopic(null);
        setNewTopic({ title: "", content: "", category: "Geral", imageUrl: "", videoUrl: "" }); 
        setCustomCategory("");
        fetchForumTopics(); 
      } else {
        const errData = await response.json().catch(() => ({}));
        toast({ 
          variant: "destructive", 
          title: editingTopic ? "Erro ao atualizar" : "Erro ao criar tópico", 
          description: errData.error || "Ocorreu um erro inesperado." 
        });
      }
    } catch (err) { 
      toast({ 
        variant: "destructive", 
        title: "Erro de Conexão", 
        description: "Não foi possível comunicar com o servidor." 
      }); 
    }
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
        setNewOpportunity({ title: "", company: "", location: "", type: "emprego", description: "", requirements: "", link: "", deadline: "", imageUrl: "" }); 
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
    <div className="min-h-screen bg-[#EBDCC6] flex font-sans font-medium text-[#001F33]">
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

      <AdminSidebar 
        currentTab={currentTab} 
        onTabChange={setCurrentTab} 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen} 
      />

      <main className="flex-1 md:ml-72 min-h-screen flex flex-col min-w-0">
        <header className="h-20 bg-white border-b-2 border-[#8B4513] flex items-center px-6 md:px-10 shadow-sm justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden text-[#001F33]"
            >
              <Menu size={24} />
            </Button>
            <h1 className="text-lg md:text-2xl font-display uppercase text-[#001F33] tracking-tight truncate max-w-[150px] sm:max-w-none">
            {currentTab === 'overview' && 'Visão Geral'}
            {currentTab === 'users' && 'Utilizadores'}
            {currentTab === 'jobs' && 'Oportunidades'}
            {currentTab === 'content' && 'Trilhas'}
            {currentTab === 'mentors' && 'Gestão de Mentores'}
            {currentTab === 'forum' && 'Comunidade'}
            </h1>
          </div>
          {currentTab === 'jobs' && (
            <Button onClick={() => { setEditingOpportunity(null); setIsAddingOpportunity(true); }} className="bg-[#0EA5E9] text-white uppercase font-bold text-[10px] sm:text-xs px-4 sm:px-6 h-10 sm:h-11 rounded-full shadow-lg shadow-[#0EA5E9]/20 hover:scale-105 active:scale-95 transition-all">
              <Plus className="sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Nova Vaga</span>
            </Button>
          )}
          {currentTab === 'content' && !selectedTrack && (
            <Button onClick={() => { setEditingTrack(null); setIsAddingTrack(true); }} className="bg-[#0EA5E9] text-white uppercase font-bold text-[10px] sm:text-xs px-4 sm:px-6 h-10 sm:h-11 rounded-full shadow-lg shadow-[#0EA5E9]/20 hover:scale-105 active:scale-95 transition-all">
              <Plus className="sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Nova Trilha</span>
            </Button>
          )}
          {currentTab === 'forum' && (
            <Button onClick={() => { setNewTopic({title: "", content: "", category: "Geral"}); setIsAddingTopic(true); }} className="bg-[#0EA5E9] text-white uppercase font-bold text-[9px] sm:text-[10px] px-4 sm:px-6 h-10 sm:h-11 rounded-full shadow-lg shadow-[#0EA5E9]/20 hover:scale-105 active:scale-95 transition-all flex items-center">
              <Plus className="sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Novo Tópico</span>
            </Button>
          )}
        </header>

        <div className="p-6 sm:p-10">
          {currentTab === 'overview' && (
            <div className="space-y-10">
               <motion.div initial={{opacity:0, y: 20}} animate={{opacity:1, y: 0}} className="bg-[#001F33] p-8 sm:p-12 rounded-[32px] sm:rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
                  <div className="relative z-10">
                    <h2 className="text-3xl sm:text-5xl md:text-6xl font-display uppercase mb-4 tracking-tighter leading-none">Gestão Central <br/><span className="text-[#0EA5E9]">Carreira 360</span></h2>
                    <p className="text-white/70 font-medium max-w-2xl text-base sm:text-xl">Monitoriza o progresso dos jovens, valida mentores e mantém as oportunidades atualizadas.</p>
                  </div>
                  <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-[#0EA5E9] rounded-full blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
               </motion.div>
               <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {[
                    { label: "Jovens", val: stats.totalJovens, icon: Users, color: "bg-[#0EA5E9]" },
                    { label: "Mentores", val: stats.totalMentores, icon: UserCheck, color: "bg-[#F97316]" },
                    { label: "Vagas", val: stats.oportunidades, icon: Briefcase, color: "bg-[#0EA5E9]" },
                    { label: "Fórum", val: "Brevemente", icon: BookOpen, color: "bg-[#F97316]" }
                  ].map((s, i) => (
                    <motion.div initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} transition={{delay: i*0.1}} key={i} className="bg-white p-4 sm:p-8 rounded-3xl shadow-sm border border-[#8B4513]/50 flex flex-col gap-2 group hover:shadow-xl transition-all">
                      <div className={`${s.color} p-4 rounded-2xl text-white w-fit shadow-lg shadow-black/10 group-hover:scale-110 transition-transform`}><s.icon size={28}/></div>
                      <div className="mt-4"><p className="text-[10px] font-bold uppercase text-[#001F33]/80 tracking-widest leading-none mb-1">{s.label}</p><h4 className="text-3xl font-display text-[#001F33]">{s.val}</h4></div>
                    </motion.div>
                  ))}
               </div>
            </div>
          )}

          {currentTab === 'users' && (
            <div className="space-y-8">
              <div className="bg-white rounded-[2.5rem] border-4 border-[#8B4513] shadow-sm overflow-hidden mb-12">
                <div className="p-10 border-b-4 border-[#8B4513] bg-[#EBDCC6]/30">
                  <h2 className="text-xl font-display uppercase tracking-widest text-[#001F33]">Utilizadores Registados</h2>
                </div>
                <div className="p-8">
                  <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative flex-1 w-full group">
                      <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#8B4513]/30 group-focus-within:text-[#0EA5E9] transition-colors" size={20} />
                      <Input 
                        className="pl-16 h-16 bg-[#EBDCC6] border-4 border-[#8B4513] rounded-3xl font-bold text-[#001F33] focus:ring-4 focus:ring-[#0EA5E9]/20" 
                        placeholder="Pesquisar por nome ou e-mail..." 
                        value={searchUsers}
                        onChange={e => setSearchUsers(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* FILTROS RÁPIDOS DE ROLE */}
                  <div className="flex flex-wrap items-center gap-3 bg-[#EBDCC6]/80 p-3 rounded-[2.5rem] border-2 border-[#8B4513]/20 w-fit backdrop-blur-md shadow-inner mb-8">
                    <Button 
                      variant="ghost" 
                      onClick={() => setFilterRole("all")}
                      className={`h-12 px-8 rounded-full text-[10px] uppercase font-bold tracking-[0.2em] transition-all duration-300 ${filterRole === 'all' ? 'bg-[#001F33] text-white shadow-[0_8px_20px_-5px_rgba(0,31,51,0.4)] scale-105' : 'text-[#001F33]/60 hover:bg-[#001F33]/10'}`}
                    >
                      <span className="mr-2 text-base">📋</span> Todos <span className="ml-2 opacity-50">({candidates.length})</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={() => setFilterRole("candidate")}
                      className={`h-12 px-8 rounded-full text-[10px] uppercase font-bold tracking-[0.2em] transition-all duration-300 ${filterRole === 'candidate' ? 'bg-[#0EA5E9] text-white shadow-[0_8px_20px_-5px_rgba(14,165,233,0.4)] scale-105' : 'text-[#0EA5E9]/70 hover:bg-[#0EA5E9]/10'}`}
                    >
                      <span className="mr-2 text-base">🎓</span> Jovens <span className="ml-2 opacity-50">({candidates.filter(c => c.role === 'candidato').length})</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={() => setFilterRole("mentor")}
                      className={`h-12 px-8 rounded-full text-[10px] uppercase font-bold tracking-[0.2em] transition-all duration-300 ${filterRole === 'mentor' ? 'bg-[#F97316] text-white shadow-[0_8px_20px_-5px_rgba(249,115,22,0.4)] scale-105' : 'text-[#F97316]/70 hover:bg-[#F97316]/10'}`}
                    >
                      <span className="mr-2 text-base">👤</span> Mentores <span className="ml-2 opacity-50">({candidates.filter(c => c.role === 'mentor').length})</span>
                    </Button>
                  </div>

                  {usersContent}
                </div>
              </div>
            </div>
          )}
          
          {currentTab === 'mentors' && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white p-6 rounded-[2.5rem] border border-[#8B4513]/50 shadow-sm relative overflow-hidden group">
                 <div className="relative w-full md:w-96 group/search z-10">
                   <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#001F33]/20 group-focus-within/search:text-[#F97316] transition-colors" size={20} />
                   <Input 
                     className="pl-16 h-16 bg-[#EBDCC6] border-none rounded-2xl font-bold text-[#001F33] focus:ring-2 focus:ring-[#F97316] shadow-inner" 
                     placeholder="Pesquisar mentor por nome ou email..." 
                     value={searchMentors}
                     onChange={(e) => setSearchMentors(e.target.value)}
                   />
                 </div>
                 <div className="text-right z-10">
                    <p className="text-[10px] font-bold uppercase text-[#001F33]/40 tracking-[0.3em] mb-1">Base de Mentores</p>
                    <div className="flex items-center justify-end gap-3">
                       <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                       <p className="text-3xl font-display text-[#001F33]">{mentors.length}</p>
                    </div>
                 </div>
                 <div className="absolute top-0 right-0 w-32 h-32 bg-[#F97316]/5 rounded-bl-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
              </div>

              {/* FILTROS DE ESTADO PERMANENTES - Alta Visibilidade */}
              <div className="flex flex-wrap items-center gap-3 bg-[#EBDCC6]/80 p-3 rounded-[2.5rem] border-2 border-[#8B4513]/20 w-fit backdrop-blur-md shadow-inner">
                <Button 
                  variant="ghost" 
                  onClick={() => setFilterMentorStatus("all")}
                  className={`h-12 px-8 rounded-full text-[10px] uppercase font-bold tracking-[0.2em] transition-all duration-300 ${filterMentorStatus === 'all' ? 'bg-[#001F33] text-white shadow-[0_8px_20px_-5px_rgba(0,31,51,0.4)] scale-105' : 'text-[#001F33]/60 hover:bg-[#001F33]/10'}`}
                >
                  <span className="mr-2">📋</span> Todos <span className="ml-2 opacity-50">({mentors.length})</span>
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setFilterMentorStatus("pendente")}
                  className={`h-12 px-8 rounded-full text-[10px] uppercase font-bold tracking-[0.2em] transition-all duration-300 ${filterMentorStatus === 'pendente' ? 'bg-[#F97316] text-white shadow-[0_8px_20px_-5px_rgba(249,115,22,0.4)] scale-105' : 'text-[#F97316]/60 hover:bg-[#F97316]/10'}`}
                >
                  <span className="mr-2">🕒</span> Pendentes <span className="ml-2 opacity-50">({mentors.filter(m => m.status === 'pendente').length})</span>
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setFilterMentorStatus("ativo")}
                  className={`h-12 px-8 rounded-full text-[10px] uppercase font-bold tracking-[0.2em] transition-all duration-300 ${filterMentorStatus === 'ativo' ? 'bg-green-500 text-white shadow-[0_8px_20px_-5px_rgba(34,197,94,0.4)] scale-105' : 'text-green-600/70 hover:bg-green-50'}`}
                >
                  <span className="mr-2">✅</span> Aprovados <span className="ml-2 opacity-50">({mentors.filter(m => m.status === 'ativo').length})</span>
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setFilterMentorStatus("rejeitado")}
                  className={`h-12 px-8 rounded-full text-[10px] uppercase font-bold tracking-[0.2em] transition-all duration-300 ${filterMentorStatus === 'rejeitado' ? 'bg-red-500 text-white shadow-[0_8px_20px_-5px_rgba(239,68,68,0.4)] scale-105' : 'text-red-500/70 hover:bg-red-50'}`}
                >
                  <span className="mr-2">❌</span> Rejeitados <span className="ml-2 opacity-50">({mentors.filter(m => m.status === 'rejeitado').length})</span>
                </Button>
              </div>

              {mentorsContent}
            </div>
          )}

        {currentTab === 'jobs' && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-6 rounded-[2rem] border border-[#8B4513]/50 shadow-sm">
                 <div className="relative w-full md:w-96 group">
                   <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#001F33]/20 group-focus-within:text-[#0EA5E9] transition-colors" size={20} />
                   <Input 
                     className="pl-14 h-14 bg-[#EBDCC6] border-none rounded-2xl font-bold text-[#001F33] focus:ring-2 focus:ring-[#0EA5E9]" 
                     placeholder="Pesquisar vaga ou empresa..." 
                     value={searchJobs}
                     onChange={(e) => setSearchJobs(e.target.value)}
                   />
                 </div>
                 <div className="w-full md:w-64">
                   <Select value={filterJobType} onValueChange={setFilterJobType}>
                     <SelectTrigger className="h-14 bg-[#EBDCC6] border-none rounded-2xl font-bold uppercase text-[10px] tracking-widest px-6 focus:ring-2 focus:ring-[#0EA5E9]">
                       <SelectValue placeholder="Filtrar por Tipo" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="all">Todas as Categorias</SelectItem>
                       <SelectItem value="emprego">Apenas Empregos</SelectItem>
                       <SelectItem value="estagio">Apenas Estágios</SelectItem>
                       <SelectItem value="bolsa">Bolsas de Estudo</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {opportunities
                  .filter(op => {
                    const matchesSearch = op.title.toLowerCase().includes(searchJobs.toLowerCase()) || 
                                          op.company.toLowerCase().includes(searchJobs.toLowerCase());
                    const matchesType = filterJobType === "all" || op.type === filterJobType;
                    return matchesSearch && matchesType;
                  })
                  .map(op => (
                    <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} key={op.id} className="bg-white overflow-hidden rounded-[24px] sm:rounded-[32px] shadow-sm border border-[#8B4513]/70 relative group hover:shadow-2xl transition-all">
                      {op.imageUrl && (
                        <div className="h-32 w-full overflow-hidden border-b border-[#8B4513]/50">
                          <img src={getFileUrl(op.imageUrl)} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                      )}
                      <div className="p-6 sm:p-10">
                        <div className="flex justify-between items-start mb-8">
                        <span className="bg-[#0EA5E9]/10 text-[#0EA5E9] text-[10px] font-bold uppercase px-3 py-1.5 rounded-full tracking-widest">{op.type}</span>
                        <div className="flex gap-2 transition-opacity">
                          <Button variant="ghost" size="icon" className="text-[#0EA5E9] hover:bg-[#0EA5E9]/10 rounded-full" onClick={() => { 
                            setEditingOpportunity(op); 
                            setNewOpportunity({...op, deadline: op.deadline ? op.deadline.split('T')[0] : ""});
                            setIsAddingOpportunity(true); 
                          }}><Pencil size={20}/></Button>
                          <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 rounded-full" onClick={() => triggerDelete("Eliminar Vaga", `Tens a certeza que queres apagar a vaga ${op.title}?`, () => deleteOpportunity(op.id))}><Trash2 size={24}/></Button>
                        </div>
                      </div>
                      <h3 className="text-2xl font-display uppercase text-[#001F33] mb-4 group-hover:text-[#0EA5E9] transition-colors">{op.title}</h3>
                      <div className="flex items-center gap-4 text-[#001F33]/85 text-xs font-bold mb-8">
                        <span className="flex items-center gap-2"><Building2 size={16} className="text-[#0EA5E9]"/> {op.company}</span>
                        <span className="flex items-center gap-2"><MapPin size={16} className="text-[#0EA5E9]"/> {op.location}</span>
                      </div>
                      <div className="flex justify-between items-center pt-8 border-t border-[#8B4513]/50">
                        <span className="text-[10px] font-bold uppercase text-[#001F33]/70">Prazo: {op.deadline ? new Date(op.deadline).toLocaleDateString() : 'Indefinido'}</span>
                        <div className="h-10 w-10 rounded-full bg-[#EBDCC6] flex items-center justify-center text-[#0EA5E9] group-hover:bg-[#0EA5E9] group-hover:text-white transition-all"><ExternalLink size={16} /></div>
                      </div>
                    </div>
                  </motion.div>
                  ))}
              </div>
            </div>
          )}

          {currentTab === 'content' && (
            <div className="space-y-10">
               {selectedTrack ? (
                 <div className="space-y-8">
                    <div className="flex items-center gap-4 mb-2">
                       <Button variant="ghost" onClick={() => setSelectedTrack(null)} className="text-[#0EA5E9] font-bold uppercase text-[10px] tracking-widest">← Voltar às Trilhas</Button>
                    </div>
                    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="bg-[#001F33] p-10 md:p-20 min-h-[250px] md:min-h-[350px] rounded-[32px] text-white flex flex-col md:flex-row justify-between items-start md:items-end shadow-xl gap-6 relative overflow-hidden">
                       {/* Background Image of the selected track */}
                       {selectedTrack?.imageUrl && (
                         <div className="absolute inset-0 pointer-events-none opacity-40">
                           <img src={getFileUrl(selectedTrack.imageUrl)} alt="" className="w-full h-full object-cover" />
                           <div className="absolute inset-0 bg-gradient-to-t from-[#001F33] via-[#001F33]/60 to-transparent" />
                         </div>
                       )}
                       
                       <div className="space-y-2 w-full relative z-10">
                          <p className="text-[#0EA5E9] text-[10px] font-bold uppercase tracking-[0.3em]">Gestão de Módulos</p>
                          <h2 className="text-5xl font-display uppercase leading-none">{selectedTrack.title}</h2>
                       </div>
                       <Button onClick={() => { setEditingModule(null); setNewModule({title: "", order: modules.length}); setIsAddingModule(true); }} className="bg-white text-[#001F33] uppercase font-bold text-xs px-8 h-12 rounded-full shadow-lg shadow-white/10 hover:scale-105 active:scale-95 transition-all">Novo Módulo</Button>
                    </motion.div>
                    
                    <div className="grid gap-4">
                      {modules.map(mod => (
                        <div key={mod.id} className="space-y-4">
                          <motion.div initial={{opacity:0, x: -20}} animate={{opacity:1, x: 0}} className="bg-white p-6 md:p-8 rounded-[24px] border border-[#8B4513]/70 flex flex-col md:flex-row justify-between items-start md:items-center shadow-sm hover:shadow-xl transition-all group gap-6">
                            <div className="flex items-center gap-4 md:gap-6">
                               <div className="h-10 w-10 md:h-12 md:w-12 shrink-0 bg-[#EBDCC6] rounded-2xl flex items-center justify-center text-[#001F33] font-display text-xl">{mod.order + 1}</div>
                               <span className="font-display uppercase text-xl md:text-2xl text-[#001F33] tracking-tight">{mod.title}</span>
                            </div>
                            <div className="flex flex-wrap gap-2 md:gap-3 transition-opacity">
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
                                 className={`${currentModule?.id === mod.id ? 'bg-[#001F33]' : 'bg-[#0EA5E9]'} text-white text-[10px] font-bold uppercase px-6 h-10 rounded-full transition-all`}
                               >
                                 {currentModule?.id === mod.id ? 'Fechar Etapas' : 'Ver Etapas'}
                               </Button>
                               <Button variant="ghost" size="icon" onClick={() => { setEditingModule(mod); setNewModule({title: mod.title, order: mod.order}); setIsAddingModule(true); }} className="text-[#0EA5E9] hover:bg-[#0EA5E9]/10 rounded-full"><Pencil size={20}/></Button>
                               <Button variant="ghost" size="icon" onClick={() => triggerDelete("Eliminar Módulo", "Isto apagará permanentemente o módulo e todos os vídeos associados.", () => deleteModule(mod.id))} className="text-red-500 hover:bg-red-50 rounded-full"><Trash2 size={22}/></Button>
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
                                    <div key={vid.id} className="bg-white/80 p-6 rounded-2xl border border-[#8B4513]/50 flex flex-col gap-6 group/vid transition-all hover:shadow-md">
                                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div className="flex items-start sm:items-center gap-4">
                                          <div className="h-10 w-10 shrink-0 bg-[#0EA5E9]/10 rounded-xl flex items-center justify-center text-[#0EA5E9]"><Film size={20} /></div>
                                          <div className="break-all">
                                            <p className="font-bold text-base text-[#001F33]">{vid.title}</p>
                                            <p className="text-[10px] font-medium text-[#001F33]/80 uppercase tracking-widest">{vid.xpPoints} XP • {vid.url.substring(0, 40)}{vid.url.length > 40 ? '...' : ''}</p>
                                          </div>
                                        </div>
                                        <div className="flex gap-2 transition-opacity self-end sm:self-auto">
                                          <Button variant="ghost" size="icon" className="h-9 w-9 text-[#0EA5E9] hover:bg-[#0EA5E9]/10 rounded-full" onClick={() => {
                                            setEditingVideo(vid);
                                            setNewVideo({...vid});
                                            setIsAddingVideo(true);
                                          }}><Pencil size={18}/></Button>
                                          <Button variant="ghost" size="icon" className="h-9 w-9 text-red-500 hover:bg-red-50 rounded-full" onClick={() => triggerDelete("Eliminar Etapa", "Tens a certeza que queres remover este vídeo?", () => deleteVideo(vid.id))}><Trash2 size={18}/></Button>
                                        </div>
                                      </div>
                                      
                                      {/* Video Preview Section */}
                                      {getYouTubeVideoId(vid.url) && (
                                        <div className="w-full max-w-2xl aspect-video rounded-xl overflow-hidden border-2 border-[#8B4513]/20 shadow-lg bg-black group-hover/vid:border-[#0EA5E9]/30 transition-colors">
                                          <iframe 
                                            className="w-full h-full"
                                            src={`https://www.youtube.com/embed/${getYouTubeVideoId(vid.url)}`}
                                            title={vid.title}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                          ></iframe>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                <Button 
                                  onClick={() => { setEditingVideo(null); setNewVideo({title: "", url: "", description: "", xpPoints: 100, order: videos.length}); setIsAddingVideo(true); }}
                                  variant="outline" 
                                  className="w-full border-dashed border-2 border-[#0EA5E9]/30 text-[#0EA5E9] font-bold uppercase text-[10px] h-12 rounded-2xl hover:bg-[#0EA5E9]/5"
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
                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                   {tracks.map(t => (
                     <motion.div initial={{opacity:0, y: 30}} animate={{opacity:1, y: 0}} key={t.id} className="bg-[#001F33] rounded-[32px] md:rounded-[40px] shadow-sm border border-white/10 p-6 md:p-12 flex flex-col justify-between group md:h-96 relative overflow-hidden hover:shadow-2xl transition-all">
                        {t.imageUrl && (
                           <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit]">
                             <img 
                               src={getFileUrl(t.imageUrl)} 
                               alt="" 
                               className="w-full h-full object-cover opacity-20 group-hover:opacity-40 transition-all duration-700 group-hover:scale-110" 
                             />
                             <div className="absolute inset-0 bg-gradient-to-t from-[#001F33] via-[#001F33]/60 to-transparent" />
                           </div>
                         )}
                        <div className="relative z-10">
                          <div className="flex justify-between items-start mb-6">
                             <div className="h-14 w-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-[#0EA5E9] shadow-lg"><Film size={28}/></div>
                             <div className="flex gap-2">
                                <Button onClick={() => { setEditingTrack(t); setNewTrack({ ...t, hasCertificate: t.hasCertificate ?? true, duration: t.duration ?? "" }); setIsAddingTrack(true); }} variant="ghost" size="icon" className="text-[#0EA5E9] hover:bg-white/10 rounded-full"><Pencil size={20}/></Button>
                                <Button onClick={() => triggerDelete("Eliminar Trilha", `Tens a certeza que queres apagar a trilha ${t.title}?`, () => deleteTrack(t.id))} variant="ghost" size="icon" className="text-red-400 hover:bg-red-500/10 rounded-full"><Trash2 size={24}/></Button>
                             </div>
                          </div>
                           <h3 className="text-3xl font-display uppercase text-white mb-6 tracking-tight leading-none">{t.title}</h3>
                           <p className="text-sm font-bold text-white/70 mb-8 line-clamp-3 leading-relaxed">{t.description}</p>
                        </div>
                        <Button 
                          onClick={() => { setSelectedTrack(t); fetchModules(t.id); }} 
                          className="bg-[#0EA5E9] text-white uppercase font-bold text-xs px-10 h-14 rounded-full shadow-2xl shadow-[#0EA5E9]/30 active:scale-95 transition-all relative z-10 border-2 border-transparent hover:bg-white hover:text-[#001F33]"
                        >
                          Gerir Conteúdo
                        </Button>
                     </motion.div>
                   ))}
                 </div>
               )}
            </div>
          )}



          {currentTab === 'forum' && (
            <div className="space-y-6">
              {/* MOBILE CARDS - Visível até ecrãs Grandes */}
              <div className="lg:hidden divide-y divide-[#8B4513]/50 bg-white rounded-[32px] shadow-2xl overflow-hidden border border-[#8B4513]/50">
                {forumTopics.map(t => (
                  <div key={t.id} className="p-6 flex flex-col gap-4">
                    <div>
                      <span className="text-[9px] font-bold uppercase px-3 py-1 rounded-full bg-[#0EA5E9]/10 text-[#0EA5E9] inline-block mb-2">{t.category}</span>
                      <p className="font-bold uppercase text-sm text-[#001F33] leading-tight">{t.title}</p>
                      <p className="text-[10px] font-bold text-[#001F33]/80 tracking-widest mt-1">{new Date(t.createdAt).toLocaleDateString()} • Por {t.authorName}</p>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                       <Link href={`/forum/topic/${t.id}`}>
                         <Button variant="outline" size="sm" className="h-9 border-[#0EA5E9] text-[#0EA5E9] text-[9px] uppercase font-bold px-4 rounded-full flex items-center">
                           <ExternalLink size={12} className="mr-1.5" /> Ver Tópico
                         </Button>
                       </Link>
                       <Button 
                         variant="ghost" 
                         size="sm"
                         onClick={() => setConfirmConfig({
                           isOpen: true,
                           title: "Eliminar Tópico?",
                           description: "Esta acção é irreversível e removerá todos os comentários associados.",
                           variant: "destructive",
                           onConfirm: () => handleDeleteTopic(t.id)
                         })}
                         className="h-9 w-9 p-0 rounded-full text-red-500 hover:bg-red-50"
                       >
                         <Trash2 size={16} />
                       </Button>
                    </div>
                  </div>
                ))}
                {forumTopics.length === 0 && (
                  <div className="p-8 text-center text-xs font-bold text-[#001F33]/50 uppercase">Sem tópicos criados.</div>
                )}
              </div>

              {/* DESKTOP TABLE - Visível apenas em ecrãs XL */}
              <div className="hidden lg:block bg-white rounded-[32px] shadow-2xl overflow-x-auto border border-[#8B4513]/50">
                <div className="min-w-[700px]">
                  <table className="w-full text-left">
                    <thead className="bg-[#001F33] text-white font-bold uppercase text-[10px] tracking-widest">
                      <tr className="h-16">
                        <th className="pl-10 pr-4 w-[40%]">Tópico</th>
                        <th className="px-4 w-[20%]">Categoria</th>
                        <th className="px-4 w-[20%]">Autor</th>
                        <th className="pr-10 pl-4 w-[20%] text-right">Acções</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#8B4513]/50">
                      {forumTopics.map(t => (
                        <tr key={t.id} className="h-20 hover:bg-[#EBDCC6]/50 transition-colors">
                          <td className="pl-10 pr-4">
                            <p className="font-bold uppercase text-sm text-[#001F33]">{t.title}</p>
                            <p className="text-[10px] font-bold text-[#001F33]/80 tracking-widest">{new Date(t.createdAt).toLocaleDateString()}</p>
                          </td>
                          <td className="px-4">
                            <span className="text-[10px] font-bold uppercase px-4 py-1.5 rounded-full bg-[#0EA5E9]/10 text-[#0EA5E9]">{t.category}</span>
                          </td>
                          <td className="px-4">
                            <p className="text-xs font-bold text-[#001F33] uppercase">{t.authorName}</p>
                          </td>
                          <td className="pr-10 pl-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                onClick={() => {
                                  setEditingTopic(t);
                                  setNewTopic({
                                    title: t.title,
                                    content: t.content,
                                    category: t.category,
                                    imageUrl: t.imageUrl || "",
                                    videoUrl: t.videoUrl || ""
                                  });
                                  setIsAddingTopic(true);
                                }}
                                className="h-11 w-11 shrink-0 rounded-full text-amber-500 hover:bg-amber-50"
                              >
                                <Pencil className="h-5 w-5" />
                              </Button>
                              <Link href={`/forum/topic/${t.id}`}>
                                <Button 
                                  variant="ghost" 
                                  className="h-11 rounded-full text-[#0EA5E9] hover:bg-[#0EA5E9]/10 font-bold uppercase text-[10px] tracking-widest flex items-center px-4"
                                >
                                  <ExternalLink className="mr-2 h-4 w-4" /> Ver Tópico
                                </Button>
                              </Link>
                              <Button 
                                variant="ghost" 
                                onClick={() => setConfirmConfig({
                                  isOpen: true,
                                  title: "Eliminar Tópico?",
                                  description: "Esta acção é irreversível e removerá todos os comentários associados.",
                                  variant: "destructive",
                                  onConfirm: () => handleDeleteTopic(t.id)
                                })}
                                className="h-11 w-11 shrink-0 rounded-full text-red-500 hover:bg-red-50"
                              >
                                <Trash2 className="h-5 w-5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODAIS REPROJETADOS - CORES NAVY/CREME */}
        <Dialog open={isAddingOpportunity} onOpenChange={setIsAddingOpportunity}>
          <DialogContent className="max-w-3xl bg-white border-none shadow-2xl rounded-[40px] p-10 select-none">
            <DialogHeader><DialogTitle className="text-3xl font-display uppercase text-[#001F33] tracking-tighter">{editingOpportunity ? 'Editar Oportunidade' : 'Cadastrar Oportunidade'}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 py-8">
              <div className="space-y-2"><label className="text-[10px] font-bold uppercase text-[#001F33] tracking-[0.2em] ml-2">Cargo / Título</label><Input className="text-[#001F33] bg-[#EBDCC6] border border-[#8B4513]/50 h-14 rounded-2xl font-bold px-6 focus:ring-[#0EA5E9]" value={newOpportunity.title} onChange={e => setNewOpportunity({...newOpportunity, title: e.target.value})} placeholder="Ex: Desenvolvedor React" /></div>
              <div className="space-y-2"><label className="text-[10px] font-bold uppercase text-[#001F33] tracking-[0.2em] ml-2">Instituição / Empresa</label><Input className="text-[#001F33] bg-[#EBDCC6] border border-[#8B4513]/50 h-14 rounded-2xl font-bold px-6 focus:ring-[#0EA5E9]" value={newOpportunity.company} onChange={e => setNewOpportunity({...newOpportunity, company: e.target.value})} placeholder="Ex: Unitel" /></div>
              <div className="space-y-2"><label className="text-[10px] font-bold uppercase text-[#001F33] tracking-[0.2em] ml-2">Cidade / Província</label><Input className="text-[#001F33] bg-[#EBDCC6] border border-[#8B4513]/50 h-14 rounded-2xl font-bold px-6 focus:ring-[#0EA5E9]" value={newOpportunity.location} onChange={e => setNewOpportunity({...newOpportunity, location: e.target.value})} placeholder="Ex: Luanda, Talatona" /></div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-[#001F33] tracking-[0.2em] ml-2">Natureza</label>
                <Select value={newOpportunity.type} onValueChange={(val) => setNewOpportunity({...newOpportunity, type: val})}>
                  <SelectTrigger className="text-[#001F33] bg-[#EBDCC6] border border-[#8B4513]/50 h-14 rounded-2xl font-bold px-6"><SelectValue placeholder="Tipo" /></SelectTrigger>
                  <SelectContent><SelectItem value="emprego">Emprego</SelectItem><SelectItem value="estagio">Estágio</SelectItem><SelectItem value="bolsa">Bolsa de Estudo</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-bold uppercase text-[#001F33] tracking-[0.2em] ml-2">Imagem de Capa (Link URL)</label>
                <Input className="text-[#001F33] bg-[#EBDCC6] border border-[#8B4513]/50 h-14 rounded-2xl font-bold px-6 focus:ring-[#0EA5E9]" value={newOpportunity.imageUrl || ""} onChange={e => setNewOpportunity({...newOpportunity, imageUrl: e.target.value})} placeholder="Ex: https://images.unsplash.com/photo-..." />
              </div>
              <div className="col-span-2 space-y-2"><label className="text-[10px] font-bold uppercase text-[#001F33] tracking-[0.2em] ml-2">Descritivo da Vaga</label><Textarea className="text-[#001F33] bg-[#EBDCC6] border border-[#8B4513]/50 min-h-[140px] rounded-3xl font-bold p-6 focus:ring-[#0EA5E9]" value={newOpportunity.description} onChange={e => setNewOpportunity({...newOpportunity, description: e.target.value})} placeholder="Quais são as responsabilidades e o que procuro?" /></div>
              <div className="space-y-2"><label className="text-[10px] font-bold uppercase text-[#001F33] tracking-[0.2em] ml-2">Candidatura (URL/Email)</label><Input className="text-[#001F33] bg-[#EBDCC6] border border-[#8B4513]/50 h-14 rounded-2xl font-bold px-6 focus:ring-[#0EA5E9]" value={newOpportunity.link} onChange={e => setNewOpportunity({...newOpportunity, link: e.target.value})} placeholder="Onde o jovem clica?" /></div>
              <div className="space-y-2"><label className="text-[10px] font-bold uppercase text-[#001F33] tracking-[0.2em] ml-2">Fecho Candidaturas</label><Input type="date" className="text-[#001F33] bg-[#EBDCC6] border border-[#8B4513]/50 h-14 rounded-2xl font-bold px-6 focus:ring-[#0EA5E9]" value={newOpportunity.deadline} onChange={e => setNewOpportunity({...newOpportunity, deadline: e.target.value})} /></div>
            </div>
            <DialogFooter className="mt-4"><Button onClick={handleSaveOpportunity} className="bg-[#001F33] text-white uppercase font-bold text-xs w-full h-16 rounded-3xl shadow-2xl shadow-[#001F33]/30 hover:bg-[#0EA5E9] transition-all tracking-widest">{editingOpportunity ? 'Guardar Alterações' : 'Publicar Vaga Agora'}</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isAddingTrack} onOpenChange={setIsAddingTrack}>
          <DialogContent className="max-w-xl bg-white border-none shadow-2xl rounded-[40px] p-12">
            <DialogHeader><DialogTitle className="text-3xl font-display uppercase text-[#001F33] tracking-tighter">{editingTrack ? 'Editar Trilha' : 'Nova Trilha Profissional'}</DialogTitle></DialogHeader>
            <div className="space-y-8 py-8">
              <div className="space-y-2"><label className="text-[10px] font-bold uppercase text-[#001F33] tracking-[0.2em] ml-2">Nome da Jornada</label><Input className="text-[#001F33] bg-[#EBDCC6] border border-[#8B4513]/50 h-16 rounded-2xl font-bold px-8 text-lg" value={newTrack.title} onChange={e => setNewTrack({...newTrack, title: e.target.value})} placeholder="Ex: Domínio Financeiro" /></div>
              <div className="space-y-2"><label className="text-[10px] font-bold uppercase text-[#001F33] tracking-[0.2em] ml-2">Explicação Curta</label><Textarea className="text-[#001F33] bg-[#EBDCC6] border border-[#8B4513]/50 min-h-[120px] rounded-3xl font-bold p-8" value={newTrack.description} onChange={e => setNewTrack({...newTrack, description: e.target.value})} placeholder="O que o jovem vai atingir com isto?" /></div>
              <div className="space-y-2"><label className="text-[10px] font-bold uppercase text-[#001F33] tracking-[0.2em] ml-2">Capa (Caminho da Imagem)</label><Input className="text-[#001F33] bg-[#EBDCC6] border border-[#8B4513]/50 h-16 rounded-2xl font-bold px-8" value={newTrack.imageUrl} onChange={e => setNewTrack({...newTrack, imageUrl: e.target.value})} placeholder="/assets/img/trilha-1.jpg" /></div>
              
              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-[#001F33] tracking-[0.2em] ml-2">Duração (Total)</label>
                  <Input 
                    className="text-[#001F33] bg-[#EBDCC6] border border-[#8B4513]/50 h-16 rounded-2xl font-bold px-8" 
                    value={newTrack.duration || ""} 
                    onChange={e => setNewTrack({...newTrack, duration: e.target.value})} 
                    placeholder="Ex: 12 Horas" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-[#001F33] tracking-[0.2em] ml-2">Certificado</label>
                  <Select 
                    value={newTrack.hasCertificate ? "sim" : "nao"} 
                    onValueChange={(val) => setNewTrack({...newTrack, hasCertificate: val === "sim"})}
                  >
                    <SelectTrigger className="text-[#001F33] bg-[#EBDCC6] border border-[#8B4513]/50 h-16 rounded-2xl font-bold px-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sim">Sim, Disponível</SelectItem>
                      <SelectItem value="nao">Não Incluído</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter><Button onClick={handleSaveTrack} className="bg-[#0EA5E9] text-white uppercase font-bold text-xs w-full h-16 rounded-3xl shadow-2xl shadow-[#0EA5E9]/30 hover:bg-[#001F33] transition-all tracking-[0.3em]">{editingTrack ? 'Atualizar Trilha' : 'Lançar Trilha'}</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isAddingModule} onOpenChange={setIsAddingModule}>
          <DialogContent className="max-w-md bg-white border-none shadow-2xl rounded-[40px] p-10">
            <DialogHeader><DialogTitle className="text-2xl font-display uppercase text-[#001F33] tracking-tighter">{editingModule ? 'Renomear Módulo' : 'Novo Módulo de Aprendizagem'}</DialogTitle></DialogHeader>
            <div className="py-8 space-y-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-[#001F33] tracking-widest ml-2">Nome do Módulo</label>
                  <Input className="text-[#001F33] bg-[#EBDCC6] border border-[#8B4513]/50 h-16 rounded-[20px] font-bold px-8 text-lg" value={newModule.title} onChange={e => setNewModule({...newModule, title: e.target.value})} placeholder="Ex: Preparação Mental" />
               </div>
            </div>
            <DialogFooter><Button onClick={handleSaveModule} className="w-full bg-[#001F33] text-white uppercase font-bold text-xs h-16 rounded-3xl shadow-xl hover:bg-[#0EA5E9] transition-all tracking-[0.2em]">{editingModule ? 'Actualizar Nome' : 'Confirmar Módulo'}</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isAddingVideo} onOpenChange={setIsAddingVideo}>
          <DialogContent className="max-w-2xl bg-white border-none shadow-2xl rounded-[40px] p-12">
            <DialogHeader><DialogTitle className="text-3xl font-display uppercase text-[#001F33] tracking-tighter">{editingVideo ? 'Editar Etapa' : 'Adicionar Etapa (Vídeo / Link)'}</DialogTitle></DialogHeader>
            <div className="py-10 space-y-8">
               <div className="space-y-2"><label className="text-[10px] font-bold uppercase text-[#001F33] tracking-widest ml-2">Título da Etapa</label><Input className="text-[#001F33] bg-[#EBDCC6] border border-[#8B4513]/50 h-16 rounded-2xl font-bold px-8 text-lg" value={newVideo.title} onChange={e => setNewVideo({...newVideo, title: e.target.value})} /></div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2"><label className="text-[10px] font-bold uppercase text-[#001F33] tracking-widest ml-2">Fonte do Vídeo (URL)</label><Input className="text-[#001F33] bg-[#EBDCC6] border border-[#8B4513]/50 h-16 rounded-2xl font-bold px-8" value={newVideo.url} onChange={e => setNewVideo({...newVideo, url: e.target.value})} /></div>
                  <div className="space-y-2"><label className="text-[10px] font-bold uppercase text-[#001F33] tracking-widest ml-2">Recompensa (XP)</label><Input type="number" className="text-[#001F33] bg-[#EBDCC6] border border-[#8B4513]/50 h-16 rounded-2xl font-bold px-8" value={newVideo.xpPoints} onChange={e => setNewVideo({...newVideo, xpPoints: parseInt(e.target.value)})} /></div>
               </div>
               <div className="space-y-2"><label className="text-[10px] font-bold uppercase text-[#001F33] tracking-widest ml-2">O que o jovem deve fazer / aprender?</label><Textarea className="text-[#001F33] bg-[#EBDCC6] border border-[#8B4513]/50 min-h-[140px] rounded-[32px] font-bold p-8" value={newVideo.description} onChange={e => setNewVideo({...newVideo, description: e.target.value})} placeholder="Instruções para completar esta etapa..." /></div>
            </div>
            <DialogFooter><Button onClick={handleSaveVideo} className="w-full bg-[#0EA5E9] text-white uppercase font-bold text-xs h-18 rounded-[32px] shadow-2xl shadow-[#0EA5E9]/40 active:scale-95 transition-all tracking-[0.3em]">{editingVideo ? 'Guardar Etapa' : 'Vincular à Trilha'}</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isRejectingUser} onOpenChange={setIsRejectingUser}>
          <DialogContent className="max-w-md bg-white border-none shadow-2xl rounded-[40px] p-10">
            <DialogHeader>
              <DialogTitle className="text-2xl font-display uppercase text-[#001F33] tracking-tighter">Motivo da Recusa</DialogTitle>
            </DialogHeader>
            <div className="py-6 space-y-4">
              <p className="text-sm font-bold text-[#001F33]/85">Por favor, indique o motivo pelo qual este perfil está a ser recusado. O utilizador verá esta mensagem ao tentar fazer login.</p>
              <Textarea 
                className="text-[#001F33] bg-[#EBDCC6] border-none min-h-[120px] rounded-2xl font-bold p-6 focus:ring-[#0EA5E9]" 
                value={rejectionReason} 
                onChange={e => setRejectionReason(e.target.value)} 
                placeholder="Ex: Documentação incompleta ou perfil não ajustado às vagas atuais."
              />
            </div>
            <DialogFooter>
              <Button 
                onClick={() => userToReject && handleUpdateStatus(userToReject, 'rejeitado', rejectionReason)} 
                disabled={!rejectionReason.trim()}
                className="w-full bg-red-500 text-white uppercase font-bold text-xs h-16 rounded-3xl shadow-xl hover:bg-red-600 transition-all tracking-[0.2em]"
              >
                Confirmar Recusa
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>

      <Dialog open={!!viewUser} onOpenChange={(open) => !open && setViewUser(null)}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto bg-[#EBDCC6] border-none text-[#001F33] rounded-[32px] p-8 focus:outline-none">
          <DialogHeader className="mb-6">
             <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-[#0EA5E9]/10 text-[#0EA5E9] rounded-2xl flex justify-center items-center font-display text-2xl uppercase shadow-inner">
                  {viewUser?.name?.[0]}
                </div>
                <div>
                   <DialogTitle className="text-2xl font-display uppercase tracking-tight text-[#001F33]">{viewUser?.name}</DialogTitle>
                   <p className="font-bold text-[#001F33]/50 text-sm uppercase flex items-center gap-2 mt-1">
                      {viewUser?.email} • {viewUser?.phone || 'Sem N.º'}
                   </p>
                </div>
             </div>
             <div className="mt-4 flex gap-2">
               <span className={`text-[10px] uppercase font-bold px-3 py-1 rounded-full ${viewUser?.role === 'mentor' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                 Papel: {viewUser?.role}
               </span>
               <span className={`text-[10px] uppercase font-bold px-3 py-1 rounded-full ${viewUser?.status === 'ativo' ? 'bg-green-100 text-green-600' : viewUser?.status === 'pendente' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'}`}>
                 Estado: {viewUser?.status}
               </span>
             </div>
             {viewUser?.status === 'rejeitado' && viewUser?.rejectionReason && (
               <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-2xl">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-red-600 mb-1">Motivo da Recusa</p>
                 <p className="text-sm font-bold text-[#001F33] italic">{viewUser.rejectionReason}</p>
               </div>
             )}
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6 border-b border-[#001F33]/10">
             <div className="bg-[#EBDCC6] p-4 rounded-xl border-4 border-[#8B4513]">
               <p className="text-[10px] font-bold uppercase tracking-widest text-[#001F33]/80">Formação Académica</p>
               <p className="font-bold text-sm mt-1">{viewUser?.formation || 'Não Especificado'}</p>
             </div>
             <div className="bg-[#EBDCC6] p-4 rounded-xl border-4 border-[#8B4513]">
               <p className="text-[10px] font-bold uppercase tracking-widest text-[#001F33]/80">Área de Interesse</p>
               <p className="font-bold text-sm text-[#F97316] mt-1">{viewUser?.areaOfInterest || 'Não Especificado'}</p>
             </div>
             <div className="bg-[#EBDCC6] p-4 rounded-xl border-4 border-[#8B4513]">
               <p className="text-[10px] font-bold uppercase tracking-widest text-[#001F33]/80">Nível de Experiência</p>
               <p className="font-bold text-sm capitalize mt-1">{viewUser?.experienceLevel || 'Não Especificado'}</p>
             </div>
             <div className="bg-[#EBDCC6] p-4 rounded-xl border-4 border-[#8B4513]">
               <p className="text-[10px] font-bold uppercase tracking-widest text-[#001F33]/80">Localização</p>
               <p className="font-bold text-sm flex items-center gap-1 mt-1">
                  <MapPin size={14} className="text-[#0EA5E9]" />
                  {viewUser?.municipality && viewUser?.province ? `${viewUser.municipality}, ${viewUser.province}` : 'Sem Local'}
               </p>
             </div>
             
             <div className="col-span-full space-y-1 mt-2">
               <p className="text-[10px] font-bold uppercase tracking-widest text-[#001F33]/80">Principais Dificuldades</p>
               <div className="flex flex-wrap gap-2 mt-2">
                  {viewUser?.difficulties ? (
                    viewUser.difficulties.split(',').map((dif: string) => (
                      <span key={dif} className="bg-white px-3 py-1.5 rounded-lg text-xs font-bold border-2 border-[#8B4513]">{dif.trim()}</span>
                    ))
                  ) : (
                    <span className="text-xs font-medium text-[#001F33]/80">Nenhuma dificuldade reportada.</span>
                  )}
               </div>
             </div>
          </div>

          <div className="pt-6 space-y-4">
             <p className="text-[10px] font-bold uppercase tracking-widest text-[#001F33]/80">Mídia Associada</p>
             <div className="flex flex-wrap gap-4">
                {viewUser?.cvUrl ? (
                  <Button asChild className="bg-[#0EA5E9] hover:bg-[#001F33] text-white uppercase font-bold text-[10px] tracking-widest rounded-xl">
                    <a href={getFileUrl(viewUser.cvUrl)} target="_blank" rel="noreferrer">
                      <ExternalLink size={14} className="mr-2" /> Visualizar Currículo PDF
                    </a>
                  </Button>
                ) : (
                  <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold w-auto inline-flex items-center border border-red-200">Sem Currículo Anexado</div>
                )}
                
                {viewUser?.socialLink ? (
                  <Button asChild variant="outline" className="border-[#0EA5E9] text-[#0EA5E9] hover:bg-[#0EA5E9] hover:text-white uppercase font-bold text-[10px] tracking-widest rounded-xl">
                    <a href={viewUser.socialLink} target="_blank" rel="noreferrer">
                      <ExternalLink size={14} className="mr-2" /> Ver LinkedIn
                    </a>
                  </Button>
                ) : (
                  <div className="p-3 bg-gray-100 text-gray-400 rounded-xl text-xs font-bold w-auto inline-flex items-center border border-[#001F33]/10">Sem Rede Social</div>
                )}
             </div>
          </div>

          {/* ACTIONS AND MANAGEMENT */}
          <div className="mt-10 pt-8 border-t-2 border-[#8B4513]/20">
            {viewUser?.status === 'pendente' ? (
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => {
                    if (viewUser.role === 'mentor') updateMentorStatus(viewUser.id, 'ativo');
                    else handleUpdateStatus(viewUser.id, 'ativo');
                    setViewUser(null);
                  }}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white uppercase font-bold text-xs h-14 rounded-2xl shadow-xl shadow-green-500/20"
                >
                  <Check size={18} className="mr-2" /> Aprovar Perfil
                </Button>
                <Button 
                  onClick={() => {
                    setUserToReject(viewUser.id);
                    setIsRejectingUser(true);
                    setViewUser(null);
                  }}
                  variant="destructive"
                  className="flex-1 uppercase font-bold text-xs h-14 rounded-2xl shadow-xl"
                >
                  <X size={18} className="mr-2" /> Rejeitar Perfil
                </Button>
              </div>
            ) : (
              <div className="flex justify-end">
                <Button 
                  onClick={() => {
                    const newStatus = viewUser.status === 'ativo' ? 'rejeitado' : 'ativo';
                    if (viewUser.role === 'mentor') updateMentorStatus(viewUser.id, newStatus);
                    else handleUpdateStatus(viewUser.id, newStatus);
                    setViewUser(null);
                  }}
                  variant="outline"
                  className={`px-8 h-12 uppercase font-bold text-[10px] tracking-widest rounded-xl border-[#8B4513]/20 ${viewUser?.status === 'ativo' ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                >
                  {viewUser?.status === 'ativo' ? '🚫 Suspender Acesso' : '✅ Ativar Acesso'}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddingTopic} onOpenChange={(open) => {
        setIsAddingTopic(open);
        if (!open) {
          setEditingTopic(null);
          setNewTopic({ title: "", content: "", category: "Geral", imageUrl: "", videoUrl: "" });
        }
      }}>
        <DialogContent className="max-w-2xl bg-white border-none shadow-2xl rounded-[40px] p-12 overflow-y-auto max-h-[90vh]">
          <DialogHeader><DialogTitle className="text-3xl font-display uppercase text-[#001F33] tracking-tighter">{editingTopic ? 'Editar Tópico' : 'Novo Tópico de Comunidade'}</DialogTitle></DialogHeader>
          <div className="space-y-8 py-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-[#001F33] tracking-[0.2em] ml-2">Título da Discussão</label>
              <Input 
                className="text-[#001F33] bg-[#EBDCC6] border border-[#8B4513]/50 h-14 rounded-2xl font-bold px-6 focus:ring-[#0EA5E9]" 
                value={newTopic.title} 
                onChange={e => setNewTopic({...newTopic, title: e.target.value})} 
                placeholder="Sobre o que vamos conversar?" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-[#001F33] tracking-[0.2em] ml-2">Conteúdo da Discussão</label>
              <Textarea 
                className="text-[#001F33] bg-[#EBDCC6] border border-[#8B4513]/50 min-h-[140px] rounded-[32px] font-bold p-8 focus:ring-[#0EA5E9]" 
                value={newTopic.content} 
                onChange={e => setNewTopic({...newTopic, content: e.target.value})} 
                placeholder="Descreva o seu tópico ou anúncio..." 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-[#001F33] tracking-[0.2em] ml-2">Categoria</label>
              <Select value={newTopic.category} onValueChange={(val) => setNewTopic({...newTopic, category: val})}>
                <SelectTrigger className="text-[#001F33] bg-[#EBDCC6] border border-[#8B4513]/50 h-14 rounded-2xl font-bold px-6">
                  <SelectValue placeholder="Escolha uma Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Geral">Geral</SelectItem>
                  <SelectItem value="Carreira">Carreira</SelectItem>
                  <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                  <SelectItem value="Educação">Educação</SelectItem>
                  <SelectItem value="Dúvidas">Dúvidas</SelectItem>
                  <SelectItem value="_new_" className="font-bold text-[#0EA5E9]">+ Adicionar Nova Categoria...</SelectItem>
                </SelectContent>
              </Select>
              {newTopic.category === "_new_" && (
                <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                  <Input 
                    className="text-[#001F33] bg-[#EBDCC6] border border-[#8B4513]/50 h-14 rounded-2xl font-bold px-6 focus:ring-[#0EA5E9]" 
                    value={customCategory} 
                    onChange={e => setCustomCategory(e.target.value)} 
                    placeholder="Escreva a nova categoria..." 
                    autoFocus
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-[#001F33] tracking-[0.2em] ml-2">URL da Imagem (Opcional)</label>
                <Input 
                  className="text-[#001F33] bg-[#EBDCC6] border border-[#8B4513]/50 h-14 rounded-2xl font-bold px-6 focus:ring-[#0EA5E9]" 
                  value={newTopic.imageUrl} 
                  onChange={e => setNewTopic({...newTopic, imageUrl: e.target.value})} 
                  placeholder="https://exemplo.com/imagem.jpg" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-[#001F33] tracking-[0.2em] ml-2">URL do Vídeo (Opcional)</label>
                <Input 
                  className="text-[#001F33] bg-[#EBDCC6] border border-[#8B4513]/50 h-14 rounded-2xl font-bold px-6 focus:ring-[#0EA5E9]" 
                  value={newTopic.videoUrl} 
                  onChange={e => setNewTopic({...newTopic, videoUrl: e.target.value})} 
                  placeholder="Link do YouTube..." 
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveTopic} className="w-full bg-[#001F33] text-white uppercase font-bold text-xs h-16 rounded-3xl shadow-xl hover:bg-[#0EA5E9] transition-all tracking-[0.2em]">
              {editingTopic ? 'Salvar Alterações' : 'Publicar Tópico'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
