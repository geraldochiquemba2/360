import { useRef, useState } from "react";
import { motion, useScroll, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  MapPin, 
  Briefcase, 
  Users, 
  GraduationCap, 
  CheckCircle2, 
  ChevronRight,
  Menu,
  X,
  Target,
  FileText,
  Network,
  Clock
} from "lucide-react";
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
  const [isSubmitted, setIsSubmitted] = useState(false);
  
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
    console.log(values);
    setIsSubmitted(true);
    toast({
      title: "Inscrição submetida!",
      description: "A tua viagem começa agora. Entraremos em contacto em breve.",
    });
  }

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const fadeUpVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground overflow-hidden selection:bg-primary/20 selection:text-primary" ref={containerRef}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-display font-bold text-xl shadow-lg shadow-primary/20">
              C
            </div>
            <span className="font-display font-bold text-xl tracking-tight">Carreira 360°</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#contexto" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">O Problema</a>
            <a href="#pilares" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">O Programa</a>
            <a href="#jornada" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">A Jornada</a>
            <a href="#publico" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">Para Quem</a>
            <Button onClick={() => document.getElementById("inscricao")?.scrollIntoView({ behavior: "smooth" })} className="rounded-full px-6 font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-0.5">
              Inscreve-te Agora
            </Button>
          </div>

          <button className="md:hidden text-foreground" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border"
            >
              <div className="flex flex-col p-6 gap-4">
                <a href="#contexto" onClick={() => setIsMenuOpen(false)} className="text-lg font-semibold">O Problema</a>
                <a href="#pilares" onClick={() => setIsMenuOpen(false)} className="text-lg font-semibold">O Programa</a>
                <a href="#jornada" onClick={() => setIsMenuOpen(false)} className="text-lg font-semibold">A Jornada</a>
                <a href="#publico" onClick={() => setIsMenuOpen(false)} className="text-lg font-semibold">Para Quem</a>
                <Button onClick={() => { setIsMenuOpen(false); document.getElementById("inscricao")?.scrollIntoView({ behavior: "smooth" }); }} className="mt-4 rounded-xl h-12 font-bold">
                  Inscreve-te Agora
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 px-6 overflow-hidden min-h-[90vh] flex items-center">
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }}></div>
        <div className="absolute top-0 -right-64 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-64 -left-64 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex flex-col items-start"
          >
            <motion.div variants={fadeUpVariant} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-bold mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Luanda • Viana • Benguela • Lobito
            </motion.div>
            
            <motion.h1 variants={fadeUpVariant} className="text-5xl md:text-7xl font-display font-extrabold leading-[1.05] tracking-tight mb-6">
              O parceiro de carreira que <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">nunca tiveste.</span>
            </motion.h1>
            
            <motion.p variants={fadeUpVariant} className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-lg leading-relaxed font-medium">
              Não é mais um curso online. É uma bússola para quem tem talento mas não sabe por onde começar.
            </motion.p>
            
            <motion.div variants={fadeUpVariant} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Button size="lg" onClick={() => document.getElementById("inscricao")?.scrollIntoView({ behavior: "smooth" })} className="rounded-full h-14 px-8 text-lg font-bold shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-1">
                Começar a Jornada
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => document.getElementById("contexto")?.scrollIntoView({ behavior: "smooth" })} className="rounded-full h-14 px-8 text-lg font-bold border-2 hover:bg-secondary/5">
                O Nosso Método
              </Button>
            </motion.div>
            
            <motion.div variants={fadeUpVariant} className="mt-12 flex items-center gap-4 p-4 rounded-2xl bg-secondary/5 border border-secondary/10 backdrop-blur-sm">
              <div className="flex -space-x-3">
                {[1,2,3].map((i) => (
                  <div key={i} className="w-12 h-12 rounded-full border-2 border-background bg-secondary/10 flex items-center justify-center overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${i + 10}&backgroundColor=transparent`} alt="avatar" />
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Programa de 12 meses</p>
                <p className="text-sm text-muted-foreground">Transformação profunda</p>
              </div>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.2, type: "spring" }}
            className="relative lg:h-[650px] rounded-[2.5rem] overflow-hidden bg-secondary border border-border/10 shadow-2xl group"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-secondary/95 via-secondary/80 to-secondary/30 z-10 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-90"></div>
            <img 
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
              alt="Jovens a trabalhar num portátil" 
              className="absolute inset-0 w-full h-full object-cover object-center grayscale-[30%] transition-transform duration-700 group-hover:scale-105"
            />
            
            {/* Floating Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="absolute top-8 right-8 z-30 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <p className="text-white font-bold">Foco Prático</p>
                <p className="text-white/80 text-sm">Mercado real</p>
              </div>
            </motion.div>

            <div className="absolute inset-0 z-20 p-8 flex flex-col justify-end">
              <div className="bg-background/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl transform transition-transform duration-500 hover:-translate-y-2">
                <p className="text-white font-display text-3xl md:text-4xl font-bold leading-tight mb-6">
                  "O problema não é falta de talento nos jovens angolanos — é falta de orientação estruturada."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl shadow-lg">VF</div>
                  <div>
                    <p className="text-white font-bold text-lg">Vagner Fernandes</p>
                    <p className="text-white/70 font-medium">Promotor do Programa</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* The Context Section */}
      <section id="contexto" className="py-32 px-6 bg-secondary text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariant}
            className="max-w-3xl mb-20"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white border border-white/20 text-sm font-bold mb-6">
              O Contexto Angolano
            </div>
            <h2 className="text-4xl md:text-6xl font-display font-extrabold mb-6 leading-tight">A realidade que vamos mudar.</h2>
            <p className="text-xl md:text-2xl text-white/70 leading-relaxed font-medium">
              O mercado de trabalho em Angola é complexo. As estatísticas mostram uma realidade dura, mas nós vemos um mar de potencial não aproveitado.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { stat: "29,4%", label: "Taxa de desemprego geral", icon: Target, color: "text-primary" },
              { stat: ">80%", label: "Dos desempregados têm menos de 35 anos", icon: Users, color: "text-accent" },
              { stat: "50%+", label: "Desemprego no grupo dos 15 aos 24 anos", icon: Briefcase, color: "text-white" }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className="bg-white/5 border border-white/10 p-10 rounded-[2rem] backdrop-blur-sm hover:bg-white/10 transition-colors group"
              >
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <item.icon className={`w-8 h-8 ${item.color}`} />
                </div>
                <h3 className="text-6xl font-display font-extrabold mb-4">{item.stat}</h3>
                <p className="text-white/70 font-medium text-xl leading-snug">{item.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section id="pilares" className="py-32 px-6 relative bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-24">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/5 text-secondary font-bold mb-6">
              A Nossa Solução
            </div>
            <h2 className="text-4xl md:text-6xl font-display font-extrabold mb-6 leading-tight">Como funciona a bússola.</h2>
            <p className="text-xl md:text-2xl text-muted-foreground font-medium">
              Um programa intensivo e prático estruturado em três pilares fundamentais para a tua inserção no mercado.
            </p>
          </div>

          <div className="space-y-24">
            {[
              {
                title: "Formação & Orientação",
                desc: "Desenhamos a tua marca profissional do zero. Desde a construção de um CV que passa nos filtros de recrutamento até ao posicionamento estratégico no mercado de trabalho angolano.",
                tags: ["Construção de CV", "Posicionamento", "Análise de Mercado"],
                icon: GraduationCap,
                color: "bg-primary/10 text-primary border-primary/20",
                img: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
              },
              {
                title: "Assistência Técnica",
                desc: "Não ficas sozinho a enviar currículos para o vazio. Revimos o teu perfil, abrimos portas para networking estratégico e conectamos-te a vagas reais que fazem sentido para o teu percurso.",
                tags: ["Revisão de Perfil", "Networking", "Mapeamento de Vagas"],
                icon: Network,
                color: "bg-accent/10 text-accent-foreground border-accent/20",
                img: "https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
              },
              {
                title: "Simulação de Entrevistas",
                desc: "Treinamos-te para o momento da verdade. Realizamos simulações práticas e intensivas com feedback estruturado sobre a tua postura, comunicação e níveis de confiança.",
                tags: ["Treino Prático", "Feedback Estruturado", "Postura e Confiança"],
                icon: FileText,
                color: "bg-secondary/10 text-secondary border-secondary/20",
                img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
              }
            ].map((pillar, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className={`grid md:grid-cols-2 gap-12 lg:gap-20 items-center ${i % 2 !== 0 ? 'md:grid-flow-col-dense' : ''}`}
              >
                <div className={`order-2 ${i % 2 !== 0 ? 'md:order-1' : 'md:order-1'}`}>
                  <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-8 border-2 shadow-lg ${pillar.color}`}>
                    <pillar.icon className="w-10 h-10" />
                  </div>
                  <h3 className="text-4xl font-display font-extrabold mb-6 leading-tight">{pillar.title}</h3>
                  <p className="text-xl text-muted-foreground mb-8 leading-relaxed">{pillar.desc}</p>
                  <div className="flex flex-wrap gap-3">
                    {pillar.tags.map((tag, j) => (
                      <span key={j} className="px-5 py-2.5 bg-muted text-foreground font-bold rounded-xl text-sm border border-border/50 shadow-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className={`order-1 ${i % 2 !== 0 ? 'md:order-2' : 'md:order-2'} relative h-[400px] md:h-[500px] rounded-[2.5rem] overflow-hidden shadow-2xl group`}>
                  <img src={pillar.img} alt={pillar.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-secondary/10 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-0"></div>
                  <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-[2.5rem]"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section id="jornada" className="py-32 px-6 bg-muted/30 border-y border-border/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-display font-extrabold mb-6">A tua jornada de 12 meses.</h2>
            <p className="text-xl text-muted-foreground font-medium">Um plano estruturado para passar da incerteza à acção.</p>
          </div>

          <div className="relative border-l-4 border-primary/20 ml-6 md:ml-12 space-y-16">
            {[
              {
                month: "Meses 1-3",
                title: "Diagnóstico e Reestruturação",
                desc: "Analisamos o teu perfil actual, identificamos lacunas e reconstruímos as tuas ferramentas principais (CV, LinkedIn, Portfólio).",
                icon: FileText
              },
              {
                month: "Meses 4-6",
                title: "Posicionamento e Marca Pessoal",
                desc: "Definimos o teu nicho. Ensinamos-te a comunicar o teu valor e a criar uma presença digital que atrai recrutadores.",
                icon: Target
              },
              {
                month: "Meses 7-9",
                title: "Networking e Mercado Oculto",
                desc: "Acesso a oportunidades não publicadas. Simulação de entrevistas intensivas e mapeamento de empresas alvo.",
                icon: Users
              },
              {
                month: "Meses 10-12",
                title: "Inserção e Acompanhamento",
                desc: "Candidaturas estratégicas, apoio na negociação de propostas e mentoria contínua durante a fase de integração.",
                icon: GraduationCap
              }
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="relative pl-10 md:pl-16"
              >
                <div className="absolute -left-[2.85rem] top-0 w-16 h-16 rounded-2xl bg-background border-4 border-primary flex items-center justify-center shadow-xl">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>
                <div className="bg-card border border-border p-8 rounded-3xl shadow-lg">
                  <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-sm mb-4">
                    {step.month}
                  </span>
                  <h3 className="text-2xl font-display font-bold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground text-lg">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section id="publico" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent-foreground font-bold mb-6 border border-accent/20">
                O Perfil
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-extrabold mb-6 leading-tight">Para quem foi feito?</h2>
              <p className="text-xl text-muted-foreground mb-10 font-medium leading-relaxed">
                Se tens entre 18 e 35 anos e sentes que precisas de direcção, o Carreira 360° é o teu próximo passo.
              </p>
              
              <ul className="space-y-6">
                {[
                  "Licenciados desempregados à procura da primeira oportunidade",
                  "Finalistas universitários a prepararem-se para o salto",
                  "Técnicos profissionais que querem destacar-se no mercado",
                  "Jovens em reconversão de carreira que precisam de novo foco"
                ].map((item, i) => (
                  <motion.li 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-5 p-4 rounded-2xl hover:bg-muted/50 transition-colors"
                  >
                    <div className="mt-1 w-8 h-8 rounded-full bg-primary/20 flex flex-shrink-0 items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-lg font-bold text-foreground/90">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-card p-10 md:p-12 rounded-[2.5rem] shadow-2xl border border-border relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
              
              <div className="mb-10 relative z-10">
                <h3 className="text-3xl font-display font-bold mb-3">O compromisso</h3>
                <p className="text-muted-foreground text-lg">Detalhes operacionais do programa.</p>
              </div>

              <div className="space-y-6 relative z-10">
                <div className="flex items-center gap-5 p-6 rounded-2xl bg-muted border border-border/50">
                  <div className="w-14 h-14 rounded-xl bg-background border shadow-sm flex items-center justify-center flex-shrink-0">
                    <MapPin className="text-primary w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-lg mb-1">Localizações</p>
                    <p className="text-muted-foreground">Luanda, Viana, Benguela, Lobito</p>
                  </div>
                </div>

                <div className="flex items-center gap-5 p-6 rounded-2xl bg-muted border border-border/50">
                  <div className="w-14 h-14 rounded-xl bg-background border shadow-sm flex items-center justify-center flex-shrink-0">
                    <Clock className="text-primary w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-lg mb-1">Duração</p>
                    <p className="text-muted-foreground">12 meses de acompanhamento</p>
                  </div>
                </div>

                <div className="flex items-center gap-5 p-6 rounded-2xl bg-muted border border-border/50">
                  <div className="w-14 h-14 rounded-xl bg-background border shadow-sm flex items-center justify-center flex-shrink-0">
                    <Users className="text-primary w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-lg mb-1">Idade</p>
                    <p className="text-muted-foreground">Jovens dos 18 aos 35 anos</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 px-6 bg-muted/30 border-t border-border/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-extrabold mb-6">Perguntas Frequentes.</h2>
            <p className="text-xl text-muted-foreground font-medium">Tudo o que precisas de saber antes de dar o passo.</p>
          </div>

          <Accordion type="single" collapsible className="space-y-4 w-full">
            {[
              {
                q: "O programa tem algum custo?",
                a: "O valor da inscrição e mensalidades será partilhado após a análise do teu perfil. Acreditamos num modelo acessível, focado no retorno do teu investimento através da inserção no mercado."
              },
              {
                q: "Não tenho licenciatura, posso participar?",
                a: "Sim. O programa também é desenhado para técnicos profissionais e jovens em reconversão de carreira. O que procuramos é atitude e vontade de aprender."
              },
              {
                q: "As sessões são presenciais ou online?",
                a: "O Carreira 360° funciona num modelo híbrido. A componente online permite flexibilidade, enquanto as simulações e eventos de networking acontecem presencialmente em Luanda, Viana, Benguela e Lobito."
              },
              {
                q: "Garantem emprego no final dos 12 meses?",
                a: "Nenhum programa sério garante emprego, pois a decisão final é sempre da empresa. O que garantimos é que estarás no top 5% dos candidatos mais bem preparados do país, o que aumenta exponencialmente as tuas hipóteses."
              }
            ].map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="bg-card border rounded-2xl px-6 py-2 shadow-sm data-[state=open]:border-primary/50 transition-colors">
                <AccordionTrigger className="text-lg font-bold hover:no-underline hover:text-primary transition-colors py-4">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA / Form Section */}
      <section id="inscricao" className="py-32 px-6 relative overflow-hidden bg-secondary text-white">
        <div className="absolute -top-64 -right-64 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute -bottom-64 -left-64 w-[600px] h-[600px] bg-accent/20 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-display font-extrabold mb-6 leading-tight">Dá o primeiro passo.</h2>
            <p className="text-xl md:text-2xl text-white/70 font-medium">
              A orientação que precisas está à distância de uma inscrição.
            </p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card text-foreground border border-border shadow-2xl rounded-[2.5rem] p-8 md:p-12 relative"
          >
            {isSubmitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16"
              >
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <h3 className="text-4xl font-display font-extrabold mb-4">Inscrição Recebida!</h3>
                <p className="text-xl text-muted-foreground mb-10 max-w-lg mx-auto">
                  Verifica o teu e-mail nos próximos dias. A tua jornada para uma carreira estruturada começou.
                </p>
                <Button onClick={() => setIsSubmitted(false)} variant="outline" size="lg" className="rounded-full h-14 px-8 font-bold border-2">
                  Fazer nova inscrição
                </Button>
              </motion.div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-bold">Nome Completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: João Silva" className="h-14 px-4 rounded-xl bg-muted/50 border-border focus:border-primary focus:ring-1 focus:ring-primary focus:bg-background transition-all text-base" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-bold">E-mail</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: joao@exemplo.com" className="h-14 px-4 rounded-xl bg-muted/50 border-border focus:border-primary focus:ring-1 focus:ring-primary focus:bg-background transition-all text-base" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-bold">Cidade</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-14 px-4 rounded-xl bg-muted/50 border-border focus:border-primary focus:ring-1 focus:ring-primary focus:bg-background transition-all text-base">
                                <SelectValue placeholder="Onde vives?" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl">
                              <SelectItem value="luanda">Luanda</SelectItem>
                              <SelectItem value="viana">Viana</SelectItem>
                              <SelectItem value="benguela">Benguela</SelectItem>
                              <SelectItem value="lobito">Lobito</SelectItem>
                              <SelectItem value="outra">Outra</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="profile"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-bold">Perfil Actual</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-14 px-4 rounded-xl bg-muted/50 border-border focus:border-primary focus:ring-1 focus:ring-primary focus:bg-background transition-all text-base">
                                <SelectValue placeholder="Qual é a tua situação?" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl">
                              <SelectItem value="licenciado">Licenciado Desempregado</SelectItem>
                              <SelectItem value="finalista">Finalista Universitário</SelectItem>
                              <SelectItem value="tecnico">Técnico Profissional</SelectItem>
                              <SelectItem value="reconversao">Em reconversão de carreira</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-bold">A tua história (Opcional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Fala-nos um pouco sobre os teus maiores desafios actuais..." 
                            className="min-h-[150px] p-4 rounded-xl bg-muted/50 border-border focus:border-primary focus:ring-1 focus:ring-primary focus:bg-background transition-all resize-none text-base" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" size="lg" className="w-full h-16 rounded-xl text-xl font-bold shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all">
                    Submeter Inscrição
                    <ChevronRight className="ml-2 w-6 h-6" />
                  </Button>
                </form>
              </Form>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0a0f1a] text-white py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-display font-bold text-2xl">
                C
              </div>
              <span className="font-display font-bold text-2xl tracking-tight">Carreira 360°</span>
            </div>
            <p className="text-white/50 text-sm max-w-xs text-center md:text-left font-medium">
              A bússola para jovens angolanos que procuram uma orientação estruturada para o mercado.
            </p>
          </div>
          
          <div className="flex flex-col items-center md:items-end gap-4">
            <div className="flex gap-6">
              <a href="#" className="text-white/60 hover:text-white transition-colors text-sm font-bold">LinkedIn</a>
              <a href="#" className="text-white/60 hover:text-white transition-colors text-sm font-bold">Instagram</a>
              <a href="#" className="text-white/60 hover:text-white transition-colors text-sm font-bold">WhatsApp</a>
            </div>
            <p className="text-white/40 text-sm font-medium">
              © {new Date().getFullYear()} Carreira 360°. Promovido por Vagner Fernandes.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
