import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Rocket, 
  Target, 
  TrendingUp, 
  Lightbulb, 
  ChevronRight, 
  BrainCircuit, 
  Sparkles,
  Search,
  Users,
  Award,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CandidateSidebar } from "@/components/layout/CandidateSidebar";
import { Input } from "@/components/ui/input";

export default function AiPulsePage() {
  const [location, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedStr = localStorage.getItem("user");
    if (!storedStr) {
      setLocation("/auth/login");
      return;
    }
    setUser(JSON.parse(storedStr));
    
    // Simular carregamento da IA
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, [setLocation]);

  if (!user) return <div className="min-h-screen bg-[#001F33]"></div>;

  return (
    <div className="min-h-screen bg-[#EBDCC6] block font-sans text-[#001F33] relative overflow-x-hidden">
      <CandidateSidebar 
        currentTab="ai-pulse" 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen} 
       />

      <main className="md:ml-72 min-h-screen p-8 md:p-16">
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
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="text-[#0EA5E9]" size={20} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0EA5E9]">Análise em Tempo Real</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-display uppercase tracking-tight mb-2">Pulso de Carreira IA</h1>
              <p className="text-[#001F33]/60 font-medium max-w-2xl text-xs sm:text-sm leading-relaxed">
                A nossa Inteligência Artificial analisa o mercado angolano em tempo real para alinhar o teu perfil às oportunidades de maior impacto.
              </p>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
             <div className="relative">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="h-24 w-24 border-t-4 border-b-4 border-[#0EA5E9] rounded-full"
                />
                <BrainCircuit className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#0EA5E9] animate-pulse" size={32} />
             </div>
             <p className="mt-8 text-xs font-black uppercase tracking-widest text-[#001F33]/40">A sintonizar o teu futuro...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Main Insights */}
            <div className="xl:col-span-2 space-y-8">
               
               {/* Core Analysis Card */}
               <section className="bg-[#001F33] rounded-[32px] p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden group">
                  <div className="relative z-10">
                     <div className="flex items-center gap-4 mb-8">
                        <div className="h-16 w-16 bg-[#0EA5E9] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#0EA5E9]/20 group-hover:scale-110 transition-transform">
                           <Target size={32} />
                        </div>
                        <div>
                           <h2 className="text-2xl font-display uppercase tracking-tight">O teu Próximo Passo</h2>
                           <p className="text-[#0EA5E9] font-bold text-sm">Arquiteto de Soluções Cloud</p>
                        </div>
                     </div>

                     <div className="space-y-6">
                        <p className="text-white/60 font-medium leading-relaxed italic">
                          "Geraldo, com base no teu interesse em Engenharia e formação atual, o mercado de Cloud Computing em Angola está a crescer 40% ao ano. A tua probabilidade de contratação nesta área aumenta 3x se completares a certificação Fundamental."
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                           <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                              <p className="text-[10px] font-black uppercase tracking-widest text-[#0EA5E9] mb-3">Gap de Competências</p>
                              <div className="space-y-3">
                                 <div className="flex justify-between items-center text-xs font-bold uppercase">
                                    <span>Azure / AWS</span>
                                    <span className="text-[#F97316]">Pendente</span>
                                 </div>
                                 <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-white/20 w-1/4" />
                                 </div>
                              </div>
                           </div>
                           <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                              <p className="text-[10px] font-black uppercase tracking-widest text-[#0EA5E9] mb-3">Alinhamento de Perfil</p>
                              <div className="space-y-3">
                                 <div className="flex justify-between items-center text-xs font-bold uppercase">
                                    <span>Formação Base</span>
                                    <span className="text-[#22C55E]">85%</span>
                                 </div>
                                 <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#22C55E] w-[85%]" />
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
                  <div className="absolute top-0 right-0 w-96 h-96 bg-[#0EA5E9] rounded-full -mr-48 -mt-48 blur-[100px] opacity-10 group-hover:opacity-20 transition-opacity" />
               </section>

               {/* Market Trends */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-8 rounded-[32px] border-2 border-[#8B4513] shadow-sm">
                     <div className="flex items-center gap-3 mb-6">
                        <TrendingUp className="text-[#F97316]" size={24} />
                        <h3 className="text-lg font-display uppercase">Tendências em Angola</h3>
                     </div>
                     <ul className="space-y-4">
                        {[
                          { item: "Data Analytics em Banca", trend: "+25%" },
                          { item: "Cibersegurança em Fintechs", trend: "+18%" },
                          { item: "DevOps em Startups", trend: "+15%" }
                        ].map((t, idx) => (
                           <li key={idx} className="flex justify-between items-center py-3 border-b border-[#8B4513]/10 last:border-0">
                              <span className="text-sm font-bold text-[#001F33]/70">{t.item}</span>
                              <span className="text-xs font-black text-[#22C55E] tracking-widest">{t.trend}</span>
                           </li>
                        ))}
                     </ul>
                  </div>

                  <div className="bg-white p-8 rounded-[32px] border-2 border-[#8B4513] shadow-sm">
                     <div className="flex items-center gap-3 mb-6">
                        <Lightbulb className="text-[#F97316]" size={24} />
                        <h3 className="text-lg font-display uppercase">Recomendação IA</h3>
                     </div>
                     <div className="p-4 bg-[#EBDCC6] rounded-2xl mb-4">
                        <p className="text-xs font-bold text-[#001F33]/80 leading-relaxed">
                          "Foca em **Soft Skills de Negociação**. Candidatos técnicos com boa comunicação estão a receber ofertas 15% superiores."
                        </p>
                     </div>
                     <Button variant="outline" className="w-full border-2 border-[#8B4513]/20 font-black uppercase text-[10px] tracking-widest h-12">
                        Explorar trilha de Soft Skills
                     </Button>
                  </div>
               </div>
            </div>

            {/* AI Assistant Column */}
            <div className="space-y-8">
               <div className="bg-gradient-to-br from-[#0EA5E9] to-[#001F33] rounded-[32px] p-8 text-white shadow-xl">
                  <h3 className="text-xl font-display uppercase mb-6 flex items-center gap-2">
                     <BrainCircuit size={24} /> Mentoria IA
                  </h3>
                  <div className="space-y-4 mb-8">
                     <div className="bg-white/10 p-4 rounded-xl text-xs font-medium">
                        Olá {user.name.split(' ')[0]}! Queres que eu analise o teu currículo atual para a vaga de 'Engenheiro Cloud' da Unitel?
                     </div>
                     <div className="bg-white/5 p-4 rounded-xl text-[10px] font-bold uppercase tracking-widest opacity-50">
                        A aguardar a tua pergunta...
                     </div>
                  </div>
                  <div className="flex gap-2">
                     <Input 
                        placeholder="Pergunta à IA..." 
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-11 text-xs font-bold"
                     />
                     <Button className="bg-[#F97316] hover:bg-white hover:text-[#001F33] h-11 px-4">
                        <ChevronRight size={20} />
                     </Button>
                  </div>
               </div>

               {/* Quick Stats */}
               <div className="bg-[#EBDCC6] rounded-[32px] p-8 border-2 border-[#8B4513]/30">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#001F33]/40 mb-6">Pontuação IA</h3>
                  <div className="space-y-6">
                     <div>
                        <div className="flex justify-between text-[10px] font-black uppercase mb-2">
                           <span>Prontidão de Mercado</span>
                           <span className="text-[#0EA5E9]">68%</span>
                        </div>
                        <div className="w-full h-2 bg-[#001F33]/5 rounded-full overflow-hidden">
                           <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: "68%" }}
                              className="h-full bg-[#0EA5E9]" 
                           />
                        </div>
                     </div>
                     <p className="text-[10px] font-bold text-[#001F33]/60 leading-relaxed uppercase">
                        Ganha XP completando simulações de entrevista para aumentar esta pontuação.
                     </p>
                  </div>
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
