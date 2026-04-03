import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema } from "@workspace/api-zod";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

const steps = ["Dados Básicos", "Perfil", "Detalhes"];

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

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
    },
  });

  async function onSubmit(values: any): Promise<void> {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Erro ao registar");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      toast({ title: "Bem-vindo!", description: "Conta criada com sucesso." });
      setLocation("/");
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

  const nextStep = (): void => {
    if (step === 1) {
      // Basic validation for step 1
      const fields = ["name", "email", "phone", "password"];
      const isValid = fields.every(f => form.getValues(f as any));
      if (!isValid) {
        toast({ title: "Campos em falta", description: "Preencha todos os campos básicos." });
        return;
      }
    }
    setStep(s => s + 1);
  };

  const prevStep = () => setStep(s => s - 1);

  const difficultiesOptions = [
    { id: "entrevistas", label: "Entrevistas" },
    { id: "cv", label: "Construção de CV" },
    { id: "experiencia", label: "Falta de experiência" },
    { id: "networking", label: "Networking" },
  ];

  return (
    <div className="min-h-screen bg-[#001F33] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans pt-20">
      {/* Back Button */}
      <div className="absolute top-8 left-8 z-20">
        <Link href="/">
          <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10 uppercase font-bold tracking-widest text-xs flex items-center gap-2">
            ← Voltar para o Início
          </Button>
        </Link>
      </div>

      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#0EA5E9]/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#F97316]/10 blur-[120px] rounded-full"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-white/5 backdrop-blur-xl border-4 border-[#0EA5E9] p-8 md:p-12 shadow-[16px_16px_0px_0px_rgba(249,115,22,1)]"
      >
        <div className="mb-10 flex flex-col items-center">
          <Link href="/">
            <img 
              src="/assets/logo.png" 
              alt="Carreira 360" 
              className="h-20 w-auto object-contain mb-6 cursor-pointer hover:scale-105 transition-transform"
            />
          </Link>
          <div className="flex items-center gap-4 w-full">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold font-display ${step > i ? 'bg-[#0EA5E9] text-[#001F33]' : 'bg-white/10 text-white/40'}`}>
                  {i + 1}
                </div>
                <span className={`hidden md:block text-xs uppercase tracking-widest font-bold ${step === i + 1 ? 'text-[#0EA5E9]' : 'text-white/40'}`}>
                  {s}
                </span>
                {i < steps.length - 1 && <div className="h-[2px] w-4 md:w-8 bg-white/10"></div>}
              </div>
            ))}
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
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
                </motion.div>
              )}

              {step === 2 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <FormField control={form.control} name="role" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0EA5E9] uppercase tracking-widest font-bold">Eu sou um...</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white/5 border-2 border-white/20 text-white h-16 rounded-none focus-visible:border-[#0EA5E9] focus-visible:ring-0">
                            <SelectValue placeholder="Escolhe o teu perfil" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#001F33] border-[#0EA5E9] text-white">
                          <SelectItem value="candidato">Candidato (Jovem à procura de emprego)</SelectItem>
                          <SelectItem value="mentor">Mentor (Recrutador / Profissional)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                  <p className="text-white/50 text-sm">
                    {form.watch("role") === "candidato" 
                      ? "Como candidato, terás acesso a trilhas de carreira, simulações de entrevistas e assistência técnica no teu CV." 
                      : "Como mentor, poderás ajudar jovens candidatos com feedbacks reais e orientações de carreira."}
                  </p>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="formation" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#0EA5E9] uppercase tracking-widest font-bold">Formação Académica</FormLabel>
                        <FormControl>
                          <Input placeholder="Licenciatura em..." {...field} className="bg-white/5 border-2 border-white/20 text-white h-14 rounded-none" />
                        </FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="areaOfInterest" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#0EA5E9] uppercase tracking-widest font-bold">Área de Interesse</FormLabel>
                        <FormControl>
                          <Input placeholder="TI, Marketing, Finanças..." {...field} className="bg-white/5 border-2 border-white/20 text-white h-14 rounded-none" />
                        </FormControl>
                      </FormItem>
                    )} />
                  </div>
                  
                  <FormField control={form.control} name="experienceLevel" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0EA5E9] uppercase tracking-widest font-bold">Nível de Experiência</FormLabel>
                      <Select onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="bg-white/5 border-2 border-white/20 text-white h-14 rounded-none">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#001F33] border-[#0EA5E9] text-white">
                          <SelectItem value="nenhuma">Sem Experiência</SelectItem>
                          <SelectItem value="estagio">Estágio / Junior</SelectItem>
                          <SelectItem value="pleno">Pleno</SelectItem>
                          <SelectItem value="senior">Sénior</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />

                  <div className="space-y-4">
                    <FormLabel className="text-[#0EA5E9] uppercase tracking-widest font-bold block mb-2">Principais Dificuldades (Opcional)</FormLabel>
                    <div className="grid grid-cols-2 gap-4">
                      {difficultiesOptions.map(opt => (
                        <div key={opt.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={opt.id} 
                            onCheckedChange={(checked) => {
                              const curr = form.getValues("difficulties") as string[];
                              if (checked) form.setValue("difficulties", [...curr, opt.label]);
                              else form.setValue("difficulties", curr.filter(i => i !== opt.label));
                            }}
                          />
                          <label htmlFor={opt.id} className="text-sm font-medium uppercase tracking-tight">{opt.label}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-between pt-8">
              {step > 1 && (
                <Button type="button" onClick={prevStep} variant="outline" className="h-14 px-8 rounded-none border-2 border-white/20 bg-transparent hover:bg-white/10 uppercase font-display text-lg">
                  Voltar
                </Button>
              )}
              {step < 3 ? (
                <Button type="button" onClick={nextStep} className="h-14 px-8 ms-auto bg-[#0EA5E9] hover:bg-[#F97316] text-[#001F33] uppercase font-display text-lg rounded-none">
                  Seguinte
                </Button>
              ) : (
                <Button type="submit" disabled={isLoading} className="h-14 px-8 ms-auto bg-[#0EA5E9] hover:bg-[#F97316] text-[#001F33] uppercase font-display text-lg rounded-none">
                   {isLoading ? "A Criar Conta..." : "Concluir Cadastro"}
                </Button>
              )}
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
