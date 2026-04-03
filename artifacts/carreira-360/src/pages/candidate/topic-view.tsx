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
  ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function TopicView() {
  const { id } = useParams();
  const [location, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [topicData, setTopicData] = useState<any>(null);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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
        body: JSON.stringify({ content: newComment })
      });
      if (response.ok) {
        toast({ title: "Comentário Publicado!", description: "Ganhaste +20 XP por participar na discussão." });
        setNewComment("");
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

  const handleLogout = () => { localStorage.clear(); setLocation("/"); };

  if (loading) return <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center font-display text-2xl uppercase tracking-tighter text-[#001F33]/20">Carregando discussão...</div>;
  if (!topicData) return null;

  const { topic, comments, likes } = topicData;

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex font-sans text-[#001F33]">
      {/* Sidebar - Shared */}
      <aside className="w-64 bg-[#001F33] text-white flex flex-col h-screen fixed top-0 left-0 z-20">
        <div className="p-8 border-b border-white/10">
          <img src="/assets/logo.png" className="h-10 w-auto object-contain" alt="Logo" />
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
      <main className="flex-1 ml-64 p-10">
        <Link href="/forum">
          <button className="flex items-center gap-2 text-[#001F33]/40 hover:text-[#0EA5E9] font-black uppercase text-[10px] tracking-widest mb-10 transition-colors">
            <ArrowLeft size={16} /> Voltar para a Comunidade
          </button>
        </Link>

        <div className="max-w-4xl mx-auto space-y-10">
          {/* Main Topic Header */}
          <div className="bg-white p-12 rounded-[48px] shadow-sm border border-[#001F33]/5 relative overflow-hidden">
             {/* Category Tag */}
             <div className="absolute top-8 right-12 px-6 py-2 bg-[#0EA5E9]/10 text-[#0EA5E9] rounded-full text-[10px] font-black uppercase tracking-widest">
               {topic.category.toUpperCase()}
             </div>

             <div className="flex items-center gap-4 mb-8">
               <div className="h-12 w-12 bg-[#F5F0E8] rounded-2xl flex items-center justify-center text-[#0EA5E9] font-black text-lg">
                 {topic.authorName?.charAt(0).toUpperCase()}
               </div>
               <div>
                 <p className="text-sm font-black text-[#001F33] uppercase">{topic.authorName}</p>
                 <p className="text-[10px] font-bold text-[#001F33]/40 tracking-widest">{new Date(topic.createdAt).toLocaleString()}</p>
               </div>
             </div>

             <h1 className="text-4xl md:text-5xl font-display uppercase tracking-tight text-[#001F33] mb-8 leading-tight">
               {topic.title}
             </h1>
             
             <p className="text-lg text-[#001F33]/70 font-medium leading-relaxed mb-12">
               {topic.content}
             </p>

             <div className="flex items-center justify-between pt-10 border-t border-[#001F33]/5">
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
                     {likes.length > 3 && <span className="pl-6 text-[10px] font-black text-[#001F33]/40 tracking-widest">+{likes.length - 3} OUTROS</span>}
                   </div>
                 )}
               </div>
               <div className="flex items-center gap-3 text-[#001F33]/40">
                 <MessageCircle size={20} />
                 <span className="text-xs font-black uppercase tracking-widest">{comments.length} Respostas</span>
               </div>
             </div>
          </div>

          {/* Comments Section */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase text-[#001F33]/40 tracking-[0.2em] ml-12">Respostas da Comunidade</h3>
            
            {comments.map((comment: any, idx: number) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={comment.id}
                className="bg-white p-10 rounded-[40px] shadow-sm border border-[#001F33]/5"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-10 w-10 bg-[#F5F0E8] rounded-xl flex items-center justify-center text-[#0EA5E9] font-black text-xs">
                    {comment.authorName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-black text-[#001F33] uppercase">{comment.authorName}</p>
                    <p className="text-[10px] font-bold text-[#001F33]/40 tracking-widest">{new Date(comment.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <p className="text-sm md:text-base text-[#001F33]/70 font-medium leading-relaxed">
                  {comment.content}
                </p>
              </motion.div>
            ))}

            <div className="bg-white p-10 rounded-[40px] shadow-sm border border-[#001F33]/5 mt-12">
              <label className="text-[10px] font-black uppercase text-[#001F33] tracking-widest ml-2 mb-4 block">A tua resposta</label>
              <Textarea 
                className="bg-[#F5F0E8] border-none min-h-[120px] rounded-[32px] p-8 text-[#001F33] font-bold focus:ring-[#0EA5E9] text-base mb-6"
                placeholder="Escreve o teu comentário aqui..."
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
    </div>
  );
}
