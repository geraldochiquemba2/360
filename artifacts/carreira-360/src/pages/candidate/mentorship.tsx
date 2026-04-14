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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [mentorAvailability, setMentorAvailability] = useState<any[]>([]);
  const [filterSession, setFilterSession] = useState("todos");
  const [sortSession, setSortSession] = useState("recentes");
  const [searchMentor, setSearchMentor] = useState("");
  const { toast } = useToast();
  const diasSemana = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

  const handleReschedule = (mentorId: number) => {
    const mentor = mentors.find(m => m.id === mentorId);
    if (mentor) {
      setSelectedMentor(mentor);
      setIsBookingModalOpen(true);
    } else {
      toast({ title: "Indisponível", description: "O mentor selecionado já não se encontra ativo na plataforma.", variant: "destructive" });
    }
  };

  const handleCancelSession = async (sessionId: number) => {
    if (!window.confirm("Tens a certeza que queres cancelar esta sessão?")) return;
    
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/mentorship/sessions/${sessionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: "cancelado" })
      });

      if (response.ok) {
        toast({ title: "Sessão Cancelada", description: "O teu agendamento foi cancelado com sucesso." });
        fetchData();
      }
    } catch (err) {
      toast({ title: "Erro", description: "Não foi possível cancelar o agendamento.", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (selectedMentor) {
      const token = localStorage.getItem("token");
      fetch(`/api/mentorship/mentors/${selectedMentor.id}/availability`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => setMentorAvailability(Array.isArray(data) ? data : []))
      .catch(console.error);
    } else {
      setMentorAvailability([]);
    }
  }, [selectedMentor]);

  const generateAvailableOptions = () => {
    if (!mentorAvailability || mentorAvailability.length === 0) return [];
    
    // Obter datas (YYYY-MM-DD) onde o candidato já tem marcações ativas/pendentes
    const myBookedDates = mySessions
      .filter((s: any) => s.status !== 'cancelado')
      .map((s: any) => {
         const d = new Date(s.dateTime);
         return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      });

    const options = [];
    const today = new Date();
    
    // Generate dates for the next 365 days (1 ano)
    for (let i = 1; i <= 365; i++) {
       const date = new Date(today);
       date.setDate(today.getDate() + i);
       const objDay = date.getDay();
       
       const slots = mentorAvailability.filter(s => s.dayOfWeek === objDay);
       for (const slot of slots) {
         const year = date.getFullYear();
         const month = String(date.getMonth() + 1).padStart(2, '0');
         const day = String(date.getDate()).padStart(2, '0');
         const dateString = `${year}-${month}-${day}`;
         
         // Bloquear: se o utilizador já tem sessão neste exato dia, a opção fica indisponível (nem aparece)
         if (myBookedDates.includes(dateString)) continue;

         const timeString = slot.startTime.length === 5 ? slot.startTime : slot.startTime.substring(0, 5);
         
         options.push({
           value: `${dateString}T${timeString}`,
           label: `${diasSemana[objDay]}, ${day}/${month}/${year} (${slot.startTime} às ${slot.endTime})`
         });
       }
    }
    return options;
  };

  const availableDateOptions = generateAvailableOptions();

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
      <main className="flex-1 md:ml-72 p-4 sm:p-10">
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
                <h1 className="text-2xl sm:text-4xl font-display uppercase tracking-tight mb-1 sm:mb-2">Mentoria Profissional</h1>
                <p className="text-[#001F33]/60 font-medium max-w-2xl text-[10px] sm:text-sm leading-tight">
                  Conecta-te com profissionais experientes para acelerar a tua carreira. Escolhe um mentor e agenda uma conversa personalizada.
                </p>
              </div>
            </div>
          </header>
  
          <div className="flex flex-col gap-6 sm:gap-10">
            {/* User Sessions Sidebar (Moved to top) */}
            <div className="space-y-6 sm:space-y-8">
              <div className="flex items-center gap-4 mb-4">
                <h2 className="text-sm sm:text-xl font-display uppercase text-[#F97316] tracking-widest whitespace-nowrap">As Minhas Sessões</h2>
                <div className="h-px w-full bg-[#001F33]/10" />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <select
                  value={filterSession}
                  onChange={e => setFilterSession(e.target.value)}
                  className="h-9 px-3 bg-white border border-[#001F33]/10 rounded-xl text-[10px] font-black uppercase text-[#001F33] outline-none"
                >
                  <option value="todos">Todos</option>
                  <option value="pendente">Pendentes</option>
                  <option value="confirmado">Confirmados</option>
                  <option value="cancelado">Não Selecionados</option>
                </select>
                <select
                  value={sortSession}
                  onChange={e => setSortSession(e.target.value)}
                  className="h-9 px-3 bg-white border border-[#001F33]/10 rounded-xl text-[10px] font-black uppercase text-[#001F33] outline-none"
                >
                  <option value="recentes">Mais Recentes</option>
                  <option value="antigos">Mais Antigos</option>
                </select>
              </div>
              
              {(() => {
                const filtered = mySessions
                  .filter(s => filterSession === 'todos' || s.status === filterSession)
                  .sort((a, b) => {
                    const dA = new Date(a.dateTime).getTime();
                    const dB = new Date(b.dateTime).getTime();
                    return sortSession === 'recentes' ? dB - dA : dA - dB;
                  });
                
                if (mySessions.length === 0 || filtered.length === 0) {
                  return (
                    <div className="bg-[#001F33]/5 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-dashed border-[#001F33]/20 text-center">
                      <p className="text-[8px] sm:text-[10px] font-black uppercase text-[#001F33]/40 tracking-widest">{mySessions.length === 0 ? 'Nenhuns agendamentos' : 'Sem resultados para este filtro'}</p>
                    </div>
                  );
                }
                
                return (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                {filtered.map((session) => {
                    const isPast = new Date(session.dateTime) < new Date();
                    
                    let displayStatus = session.status;
                    let statusColor = 'bg-gray-100 text-gray-400';
                    
                    if (session.status === 'confirmado') {
                       displayStatus = "Confirmado";
                       statusColor = 'bg-green-100 text-green-600';
                    } else if (session.status === 'cancelado') {
                       displayStatus = "Não Selecionado";
                       statusColor = 'bg-red-100 text-red-600 text-[6px] sm:text-[7px]';
                    } else if (session.status === 'pendente') {
                       if (isPast) {
                         displayStatus = "Mentor Indisponível";
                         statusColor = 'bg-gray-100 text-gray-500 text-[6px] sm:text-[7px]';
                       } else {
                         displayStatus = "Pendente";
                         statusColor = 'bg-amber-100 text-amber-600';
                       }
                    }

                    return (
                    <motion.div 
                      key={session.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white p-3 sm:p-5 rounded-xl sm:rounded-3xl shadow-sm border border-[#001F33]/5 relative overflow-hidden flex flex-col h-full"
                    >
                      <div className="flex justify-between items-start mb-2 sm:mb-3">
                         <p className="text-[10px] sm:text-xs font-black uppercase text-[#0EA5E9] truncate pr-2">{session.mentorName}</p>
                         <span className={`px-2 py-0.5 rounded text-[7px] sm:text-[8px] font-black uppercase tracking-tight shrink-0 ${statusColor}`}>
                           {displayStatus}
                         </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 text-[#001F33] text-[9px] sm:text-xs font-black uppercase mb-4">
                         <span className="flex items-center"><Calendar size={12} className="mr-1 sm:mr-1.5 text-[#0EA5E9]" /> {new Date(session.dateTime).toLocaleDateString()}</span>
                         <span className="flex items-center"><Clock size={12} className="mr-1 sm:mr-1.5 text-[#0EA5E9]" /> {new Date(session.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      
                      <div className="mt-auto pt-3 border-t border-[#001F33]/5 flex gap-2">
                        {session.status === 'confirmado' && (
                          <Button className="flex-1 bg-[#001F33] hover:bg-[#0EA5E9] text-white text-[8px] sm:text-[10px] font-black uppercase h-8 sm:h-9 rounded-lg sm:rounded-xl shadow-lg transition-all" asChild>
                             <a href={session.meetingLink || "#"} target="_blank">Entrar</a>
                          </Button>
                        )}
                        {(session.status === 'pendente' && !isPast) && (
                          <Button 
                            variant="outline" 
                            onClick={() => handleCancelSession(session.id)}
                            className="w-full h-8 sm:h-9 rounded-lg sm:rounded-xl text-[8px] sm:text-[10px] font-black uppercase border-[#ef4444]/20 text-[#ef4444] hover:bg-[#ef4444]/10"
                          >
                            Cancelar
                          </Button>
                        )}
                        {(session.status === 'confirmado' && !isPast) && (
                          <Button 
                            variant="outline" 
                            onClick={() => handleCancelSession(session.id)}
                            className="w-auto px-4 h-8 sm:h-9 rounded-lg sm:rounded-xl text-[8px] sm:text-[10px] font-black uppercase border-[#ef4444]/20 text-[#ef4444] hover:bg-[#ef4444]/10"
                          >
                            Cancelar
                          </Button>
                        )}
                        {(session.status === 'cancelado' || (session.status === 'pendente' && isPast)) && (
                          <Button 
                            onClick={() => handleReschedule(session.mentorId)}
                            className="w-full bg-[#001F33] hover:bg-[#0EA5E9] text-white text-[8px] sm:text-[10px] font-black uppercase h-8 sm:h-9 rounded-lg sm:rounded-xl shadow-lg transition-all"
                          >
                            Remarcar
                          </Button>
                        )}
                      </div>
                     </motion.div>
                   )})}
                </div>
                );
              })()}
            </div>

            {/* Mentors Grid */}
            <div className="space-y-6 sm:space-y-8">
              <div className="flex items-center justify-between mb-4">
                 <h2 className="text-sm sm:text-xl font-display uppercase text-[#0EA5E9] tracking-widest whitespace-nowrap">Mentores Disponíveis</h2>
                 <div className="h-px w-full ml-4 sm:ml-8 bg-[#001F33]/10" />
              </div>

              <div className="relative mb-4">
                <input
                  type="text"
                  value={searchMentor}
                  onChange={e => setSearchMentor(e.target.value)}
                  placeholder="Pesquisar por nome ou especialidade..."
                  className="w-full h-11 pl-10 pr-4 bg-white border border-[#001F33]/10 rounded-xl text-sm font-medium text-[#001F33] placeholder:text-[#001F33]/30 outline-none focus:ring-2 focus:ring-[#0EA5E9] transition-all"
                />
                <svg className="absolute left-3 top-3 h-5 w-5 text-[#001F33]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </div>

              {loading ? (
                <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-4 border-[#0EA5E9] border-t-transparent rounded-full"></div></div>
              ) : (() => {
                const filteredMentors = mentors.filter(m =>
                  m.name?.toLowerCase().includes(searchMentor.toLowerCase()) ||
                  m.specialties?.toLowerCase().includes(searchMentor.toLowerCase())
                );
                if (filteredMentors.length === 0) {
                  return (
                    <div className="bg-white p-8 sm:p-12 text-center rounded-2xl sm:rounded-3xl shadow-sm border border-[#001F33]/5 font-black uppercase tracking-widest text-[9px] sm:text-xs text-[#001F33]/40">
                      {mentors.length === 0 ? 'Nenhum mentor ativo de momento. Volta mais tarde!' : 'Nenhum mentor corresponde à tua pesquisa.'}
                    </div>
                  );
                }
                return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                  {filteredMentors.map((mentor) => (
                    <motion.div 
                      key={mentor.id}
                      whileHover={{ y: -5 }}
                      className="bg-white rounded-2xl sm:rounded-[32px] p-4 sm:p-6 shadow-sm border border-[#001F33]/5 hover:border-[#0EA5E9]/30 hover:shadow-xl transition-all duration-300 group relative overflow-hidden flex flex-col h-full"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-[#0EA5E9]/5 rounded-bl-full -mr-12 -mt-12 sm:-mr-16 sm:-mt-16 transition-all group-hover:bg-[#0EA5E9]/10" />
                      <div className="flex items-start gap-3 sm:gap-4 relative z-10 mb-4 flex-1">
                        <div className="h-10 w-10 sm:h-16 sm:w-16 bg-[#001F33] rounded-lg sm:rounded-2xl flex items-center justify-center text-white text-xs sm:text-2xl font-display shadow-lg shrink-0">
                           {mentor.imageUrl ? <img src={mentor.imageUrl} className="h-full w-full object-cover rounded-lg sm:rounded-2xl" /> : mentor.name[0]}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-xs sm:text-lg font-display uppercase text-[#001F33] leading-tight mb-1 truncate">{mentor.name}</h3>
                          <p className="text-[7px] sm:text-[10px] font-black text-[#0EA5E9] uppercase tracking-[0.1em] sm:tracking-widest whitespace-nowrap overflow-hidden text-ellipsis">{mentor.specialties}</p>
                        </div>
                      </div>
                      
                      <p className="text-[10px] sm:text-sm text-[#001F33] mb-4 sm:mb-6 font-medium leading-tight sm:leading-relaxed line-clamp-3 min-h-[2.5rem] sm:min-h-[4.5rem]">
                        {mentor.bio}
                      </p>
                      
                      <div className="flex gap-2 relative z-10 mt-auto">
                         <Button 
                           onClick={() => { setSelectedMentor(mentor); setIsBookingModalOpen(true); }}
                           className="flex-1 bg-[#001F33] hover:bg-[#0EA5E9] text-white uppercase font-bold text-[8px] sm:text-[10px] tracking-widest h-9 sm:h-11 rounded-lg sm:rounded-xl shadow-lg shadow-[#001F33]/5"
                         >
                           Agendar
                         </Button>
                         {mentor.linkedinUrl && (
                           <Button variant="outline" className="h-9 sm:h-11 px-3 sm:px-4 rounded-lg sm:rounded-xl border-[#0EA5E9]/30 text-[#0EA5E9] bg-[#0EA5E9]/5 hover:bg-[#0EA5E9]/10 gap-2 shrink-0" asChild>
                             <a href={mentor.linkedinUrl} target="_blank">
                               <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest">LinkedIn</span>
                               <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                             </a>
                           </Button>
                         )}
                      </div>
                    </motion.div>
                  ))}
                </div>
                );
              })()}
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
              <label className="text-[10px] font-bold uppercase text-[#001F33]/80 tracking-widest">Especialista Selecionado</label>
              <div className="p-3 bg-[#001F33]/5 border border-[#001F33]/10 rounded-xl flex items-center gap-3">
                 <div className="h-10 w-10 bg-[#001F33] shadow-md rounded-lg flex items-center justify-center text-white font-bold text-base shrink-0">
                    {selectedMentor?.imageUrl ? <img src={selectedMentor.imageUrl} className="h-full w-full object-cover rounded-lg" /> : selectedMentor?.name[0]}
                 </div>
                 <div className="flex flex-col min-w-0">
                   <span className="font-black uppercase text-[#001F33] text-xs truncate">{selectedMentor?.name}</span>
                   <span className="text-[8px] font-black uppercase text-[#0EA5E9] tracking-widest truncate mt-0.5">{selectedMentor?.specialties}</span>
                 </div>
              </div>
           </div>

           {mentorAvailability.length > 0 && (
             <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-[#001F33]/80 tracking-widest flex items-center gap-2">
                   <Clock size={12} className="text-[#F97316]" />
                   Horários Disponíveis (Referência)
                </label>
                <div className="flex flex-wrap gap-2">
                   {mentorAvailability.map((slot: any, i: number) => (
                     <div key={i} className="text-[10px] sm:text-xs bg-white border border-[#0EA5E9]/20 px-3 py-1.5 rounded-lg text-[#001F33] font-medium shadow-sm">
                        <span className="font-black text-[#0EA5E9] mr-1">{diasSemana[slot.dayOfWeek]}:</span> 
                        {slot.startTime} - {slot.endTime}
                     </div>
                   ))}
                </div>
                <p className="text-[9px] text-[#001F33]/70 font-medium italic">Por favor, agenda a tua sessão para algum destes horários.</p>
             </div>
           )}

           <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-[#001F33]/80 tracking-widest">Escolhe o Dia e Hora</label>
              {mentorAvailability.length > 0 ? (
                <Select value={bookingDate} onValueChange={setBookingDate}>
                  <SelectTrigger className="w-full h-12 bg-white border border-[#001F33]/10 rounded-xl px-4 text-[10px] sm:text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-[#0EA5E9] text-[#001F33]">
                    <SelectValue placeholder="Seleciona uma data disponível..." />
                  </SelectTrigger>
                  <SelectContent position="popper" className="max-h-[300px]">
                    {availableDateOptions.map((opt, i) => (
                      <SelectItem key={i} value={opt.value} className="text-[10px] sm:text-xs">
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <input 
                  type="datetime-local" 
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full h-12 bg-white border border-[#001F33]/10 rounded-xl px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                />
              )}
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-[#001F33]/80 tracking-widest">Objetivo da Mentoria</label>
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
             className="w-full text-[10px] font-bold uppercase text-[#001F33]/70 hover:bg-[#001F33]/5"
           >
             Cancelar
           </Button>
        </DialogFooter>
      </ResponsiveDialog>
    </div>
  );
}
