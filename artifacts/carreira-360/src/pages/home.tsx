import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Menu, X } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  city: z.string().min(1, "Selecione uma cidade"),
  profile: z.string().min(1, "Selecione um perfil"),
  message: z.string().optional(),
});

export default function Home() {
  const { toast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      city: "",
      profile: "",
      message: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "INSCRIÇÃO RECEBIDA",
        description: "A tua candidatura foi registada. Em breve entraremos em contacto.",
      });
      form.reset();
    }, 1000);
  }

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-[100dvh] bg-[#001F33] font-sans text-white overflow-x-hidden selection:bg-[#0EA5E9] selection:text-[#001F33]">
      {/* NAVBAR */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isMenuOpen ? 'bg-[#001F33] backdrop-blur-xl' : 'bg-[#001F33]/80 backdrop-blur-md border-b border-white/10'}`}>
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-display text-3xl cursor-pointer hover:text-[#0EA5E9] transition-colors" onClick={() => window.scrollTo(0,0)}>
            CARREIRA 360°
          </div>
          
          <div className="hidden md:flex items-center gap-12 font-sans font-bold text-sm tracking-widest uppercase">
            <button onClick={() => scrollTo("estatisticas")} className="hover:text-[#0EA5E9] transition-colors">O Problema</button>
            <button onClick={() => scrollTo("pilares")} className="hover:text-[#0EA5E9] transition-colors">Pilares</button>
            <button onClick={() => scrollTo("jornada")} className="hover:text-[#0EA5E9] transition-colors">Jornada</button>
            <button onClick={() => scrollTo("inscricao")} className="hover:text-[#0EA5E9] transition-colors">Inscrever</button>
            <a href="/auth/login" className="bg-[#0EA5E9] text-[#001F33] px-6 py-2 rounded-none font-bold hover:bg-[#F97316] transition-colors">Entrar</a>
          </div>

          <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden fixed inset-0 top-16 bg-black/95 backdrop-blur-xl p-6 flex flex-col gap-4 shadow-2xl z-[60] border-t border-white/10 overflow-y-auto">
            <motion.button 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => scrollTo("estatisticas")} 
              className="text-left text-2xl font-display uppercase hover:text-[#0EA5E9] transition-colors"
            >
              O Problema
            </motion.button>
            <motion.button 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => scrollTo("pilares")} 
              className="text-left text-2xl font-display uppercase hover:text-[#0EA5E9] transition-colors"
            >
              Os Pilares
            </motion.button>
            <motion.button 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => scrollTo("jornada")} 
              className="text-left text-2xl font-display uppercase hover:text-[#0EA5E9] transition-colors"
            >
              Jornada
            </motion.button>
            <motion.button 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              onClick={() => scrollTo("publico")} 
              className="text-left text-2xl font-display uppercase hover:text-[#0EA5E9] transition-colors"
            >
              Para Quem
            </motion.button>
            <motion.button 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              onClick={() => scrollTo("inscricao")} 
              className="text-left text-2xl font-display text-[#0EA5E9] uppercase border-t border-white/10 pt-4"
            >
              Inscrever-me
            </motion.button>
          </div>
        )}
      </nav>

      {/* 1. HERO */}
      <section className="relative min-h-[100dvh] flex items-end pb-12 pt-32 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
            <img 
               src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=80" 
               alt="Arquitetura Corporativa" 
               className="w-full h-full object-cover opacity-60 mix-blend-luminosity scale-105"
             />
            <div className="absolute inset-0 bg-gradient-to-t from-[#001F33] via-[#001F33]/40 to-transparent"></div>
        </div>

            <div className="max-w-[1400px] w-full mx-auto relative z-10">
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex flex-col items-start"
              >
            
            <h1 className="text-[10vw] md:text-[5rem] lg:text-[7rem] font-display leading-[0.8] tracking-tight uppercase max-w-[1200px] text-white mix-blend-difference">
              O PARCEIRO <br />
              <span className="text-[#0EA5E9] mix-blend-normal block -mt-2 md:-mt-4">DE CARREIRA</span>
            </h1>
            <p className="font-display text-[5vw] md:text-[2.5rem] text-white/50 uppercase leading-none mt-2">
              QUE NUNCA TIVESTE.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. TICKER */}
      <div className="bg-[#0EA5E9] py-2 md:py-3 overflow-hidden flex whitespace-nowrap border-y-4 border-[#F97316] rotate-[-1deg] scale-105 transform origin-center z-20 relative">
        <motion.div 
          className="flex whitespace-nowrap text-[#001F33] font-display text-2xl md:text-4xl uppercase tracking-widest"
          animate={{ x: [0, -2000] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        >
          {Array(10).fill("• PROGRAMA DE 12 MESES • ANGOLA • EMPREGABILIDADE • ").map((text, i) => (
            <span key={i} className="mx-4">{text}</span>
          ))}
        </motion.div>
      </div>

      {/* 3. ESTATÍSTICAS */}
      <section id="estatisticas" className="py-16 md:py-24 px-6 bg-[#F5F0E8] text-[#001F33] relative z-10 -mt-8">
        <div className="max-w-[1400px] mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="mb-12 md:mb-20"
          >
            <h2 className="text-4xl md:text-5xl lg:text-[5rem] font-display leading-[0.85] max-w-4xl uppercase">
              OS NÚMEROS<br />QUE NOS OBRIGAM<br />
              <span className="text-[#F97316]">A AGIR.</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-12 gap-12 items-end">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="md:col-span-12 lg:col-span-5 md:pr-12 md:pb-6"
            >
              <p className="text-[6rem] md:text-[8rem] font-display text-[#001F33] leading-[0.8] -ml-2 tracking-tighter">29,4%</p>
              <p className="text-xl font-bold uppercase tracking-widest text-[#F97316] mt-4 mb-2">Taxa geral de desemprego</p>
              <p className="text-base font-medium opacity-50">INE Angola</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="md:col-span-6 lg:col-span-4 md:px-8 border-t-4 md:border-t-0 md:border-l-4 border-[#0EA5E9] pt-8 md:pt-0"
            >
              <p className="text-[4rem] md:text-[6rem] font-display text-[#001F33] leading-[0.8] tracking-tighter">+80%</p>
              <p className="text-lg font-bold uppercase tracking-widest mt-4 mb-2">Desempregados têm -35 anos</p>
              <p className="text-base font-medium opacity-50">Desafio Jovem</p>
            </motion.div>
 
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="md:col-span-6 lg:col-span-3 md:pl-12 md:pb-6 border-t-4 md:border-t-0 md:border-l-4 border-[#001F33] pt-8 md:pt-0"
            >
              <p className="text-[3rem] md:text-[5rem] font-display text-[#F97316] leading-[0.8] tracking-tighter">50%+</p>
              <p className="text-lg font-bold uppercase tracking-widest mt-4 mb-2">Desemprego 15-24 anos</p>
              <p className="text-base font-medium opacity-50">Oportunidade Perdida</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. OS 3 PILARES */}
      <section id="pilares" className="bg-[#001F33] pb-12 pt-16">
        <div className="max-w-[1400px] mx-auto px-6 mb-16">
          <h2 className="text-[7vw] md:text-[6rem] font-display text-white leading-[0.8] uppercase tracking-tighter mix-blend-exclusion">
            COMO VAMOS <br/><span className="text-[#0EA5E9] inline-block -rotate-2">VENCER ISTO</span>
          </h2>
        </div>

        {/* Pilar 01 */}
        <div className="w-full flex flex-col lg:flex-row min-h-[50vh] border-y border-white/20 hover:bg-white/5 transition-colors group">
          <div className="lg:w-1/2 p-6 md:p-12 flex flex-col justify-center relative overflow-hidden">
            <span className="absolute -top-10 -left-10 text-[10rem] md:text-[14rem] font-display font-black text-white/5 z-0 group-hover:text-[#0EA5E9]/10 transition-colors">01</span>
            <div className="relative z-10">
              <h3 className="text-4xl md:text-5xl font-display text-white mb-4 uppercase tracking-tight">Formação & Orientação</h3>
              <p className="text-lg md:text-xl font-sans text-white/70 leading-relaxed mb-8 max-w-xl">
                Não deixamos o teu talento escondido. Construção de um currículo de alto impacto, optimização de LinkedIn e posicionamento estratégico.
              </p>
              <div className="flex flex-wrap gap-4">
                {['CV de Impacto', 'Posicionamento', 'Análise de Mercado'].map(tag => (
                  <span key={tag} className="border border-[#0EA5E9] text-[#0EA5E9] px-6 py-2 uppercase font-bold text-sm tracking-widest rounded-full">{tag}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="lg:w-1/2 h-[50vh] lg:h-auto relative overflow-hidden">
            <motion.img
              src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1000&q=80"
              alt="Formação"
              className="absolute inset-0 w-full h-full object-cover scale-105"
              initial={{ filter: "grayscale(100%) brightness(0.7)" }}
              whileInView={{ filter: "grayscale(0%) brightness(1)" }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 1.6, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Pilar 02 */}
        <div className="w-full flex flex-col lg:flex-row-reverse min-h-[50vh] border-b border-white/20 hover:bg-white/5 transition-colors group">
          <div className="lg:w-1/2 p-6 md:p-12 flex flex-col justify-center relative overflow-hidden">
            <span className="absolute -bottom-20 -right-10 text-[10rem] md:text-[14rem] font-display font-black text-white/5 z-0 group-hover:text-[#F97316]/10 transition-colors">02</span>
            <div className="relative z-10">
              <h3 className="text-4xl md:text-5xl font-display text-white mb-4 uppercase tracking-tight">Assistência Técnica</h3>
              <p className="text-lg md:text-xl font-sans text-white/70 leading-relaxed mb-8 max-w-xl">
                Networking real e conexões que importam. Auxiliamos na revisão rigorosa do teu perfil para vagas específicas e mapeamos o mercado oculto.
              </p>
              <div className="flex flex-wrap gap-4">
                {['Revisão de Perfil', 'Networking', 'Mercado Oculto'].map(tag => (
                  <span key={tag} className="border border-[#F97316] text-[#F97316] px-6 py-2 uppercase font-bold text-sm tracking-widest rounded-full">{tag}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="lg:w-1/2 h-[50vh] lg:h-auto relative overflow-hidden">
            <motion.img
              src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1000&q=80"
              alt="Networking"
              className="absolute inset-0 w-full h-full object-cover scale-105"
              initial={{ filter: "grayscale(100%) brightness(0.7)" }}
              whileInView={{ filter: "grayscale(0%) brightness(1)" }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 1.6, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Pilar 03 */}
        <div className="w-full flex flex-col lg:flex-row min-h-[50vh] border-b border-white/20 hover:bg-white/5 transition-colors group">
          <div className="lg:w-1/2 p-6 md:p-12 flex flex-col justify-center relative overflow-hidden">
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10rem] md:text-[14rem] font-display font-black text-white/5 z-0 group-hover:text-[#0EA5E9]/10 transition-colors">03</span>
            <div className="relative z-10">
              <h3 className="text-4xl md:text-5xl font-display text-white mb-4 uppercase tracking-tight">Simulação de Entrevistas</h3>
              <p className="text-lg md:text-xl font-sans text-white/70 leading-relaxed mb-8 max-w-xl">
                A prática leva à perfeição. Sessões de simulação reais com feedback duro e construtivo. Preparação para perguntas difíceis e confiança inabalável.
              </p>
              <div className="flex flex-wrap gap-4">
                {['Treino Prático', 'Feedback', 'Confiança'].map(tag => (
                  <span key={tag} className="border border-[#0EA5E9] text-[#0EA5E9] px-6 py-2 uppercase font-bold text-sm tracking-widest rounded-full">{tag}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="lg:w-1/2 h-[50vh] lg:h-auto relative overflow-hidden">
            <motion.img
              src="/assets/vagner.jpg"
              alt="Entrevista"
              className="absolute inset-0 w-full h-full object-cover scale-105"
              initial={{ filter: "grayscale(100%) brightness(0.7)" }}
              whileInView={{ filter: "grayscale(0%) brightness(1)" }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 1.6, ease: "easeOut" }}
            />
          </div>
        </div>
      </section>

      {/* 5. CITAÇÃO */}
      <section className="py-24 bg-[#0EA5E9] px-6 flex items-center justify-center relative overflow-hidden">
        <motion.div 
          initial={{ rotate: -5, scale: 0.9, opacity: 0 }}
          whileInView={{ rotate: 0, scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", damping: 12 }}
          className="max-w-[1200px] mx-auto text-center relative z-10"
        >
          <h2 className="font-display text-[8vw] md:text-[4.5rem] text-[#001F33] leading-[0.85] tracking-tighter uppercase">
            "O problema não é falta de talento — <br/>
            é falta de <span className="text-white mix-blend-difference block mt-4">orientação estruturada.</span>"
          </h2>
          <div className="mt-16 inline-block">
            <p className="text-[#001F33] font-black font-sans text-2xl uppercase tracking-[0.2em] border-b-8 border-[#001F33] pb-2">Vagner Fernandes</p>
            <p className="text-[#001F33]/60 font-bold uppercase tracking-widest text-sm mt-4">Promotor do Programa</p>
          </div>
        </motion.div>
      </section>

      {/* 6. JORNADA */}
      <section id="jornada" className="py-16 md:py-24 bg-[#F5F0E8] px-6 text-[#001F33]">
        <div className="max-w-[1400px] mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-5xl md:text-[5rem] font-display text-[#001F33] mb-12 uppercase tracking-tighter leading-[0.8]"
          >
            12 Meses.<br/>
            <span className="text-transparent" style={{ WebkitTextStroke: "2px #001F33" }}>Sem Atalhos.</span>
          </motion.h2>

          {/* Desktop: horizontal */}
          <div className="hidden md:flex flex-row gap-0">
            {[
              { num: "1", title: "Diagnóstico", desc: "Análise profunda do teu perfil actual. Onde estás e o que precisas.", color: "#0EA5E9" },
              { num: "2", title: "Reestruturação", desc: "Construção de CV, LinkedIn e carta de apresentação.", color: "#F97316" },
              { num: "3", title: "Treino Prático", desc: "Simulações. Como falar, como negociar, como vender o teu valor.", color: "#0EA5E9" },
              { num: "4", title: "Ataque", desc: "Candidaturas cirúrgicas e acompanhamento até à inserção.", color: "#F97316" },
            ].map((fase, i) => (
              <motion.div
                key={i}
                className="flex-1 flex flex-col"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
              >
                {/* Barra animada por scroll */}
                <div className="h-4 w-full bg-[#001F33]/10 mb-8 relative overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 h-full"
                    style={{ backgroundColor: fase.color }}
                    initial={{ width: "0%" }}
                    whileInView={{ width: "100%" }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.9, delay: i * 0.15 + 0.2, ease: "easeOut" }}
                  />
                </div>
                <div className="pr-8">
                  <motion.p
                    className="text-[4rem] font-display leading-none mb-2"
                    style={{ color: fase.color }}
                    initial={{ opacity: 0.15 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: i * 0.15 + 0.3 }}
                  >
                    {fase.num}
                  </motion.p>
                  <h4 className="text-2xl font-display uppercase mb-2 text-[#001F33]">{fase.title}</h4>
                  <p className="font-sans text-base font-medium text-[#001F33]/70">{fase.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mobile: cartões empilhados */}
          <div className="flex flex-col gap-6 md:hidden">
            {[
              { num: "01", title: "Diagnóstico", desc: "Análise profunda do teu perfil actual. Onde estás e o que precisas.", color: "#0EA5E9", bg: "#001F33" },
              { num: "02", title: "Reestruturação", desc: "Construção de CV, LinkedIn e carta de apresentação.", color: "#F97316", bg: "#F5F0E8" },
              { num: "03", title: "Treino Prático", desc: "Simulações. Como falar, como negociar, como vender o teu valor.", color: "#0EA5E9", bg: "#001F33" },
              { num: "04", title: "Ataque", desc: "Candidaturas cirúrgicas e acompanhamento até à inserção.", color: "#F97316", bg: "#F5F0E8" },
            ].map((fase, i) => (
              <motion.div
                key={i}
                className="flex items-start gap-6 p-6 border-2 rounded-none"
                style={{ borderColor: fase.color, backgroundColor: i % 2 === 0 ? "#001F33" : "transparent" }}
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <span
                  className="font-display text-7xl leading-none shrink-0 w-20"
                  style={{ color: fase.color }}
                >
                  {fase.num}
                </span>
                <div>
                  <h4
                    className="text-2xl font-display uppercase mb-2"
                    style={{ color: i % 2 === 0 ? "#ffffff" : "#001F33" }}
                  >
                    {fase.title}
                  </h4>
                  <p
                    className="font-sans text-base font-medium"
                    style={{ color: i % 2 === 0 ? "rgba(255,255,255,0.65)" : "rgba(10,10,10,0.65)" }}
                  >
                    {fase.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. PARA QUEM */}
      <section id="publico" className="py-16 md:py-24 bg-[#001F33] px-6 text-white border-y border-white/10">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid lg:grid-cols-12 gap-12 md:gap-16">
            <div className="lg:col-span-5">
              <h2 className="text-5xl md:text-[5rem] font-display leading-[0.8] mb-6 uppercase">Para <br/><span className="text-[#0EA5E9]">quem?</span></h2>
              <p className="text-xl font-sans text-white/60 font-medium max-w-md">
                Não é para todos. Exige compromisso, vontade de aprender e ambição. Jovens angolanos dos 18 aos 35 anos.
              </p>
            </div>
            <div className="lg:col-span-7 flex flex-col gap-12">
              {[
                { title: "Recém-Licenciados", desc: "Acabaste a faculdade e não sabes por onde começar a procurar o teu primeiro emprego." },
                { title: "Profissionais Estagnados", desc: "Estás num trabalho que não valoriza o teu potencial e queres dar o salto." },
                { title: "Jovens em Transição", desc: "Queres mudar de área mas não tens a rede de contactos necessária." },
                { title: "Procuradores Activos", desc: "Envias dezenas de CVs e nunca és chamado. O erro está na estratégia." }
              ].map((item, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group"
                >
                  <h4 className="text-3xl md:text-5xl font-display uppercase mb-4 text-white group-hover:text-[#0EA5E9] transition-colors">{item.title}</h4>
                  <p className="text-xl text-white/50 font-sans font-medium">{item.desc}</p>
                  <div className="h-px w-full bg-white/10 mt-12 group-hover:bg-[#0EA5E9]/50 transition-colors"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 8. FAQ */}
      <section className="py-16 bg-[#F5F0E8] px-6 text-[#001F33]">
        <div className="max-w-[1000px] mx-auto">
          <h2 className="text-4xl md:text-[4rem] font-display mb-8 text-center uppercase tracking-tighter">Perguntas Frequentes</h2>
          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="item-1" className="border-b-4 border-[#001F33] py-6">
              <AccordionTrigger className="text-2xl md:text-4xl font-display uppercase hover:text-[#F97316] hover:no-underline text-left">O programa garante emprego?</AccordionTrigger>
              <AccordionContent className="text-xl text-[#001F33]/70 font-sans font-medium pt-6 pb-4">
                Nenhum programa sério pode garantir emprego, pois a decisão final é sempre do empregador. O que garantimos é que estarás no top 5% dos candidatos mais bem preparados.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border-b-4 border-[#001F33] py-6">
              <AccordionTrigger className="text-2xl md:text-4xl font-display uppercase hover:text-[#F97316] hover:no-underline text-left">As formações são presenciais?</AccordionTrigger>
              <AccordionContent className="text-xl text-[#001F33]/70 font-sans font-medium pt-6 pb-4">
                O programa funciona num modelo híbrido: sessões online e momentos práticos presenciais nas províncias de actuação.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="border-b-4 border-[#001F33] py-6">
              <AccordionTrigger className="text-2xl md:text-4xl font-display uppercase hover:text-[#F97316] hover:no-underline text-left">Tem algum custo?</AccordionTrigger>
              <AccordionContent className="text-xl text-[#001F33]/70 font-sans font-medium pt-6 pb-4">
                Preenche o formulário para receberes o dossier completo, incluindo opções de financiamento e bolsas disponíveis.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4" className="border-b-4 border-[#001F33] py-6">
              <AccordionTrigger className="text-2xl md:text-4xl font-display uppercase hover:text-[#F97316] hover:no-underline text-left">Preciso ter experiência?</AccordionTrigger>
              <AccordionContent className="text-xl text-[#001F33]/70 font-sans font-medium pt-6 pb-4">
                Não. Ajudamos quer pessoas sem experiência (primeiro emprego), quer profissionais que procuram recolocação.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* 9. FORMULÁRIO */}
      <section id="inscricao" className="py-20 md:py-24 bg-[#001F33] px-6 text-white relative">
        <div className="absolute inset-0 bg-[#0EA5E9]/5 mix-blend-overlay pointer-events-none"></div>
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-12 md:gap-24 relative z-10">
          <div>
            <h2 className="text-[10vw] md:text-[6rem] font-display uppercase leading-[0.8] mb-6 tracking-tighter">
              O MOMENTO <br/><span className="text-[#0EA5E9]">É AGORA.</span>
            </h2>
            <p className="text-xl font-sans text-white/60 mb-8">
              Apenas candidatos com perfil ajustado serão contactados. Preenche com rigor.
            </p>
          </div>

          <div className="bg-transparent border-4 border-[#0EA5E9] p-8 md:p-12 relative shadow-[16px_16px_0px_0px_rgba(249,115,22,1)]">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 font-sans">
                <div className="space-y-6">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0EA5E9] uppercase tracking-widest font-bold">Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="O teu nome" {...field} className="bg-white/5 border-2 border-white/20 text-white h-16 text-lg focus-visible:border-[#0EA5E9] focus-visible:ring-0 rounded-none placeholder:text-white/30" />
                      </FormControl>
                      <FormMessage className="text-[#F97316] font-bold" />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0EA5E9] uppercase tracking-widest font-bold">E-mail</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="O teu melhor e-mail" {...field} className="bg-white/5 border-2 border-white/20 text-white h-16 text-lg focus-visible:border-[#0EA5E9] focus-visible:ring-0 rounded-none placeholder:text-white/30" />
                      </FormControl>
                      <FormMessage className="text-[#F97316] font-bold" />
                    </FormItem>
                  )} />
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="city" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#0EA5E9] uppercase tracking-widest font-bold">Cidade</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white/5 border-2 border-white/20 text-white h-16 text-lg focus-visible:border-[#0EA5E9] focus-visible:ring-0 rounded-none">
                              <SelectValue placeholder="Selecionar" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-[#001F33] border-[#0EA5E9] text-white">
                            <SelectItem value="luanda">Luanda</SelectItem>
                            <SelectItem value="viana">Viana</SelectItem>
                            <SelectItem value="benguela">Benguela</SelectItem>
                            <SelectItem value="lobito">Lobito</SelectItem>
                            <SelectItem value="outra">Outra</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-[#F97316] font-bold" />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="profile" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#0EA5E9] uppercase tracking-widest font-bold">Perfil</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white/5 border-2 border-white/20 text-white h-16 text-lg focus-visible:border-[#0EA5E9] focus-visible:ring-0 rounded-none">
                              <SelectValue placeholder="Selecionar" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-[#001F33] border-[#0EA5E9] text-white">
                            <SelectItem value="licenciado">Licenciado</SelectItem>
                            <SelectItem value="finalista">Finalista</SelectItem>
                            <SelectItem value="tecnico">Técnico</SelectItem>
                            <SelectItem value="reconversao">Reconversão</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-[#F97316] font-bold" />
                      </FormItem>
                    )} />
                  </div>
                  
                  <FormField control={form.control} name="message" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#FACC15] uppercase tracking-widest font-bold">Por que deves ser escolhido? (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Convence-nos em poucas linhas..." {...field} className="bg-white/5 border-2 border-white/20 text-white min-h-[120px] text-lg focus-visible:border-[#FACC15] focus-visible:ring-0 rounded-none placeholder:text-white/30 resize-none" />
                      </FormControl>
                    </FormItem>
                  )} />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full h-16 bg-[#FACC15] hover:bg-[#F97316] text-[#0A0A0A] text-xl font-display uppercase rounded-none transition-colors border-0"
                >
                  {isSubmitting ? "A Enviar..." : "Submeter Candidatura"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0A0A0A] py-12 px-6 border-t border-white/10 text-center">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="font-display text-4xl text-white uppercase">CARREIRA 360°</div>
          <p className="text-white/40 font-sans text-sm font-medium uppercase tracking-widest">
            © {new Date().getFullYear()} Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
