import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Calendar, 
  Clock, 
  MessageSquare, 
  LayoutDashboard, 
  LogOut, 
  CheckCircle2, 
  XCircle, 
  ExternalLink,
  ClipboardList,
  Menu,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function MentorDashboard() {
  const [location, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [viewCandidate, setViewCandidate] = useState<any>(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [meetingLink, setMeetingLink] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const storedStr = localStorage.getItem("user");
    if (!storedStr) {
      setLocation("/auth/login");
      return;
    }
    const parsedUser = JSON.parse(storedStr);
    if (parsedUser.role !== "mentor") {
      setLocation("/");
      return;
    }
    setUser(parsedUser);
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("/api/mentorship/mentor-sessions", {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      }
    } catch (err) {
      console.error("Erro ao buscar sessões", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (sessionId: number, status: string, link: string = "") => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/mentorship/sessions/${sessionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status, meetingLink: link })
      });

      if (response.ok) {
        toast({ 
          title: status === 'confirmado' ? "Sessão Confirmada!" : "Sessão Cancelada", 
          description: status === 'confirmado' ? "O aluno será notificado e receberá o link." : "O agendamento foi removido." 
        });
        setIsApproveModalOpen(false);
        setMeetingLink("");
        fetchSessions();
      }
    } catch (err) {
      toast({ title: "Erro", description: "Falha ao atualizar sessão.", variant: "destructive" });
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setLocation("/");
  };

  if (!user) return <div className="min-h-screen bg-[#001F33]"></div>;

  return (
    <div className="min-h-screen bg-[#EBDCC6] flex font-sans text-[#001F33] relative overflow-x-hidden">
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

      {/* Sidebar Mentor */}
      <aside className={`w-72 bg-[#001F33] text-white flex flex-col h-screen fixed top-0 left-0 border-r border-[#F97316]/20 z-40 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-8 border-b border-white/10 flex flex-col items-center relative">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsSidebarOpen(false)}
            className="absolute right-4 top-4 text-white/50 hover:text-white md:hidden"
          >
            <X size={24} />
          </Button>
          <img src="/assets/logo.png" className="h-18 w-auto object-contain mb-4" alt="Logo" />
          <span className="px-3 py-1 bg-[#F97316]/20 text-[#F97316] rounded-full text-[10px] font-bold uppercase tracking-widest">Painel do Mentor</span>
        </div>
        <nav className="flex-1 p-6 space-y-4">
          <Button variant="ghost" className="w-full justify-start text-white bg-[#F97316]/20 uppercase tracking-widest font-bold text-xs h-12">
            <ClipboardList className="mr-3 h-5 w-5" /> Agendamentos
          </Button>
          <div className="pt-8 opacity-20 pointer-events-none">
             <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 pl-4">Configurações</p>
             <Button variant="ghost" className="w-full justify-start text-white/50 uppercase tracking-widest font-bold text-xs h-12">
                <Calendar className="mr-3 h-5 w-5" /> Minha Agenda
             </Button>
          </div>
        </nav>
        <div className="p-6 border-t border-white/10">
          <div className="mb-4">
             <p className="text-sm font-bold uppercase text-white truncate">{user.name}</p>
             <p className="text-[10px] text-white/50 uppercase truncate">{user.email}</p>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-[#F97316] hover:bg-[#F97316]/10 uppercase tracking-widest font-bold text-xs">
            <LogOut className="mr-3 h-5 w-5" /> Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-72 min-h-screen">
        <header className="p-6 md:p-10 bg-white/50 md:bg-transparent border-b-2 md:border-none border-[#8B4513] sticky top-0 z-20 backdrop-blur-md md:backdrop-blur-none flex items-center justify-between md:block">
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
              <h1 className="text-2xl md:text-4xl font-display uppercase tracking-tight mb-1 md:mb-2 text-[#001F33]">Pedidos de Mentoria</h1>
              <p className="text-[#001F33]/50 font-medium text-xs md:text-sm hidden md:block">Analisa e gere as solicitações dos jovens que procuram a tua orientação.</p>
            </div>
          </div>

          <div className="flex gap-4 md:absolute md:right-10 md:top-10">
             <div className="bg-white p-3 md:p-4 rounded-2xl shadow-sm border-2 border-[#8B4513] flex items-center gap-3">
                <div className="h-8 w-8 md:h-10 md:w-10 bg-[#0EA5E9]/10 rounded-xl flex items-center justify-center text-[#0EA5E9]">
                   <Users size={18} />
                </div>
                <div>
                   <p className="text-[10px] font-bold uppercase text-[#001F33]/40 tracking-widest leading-none">Sessões</p>
                   <p className="text-lg md:text-xl font-bold">{sessions.length}</p>
                </div>
             </div>
          </div>
        </header>

        <div className="p-6 md:p-10">
          <div className="md:hidden mb-8">
            <p className="text-[#001F33]/50 font-medium text-sm">Analisa e gere as solicitações dos jovens.</p>
          </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-4 border-[#F97316] border-t-transparent rounded-full"></div></div>
        ) : sessions.length === 0 ? (
          <div className="bg-white p-20 text-center rounded-[2.5rem] shadow-sm border-2 border-[#8B4513]">
            <Calendar size={64} className="mx-auto text-[#001F33]/10 mb-6" />
            <h3 className="text-xl font-display uppercase text-[#001F33]/30">Ainda não tens pedidos</h3>
            <p className="text-sm text-[#001F33]/40 mt-2">Assim que um jovem agendar contigo, a notificação irá aparecer aqui.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {sessions.map((session) => (
              <motion.div 
                key={session.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-5 sm:p-8 rounded-[2rem] shadow-sm border-2 border-[#8B4513] hover:shadow-md transition-shadow flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-8"
              >
                <div className="flex items-center gap-6">
                  <div className="h-14 w-14 bg-[#EBDCC6] rounded-2xl flex items-center justify-center text-[#001F33] font-display text-xl">
                     {session.candidateName[0]}
                  </div>
                  <div>
                    <h3 className="text-lg font-display uppercase text-[#001F33] mb-1">{session.candidateName}</h3>
                    <div className="flex items-center gap-4 text-xs font-semibold text-[#001F33]/40 mb-2">
                       <span className="flex items-center"><Calendar size={14} className="mr-1.5" /> {new Date(session.dateTime).toLocaleDateString()}</span>
                       <span className="flex items-center"><Clock size={14} className="mr-1.5" /> {new Date(session.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <Button onClick={() => setViewCandidate(session)} variant="outline" size="sm" className="h-7 text-[9px] uppercase px-3 font-bold border-[#001F33]/20 text-[#0EA5E9] hover:bg-[#0EA5E9]/10">
                      Visualizar Perfil Completo
                    </Button>
                  </div>
                </div>

                <div className="w-full lg:flex-1 lg:max-w-md bg-[#EBDCC6]/50 p-4 rounded-2xl">
                   <p className="text-[10px] font-bold uppercase text-[#001F33]/30 tracking-widest mb-1">Notas do Aluno:</p>
                   <p className="text-sm text-[#001F33]/70 italic line-clamp-2">"{session.notes || 'Sem observações...'}"</p>
                </div>

                <div className="flex items-center gap-3 w-full lg:w-auto">
                  {session.status === 'pendente' ? (
                    <>
                      <Button 
                        onClick={() => { setSelectedSession(session); setIsApproveModalOpen(true); }}
                        className="bg-[#0EA5E9] hover:bg-[#001F33] text-white uppercase font-bold text-[10px] tracking-widest h-12 px-6 rounded-xl"
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Confirmar
                      </Button>
                      <Button 
                        variant="ghost" 
                        onClick={() => handleUpdateStatus(session.id, 'cancelado')}
                        className="text-[#F97316] hover:bg-[#F97316]/10 uppercase font-bold text-[10px] h-12 px-6 rounded-xl"
                      >
                        Recusar
                      </Button>
                    </>
                  ) : (
                    <div className={`px-6 py-3 rounded-xl border flex items-center gap-2 font-bold uppercase text-[10px] tracking-widest ${
                      session.status === 'confirmado' ? 'bg-green-50 border-green-200 text-green-600' : 'bg-gray-50 border-gray-100 text-gray-400'
                    }`}>
                      {session.status === 'confirmado' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                      {session.status}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
        </div>
      </main>

      {/* Approval Modal */}
      <ResponsiveDialog 
        isOpen={isApproveModalOpen} 
        setIsOpen={setIsApproveModalOpen}
        title="Confirmar Mentoria"
        className="sm:max-w-md"
      >
        <div className="space-y-6 py-4">
           <div className="p-4 bg-[#EBDCC6] rounded-2xl">
              <p className="text-[10px] font-bold uppercase text-[#001F33]/40 tracking-widest mb-1">Candidato</p>
              <p className="font-bold text-lg uppercase">{selectedSession?.candidateName}</p>
              <p className="text-xs text-[#001F33]/50">{new Date(selectedSession?.dateTime).toLocaleString()}</p>
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-[#001F33]/50 tracking-widest">Link da Videochamada</label>
              <Input 
                 placeholder="Ex: https://meet.google.com/xxx-xxxx-xxx" 
                 value={meetingLink}
                 onChange={(e) => setMeetingLink(e.target.value)}
                 className="h-12 border-[#8B4513]/50 rounded-xl focus:ring-2 focus:ring-[#0EA5E9]"
              />
              <p className="text-[10px] text-[#001F33]/50 font-medium">O aluno irá receber este link após a sua confirmação.</p>
           </div>
        </div>

        <DialogFooter className="mt-8">
           <Button 
              onClick={() => handleUpdateStatus(selectedSession.id, 'confirmado', meetingLink)}
              disabled={!meetingLink}
              className="w-full bg-[#0EA5E9] hover:bg-[#001F33] text-white uppercase font-bold text-xs tracking-widest h-14 shadow-lg shadow-[#0EA5E9]/30"
           >
              Confirmar e Enviar Link
           </Button>
        </DialogFooter>
      </ResponsiveDialog>

      {/* Candidate Profile Modal */}
      <ResponsiveDialog 
        isOpen={!!viewCandidate} 
        setIsOpen={(open) => !open && setViewCandidate(null)}
        title="Perfil do Jovem"
        className="sm:max-w-xl"
      >
        {viewCandidate && (
          <div className="space-y-6 py-4">
             <div className="flex items-center justify-between border-b border-[#8B4513]/50 pb-4">
                <div>
                   <h2 className="text-2xl font-display uppercase tracking-tight text-[#001F33]">{viewCandidate.candidateName}</h2>
                   <p className="font-bold text-[#001F33]/50 text-xs uppercase mt-1">
                      {viewCandidate.candidateEmail} • {viewCandidate.candidatePhone || 'Sem N.º'}
                   </p>
                </div>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="bg-[#EBDCC6] p-4 rounded-xl border border-[#8B4513]/50">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-[#001F33]/40">Formação Académica</p>
                 <p className="font-bold text-sm mt-1">{viewCandidate.formation || 'Não Especificado'}</p>
               </div>
               <div className="bg-[#EBDCC6] p-4 rounded-xl border border-[#8B4513]/50">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-[#001F33]/40">Área de Interesse</p>
                 <p className="font-bold text-sm mt-1 text-[#F97316]">{viewCandidate.areaOfInterest || 'Não Especificado'}</p>
               </div>
               <div className="bg-[#EBDCC6] p-4 rounded-xl border border-[#8B4513]/50">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-[#001F33]/40">Experiência</p>
                 <p className="font-bold text-sm mt-1 capitalize">{viewCandidate.experienceLevel || 'Não Especificado'}</p>
               </div>
               <div className="bg-[#EBDCC6] p-4 rounded-xl border border-[#8B4513]/50">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-[#001F33]/40">Localização</p>
                 <p className="font-bold text-sm mt-1">
                    {viewCandidate.municipality && viewCandidate.province ? `${viewCandidate.municipality}, ${viewCandidate.province}` : 'Sem Local'}
                 </p>
               </div>
             </div>
 
             <div className="bg-[#EBDCC6] p-4 rounded-xl border-2 border-[#8B4513]">
               <p className="text-[10px] font-bold uppercase tracking-widest text-[#001F33]/40 mb-2">Principais Dificuldades</p>
               <div className="flex flex-wrap gap-2">
                  {viewCandidate.difficulties ? (
                    viewCandidate.difficulties.split(',').map((dif: string) => (
                      <span key={dif} className="bg-white px-2 py-1 rounded-md text-[10px] font-bold border-2 border-[#8B4513] uppercase tracking-wider">{dif.trim()}</span>
                    ))
                  ) : (
                    <span className="text-xs font-medium text-[#001F33]/40">Nenhuma dificuldade reportada.</span>
                  )}
               </div>
             </div>
 
             <div className="flex flex-wrap gap-4 pt-2">
                {viewCandidate.cvUrl ? (
                  <Button asChild className="flex-1 min-w-[140px] bg-[#001F33] hover:bg-[#0EA5E9] text-white font-bold text-[10px] uppercase tracking-widest h-12 rounded-xl">
                    <a href={viewCandidate.cvUrl} target="_blank" rel="noreferrer">
                      <ExternalLink size={14} className="mr-2" /> Abrir CV (PDF)
                    </a>
                  </Button>
                ) : (
                  <div className="flex-1 min-w-[140px] p-3 bg-red-50 text-red-600 rounded-xl text-[10px] uppercase font-bold text-center border border-red-200 flex items-center justify-center">Sem CV</div>
                )}
                
                {viewCandidate.socialLink ? (
                  <Button asChild variant="outline" className="flex-1 min-w-[140px] bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white font-bold text-[10px] uppercase tracking-widest h-12 rounded-xl">
                    <a href={viewCandidate.socialLink} target="_blank" rel="noreferrer">
                      <ExternalLink size={14} className="mr-2" /> LinkedIn
                    </a>
                  </Button>
                ) : (
                   <div className="flex-1 min-w-[140px] p-3 bg-gray-100 text-gray-400 rounded-xl text-[10px] uppercase font-bold text-center border border-gray-200 flex items-center justify-center">Sem Mídia Social</div>
                )}
             </div>
          </div>
        )}
      </ResponsiveDialog>
    </div>
  );
}
