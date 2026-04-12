import { CandidateSidebar } from "@/components/layout/CandidateSidebar";
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Users, Calendar, Clock, MessageSquare, LayoutDashboard, LogOut, ExternalLink, ChevronRight, CheckCircle2, Clock3, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { AdminSidebar } from "@/components/layout/AdminSidebar";

export default function MentorshipPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [mentors, setMentors] = useState<any[]>([]);
  const [mySessions, setMySessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMentor, setSelectedMentor] = useState<any>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingNotes, setBookingNotes] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const storedStr = localStorage.getItem("user");
    if (!storedStr) {
      setLocation("/auth/login");
      return;
    }
    const parsedUser = JSON.parse(storedStr);
    setUser(parsedUser);
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const [mentorsRes, sessionsRes] = await Promise.all([
        fetch("/api/mentorship/mentors"),
        fetch("/api/mentorship/my-sessions", { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      if (mentorsRes.ok) setMentors(await mentorsRes.json());
      if (sessionsRes.ok) setMySessions(await sessionsRes.json());
    } catch (err) {
      console.error("Erro ao carregar dados", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!bookingDate) {
      toast({ title: "Campo Obrigatório", description: "Por favor, escolhe uma data e hora para a mentoria.", variant: "destructive" });
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const response = await fetch("/api/mentorship/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          mentorId: selectedMentor.id,
          dateTime: bookingDate,
          notes: bookingNotes
        })
      });

      if (response.ok) {
        toast({ title: "Pedido Enviado!", description: "O mentor irá analisar o teu pedido e responder em breve." });
        setIsBookingModalOpen(false);
        setBookingDate("");
        setBookingNotes("");
        fetchData();
      }
    } catch (err) {
      toast({ title: "Erro", description: "Falha ao realizar agendamento.", variant: "destructive" });
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setLocation("/");
  };

  if (!user) return <div className="min-h-screen bg-[#001F33]"></div>;

  return (
    <div className="min-h-screen bg-[#EBDCC6] flex font-sans text-[#001F33]">
      {/* Sidebar */}
      
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
          currentTab="mentors" 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen} 
        />
      ) : (
        <CandidateSidebar 
          currentTab="mentors" 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen} 
        />
      )}

      {/* Content */}
      <main className="flex-1 md:ml-72 p-6 sm:p-8">
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
              <h1 className="text-3xl sm:text-4xl font-display uppercase tracking-tight mb-2">Mentoria Profissional</h1>
              <p className="text-[#001F33]/50 font-medium max-w-2xl text-xs sm:text-sm">
                Conecta-te com profissionais experientes para acelerar a tua carreira. Escolhe um mentor, agenda uma conversa e recebe orientação personalizada.
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
          {/* Mentors Grid */}
          <div className="xl:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
               <h2 className="text-xl font-display uppercase text-[#0EA5E9] tracking-widest">Mentores Disponíveis</h2>
               <div className="h-px flex-1 mx-8 bg-[#001F33]/10" />
            </div>

            {loading ? (
              <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-4 border-[#0EA5E9] border-t-transparent rounded-full"></div></div>
            ) : mentors.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-3xl shadow-sm border-2 border-[#8B4513] font-bold uppercase tracking-widest text-xs text-[#001F33]/60">
                Nenhum mentor ativo de momento. Volta mais tarde!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mentors.map((mentor) => (
                  <motion.div 
                    key={mentor.id}
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-3xl p-6 shadow-sm border-2 border-[#8B4513] group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#0EA5E9]/5 rounded-bl-full -mr-16 -mt-16 transition-all group-hover:bg-[#0EA5E9]/10" />
                    <div className="flex items-start gap-4 relative z-10">
                      <div className="h-16 w-16 bg-[#001F33] rounded-2xl flex items-center justify-center text-white text-2xl font-display shadow-lg">
                         {mentor.imageUrl ? <img src={mentor.imageUrl} className="h-full w-full object-cover rounded-2xl" /> : mentor.name[0]}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-display uppercase text-[#001F33] leading-tight mb-1">{mentor.name}</h3>
                        <p className="text-[10px] font-bold text-[#0EA5E9] uppercase tracking-widest mb-3">{mentor.specialties}</p>
                      </div>
                    </div>
                    <p className="text-sm text-[#001F33]/60 mb-6 font-sans leading-relaxed line-clamp-3 min-h-[4.5rem]">
                      {mentor.bio}
                    </p>
                    <div className="flex gap-2">
                       <Button 
                         onClick={() => { setSelectedMentor(mentor); setIsBookingModalOpen(true); }}
                         className="flex-1 bg-[#001F33] hover:bg-[#0EA5E9] text-white uppercase font-bold text-[10px] tracking-widest h-11"
                       >
                         Agendar Conversa
                       </Button>
                       {mentor.linkedinUrl && (
                         <Button variant="outline" size="icon" className="h-11 w-11 border-[#001F33]/10 text-[#001F33]/40 hover:text-[#0EA5E9]" asChild>
                           <a href={mentor.linkedinUrl} target="_blank"><ExternalLink size={18} /></a>
                         </Button>
                       )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* User Sessions Sidebar */}
          <div className="space-y-8">
            <h2 className="text-xl font-display uppercase text-[#F97316] tracking-widest">Minhas Sessões</h2>
            
            <div className="space-y-4">
              {mySessions.length === 0 ? (
                <div className="bg-[#001F33]/5 rounded-3xl p-8 border border-dashed border-[#001F33]/20 text-center">
                  <p className="text-[10px] font-bold uppercase text-[#001F33]/70 tracking-widest">Tu ainda não tens agendamentos</p>
                </div>
              ) : (
                mySessions.map((session) => (
                  <motion.div 
                    key={session.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white p-5 rounded-3xl shadow-sm border-2 border-[#8B4513] relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start mb-3">
                       <p className="text-xs font-bold uppercase text-[#0EA5E9]">{session.mentorName}</p>
                       <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-tighter ${
                         session.status === 'confirmado' ? 'bg-green-100 text-green-600' : 
                         session.status === 'pendente' ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400'
                       }`}>
                         {session.status}
                       </span>
                    </div>
                    <div className="flex items-center gap-4 text-[#001F33]/50 text-xs font-medium">
                       <span className="flex items-center"><Calendar size={14} className="mr-1.5" /> {new Date(session.dateTime).toLocaleDateString()}</span>
                       <span className="flex items-center"><Clock size={14} className="mr-1.5" /> {new Date(session.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    
                    {session.status === 'confirmado' && (
                      <div className="mt-4 pt-4 border-t border-[#8B4513]">
                        <Button className="w-full bg-[#001F33] text-white text-[10px] font-bold uppercase h-9 shadow-lg shadow-[#001F33]/20" asChild>
                           <a href={session.meetingLink} target="_blank">Entrar na Chamada</a>
                        </Button>
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </div>

            {/* AI Coaching Tip */}
            <div className="bg-gradient-to-br from-[#0EA5E9] to-[#001F33] p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
               <div className="relative z-10">
                  <Clock3 className="mb-4 text-[#F97316]" size={32} />
                  <h3 className="text-[15px] font-bold uppercase tracking-wider mb-2">Prepara-te para Brilhar</h3>
                  <p className="text-white/60 text-xs font-sans leading-relaxed mb-6">
                    Antes de cada sessão, anota as tuas 3 dúvidas principais. Aproveita cada minuto com o teu mentor!
                  </p>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#F97316]">Dica da Carreira 360º</p>
               </div>
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl" />
            </div>
          </div>
        </div>
      </main>

      {/* Booking Modal */}
      <ResponsiveDialog 
        isOpen={isBookingModalOpen} 
        setIsOpen={setIsBookingModalOpen}
        title="Solicitar Mentoria"
        className="sm:max-w-md"
      >
        <div className="space-y-6 py-4">
           <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-[#001F33]/50 tracking-widest">Especialista Selecionado</label>
              <div className="p-3 bg-[#EBDCC6] rounded-xl flex items-center gap-3">
                 <div className="h-8 w-8 bg-[#0EA5E9] rounded-lg flex items-center justify-center text-white font-bold text-xs">
                    {selectedMentor?.name[0]}
                 </div>
                 <span className="font-bold uppercase text-xs">{selectedMentor?.name}</span>
              </div>
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-[#001F33]/50 tracking-widest">Escolhe o Dia e Hora</label>
              <input 
                type="datetime-local" 
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full h-12 bg-white border border-[#001F33]/10 rounded-xl px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-[#0EA5E9]"
              />
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-[#001F33]/50 tracking-widest">Objetivo da Mentoria</label>
              <Textarea 
                placeholder="Ex: Queria rever o meu CV..." 
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
                className="min-h-[100px] bg-white border border-[#001F33]/20 rounded-xl focus:ring-2 focus:ring-[#0EA5E9] text-[#001F33] font-medium"
              />
           </div>
        </div>

        <DialogFooter className="mt-8 flex flex-col gap-3">
           <Button 
              onClick={handleBooking}
              className="w-full bg-[#0EA5E9] hover:bg-[#001F33] text-white uppercase font-bold text-xs tracking-widest h-14 shadow-lg shadow-[#0EA5E9]/30"
           >
              Enviar Solicitação
           </Button>
           <Button 
             variant="ghost" 
             onClick={() => setIsBookingModalOpen(false)}
             className="w-full text-[10px] font-bold uppercase text-[#001F33]/40"
           >
             Cancelar
           </Button>
        </DialogFooter>
      </ResponsiveDialog>
    </div>
  );
}
