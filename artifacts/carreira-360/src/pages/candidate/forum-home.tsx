import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { 
  MessageSquare, 
  Plus, 
  MessageCircle, 
  Heart, 
  ChevronRight, 
  Search,
  Filter,
  LayoutDashboard,
  Users,
  Briefcase,
  LogOut,
  ArrowLeft,
  Users2,
  Menu,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { useToast } from "@/hooks/use-toast";

const categories = [
  { id: 'all', label: 'Tudo', color: 'bg-gray-100 text-gray-600' },
  { id: 'cv', label: 'Dicas de CV', color: 'bg-blue-100 text-blue-600' },
  { id: 'jobs', label: 'Vagas', color: 'bg-green-100 text-green-600' },
  { id: 'career', label: 'Carreira', color: 'bg-purple-100 text-purple-600' },
  { id: 'education', label: 'Formação', color: 'bg-amber-100 text-amber-600' },
];

export default function ForumHome() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [newTopic, setNewTopic] = useState({ title: "", content: "", category: "cv" });
  const { toast } = useToast();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { setLocation("/auth/login"); return; }
    setUser(JSON.parse(stored));
    fetchTopics();
  }, []);

  const fetchTopics = async (category = selectedCategory) => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const url = category === 'all' ? '/api/forum/topics' : `/api/forum/topics?category=${category}`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) setTopics(await response.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTopic = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("/api/forum/topics", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newTopic)
      });
      if (response.ok) {
        toast({ title: "Tópico Criado!", description: "Ganhaste +100 XP por partilhar com a comunidade." });
        setIsAddingTopic(false);
        setNewTopic({ title: "", content: "", category: "cv" });
        fetchTopics();
      }
    } catch (err) {
      toast({ title: "Erro ao criar tópico" });
    }
  };

  const handleLike = async (topicId: number) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/forum/topics/${topicId}/like`, {
        method: "POST",
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchTopics();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => { localStorage.clear(); setLocation("/"); };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex font-sans text-[#001F33]">
      {/* Sidebar - Consistent with Dashboard */}
      
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
      <main className="flex-1 md:ml-72 p-6 sm:p-10 mt-2">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-12">
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
              <span className="text-[#0EA5E9] font-black uppercase text-[10px] tracking-[0.3em] block mb-2">Comunidade Carreira 360</span>
              <h1 className="text-3xl sm:text-5xl font-display uppercase tracking-tight text-[#001F33] leading-none">Muro de Discussões</h1>
            </div>
          </div>
          <Button 
            onClick={() => setIsAddingTopic(true)}
            className="bg-[#0EA5E9] text-white uppercase font-black text-xs px-8 h-12 sm:h-14 rounded-full shadow-lg shadow-[#0EA5E9]/20 hover:scale-105 active:scale-95 transition-all w-full sm:w-auto"
          >
            <Plus className="mr-2 h-5 w-5" /> Iniciar Discussão
          </Button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Categorias */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-[#8B4513]/50">
              <h3 className="text-[10px] font-black uppercase text-[#001F33]/40 tracking-widest mb-6 px-2">Categorias</h3>
              <div className="space-y-2">
                {categories.map(cat => (
                  <button 
                    key={cat.id}
                    onClick={() => { setSelectedCategory(cat.id); fetchTopics(cat.id); }}
                    className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${selectedCategory === cat.id ? 'bg-[#001F33] text-white shadow-xl' : 'text-[#001F33]/60 hover:bg-[#F5F0E8]'}`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Feed de Tópicos */}
          <div className="lg:col-span-3 space-y-6">
            {loading ? (
              <div className="text-center py-20 text-[#001F33]/20 font-display text-2xl uppercase">Carregando conversas...</div>
            ) : (
              <div className="grid gap-6">
                {topics.map((t, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={t.id}
                    className="bg-white p-5 sm:p-8 rounded-[32px] shadow-sm border border-[#8B4513]/50 hover:shadow-2xl transition-all group relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-[#F5F0E8] rounded-full flex items-center justify-center text-[#0EA5E9] font-black text-xs">
                          {t.authorName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-black text-[#001F33] uppercase">{t.authorName}</p>
                          <p className="text-[10px] font-bold text-[#001F33]/40">{new Date(t.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-black uppercase px-4 py-1.5 rounded-full ${categories.find(c => c.id === t.category)?.color}`}>
                        {categories.find(c => c.id === t.category)?.label}
                      </span>
                    </div>

                    <h3 className="text-2xl font-display uppercase text-[#001F33] mb-4 group-hover:text-[#0EA5E9] transition-colors">
                      {t.title}
                    </h3>
                    <p className="text-[#001F33]/60 text-sm font-medium mb-8 line-clamp-2 leading-relaxed">
                      {t.content}
                    </p>

                    <div className="flex items-center justify-between pt-8 border-t border-[#8B4513]/50">
                      <div className="flex items-center gap-6">
                        <button 
                          onClick={() => handleLike(t.id)}
                          className="flex items-center gap-2 text-[#001F33]/60 hover:text-red-500 transition-colors"
                        >
                          <Heart className={`h-5 w-5 ${t.likeCount > 0 ? 'fill-red-500 text-red-500' : ''}`} />
                          <span className="text-xs font-black">{t.likeCount}</span>
                        </button>
                        <div className="flex items-center gap-2 text-[#001F33]/60">
                          <MessageCircle className="h-5 w-5" />
                          <span className="text-xs font-black">{t.commentCount}</span>
                        </div>
                      </div>
                      
                      <Link href={`/forum/topic/${t.id}`}>
                        <Button variant="ghost" className="text-[#0EA5E9] text-[10px] font-black uppercase tracking-widest gap-2">
                          Ver Discussão <ChevronRight size={14} />
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Novo Tópico */}
        <ResponsiveDialog 
          isOpen={isAddingTopic} 
          setIsOpen={setIsAddingTopic}
          title="Iniciar Nova Discussão"
          className="sm:max-w-2xl"
        >
          <div className="py-4 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-[#001F33] tracking-widest ml-2">Título do Tópico</label>
              <Input 
                className="text-[#001F33] bg-[#F5F0E8] border-none h-16 rounded-2xl font-bold px-8 text-lg" 
                value={newTopic.title}
                onChange={e => setNewTopic({...newTopic, title: e.target.value})}
                placeholder="Ex: Como melhorar meu CV?"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-[#001F33] tracking-widest ml-2">Categoria</label>
              <div className="grid grid-cols-2 gap-3">
                {categories.filter(c => c.id !== 'all').map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setNewTopic({...newTopic, category: cat.id})}
                    className={`h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${newTopic.category === cat.id ? 'bg-[#001F33] text-white shadow-lg' : 'bg-[#F5F0E8] text-[#001F33]/40'}`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-[#001F33] tracking-widest ml-2">Conteúdo / Pergunta</label>
              <Textarea 
                className="text-[#001F33] bg-[#F5F0E8] border-none min-h-[160px] rounded-[32px] font-bold p-8" 
                value={newTopic.content}
                onChange={e => setNewTopic({...newTopic, content: e.target.value})}
                placeholder="Explica o que queres debater..."
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button 
              onClick={handleCreateTopic}
              className="w-full bg-[#001F33] text-white uppercase font-black text-xs h-18 rounded-[32px] shadow-xl hover:bg-[#0EA5E9] transition-all tracking-[0.3em]"
            >
              Publicar Tópico (+100 XP)
            </Button>
          </DialogFooter>
        </ResponsiveDialog>
      </main>
    </div>
  );
}
