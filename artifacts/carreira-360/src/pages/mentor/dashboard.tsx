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
  ClipboardList
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function MentorDashboard() {
  const [location, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<any>(null);
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
    <div className="min-h-screen bg-[#F5F0E8] flex font-sans text-[#001F33]">
      {/* Sidebar Mentor */}
      <aside className="w-72 bg-[#001F33] text-white flex flex-col h-screen fixed top-0 left-0 border-r border-[#F97316]/20">
        <div className="p-8 border-b border-white/10 flex flex-col items-center">
          <img src="/assets/logo.png" className="h-14 w-auto object-contain mb-4" alt="Logo" />
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
      <main className="flex-1 ml-72 p-10">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-display uppercase tracking-tight mb-2">Pedidos de Mentoria</h1>
            <p className="text-[#001F33]/50 font-medium">Analisa e gere as solicitações dos jovens que procuram a tua orientação.</p>
          </div>
          <div className="flex gap-4">
             <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#001F33]/5 flex items-center gap-3">
                <div className="h-10 w-10 bg-[#0EA5E9]/10 rounded-xl flex items-center justify-center text-[#0EA5E9]">
                   <Users size={20} />
                </div>
                <div>
                   <p className="text-[10px] font-bold uppercase text-[#001F33]/40 tracking-widest leading-none">Total Sessões</p>
                   <p className="text-xl font-bold">{sessions.length}</p>
                </div>
             </div>
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-4 border-[#F97316] border-t-transparent rounded-full"></div></div>
        ) : sessions.length === 0 ? (
          <div className="bg-white p-20 text-center rounded-[2.5rem] shadow-sm border border-[#001F33]/5">
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
                className="bg-white p-6 rounded-[2rem] shadow-sm border border-[#001F33]/5 hover:shadow-md transition-shadow flex items-center justify-between gap-8"
              >
                <div className="flex items-center gap-6">
                  <div className="h-14 w-14 bg-[#F5F0E8] rounded-2xl flex items-center justify-center text-[#001F33] font-display text-xl">
                     {session.candidateName[0]}
                  </div>
                  <div>
                    <h3 className="text-lg font-display uppercase text-[#001F33] mb-1">{session.candidateName}</h3>
                    <div className="flex items-center gap-4 text-xs font-semibold text-[#001F33]/40">
                       <span className="flex items-center"><Calendar size={14} className="mr-1.5" /> {new Date(session.dateTime).toLocaleDateString()}</span>
                       <span className="flex items-center"><Clock size={14} className="mr-1.5" /> {new Date(session.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 max-w-md bg-[#F5F0E8]/50 p-4 rounded-2xl">
                   <p className="text-[10px] font-bold uppercase text-[#001F33]/30 tracking-widest mb-1">Notas do Aluno:</p>
                   <p className="text-sm text-[#001F33]/70 italic line-clamp-2">"{session.notes || 'Sem observações...'}"</p>
                </div>

                <div className="flex items-center gap-3">
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
      </main>

      {/* Approval Modal */}
      <Dialog open={isApproveModalOpen} onOpenChange={setIsApproveModalOpen}>
        <DialogContent className="max-w-md bg-white rounded-3xl border-none shadow-2xl p-8 font-sans">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display uppercase text-[#0EA5E9] mb-4">Confirmar Mentoria</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
             <div className="p-4 bg-[#F5F0E8] rounded-2xl">
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
                   className="h-12 border-[#001F33]/10 rounded-xl focus:ring-2 focus:ring-[#0EA5E9]"
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
        </DialogContent>
      </Dialog>
    </div>
  );
}
