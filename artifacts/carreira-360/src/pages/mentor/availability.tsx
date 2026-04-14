import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  Menu 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { useToast } from "@/hooks/use-toast";
import { MentorSidebar } from "@/components/layout/MentorSidebar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const DAYS = [
  "Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", 
  "Quinta-feira", "Sexta-feira", "Sábado"
];

export default function MentorAvailability() {
  const [location, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Form state
  const [dayOfWeek, setDayOfWeek] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [triedSubmit, setTriedSubmit] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    const storedStr = localStorage.getItem("user");
    if (!storedStr) {
      setLocation("/auth/login");
      return;
    }
    const parsedUser = JSON.parse(storedStr);
    setUser(parsedUser);
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("/api/mentorship/my-availability", {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSlots(data);
      }
    } catch (err) {
      console.error("Erro ao buscar disponibilidade", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async () => {
    setTriedSubmit(true);
    if (!dayOfWeek || !startTime || !endTime) {
      toast({ 
        title: "Campos Incompletos", 
        description: "Por favor, define o dia, a hora de início e a hora de fim.", 
        variant: "destructive" 
      });
      return;
    }

    // Validação básica de ordem temporal
    if (startTime >= endTime) {
      toast({ 
        title: "Horário Inválido", 
        description: "A hora de fim deve ser posterior à hora de início.", 
        variant: "destructive" 
      });
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const response = await fetch("/api/mentorship/availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
           dayOfWeek: parseInt(dayOfWeek), 
           startTime, 
           endTime 
        })
      });

      if (response.ok) {
        toast({ title: "Sucesso", description: "Horário adicionado à sua agenda." });
        setIsAddModalOpen(false);
        fetchAvailability();
      } else {
        const errorData = await response.json();
        let errorMessage = errorData.error || "Verifica se os dados estão corretos ou se já tens esse horário definido.";
        
        // Mapeamento de erro técnico para amigável (fallback para servidor antigo)
        if (errorData.error === "Not a mentor") {
          errorMessage = "Ainda não terminaste o teu perfil de mentor. Por favor, vai a 'Meu Perfil' e guarda as tuas informações profissionais primeiro.";
        }

        toast({ 
          title: "Não foi possível adicionar", 
          description: errorMessage, 
          variant: "destructive" 
        });
      }
    } catch (err) {
      console.error("Add slot error:", err);
      toast({ title: "Erro de Ligação", description: "Falha ao comunicar com o servidor.", variant: "destructive" });
    }
  };

  const handleDeleteSlot = async (id: number) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/mentorship/availability/${id}`, {
        method: "DELETE",
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast({ title: "Removido", description: "Horário removido com sucesso." });
        fetchAvailability();
      }
    } catch (err) {
      toast({ title: "Erro", description: "Falha ao remover horário.", variant: "destructive" });
    }
  };

  if (!user) return <div className="min-h-screen bg-[#001F33]"></div>;

  return (
    <div className="min-h-screen bg-[#EBDCC6] flex font-sans text-[#001F33] relative overflow-x-hidden">
      <MentorSidebar 
        currentTab="availability"
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        user={user}
      />

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

      <main className="flex-1 md:ml-72 min-h-screen p-4 sm:p-10 overflow-hidden">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10">
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
              <h1 className="text-2xl md:text-4xl font-display uppercase tracking-tight text-[#001F33]">Minha Agenda</h1>
              <p className="text-[#001F33]/70 font-medium text-xs md:text-sm">Define os horários em que estás disponível para mentorias.</p>
            </div>
          </div>
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="w-full sm:w-auto bg-[#0EA5E9] hover:bg-[#001F33] text-white uppercase font-bold text-[10px] tracking-widest h-12 px-6 rounded-xl shadow-lg shadow-[#0EA5E9]/20"
          >
            <Plus className="mr-2 h-4 w-4" /> Novo Horário
          </Button>
        </header>

        <div>
          {loading ? (
             <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-4 border-[#F97316] border-t-transparent rounded-full"></div></div>
          ) : slots.length === 0 ? (
            <div className="bg-white p-20 text-center rounded-[2.5rem] shadow-sm border-2 border-[#8B4513]">
              <Calendar size={64} className="mx-auto text-[#001F33]/30 mb-6" />
              <h3 className="text-xl font-display uppercase text-[#001F33]/90 font-bold">Agenda Vazia</h3>
              <p className="text-sm text-[#001F33]/80 mt-2 font-semibold">Adiciona os teus horários para que os jovens possam agendar contigo.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {slots.sort((a,b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime)).map((slot) => (
                <motion.div 
                  key={slot.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white p-5 sm:p-6 rounded-[24px] sm:rounded-[2rem] shadow-sm border-2 sm:border-4 border-[#8B4513] flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-[#F97316]/10 rounded-2xl flex items-center justify-center text-[#F97316]">
                      <Clock size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase text-[#001F33]/70 tracking-widest leading-none mb-1">{DAYS[slot.dayOfWeek]}</p>
                      <p className="text-lg font-bold">{slot.startTime} — {slot.endTime}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDeleteSlot(slot.id)}
                    className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={18} />
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      <ResponsiveDialog 
        isOpen={isAddModalOpen} 
        setIsOpen={(open) => {
          setIsAddModalOpen(open);
          if (!open) {
            setTriedSubmit(false);
            setDayOfWeek("");
            setStartTime("");
            setEndTime("");
          }
        }}
        title="Novo Horário"
        className="sm:max-w-md"
      >
        <div className="space-y-6 py-4">
           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-[#001F33]/70 tracking-widest ml-1">Dia da Semana</label>
              <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                <SelectTrigger className={`h-12 border-[#8B4513]/50 rounded-xl bg-white/50 text-[#001F33] font-bold ${triedSubmit && !dayOfWeek ? 'border-red-500 ring-2 ring-red-500/20' : ''}`}>
                  <SelectValue placeholder="Selecione o dia" />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map((day, idx) => (
                    <SelectItem key={idx} value={idx.toString()}>{day}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-[#001F33]/70 tracking-widest ml-1">Início</label>
                <Input 
                  type="time" 
                  value={startTime} 
                  onChange={(e) => setStartTime(e.target.value)}
                  className={`h-12 border-[#8B4513]/50 rounded-xl bg-white/50 text-[#001F33] font-bold ${triedSubmit && !startTime ? 'border-red-500 ring-2 ring-red-500/20' : ''}`}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-[#001F33]/70 tracking-widest ml-1">Fim</label>
                <Input 
                  type="time" 
                  value={endTime} 
                  onChange={(e) => setEndTime(e.target.value)}
                  className={`h-12 border-[#8B4513]/50 rounded-xl bg-white/50 text-[#001F33] font-bold ${triedSubmit && !endTime ? 'border-red-500 ring-2 ring-red-500/20' : ''}`}
                />
              </div>
           </div>
        </div>

        <div className="mt-8">
           <Button 
              onClick={handleAddSlot}
              className="w-full bg-[#0EA5E9] hover:bg-[#001F33] text-white uppercase font-bold text-xs tracking-widest h-14 shadow-lg shadow-[#0EA5E9]/30 rounded-xl"
           >
              Adicionar à Agenda
           </Button>
        </div>
      </ResponsiveDialog>
    </div>
  );
}
