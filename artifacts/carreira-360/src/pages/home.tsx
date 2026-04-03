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
import { Menu, X, ArrowRight } from "lucide-react";

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
        title: "Inscrição recebida!",
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
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/20 selection:text-primary">
      {/* 1. NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-secondary border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            <div className="w-8 h-8 rounded-none bg-primary flex items-center justify-center text-primary-foreground font-display font-black text-xl">
              C
            </div>
            <span className="font-display font-black text-2xl tracking-tight text-white uppercase">CARREIRA 360°</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollTo("estatisticas")} className="text-sm font-semibold text-white/70 hover:text-white transition-colors">O Problema</button>
            <button onClick={() => scrollTo("pilares")} className="text-sm font-semibold text-white/70 hover:text-white transition-colors">Os Pilares</button>
            <button onClick={() => scrollTo("jornada")} className="text-sm font-semibold text-white/70 hover:text-white transition-colors">Jornada</button>
            <button onClick={() => scrollTo("publico")} className="text-sm font-semibold text-white/70 hover:text-white transition-colors">Para Quem</button>
            <Button onClick={() => scrollTo("inscricao")} className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 font-bold text-sm uppercase tracking-wide">
              Inscrever-me
            </Button>
          </div>

          <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-secondary border-b border-white/10 absolute top-20 left-0 right-0 p-6 flex flex-col gap-6 shadow-2xl">
            <button onClick={() => scrollTo("estatisticas")} className="text-left text-lg font-bold text-white uppercase">O Problema</button>
            <button onClick={() => scrollTo("pilares")} className="text-left text-lg font-bold text-white uppercase">Os Pilares</button>
            <button onClick={() => scrollTo("jornada")} className="text-left text-lg font-bold text-white uppercase">Jornada</button>
            <button onClick={() => scrollTo("publico")} className="text-left text-lg font-bold text-white uppercase">Para Quem</button>
            <Button onClick={() => scrollTo("inscricao")} className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 font-bold text-sm uppercase tracking-wide w-full">
              Inscrever-me
            </Button>
          </div>
        )}
      </nav>

      {/* 2. HERO */}
      <section className="relative pt-32 pb-24 md:pt-48 md:pb-32 bg-secondary text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full hidden lg:block opacity-40 mix-blend-luminosity">
           <img 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80" 
              alt="Jovens a trabalhar" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-secondary to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 text-white text-xs font-bold uppercase tracking-widest mb-8">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
              Luanda • Viana • Benguela • Lobito
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-black leading-[0.95] tracking-tight mb-8">
              O parceiro de carreira que <span className="text-primary">nunca tiveste.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/70 mb-12 max-w-xl leading-relaxed font-medium">
              Programa imersivo de 12 meses para preparar jovens angolanos para o mercado de trabalho com estratégia, treino e foco implacável.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={() => scrollTo("inscricao")} className="rounded-none h-16 px-10 bg-primary text-primary-foreground hover:bg-primary/90 text-lg font-bold uppercase tracking-wider">
                Garantir o meu lugar
              </Button>
              <Button onClick={() => scrollTo("pilares")} variant="outline" className="rounded-none h-16 px-10 bg-transparent border-white/20 text-white hover:bg-white hover:text-secondary text-lg font-bold uppercase tracking-wider">
                Ver o Programa
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TICKER/BANDA */}
      <div className="bg-primary py-4 overflow-hidden flex whitespace-nowrap border-y-4 border-secondary">
        <motion.div 
          className="flex whitespace-nowrap text-secondary font-display font-black text-3xl uppercase tracking-widest"
          animate={{ x: [0, -1000] }}
          transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
        >
          {Array(10).fill("Luanda • Viana • Benguela • Lobito • 12 Meses • Empregabilidade • Angola • ").map((text, i) => (
            <span key={i} className="mx-2">{text}</span>
          ))}
        </motion.div>
      </div>

      {/* 4. ESTATÍSTICAS */}
      <section id="estatisticas" className="py-24 md:py-32 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-black leading-tight max-w-2xl text-secondary">
              Os números que nos obrigam a agir.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12 md:gap-8">
            <div className="flex gap-6">
              <div className="w-2 bg-primary flex-shrink-0"></div>
              <div>
                <p className="text-6xl md:text-7xl font-display font-black text-secondary mb-2">29,4%</p>
                <p className="text-lg font-bold text-secondary mb-1">Taxa geral de desemprego</p>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">INE Angola</p>
              </div>
            </div>
            
            <div className="flex gap-6">
              <div className="w-2 bg-secondary flex-shrink-0"></div>
              <div>
                <p className="text-6xl md:text-7xl font-display font-black text-secondary mb-2">+80%</p>
                <p className="text-lg font-bold text-secondary mb-1">Dos desempregados têm menos de 35 anos</p>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Desafio Jovem</p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="w-2 bg-muted-foreground flex-shrink-0"></div>
              <div>
                <p className="text-6xl md:text-7xl font-display font-black text-secondary mb-2">50%+</p>
                <p className="text-lg font-bold text-secondary mb-1">Desemprego entre 15-24 anos</p>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Oportunidade Perdida</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. OS 3 PILARES */}
      <section id="pilares" className="py-24 md:py-32 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-5xl md:text-6xl font-display font-black text-secondary mb-24 uppercase tracking-tight">O Programa</h2>
          
          <div className="space-y-32">
            {/* Pilar 01 */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1 pr-0 lg:pr-12">
                <span className="text-primary font-display font-black text-6xl md:text-8xl opacity-20 block mb-4">01</span>
                <h3 className="text-3xl md:text-4xl font-display font-black text-secondary mb-6">Formação & Orientação</h3>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6 font-medium">
                  Não deixamos o teu talento escondido. Estruturamos a tua marca profissional desde a base: construção de um currículo de alto impacto, optimização do teu perfil no LinkedIn e ensino de como te posicionares estrategicamente no mercado.
                </p>
                <ul className="space-y-3 font-bold text-secondary">
                  <li className="flex items-center gap-3"><div className="w-2 h-2 bg-primary rounded-full"></div> Construção de CV</li>
                  <li className="flex items-center gap-3"><div className="w-2 h-2 bg-primary rounded-full"></div> Posicionamento Profissional</li>
                  <li className="flex items-center gap-3"><div className="w-2 h-2 bg-primary rounded-full"></div> Análise de Mercado</li>
                </ul>
              </div>
              <div className="order-1 lg:order-2">
                <img src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1000&q=80" alt="Formação" className="w-full aspect-[4/3] object-cover grayscale hover:grayscale-0 transition-all duration-500" />
              </div>
            </div>

            {/* Pilar 02 */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-1">
                <img src="https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1000&q=80" alt="Networking" className="w-full aspect-[4/3] object-cover grayscale hover:grayscale-0 transition-all duration-500" />
              </div>
              <div className="order-2 pl-0 lg:pl-12">
                <span className="text-secondary font-display font-black text-6xl md:text-8xl opacity-20 block mb-4">02</span>
                <h3 className="text-3xl md:text-4xl font-display font-black text-secondary mb-6">Assistência Técnica</h3>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6 font-medium">
                  Networking real e conexões que importam. Auxiliamos na revisão rigorosa do teu perfil para vagas específicas e mapeamos o mercado oculto de oportunidades. Não atiramos no escuro.
                </p>
                <ul className="space-y-3 font-bold text-secondary">
                  <li className="flex items-center gap-3"><div className="w-2 h-2 bg-secondary rounded-full"></div> Revisão de Perfil</li>
                  <li className="flex items-center gap-3"><div className="w-2 h-2 bg-secondary rounded-full"></div> Networking Estratégico</li>
                  <li className="flex items-center gap-3"><div className="w-2 h-2 bg-secondary rounded-full"></div> Mapeamento de Vagas</li>
                </ul>
              </div>
            </div>

            {/* Pilar 03 */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1 pr-0 lg:pr-12">
                <span className="text-primary font-display font-black text-6xl md:text-8xl opacity-20 block mb-4">03</span>
                <h3 className="text-3xl md:text-4xl font-display font-black text-secondary mb-6">Simulação de Entrevistas</h3>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6 font-medium">
                  A prática leva à perfeição. Realizamos sessões de simulação reais com feedback duro e construtivo. Preparação para perguntas difíceis, postura corporal e confiança inabalável.
                </p>
                <ul className="space-y-3 font-bold text-secondary">
                  <li className="flex items-center gap-3"><div className="w-2 h-2 bg-primary rounded-full"></div> Treino Prático Intensivo</li>
                  <li className="flex items-center gap-3"><div className="w-2 h-2 bg-primary rounded-full"></div> Feedback Estruturado</li>
                  <li className="flex items-center gap-3"><div className="w-2 h-2 bg-primary rounded-full"></div> Postura e Confiança</li>
                </ul>
              </div>
              <div className="order-1 lg:order-2">
                <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1000&q=80" alt="Entrevista" className="w-full aspect-[4/3] object-cover grayscale hover:grayscale-0 transition-all duration-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CITAÇÃO / MANIFESTO */}
      <section className="py-32 bg-secondary px-6 border-y border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-display font-black text-3xl md:text-5xl text-white leading-tight mb-12">
            "O problema não é falta de talento nos jovens angolanos — é falta de orientação estruturada para o mercado."
          </p>
          <div className="inline-block text-left">
            <p className="text-primary font-bold text-xl uppercase tracking-widest">Vagner Fernandes</p>
            <p className="text-white/60 font-medium uppercase tracking-wider text-sm mt-1">Promotor do Programa</p>
          </div>
        </div>
      </section>

      {/* 7. JORNADA */}
      <section id="jornada" className="py-24 md:py-32 bg-background px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-display font-black text-secondary mb-20 text-center uppercase tracking-tight">12 Meses. Sem Atalhos.</h2>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { num: "Fase 1", title: "Diagnóstico", desc: "Análise profunda do teu perfil actual. Onde estás e o que precisas para chegar onde queres.", bg: "bg-muted" },
              { num: "Fase 2", title: "Reestruturação", desc: "Construção de ferramentas: CV, LinkedIn e carta de apresentação que geram entrevistas.", bg: "bg-secondary", text: "text-white" },
              { num: "Fase 3", title: "Treino Prático", desc: "Simulações intensivas. Como falar, como negociar, como vender o teu valor.", bg: "bg-primary", text: "text-white" },
              { num: "Fase 4", title: "Ataque ao Mercado", desc: "Candidaturas cirúrgicas, networking activo e acompanhamento até à inserção.", bg: "bg-muted" },
            ].map((fase, i) => (
              <div key={i} className={`${fase.bg} ${fase.text || 'text-secondary'} p-8 h-full border border-border`}>
                <p className="text-sm font-bold uppercase tracking-widest mb-8 opacity-70">{fase.num}</p>
                <h4 className="text-2xl font-display font-black mb-4">{fase.title}</h4>
                <p className={`font-medium ${fase.text ? 'text-white/80' : 'text-muted-foreground'}`}>{fase.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. PARA QUEM */}
      <section id="publico" className="py-24 md:py-32 bg-muted/30 px-6 border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-16">
            <div className="lg:col-span-1">
              <h2 className="text-4xl md:text-5xl font-display font-black text-secondary mb-6">Para quem é isto?</h2>
              <p className="text-lg text-muted-foreground font-medium">
                Este programa não é para todos. Exige compromisso, vontade de aprender e ambição. Jovens angolanos dos 18 aos 35 anos.
              </p>
            </div>
            <div className="lg:col-span-2 grid sm:grid-cols-2 gap-8">
              {[
                { title: "Recém-Licenciados", desc: "Acabaste a faculdade e não sabes por onde começar a procurar o teu primeiro emprego." },
                { title: "Profissionais Estagnados", desc: "Estás num trabalho que não valoriza o teu potencial e queres dar o salto." },
                { title: "Jovens em Transição", desc: "Queres mudar de área mas não tens a rede de contactos necessária." },
                { title: "Procuradores Activos", desc: "Envias dezenas de CVs e nunca és chamado para entrevistas. O erro está na estratégia." }
              ].map((item, i) => (
                <div key={i} className="border-l-4 border-primary pl-6 py-2">
                  <h4 className="text-xl font-display font-black text-secondary mb-2 uppercase">{item.title}</h4>
                  <p className="text-muted-foreground font-medium">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 9. FAQ */}
      <section className="py-24 md:py-32 bg-background px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-display font-black text-secondary mb-16 text-center uppercase">Perguntas Frequentes</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border-b-2 border-border py-4">
              <AccordionTrigger className="text-xl font-display font-bold text-secondary hover:text-primary hover:no-underline">O programa garante emprego?</AccordionTrigger>
              <AccordionContent className="text-lg text-muted-foreground font-medium pt-4">
                Nenhum programa sério pode garantir emprego, pois a decisão final é sempre do empregador. O que garantimos é que estarás no top 5% dos candidatos mais bem preparados do mercado angolano.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border-b-2 border-border py-4">
              <AccordionTrigger className="text-xl font-display font-bold text-secondary hover:text-primary hover:no-underline">As formações são presenciais ou online?</AccordionTrigger>
              <AccordionContent className="text-lg text-muted-foreground font-medium pt-4">
                O programa funciona num modelo híbrido, com sessões teóricas online e momentos práticos (simulações e networking) presenciais nas províncias de actuação.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="border-b-2 border-border py-4">
              <AccordionTrigger className="text-xl font-display font-bold text-secondary hover:text-primary hover:no-underline">Tem algum custo?</AccordionTrigger>
              <AccordionContent className="text-lg text-muted-foreground font-medium pt-4">
                Por favor, preenche o formulário de candidatura para receberes o dossier completo do programa, incluindo opções de financiamento e bolsas disponíveis.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4" className="border-b-2 border-border py-4">
              <AccordionTrigger className="text-xl font-display font-bold text-secondary hover:text-primary hover:no-underline">Preciso de ter experiência prévia?</AccordionTrigger>
              <AccordionContent className="text-lg text-muted-foreground font-medium pt-4">
                Não. Ajudamos quer pessoas sem qualquer experiência (primeiro emprego), quer profissionais com experiência que procuram recolocação ou progressão na carreira.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* 10. FORMULÁRIO DE INSCRIÇÃO */}
      <section id="inscricao" className="py-24 md:py-32 bg-secondary text-white px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-display font-black text-white mb-6 uppercase tracking-tight">O momento é agora.</h2>
            <p className="text-xl text-white/70 font-medium">
              Apenas candidatos com perfil ajustado serão contactados. Preenche com rigor.
            </p>
          </div>

          <div className="bg-background/5 p-8 md:p-12 border border-white/10 shadow-2xl">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white uppercase tracking-widest text-xs font-bold">Nome Completo</FormLabel>
                        <FormControl>
                          <Input placeholder="O teu nome" {...field} className="bg-transparent border-white/20 text-white rounded-none h-14 focus-visible:border-primary focus-visible:ring-0" />
                        </FormControl>
                        <FormMessage className="text-primary" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white uppercase tracking-widest text-xs font-bold">E-mail</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="O teu melhor e-mail" {...field} className="bg-transparent border-white/20 text-white rounded-none h-14 focus-visible:border-primary focus-visible:ring-0" />
                        </FormControl>
                        <FormMessage className="text-primary" />
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
                        <FormLabel className="text-white uppercase tracking-widest text-xs font-bold">Província/Cidade</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-transparent border-white/20 text-white rounded-none h-14 focus:ring-0 focus:border-primary">
                              <SelectValue placeholder="Onde resides?" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-secondary border-white/20 text-white rounded-none">
                            <SelectItem value="luanda">Luanda</SelectItem>
                            <SelectItem value="viana">Viana</SelectItem>
                            <SelectItem value="benguela">Benguela</SelectItem>
                            <SelectItem value="lobito">Lobito</SelectItem>
                            <SelectItem value="outra">Outra província</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-primary" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="profile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white uppercase tracking-widest text-xs font-bold">Perfil Actual</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-transparent border-white/20 text-white rounded-none h-14 focus:ring-0 focus:border-primary">
                              <SelectValue placeholder="Qual é a tua situação?" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-secondary border-white/20 text-white rounded-none">
                            <SelectItem value="estudante">Estudante Universitário</SelectItem>
                            <SelectItem value="recem_formado">Recém-Licenciado</SelectItem>
                            <SelectItem value="desempregado">Procura de Emprego</SelectItem>
                            <SelectItem value="empregado">Empregado (Procura de Transição)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-primary" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white uppercase tracking-widest text-xs font-bold">Porque mereces uma vaga? (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Conta-nos um pouco sobre a tua ambição..." 
                          className="resize-none bg-transparent border-white/20 text-white rounded-none h-32 focus-visible:border-primary focus-visible:ring-0"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-primary" />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isSubmitting} className="w-full rounded-none h-16 bg-primary text-primary-foreground hover:bg-primary/90 text-lg font-bold uppercase tracking-wider disabled:opacity-50">
                  {isSubmitting ? "A Submeter..." : "Inscrever-me no Programa"}
                  {!isSubmitting && <ArrowRight className="ml-2 w-5 h-5" />}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </section>

      {/* 11. RODAPÉ */}
      <footer className="bg-secondary text-white py-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-none bg-primary flex items-center justify-center text-primary-foreground font-display font-black text-xl">
              C
            </div>
            <span className="font-display font-black text-xl tracking-tight uppercase">CARREIRA 360°</span>
          </div>
          
          <div className="text-white/50 text-sm font-medium text-center md:text-left">
            <p>Operações em Luanda, Viana, Benguela e Lobito.</p>
            <p className="mt-1">Contacto: programa@carreira360.ao</p>
          </div>
          
          <div className="text-white/50 text-sm font-bold uppercase tracking-widest">
            &copy; {new Date().getFullYear()} CARREIRA 360°
          </div>
        </div>
      </footer>
    </div>
  );
}
