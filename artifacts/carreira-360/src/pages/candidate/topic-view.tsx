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
  EyeOff,
  ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function TopicView() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { id } = useParams();
  const [location, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [topicData, setTopicData] = useState<any>(null);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<{ id: number; name: string } | null>(null);
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

  const handleLike = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/forum/topics/${id}/like`, {
        method: "POST",
        headers: { 'Authorization': `Bearer ${token}` }
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
        toast({ title: "Erro", description: "Não tens permissão para apagar este comentário." });
      }
    } catch (err) {
      toast({ title: "Erro ao apagar", description: "Tenta novamente mais tarde." });
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

  const handleLogout = () => { localStorage.clear(); setLocation("/"); };

  if (loading) return <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center font-display text-2xl uppercase tracking-tighter text-[#001F33]/20">Carregando discussão...</div>;
  if (!topicData) return null;

  const { topic, comments, likes } = topicData;

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex font-sans text-[#001F33]">
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

      <aside className={`w-72 bg-[#001F33] text-white flex flex-col h-screen fixed top-0 left-0 z-40 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-8 border-b border-white/10 relative flex items-center justify-between">
          <img src="/assets/logo.png" className="h-14 w-auto object-contain" alt="Logo" />
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
            <Button variant="ghost" className="w-full justify-start text-white/50 hover:bg-[#0EA5E9]/10 uppercase tracking-widest font-bold text-xs h-12">
              <LayoutDashboard className="mr-3 h-5 w-5" /> Início
            </Button>
          </Link>
          <Link href="/forum">
            <Button variant="ghost" className="w-full justify-start bg-[#0EA5E9]/20 text-white uppercase tracking-widest font-bold text-xs h-12 shadow-inner">
              <MessageSquare className="mr-3 h-5 w-5" /> Comunidade
            </Button>
          </Link>
          <Link href="/mentorship">
            <Button variant="ghost" className="w-full justify-start text-white/50 hover:bg-[#0EA5E9]/10 uppercase tracking-widest font-bold text-xs h-12">
              <Users className="mr-3 h-5 w-5" /> Mentoria
            </Button>
          </Link>
        </nav>
        <div className="p-8 border-t border-white/10">
          <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-red-400 hover:bg-red-400/10 uppercase tracking-widest font-bold text-xs h-12">
            <LogOut className="mr-3 h-5 w-5" /> Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-72 p-6 sm:p-10">
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
          <button className="flex items-center gap-2 text-[#001F33]/80 hover:text-[#0EA5E9] font-black uppercase text-[10px] tracking-widest mb-10 transition-colors">
            <ArrowLeft size={16} /> Voltar para a Comunidade
          </button>
        </Link>

        <div className="max-w-4xl mx-auto space-y-10">
          {/* Main Topic Header */}
          <div className="bg-white p-6 sm:p-12 rounded-[32px] sm:rounded-[48px] shadow-sm border border-[#8B4513]/50 relative overflow-hidden">
             {/* Category Tag */}
             <div className="absolute top-6 right-6 sm:top-8 sm:right-12 px-6 py-2 bg-[#0EA5E9]/10 text-[#0EA5E9] rounded-full text-[10px] font-black uppercase tracking-widest">
               {topic.category.toUpperCase()}
             </div>

             <div className="flex items-center gap-4 mb-8">
               <div className="h-12 w-12 bg-[#F5F0E8] rounded-2xl flex items-center justify-center text-[#0EA5E9] font-black text-lg">
                 {topic.authorName?.charAt(0).toUpperCase()}
               </div>
               <div>
                 <p className="text-sm font-black text-[#001F33] uppercase">{topic.authorName}</p>
                 <p className="text-[10px] font-bold text-[#001F33]/80 tracking-widest">{new Date(topic.createdAt).toLocaleString()}</p>
               </div>
             </div>

             <h1 className="text-4xl md:text-5xl font-display uppercase tracking-tight text-[#001F33] mb-8 leading-tight">
               {topic.title}
             </h1>
             
             <p className="text-lg text-[#001F33]/90 font-bold leading-relaxed mb-12">
               {topic.content}
             </p>

             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-10 border-t border-[#8B4513]/50">
               <div className="flex items-center gap-4">
                 <Button 
                   onClick={handleLike}
                   variant="ghost" 
                   className={`h-14 px-8 rounded-full gap-3 ${likes.some((l: any) => l.userId === user.id) ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-[#F5F0E8] text-[#001F33]/60 hover:bg-[#F5F0E8]/80'}`}
                 >
                   <Heart className={`h-5 w-5 ${likes.some((l: any) => l.userId === user.id) ? 'fill-current' : ''}`} />
                   <span className="text-xs font-black uppercase tracking-widest">{likes.length < 1 ? 'Gostar' : `${likes.length} Gostos`}</span>
                 </Button>
                 
                 {likes.length > 0 && (
                   <div className="flex -space-x-3 items-center">
                     {likes.slice(0, 3).map((l: any, i: number) => (
                       <div key={i} className="h-10 w-10 rounded-full bg-[#001F33] border-4 border-white flex items-center justify-center text-[10px] font-black text-white">
                         {l.userName.charAt(0)}
                       </div>
                     ))}
                     {likes.length > 3 && <span className="pl-6 text-[10px] font-black text-[#001F33]/80 tracking-widest">+{likes.length - 3} OUTROS</span>}
                   </div>
                 )}
               </div>
               <div className="flex items-center gap-3 text-[#001F33]/80">
                 <MessageCircle size={20} />
                 <span className="text-xs font-black uppercase tracking-widest">{comments.length} Respostas</span>
               </div>
             </div>
          </div>

          {/* Comments Section */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase text-[#001F33]/80 tracking-[0.2em] ml-12">Respostas da Comunidade</h3>
            
            {comments.filter((c: any) => !c.parentId).map((comment: any, idx: number) => (
              <div key={comment.id} className="space-y-4">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white p-6 sm:p-10 rounded-[32px] sm:rounded-[40px] shadow-sm border border-[#8B4513]/50 relative z-10"
                >
                  {comment.isHidden ? (
                    <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#F5F0E8]/50 p-6 rounded-2xl border border-red-500/20">
                      <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                        <ShieldAlert className="h-6 w-6 text-red-500" />
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <h4 className="text-sm font-black text-red-600 uppercase tracking-widest mb-1">Comentário Ocultado</h4>
                        <p className="text-xs font-bold text-[#001F33]/60">Por um administrador. Motivo: <span className="font-extrabold text-[#001F33]/90">{comment.hideReason}</span></p>
                      </div>
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
                      <div className="h-10 w-10 bg-[#F5F0E8] rounded-xl flex items-center justify-center text-[#0EA5E9] font-black text-xs">
                        {comment.authorName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-black text-[#001F33] uppercase">{comment.authorName}</p>
                        <p className="text-[10px] font-bold text-[#001F33]/80 tracking-widest">{new Date(comment.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    
                      <div className="flex items-center gap-2">
                      {user?.role === 'admin' && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setHideModalConfig({ isOpen: true, commentId: comment.id, hideReason: "" })}
                          className="text-orange-500 hover:bg-orange-50 rounded-full h-10 w-10 shrink-0"
                        >
                          <EyeOff size={16} />
                        </Button>
                      )}
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setReplyingTo({ id: comment.id, name: comment.authorName });
                          document.getElementById('reply-textarea')?.focus();
                        }}
                        className="text-[#0EA5E9] hover:bg-[#0EA5E9]/10 rounded-full h-10 px-4 text-[10px] font-black uppercase tracking-widest"
                      >
                        <Reply size={14} className="mr-2" /> Responder
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
                          className="text-red-500 hover:bg-red-50 rounded-full h-10 w-10 shrink-0"
                        >
                          <Trash2 size={16} />
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
                {comments.filter((child: any) => child.parentId === comment.id).length > 0 && (
                  <div className="pl-8 sm:pl-16 space-y-4 relative">
                    <div className="absolute left-8 top-0 bottom-12 w-0.5 bg-[#8B4513]/20 z-0"></div>
                    {comments.filter((child: any) => child.parentId === comment.id).map((child: any) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={child.id}
                        className="bg-white/80 p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] shadow-sm border border-[#8B4513]/30 relative z-10"
                      >
                        {child.isHidden ? (
                          <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#F5F0E8]/50 p-4 rounded-2xl border border-red-500/20">
                            <ShieldAlert className="h-5 w-5 text-red-500 shrink-0" />
                            <div className="flex-1 text-center sm:text-left">
                              <h4 className="text-xs font-black text-red-600 uppercase tracking-widest">Resposta Ocultada</h4>
                              <p className="text-[10px] font-bold text-[#001F33]/60">{child.hideReason}</p>
                            </div>
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
                                <div className="h-8 w-8 bg-[#F5F0E8] rounded-xl flex items-center justify-center text-[#0EA5E9] font-black text-xs">
                                  {child.authorName?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-xs font-black text-[#001F33] uppercase">{child.authorName}</p>
                                  <p className="text-[10px] font-bold text-[#001F33]/80 tracking-widest">{new Date(child.createdAt).toLocaleString()}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                {user?.role === 'admin' && (
                                  <Button variant="ghost" size="icon" onClick={() => setHideModalConfig({ isOpen: true, commentId: child.id, hideReason: "" })} className="text-orange-500 hover:bg-orange-50 rounded-full h-8 w-8 shrink-0">
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
                  </div>
                )}
              </div>
            ))}

            <div className="bg-white p-6 sm:p-10 rounded-[32px] sm:rounded-[40px] shadow-sm border border-[#8B4513]/50 mt-12">
              {replyingTo && (
                <div className="bg-[#0EA5E9]/10 border border-[#0EA5E9]/20 rounded-2xl p-4 mb-4 flex items-center justify-between">
                  <p className="text-xs font-bold text-[#001F33]/80 uppercase tracking-widest">
                    A responder a <span className="font-black text-[#0EA5E9]">{replyingTo.name}</span>
                  </p>
                  <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)} className="h-6 px-3 text-[#0EA5E9] hover:bg-[#0EA5E9]/20 rounded-full text-[10px] font-black tracking-widest uppercase">
                    Cancelar
                  </Button>
                </div>
              )}
              <Textarea 
                id="reply-textarea"
                className="bg-[#F5F0E8] border-none min-h-[120px] rounded-[32px] p-8 text-[#001F33] font-bold focus:ring-[#0EA5E9] text-base mb-6"
                placeholder={replyingTo ? "Escreve a tua resposta..." : "Escreve o teu comentário aqui..."}
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
              />
              <div className="flex justify-end">
                <Button 
                  onClick={handlePostComment}
                  className="bg-[#0EA5E9] text-white uppercase font-black text-xs h-14 px-10 rounded-full shadow-lg shadow-[#0EA5E9]/20 tracking-widest"
                >
                  <Send className="mr-2 h-4 w-4" /> Enviar Resposta (+20 XP)
                </Button>
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
              className="bg-[#F5F0E8] border-none h-14 rounded-2xl px-6 text-[#001F33] font-bold focus:ring-[#0EA5E9]"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setHideModalConfig({ ...hideModalConfig, isOpen: false })} className="h-12 rounded-full font-black uppercase text-[10px] tracking-widest text-[#001F33]/60">Cancelar</Button>
            <Button onClick={handleHideComment} className="h-12 px-8 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-orange-500/20">Ocultar Mensagem</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
