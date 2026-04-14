import { CandidateSidebar } from "@/components/layout/CandidateSidebar";
import { useState, useEffect } from "react";
import { useLocation, Link, useParams } from "wouter";
import { 
  ArrowLeft, 
  MessageSquare, 
  Heart, 
  Send,
  MessageCircle,
  LayoutDashboard,
  Users,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Trash2,
  Reply,
  Eye, EyeOff,
  ShieldAlert,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

const getYouTubeVideoId = (url: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export default function TopicView() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { id } = useParams();
  const [location, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [topicData, setTopicData] = useState<any>(null);
  const [filterType, setFilterType] = useState<'recentes' | 'populares' | 'respondidos'>('recentes');
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<{ id: number; name: string } | null>(null);
  const [visibleReplies, setVisibleReplies] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    variant: "destructive" | "default";
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    variant: "default",
    onConfirm: () => {}
  });

  const [hideModalConfig, setHideModalConfig] = useState<{
    isOpen: boolean;
    commentId: number | null;
    hideReason: string;
  }>({
    isOpen: false,
    commentId: null,
    hideReason: ""
  });

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { setLocation("/auth/login"); return; }
    setUser(JSON.parse(stored));
    fetchTopicDetails();
  }, [id]);

  const fetchTopicDetails = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/forum/topics/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) setTopicData(await response.json());
    } catch (err) {
      toast({ title: "Erro ao carregar tópico" });
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/forum/topics/${id}/posts`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ content: newComment, parentId: replyingTo?.id || null })
      });
      if (response.ok) {
        toast({ title: "Comentário Publicado!", description: "Ganhaste +20 XP por participar na discussão." });
        setNewComment("");
        setReplyingTo(null);
        fetchTopicDetails();
      }
    } catch (err) {
      toast({ title: "Erro ao publicar comentário" });
    }
  };

  const handleReaction = async (type: 'like' | 'dislike') => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/forum/topics/${id}/reaction`, {
        method: "POST",
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type })
      });
      if (response.ok) fetchTopicDetails();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentReaction = async (commentId: number, type: 'like' | 'dislike') => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/forum/comments/${commentId}/reaction`, {
        method: "POST",
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type })
      });
      if (response.ok) fetchTopicDetails();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/forum/comments/${commentId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        toast({ title: "Comentário removido", description: "O comentário foi apagado permanentemente." });
        fetchTopicDetails();
      } else {
        const data = await response.json();
        toast({ 
          variant: "destructive",
          title: "Erro ao apagar", 
          description: data.error || "Não tens permissão para apagar este comentário." 
        });
      }
    } catch (err) {
      toast({ 
        variant: "destructive",
        title: "Erro técnico", 
        description: "Tenta novamente mais tarde." 
      });
    }
  };

  const handleUnhideComment = async (commentId: number) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/forum/comments/${commentId}/unhide`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        toast({ title: "Comentário Restaurado", description: "O comentário voltou a estar visível." });
        fetchTopicDetails();
      } else {
        toast({ title: "Erro", description: "Não tens permissão para desocultar." });
      }
    } catch (err) {
      toast({ title: "Falha ao desocultar", description: "Tente novamente." });
    }
  };

  const handleHideComment = async () => {
    if (!hideModalConfig.commentId || !hideModalConfig.hideReason.trim()) return;
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/forum/comments/${hideModalConfig.commentId}/hide`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ hideReason: hideModalConfig.hideReason })
      });
      if (response.ok) {
        toast({ title: "Comentário Ocultado", description: "O comentário foi censurado com sucesso." });
        setHideModalConfig({ isOpen: false, commentId: null, hideReason: "" });
        fetchTopicDetails();
      } else {
        toast({ title: "Erro", description: "Não tens permissão para ocultar." });
      }
    } catch (err) {
      toast({ title: "Falha ao ocultar", description: "Tente novamente." });
    }
  };

  const handleShowMoreReplies = (parentId: number, total: number) => {
    setVisibleReplies(prev => ({
      ...prev,
      [parentId]: Math.min((prev[parentId] || 1) + 5, total)
    }));
  };

  const handleHideReplies = (parentId: number) => {
    setVisibleReplies(prev => ({
      ...prev,
      [parentId]: 1
    }));
  };

  const handleLogout = () => { localStorage.clear(); setLocation("/"); };

  const getSortedComments = () => {
    if (!topicData?.comments) return [];
    let parentComments = topicData.comments.filter((c: any) => !c.parentId);
    if (filterType === 'recentes') {
      parentComments.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (filterType === 'populares') {
      parentComments.sort((a: any, b: any) => ((b.likesCount || 0) - (b.dislikesCount || 0)) - ((a.likesCount || 0) - (a.dislikesCount || 0)));
    } else if (filterType === 'respondidos') {
      parentComments.sort((a: any, b: any) => {
         const aReplies = topicData.comments.filter((c: any) => c.parentId === a.id).length;
         const bReplies = topicData.comments.filter((c: any) => c.parentId === b.id).length;
         return bReplies - aReplies;
      });
    }
    return parentComments;
  };

  if (loading) return <div className="min-h-screen bg-[#EBDCC6] flex items-center justify-center font-display text-2xl uppercase tracking-tighter text-[#001F33]/20">Carregando discussão...</div>;
  if (!topicData) return null;

  const { topic, comments } = topicData;

  return (
    <div className="min-h-screen bg-[#EBDCC6] flex font-sans text-[#001F33] overflow-x-hidden w-full">
      {/* Sidebar - Shared */}
      
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

      {user?.role === 'admin' ? (
        <AdminSidebar 
          currentTab="forum" 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen} 
        />
      ) : (
        <CandidateSidebar 
          currentTab="forum" 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen} 
        />
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-72 p-4 sm:p-10 w-full overflow-hidden">
        <div className="flex items-center gap-4 md:hidden mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden text-[#001F33]"
          >
            <Menu size={24} />
          </Button>
          <span className="font-display uppercase text-[#001F33]">Tópico</span>
        </div>
        
        <Link href="/forum">
          <button className="flex items-center gap-2 text-[#001F33]/80 hover:text-[#0EA5E9] font-bold uppercase text-[10px] tracking-widest mb-10 transition-colors">
            <ArrowLeft size={16} /> Voltar para a Comunidade
          </button>
        </Link>

        <div className="max-w-4xl mx-auto space-y-6 pb-80">
          {/* Main Topic Header */}
          <div className="bg-white p-4 sm:py-8 sm:px-12 rounded-[24px] sm:rounded-[48px] shadow-sm border-2 sm:border-4 border-[#8B4513]/40 relative overflow-hidden flex flex-col md:flex-row gap-6 sm:gap-8">
             {/* Category Tag */}
             <div className="absolute top-6 right-6 sm:top-8 sm:right-12 px-6 py-2 bg-[#0EA5E9]/30 text-[#0EA5E9] border-4 border-[#0EA5E9]/50 rounded-full text-[10px] font-bold uppercase tracking-widest z-10 shadow-md">
               {topic.category.toUpperCase()}
             </div>

             {/* Author Sidebar Column */}
              <div className="w-full md:w-[200px] shrink-0 flex flex-col items-center md:items-center text-center md:border-r-4 border-[#8B4513]/40 md:pr-8 md:justify-center md:py-8">
                <span className="text-[10px] font-bold uppercase text-[#0EA5E9] tracking-widest block mb-2 sm:mb-4">Criador do Tópico</span>
               <div className="h-20 w-20 sm:h-24 sm:w-24 bg-[#EBDCC6] rounded-[2rem] flex items-center justify-center text-[#0EA5E9] font-bold text-3xl sm:text-4xl mb-4">
                 {topic.authorName?.charAt(0).toUpperCase()}
               </div>
               <p className="text-sm font-bold text-[#001F33] uppercase">{topic.authorName}</p>
               <p className="text-[10px] font-bold text-[#001F33]/80 tracking-widest mt-1 mb-8">{new Date(topic.createdAt).toLocaleString()}</p>
             </div>

             {/* Content Column */}
              <div className="flex-1 w-full md:pr-8">
                <span className="text-[10px] font-bold uppercase text-[#0EA5E9] tracking-widest block mb-2 sm:mb-4">Título do Tópico</span>
                 <h1 className="text-2xl sm:text-4xl md:text-5xl font-display uppercase tracking-tight text-[#001F33] mb-6 sm:mb-10 leading-tight pr-0 md:pr-24">
                  {topic.title}
                </h1>
                
                <span className="text-[10px] font-bold uppercase text-[#0EA5E9] tracking-widest block mb-4 mt-8">Conteúdo da Discussão</span>
                 <p className="text-lg text-[#001F33] font-bold leading-relaxed mb-8 whitespace-pre-wrap">
                  {topic.content}
                </p>

                {(topic.imageUrl || topic.videoUrl) && (
                  <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    {topic.imageUrl && (
                      <div className="rounded-[2rem] overflow-hidden border-4 border-[#8B4513]/40 shadow-md">
                        <img src={topic.imageUrl} alt={topic.title} className="w-full h-auto aspect-video object-cover hover:scale-[1.02] transition-transform duration-500" />
                      </div>
                    )}

                    {topic.videoUrl && getYouTubeVideoId(topic.videoUrl) && (
                      <div className="rounded-[2rem] overflow-hidden border-4 border-[#8B4513]/40 shadow-md aspect-video bg-[#001F33]">
                        <iframe
                          width="100%"
                          height="100%"
                          src={`https://www.youtube.com/embed/${getYouTubeVideoId(topic.videoUrl)}`}
                          title="YouTube video player"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-8 border-t-4 border-[#8B4513]/40">
                  <div className="flex flex-wrap items-center gap-2">
                    <Button 
                      onClick={() => handleReaction('like')}
                      variant="ghost" 
                      className={`h-12 px-4 sm:px-6 rounded-full gap-2 transition-all ${topic.userReaction === 'like' ? 'bg-[#0EA5E9]/10 text-[#0EA5E9] border-2 border-[#0EA5E9]/30 shadow-sm' : 'bg-[#EBDCC6] text-[#001F33]/60 hover:bg-[#EBDCC6]/80 hover:text-[#0EA5E9]'}`}
                    >
                      <ThumbsUp className={`h-4 w-4 sm:h-5 sm:w-5 ${topic.userReaction === 'like' ? 'fill-current' : ''}`} />
                      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">{topic.likesCount || 0} Gostos</span>
                    </Button>

                    <Button 
                      onClick={() => handleReaction('dislike')}
                      variant="ghost" 
                      className={`h-12 px-4 sm:px-6 rounded-full gap-2 transition-all ${topic.userReaction === 'dislike' ? 'bg-red-50 text-red-600 border-2 border-red-200 shadow-sm' : 'bg-[#EBDCC6] text-[#001F33]/60 hover:bg-[#EBDCC6]/80 hover:text-red-600'}`}
                    >
                      <ThumbsDown className={`h-4 w-4 sm:h-5 sm:w-5 ${topic.userReaction === 'dislike' ? 'fill-current' : ''}`} />
                      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">{topic.dislikesCount || 0} </span>
                    </Button>
                    
                    {topic.likers && topic.likers.length > 0 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-12 px-4 rounded-full text-[10px] font-bold uppercase text-[#0EA5E9] border-2 border-[#0EA5E9]/20 tracking-widest ml-4 hover:bg-[#0EA5E9]/10">
                            Ver pessoas que gostaram
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 rounded-2xl border-4 border-[#8B4513]/40 shadow-xl bg-white p-2">
                          {topic.likers.map((l: any, i: number) => (
                            <DropdownMenuItem key={i} className="text-xs font-bold text-[#001F33] p-3 rounded-xl hover:bg-[#EBDCC6] focus:bg-[#EBDCC6] cursor-pointer outline-none">
                              {l.name}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[#001F33]/90 group shrink-0">
                    <MessageCircle size={20} className="group-hover:text-[#0EA5E9] transition-colors" />
                    <span className="text-xs font-bold uppercase tracking-widest">{comments.length} Respostas</span>
                  </div>
                </div>
              </div>
           </div>

           {/* Comments Section */}
           <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 ml-0 sm:ml-12 mb-6">
              <h3 className="text-[10px] font-bold uppercase text-[#001F33]/90 tracking-[0.2em]">Respostas da Comunidade</h3>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
                <Button 
                  onClick={() => setFilterType('recentes')}
                  variant="ghost" 
                  className={`h-8 rounded-full text-[10px] font-bold uppercase tracking-widest px-4 transition-all ${filterType === 'recentes' ? 'bg-[#001F33] text-white shadow-md' : 'bg-white text-[#001F33]/60 hover:bg-[#EBDCC6]'}`}
                >
                  Mais Recentes
                </Button>
                <Button 
                  onClick={() => setFilterType('populares')}
                  variant="ghost" 
                  className={`h-8 rounded-full text-[10px] font-bold uppercase tracking-widest px-4 transition-all ${filterType === 'populares' ? 'bg-[#001F33] text-white shadow-md' : 'bg-white text-[#001F33]/60 hover:bg-[#EBDCC6]'}`}
                >
                  Populares
                </Button>
                <Button 
                  onClick={() => setFilterType('respondidos')}
                  variant="ghost" 
                  className={`h-8 rounded-full text-[10px] font-bold uppercase tracking-widest px-4 transition-all ${filterType === 'respondidos' ? 'bg-[#001F33] text-white shadow-md' : 'bg-white text-[#001F33]/60 hover:bg-[#EBDCC6]'}`}
                >
                  Respondidos
                </Button>
              </div>
            </div>
            
            {getSortedComments().map((comment: any, idx: number) => (
              <div key={comment.id} className="space-y-4">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white p-4 sm:p-10 rounded-[24px] sm:rounded-[40px] shadow-sm border-[3px] sm:border-4 border-[#8B4513]/40 relative z-10"
                >
                  {comment.isHidden ? (
                    <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#EBDCC6]/50 p-6 rounded-2xl border-4 border-red-500/40">
                      <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                        <ShieldAlert className="h-6 w-6 text-red-500" />
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <h4 className="text-sm font-bold text-red-600 uppercase tracking-widest mb-1">Comentário Ocultado</h4>
                        <p className="text-xs font-bold text-[#001F33]/60">Por um administrador. Motivo: <span className="font-bold text-[#001F33]/90">{comment.hideReason}</span></p>
                      </div>
                      
                      {user?.role === 'admin' && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleUnhideComment(comment.id)}
                          className="text-green-600 hover:bg-green-50 rounded-full h-10 w-10 shrink-0"
                          title="Desocultar"
                        >
                          <Eye size={16} />
                        </Button>
                      )}
                      {(user?.role === 'admin' || comment.authorId === user?.id) && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setConfirmConfig({
                            isOpen: true, title: "Apagar Permanentemente?", description: "Esta acção é irreversível.", variant: "destructive",
                            onConfirm: () => handleDeleteComment(comment.id)
                          })}
                          className="text-red-500 hover:bg-red-50 rounded-full h-10 w-10 shrink-0"
                        >
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </div>
                  ) : (
                    <>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-[#EBDCC6] rounded-xl flex items-center justify-center text-[#0EA5E9] font-bold text-xs">
                          {comment.authorName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#001F33] uppercase">{comment.authorName}</p>
                          <p className="text-[10px] font-bold text-[#001F33]/90 tracking-widest">{new Date(comment.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Button 
                          onClick={() => handleCommentReaction(comment.id, 'like')}
                          variant="ghost" 
                          className={`h-8 px-3 transition-all rounded-full gap-2 ${comment.userReaction === 'like' ? 'bg-[#0EA5E9]/10 text-[#0EA5E9] border-2 border-[#0EA5E9]/30' : 'text-[#001F33]/60 hover:bg-[#EBDCC6] hover:text-[#0EA5E9]'}`}
                        >
                          <ThumbsUp className={`h-3 w-3 sm:h-4 sm:w-4 ${comment.userReaction === 'like' ? 'fill-current' : ''}`} />
                          <span className="text-[10px] font-bold">{comment.likesCount || 0}</span>
                        </Button>

                        <Button 
                          onClick={() => handleCommentReaction(comment.id, 'dislike')}
                          variant="ghost" 
                          className={`h-8 px-3 transition-all rounded-full gap-2 ${comment.userReaction === 'dislike' ? 'bg-red-50 text-red-600 border-2 border-red-200' : 'text-[#001F33]/60 hover:bg-[#EBDCC6] hover:text-red-600'}`}
                        >
                          <ThumbsDown className={`h-3 w-3 sm:h-4 sm:w-4 ${comment.userReaction === 'dislike' ? 'fill-current' : ''}`} />
                          <span className="text-[10px] font-bold">{comment.dislikesCount || 0}</span>
                        </Button>

                        {user?.role === 'admin' && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setHideModalConfig({ isOpen: true, commentId: comment.id, hideReason: "" })}
                            className="text-orange-500 hover:bg-orange-50 rounded-full h-8 w-8 sm:h-10 sm:w-10 shrink-0 ml-2"
                          >
                            <EyeOff size={14} className="sm:w-4 sm:h-4" />
                          </Button>
                        )}
                        
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setReplyingTo({ id: comment.id, name: comment.authorName });
                            document.getElementById('reply-textarea')?.focus();
                          }}
                          className="text-[#0EA5E9] hover:bg-[#0EA5E9]/10 rounded-full h-8 sm:h-10 px-3 sm:px-4 text-[10px] font-bold uppercase tracking-widest ml-1"
                        >
                          <Reply size={14} className="mr-1 sm:mr-2" /> <span className="hidden sm:inline">Responder</span>
                        </Button>
                        
                        {(user?.role === 'admin' || comment.authorId === user?.id) && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setConfirmConfig({
                              isOpen: true,
                              title: "Apagar Comentário?",
                              description: "Esta acção é irreversível e apagará todas as respostas.",
                              variant: "destructive",
                              onConfirm: () => handleDeleteComment(comment.id)
                            })}
                            className="text-red-500 hover:bg-red-50 rounded-full h-8 w-8 sm:h-10 sm:w-10 shrink-0"
                          >
                            <Trash2 size={14} className="sm:w-4 sm:h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm md:text-base text-[#001F33]/90 font-bold leading-relaxed">
                      {comment.content}
                    </p>
                    </>
                  )}
                </motion.div>

                {/* Respostas Aninhadas (Filhos) */}
                {(() => {
                  const children = comments.filter((child: any) => child.parentId === comment.id);
                  if (children.length === 0 || comment.isHidden) return null;
                  
                  const visibleCount = visibleReplies[comment.id] || 1;
                  const visibleChildren = children.slice(0, visibleCount);
                  
                  return (
                    <div className="pl-4 sm:pl-16 space-y-4 relative mt-4">
                      <div className="absolute left-4 sm:left-8 top-0 bottom-12 w-1.5 bg-[#8B4513]/40 z-0 rounded-full"></div>
                      {visibleChildren.map((child: any) => (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          key={child.id}
                          className="bg-white/80 p-4 sm:p-8 rounded-[24px] sm:rounded-[40px] shadow-sm border-[3px] sm:border-4 border-[#8B4513]/40 relative z-10"
                        >
                          {child.isHidden ? (
                            <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#EBDCC6]/50 p-4 rounded-2xl border-4 border-red-500/40">
                              <ShieldAlert className="h-5 w-5 text-red-500 shrink-0" />
                              <div className="flex-1 text-center sm:text-left">
                                <h4 className="text-xs font-bold text-red-600 uppercase tracking-widest">Resposta Ocultada</h4>
                                <p className="text-[10px] font-bold text-[#001F33]/60">{child.hideReason}</p>
                              </div>
                              
                              {user?.role === 'admin' && (
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleUnhideComment(child.id)}
                                  className="text-green-600 hover:bg-green-50 rounded-full h-8 w-8 shrink-0"
                                  title="Desocultar"
                                >
                                  <Eye size={14} />
                                </Button>
                              )}
                              {(user?.role === 'admin' || child.authorId === user?.id) && (
                                <Button variant="ghost" size="icon" onClick={() => {
                                  setConfirmConfig({ isOpen: true, title: "Apagar Permanentemente?", description: "Irreversível.", variant: "destructive", onConfirm: () => handleDeleteComment(child.id) })
                                }} className="text-red-500 hover:bg-red-50 rounded-full h-8 w-8 shrink-0"><Trash2 size={14} /></Button>
                              )}
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 bg-[#EBDCC6] rounded-xl flex items-center justify-center text-[#0EA5E9] font-bold text-xs">
                                    {child.authorName?.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-[#001F33] uppercase">{child.authorName}</p>
                                    <p className="text-[10px] font-bold text-[#001F33]/90 tracking-widest">{new Date(child.createdAt).toLocaleString()}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2">
                                  <Button 
                                    onClick={() => handleCommentReaction(child.id, 'like')}
                                    variant="ghost" 
                                    className={`h-8 px-3 transition-all rounded-full gap-2 ${child.userReaction === 'like' ? 'bg-[#0EA5E9]/10 text-[#0EA5E9] border-2 border-[#0EA5E9]/30' : 'text-[#001F33]/60 hover:bg-[#EBDCC6] hover:text-[#0EA5E9]'}`}
                                  >
                                    <ThumbsUp className={`h-3 w-3 ${child.userReaction === 'like' ? 'fill-current' : ''}`} />
                                    <span className="text-[10px] font-bold">{child.likesCount || 0}</span>
                                  </Button>
                                  
                                  <Button 
                                    onClick={() => handleCommentReaction(child.id, 'dislike')}
                                    variant="ghost" 
                                    className={`h-8 px-3 transition-all rounded-full gap-2 ${child.userReaction === 'dislike' ? 'bg-red-50 text-red-600 border-2 border-red-200' : 'text-[#001F33]/60 hover:bg-[#EBDCC6] hover:text-red-600'}`}
                                  >
                                    <ThumbsDown className={`h-3 w-3 ${child.userReaction === 'dislike' ? 'fill-current' : ''}`} />
                                    <span className="text-[10px] font-bold">{child.dislikesCount || 0}</span>
                                  </Button>

                                  {user?.role === 'admin' && (
                                    <Button variant="ghost" size="icon" onClick={() => setHideModalConfig({ isOpen: true, commentId: child.id, hideReason: "" })} className="text-orange-500 hover:bg-orange-50 rounded-full h-8 w-8 shrink-0 ml-2">
                                      <EyeOff size={14} />
                                    </Button>
                                  )}
                                  {(user?.role === 'admin' || child.authorId === user?.id) && (
                                    <Button variant="ghost" size="icon" onClick={() => setConfirmConfig({
                                      isOpen: true, title: "Apagar?", description: "Esta acção é irreversível.", variant: "destructive", onConfirm: () => handleDeleteComment(child.id)
                                    })} className="text-red-500 hover:bg-red-50 rounded-full h-8 w-8 shrink-0">
                                      <Trash2 size={14} />
                                    </Button>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-[#001F33]/90 font-bold leading-relaxed">{child.content}</p>
                            </>
                          )}
                        </motion.div>
                      ))}
                      
                      {children.length > 1 && (
                        <div className="flex items-center gap-4 mt-4">
                          {visibleCount < children.length && (
                            <Button 
                              variant="ghost" 
                              onClick={() => handleShowMoreReplies(comment.id, children.length)}
                              className="text-[#0EA5E9] font-bold uppercase text-[10px] tracking-widest hover:bg-[#0EA5E9]/10 rounded-full h-8 px-4 border-2 sm:border-4 border-[#0EA5E9]/40 shadow-sm"
                            >
                              Ver Mais ({children.length - visibleCount})
                            </Button>
                          )}
                          {visibleCount > 1 && (
                            <Button 
                              variant="ghost" 
                              onClick={() => handleHideReplies(comment.id)}
                              className="text-[#001F33]/80 font-bold uppercase text-[10px] tracking-widest hover:bg-[#EBDCC6] rounded-full h-8 px-4"
                            >
                              Ocultar Respostas
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            ))}
            
            <div className="fixed bottom-0 left-0 right-0 md:pl-72 p-2 sm:p-6 z-20 pointer-events-none">
              <div className="pointer-events-auto max-w-4xl mx-auto bg-[#EBDCC6] border-[3px] sm:border-4 border-[#8B4513]/40 shadow-[0_-10px_40px_rgba(0,0,0,0.15)] rounded-[24px] sm:rounded-[40px] p-2 sm:p-4 pb-2 sm:pb-3">
                {replyingTo && (
                  <div className="bg-white border-2 border-[#0EA5E9]/20 rounded-2xl p-3 sm:p-4 mb-4 flex items-center justify-between shadow-sm">
                    <p className="text-[10px] sm:text-xs font-bold text-[#001F33]/80 uppercase tracking-widest">
                      A responder a <span className="font-bold text-[#0EA5E9]">{replyingTo.name}</span>
                    </p>
                    <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)} className="h-6 sm:h-8 px-3 text-[#0EA5E9] hover:bg-[#0EA5E9]/20 rounded-full text-[10px] font-bold tracking-widest uppercase">
                      Cancelar
                    </Button>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Textarea 
                    id="reply-textarea"
                    className="flex-1 bg-white border-none min-h-[50px] sm:min-h-[60px] rounded-2xl p-3 sm:p-4 text-[#001F33] font-bold focus:ring-4 focus:ring-[#0EA5E9]/20 text-sm sm:text-base shadow-inner resize-none"
                    placeholder={replyingTo ? "Escreve a tua resposta..." : "Escreve o teu comentário aqui..."}
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                  />
                  <div className="flex items-end justify-end">
                    <Button 
                      onClick={handlePostComment}
                      className="w-full sm:w-auto bg-[#0EA5E9] text-white uppercase font-bold text-[10px] sm:text-xs h-12 sm:h-[60px] px-6 rounded-2xl shadow-lg shadow-[#0EA5E9]/30 tracking-widest hover:bg-[#0284c7] hover:scale-[1.02] transition-all"
                    >
                      <Send className="mr-2 h-4 w-4" /> Enviar Resposta (+20 XP)
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={() => {
          confirmConfig.onConfirm();
          setConfirmConfig({ ...confirmConfig, isOpen: false });
        }}
        title={confirmConfig.title}
        description={confirmConfig.description}
        variant={confirmConfig.variant}
      />

      <Dialog open={hideModalConfig.isOpen} onOpenChange={(open) => setHideModalConfig({ ...hideModalConfig, isOpen: open })}>
        <DialogContent className="max-w-md bg-white border-none shadow-2xl rounded-[32px] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display uppercase text-[#001F33] tracking-tighter">Ocultar Comentário</DialogTitle>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <p className="text-xs font-bold text-[#001F33]/60 uppercase tracking-widest">Motivo Público da Censura</p>
            <Input 
              value={hideModalConfig.hideReason} 
              onChange={e => setHideModalConfig({ ...hideModalConfig, hideReason: e.target.value })}
              placeholder="Ex: Utilização de palavras obscenas"
              className="bg-[#EBDCC6] border-none h-14 rounded-2xl px-6 text-[#001F33] font-bold focus:ring-[#0EA5E9]"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setHideModalConfig({ ...hideModalConfig, isOpen: false })} className="h-12 rounded-full font-bold uppercase text-[10px] tracking-widest text-[#001F33]/60">Cancelar</Button>
            <Button onClick={handleHideComment} className="h-12 px-8 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-orange-500/20">Ocultar Mensagem</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
