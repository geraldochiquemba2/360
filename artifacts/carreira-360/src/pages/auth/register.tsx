import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema } from "@workspace/api-zod";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { angolaLocations } from "@/lib/angola-locations";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isPendingApproval, setIsPendingApproval] = useState(false);
  const [registeredUser, setRegisteredUser] = useState<any>(null);

  const form = useForm({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      role: "candidato",
      formation: "",
      areaOfInterest: "",
      experienceLevel: "",
      careerGoals: "",
      difficulties: [] as string[],
      province: "",
      municipality: "",
      socialLink: "",
      cvFile: undefined as any,
    },
  });

  async function onSubmit(values: any): Promise<void> {
    setIsLoading(true);
    console.log("[Register] Form values:", values);
    try {
      const formData = new FormData();
      Object.keys(values).forEach(key => {
        const value = values[key];
        if (key === 'cvFile' && value) {
          console.log(`[Register] Attaching ${key}:`, value.name || "File");
          formData.append(key, value);
        } else if (key === 'difficulties' && Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else if (value !== undefined && value !== null && value !== "") {
          formData.append(key, String(value));
        }
      });

      if (!formData.has("cvFile")) {
        console.error("[Register] No cvFile in FormData!");
        throw new Error("O envio do CV em PDF é obrigatório.");
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Erro ao registar");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      if (data.requiresApproval) {
        setRegisteredUser(data.user);
        setIsPendingApproval(true);
        toast({ title: "Registo Concluído", description: "O teu perfil está agora em análise." });
        return;
      }

      toast({ title: "Bem-vindo!", description: "Conta criada com sucesso." });
      
      if (data.user?.role === "admin") {
        setLocation("/admin");
      } else if (data.user?.role === "mentor") {
        setLocation("/mentor");
      } else {
        setLocation("/dashboard");
      }
      return;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro no Registo",
        description: error.message,
      });
      return;
    } finally {
      setIsLoading(false);
    }
  }

  // Unificação de Steps finalizada: Form num único eixo

  const difficultiesOptions = [
    { id: "entrevistas", label: "Entrevistas" },
    { id: "cv", label: "Construção de CV" },
    { id: "experiencia", label: "Falta de experiência" },
    { id: "networking", label: "Networking" },
  ];

  if (isPendingApproval) {
    return (
      <div className="min-h-screen bg-[#001F33] text-white flex flex-col justify-center items-center p-6 py-12 md:py-6 relative overflow-hidden font-sans">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#0EA5E9]/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#F97316]/10 blur-[120px] rounded-full"></div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg bg-white/5 backdrop-blur-xl border-4 border-[#F97316] p-8 md:p-12 shadow-[16px_16px_0px_0px_rgba(14,165,233,1)] flex flex-col items-center text-center"
        >
          <img src="/assets/logo.png" alt="Carreira 360" className="h-20 w-auto object-contain mb-8" />
          <div className="h-20 w-20 bg-[#F97316]/20 rounded-full flex items-center justify-center mb-6">
            <svg className="h-10 w-10 text-[#F97316]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-display uppercase text-[#F97316] mb-4 tracking-tighter">Pedido em Análise</h2>
          <p className="text-white font-medium mb-8 leading-relaxed">
            Parabéns <strong>{registeredUser?.name}</strong>! O teu registo como <strong>Mentor</strong> foi submetido com sucesso. 
            <br/><br/>
            Como parte do nosso compromisso com a qualidade, todos os perfis de mentores são revistos manualmente pela nossa equipa antes de serem ativados.
          </p>
          
          <div className="bg-white/5 p-6 border border-white/10 mb-8 w-full text-left">
            <p className="text-[10px] text-[#0EA5E9] mb-1 uppercase tracking-widest font-bold">Próximos Passos</p>
            <p className="text-sm text-white/70">Receberás uma notificação assim que o teu perfil for validado. Podes fechar esta página agora.</p>
          </div>

          <Button 
            onClick={() => setLocation("/auth/login")} 
            className="w-full h-16 bg-[#0EA5E9] hover:bg-[#F97316] text-[#001F33] font-display text-xl uppercase rounded-none transition-all"
          >
            Voltar ao Login
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#001F33] text-white flex flex-col justify-center items-center p-6 py-12 md:py-6 relative overflow-hidden font-sans">
      {/* Back Button */}
      <div className="w-full max-w-2xl flex justify-start mb-6 z-20 relative">
        <Link href="/">
          <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10 uppercase font-bold tracking-widest text-xs flex items-center gap-2 px-2 -ml-2">
            ← Voltar para o Início
          </Button>
        </Link>
      </div>

      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#0EA5E9]/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#F97316]/10 blur-[120px] rounded-full"></div>

      <motion.div 
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full max-w-2xl bg-white/5 backdrop-blur-xl border-4 border-[#0EA5E9] p-8 md:p-12 shadow-[16px_16px_0px_0px_rgba(249,115,22,1)]"
      >
        <div className="mb-10 flex flex-col items-center">
          <Link href="/">
            <img 
              src="/assets/logo.png" 
              alt="Carreira 360" 
              className="h-20 md:h-24 w-auto object-contain mb-10 cursor-pointer hover:scale-105 transition-transform"
            />
          </Link>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-6">
              <h3 className="text-xl font-bold border-b border-white/10 pb-2 mb-4 text-[#0EA5E9]">Dados Pessoais</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#0EA5E9] uppercase tracking-widest font-bold">Nome Completo</FormLabel>
                        <FormControl>
                          <Input placeholder="O teu nome" {...field} className="bg-white/5 border-2 border-white/20 text-white h-14 rounded-none focus-visible:border-[#0EA5E9] focus-visible:ring-0" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#0EA5E9] uppercase tracking-widest font-bold">Telemóvel</FormLabel>
                        <FormControl>
                          <Input placeholder="9XX XXX XXX" {...field} className="bg-white/5 border-2 border-white/20 text-white h-14 rounded-none focus-visible:border-[#0EA5E9] focus-visible:ring-0" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0EA5E9] uppercase tracking-widest font-bold">E-mail</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="O teu melhor e-mail" {...field} className="bg-white/5 border-2 border-white/20 text-white h-14 rounded-none focus-visible:border-[#0EA5E9] focus-visible:ring-0" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0EA5E9] uppercase tracking-widest font-bold">Palavra-passe</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} className="bg-white/5 border-2 border-white/20 text-white h-14 rounded-none focus-visible:border-[#0EA5E9] focus-visible:ring-0" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  
                  <div className="w-full h-px bg-white/10 my-6"></div>
                  <h3 className="text-xl font-bold border-b border-white/10 pb-2 mb-4 text-[#0EA5E9]">O Seu Perfil na Plataforma</h3>

                  <FormField control={form.control} name="role" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0EA5E9] uppercase tracking-widest font-bold">Eu sou um...</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white/5 border-2 border-white/20 text-white h-16 rounded-none focus-visible:border-[#0EA5E9] focus-visible:ring-0">
                            <SelectValue placeholder="Escolhe o teu perfil" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#001F33] border-[#0EA5E9] text-white max-h-[300px]">
                          <SelectItem value="candidato">Candidato (Jovem à procura de emprego)</SelectItem>
                          <SelectItem value="mentor">Mentor (Recrutador / Profissional)</SelectItem>
                          <SelectItem value="admin">Administrador (Gestão da Plataforma)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                  <p className="text-white/50 text-sm">
                    {form.watch("role") === "candidato" 
                      ? "Como candidato, terás acesso a trilhas de carreira, simulações de entrevistas e assistência técnica no teu CV." 
                      : "Como mentor, poderás ajudar jovens candidatos com feedbacks reais e orientações de carreira."}
                  </p>
                  
                  <div className="w-full h-px bg-white/10 my-6"></div>
                  <h3 className="text-xl font-bold border-b border-white/10 pb-2 mb-4 text-[#0EA5E9]">Detalhes Académicos & Interesse</h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="formation" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#0EA5E9] uppercase tracking-widest font-bold block mb-2">Formação Académica</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white/5 border-2 border-white/20 text-white h-14 rounded-none focus-visible:border-[#0EA5E9]">
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-[#001F33] border-[#0EA5E9] text-white max-h-[300px]">
                            <SelectItem value="Ensino Médio">Ensino Médio</SelectItem>
                            <SelectItem value="Técnico Médio">Técnico Médio</SelectItem>
                            <SelectItem value="Frequência Universitária">Frequência Universitária</SelectItem>
                            <SelectItem value="Licenciatura">Licenciatura</SelectItem>
                            <SelectItem value="Mestrado/Pós-Graduação">Mestrado/Pós-Graduação</SelectItem>
                            <SelectItem value="Outro">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="areaOfInterest" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#0EA5E9] uppercase tracking-widest font-bold block mb-2">Área de Interesse</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white/5 border-2 border-white/20 text-white h-14 rounded-none focus-visible:border-[#0EA5E9]">
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-[#001F33] border-[#0EA5E9] text-white max-h-[300px]">
                            <SelectItem value="Tecnologia / TI">Tecnologia / TI</SelectItem>
                            <SelectItem value="Marketing & Design">Marketing & Design</SelectItem>
                            <SelectItem value="Finanças & Gestão">Finanças & Gestão</SelectItem>
                            <SelectItem value="Engenharia">Engenharia</SelectItem>
                            <SelectItem value="Saúde">Saúde</SelectItem>
                            <SelectItem value="Direito">Direito</SelectItem>
                            <SelectItem value="Recursos Humanos">Recursos Humanos</SelectItem>
                            <SelectItem value="Logística e Transportes">Logística e Transportes</SelectItem>
                            <SelectItem value="Hotelaria e Turismo">Hotelaria e Turismo</SelectItem>
                            <SelectItem value="Agronegócio">Agronegócio</SelectItem>
                            <SelectItem value="Energias Renováveis">Energias Renováveis</SelectItem>
                            <SelectItem value="Educação e Formação">Educação e Formação</SelectItem>
                            <SelectItem value="Vendas e Atendimento ao Cliente">Vendas e Atendimento ao Cliente</SelectItem>
                            <SelectItem value="Comunicação e Jornalismo">Comunicação e Jornalismo</SelectItem>
                            <SelectItem value="Outra Área">Outra Área</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="cvFile" render={({ field: { value, onChange, ...fieldProps } }) => (
                      <FormItem>
                        <FormLabel className="text-[#0EA5E9] uppercase tracking-widest font-bold">Curriculum Vitae (Apenas PDF) *</FormLabel>
                        <FormControl>
                          <Input 
                            type="file" 
                            accept="application/pdf"
                            onChange={(event) => {
                              onChange(event.target.files && event.target.files[0]);
                            }}
                            {...fieldProps}
                            className="bg-white/5 border-2 border-white/20 text-white h-14 rounded-none file:mr-4 file:py-3 file:px-4 file:rounded-none file:border-0 file:text-xs file:font-semibold file:bg-[#0EA5E9] file:text-[#001F33] hover:file:bg-[#F97316] hover:file:text-white cursor-pointer px-0 py-0" 
                          />
                        </FormControl>
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="socialLink" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#0EA5E9] uppercase tracking-widest font-bold">LinkedIn / Portfólio (Opcional)</FormLabel>
                        <FormControl>
                          <Input type="url" placeholder="https://linkedin.com/in/..." {...field} className="bg-white/5 border-2 border-white/20 text-white h-14 rounded-none" />
                        </FormControl>
                      </FormItem>
                    )} />
                  </div>
                  
                  <FormField control={form.control} name="experienceLevel" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0EA5E9] uppercase tracking-widest font-bold">Nível de Experiência</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white/5 border-2 border-white/20 text-white h-14 rounded-none">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#001F33] border-[#0EA5E9] text-white max-h-[300px]">
                          <SelectItem value="nenhuma">Sem Experiência</SelectItem>
                          <SelectItem value="estagio">Estágio / Junior</SelectItem>
                          <SelectItem value="pleno">Pleno</SelectItem>
                          <SelectItem value="senior">Sénior</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="province" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#0EA5E9] uppercase tracking-widest font-bold">Província</FormLabel>
                        <Select onValueChange={(val) => { field.onChange(val); form.setValue("municipality", ""); }} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger className="bg-white/5 border-2 border-white/20 text-white h-14 rounded-none">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-[#001F33] border-[#0EA5E9] text-white max-h-[300px]">
                            {angolaLocations.map(p => <SelectItem key={p.nome} value={p.nome}>{p.nome}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="municipality" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#0EA5E9] uppercase tracking-widest font-bold">Município</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""} disabled={!form.watch("province")}>
                          <FormControl>
                            <SelectTrigger className="bg-white/5 border-2 border-white/20 text-white h-14 rounded-none">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-[#001F33] border-[#0EA5E9] text-white max-h-[300px]">
                            {form.watch("province") && angolaLocations.find(p => p.nome === form.watch("province"))?.municipios.map(m => (
                              <SelectItem key={m} value={m}>{m}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[#0EA5E9] uppercase tracking-widest font-bold block mb-2">Principais Dificuldades (Opcional)</label>
                    <div className="grid grid-cols-2 gap-4">
                      {difficultiesOptions.map(opt => (
                        <div key={opt.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={opt.id} 
                            onCheckedChange={(checked) => {
                              const curr = form.getValues("difficulties") as string[] || [];
                              if (checked) form.setValue("difficulties", [...curr, opt.label]);
                              else form.setValue("difficulties", curr.filter(i => i !== opt.label));
                            }}
                          />
                          <label htmlFor={opt.id} className="text-sm font-medium uppercase tracking-tight">{opt.label}</label>
                        </div>
                      ))}
                    </div>
                  </div>
            </div>

            <div className="flex justify-end pt-8 border-t border-white/10 mt-6">
              <Button type="submit" disabled={isLoading} className="h-14 px-8 bg-[#0EA5E9] hover:bg-[#F97316] text-[#001F33] uppercase font-display text-lg rounded-none w-full md:w-auto min-w-[250px]">
                {isLoading ? "A Criar Conta..." : "Submeter Registo"}
              </Button>
            </div>
          </form>
        </Form>

        <div className="mt-8 text-center">
          <p className="text-white/40 font-medium font-sans">
            Já tens conta?{" "}
            <Link href="/auth/login" className="text-[#0EA5E9] font-bold hover:underline">Entra aqui</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
