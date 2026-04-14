import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema } from "@workspace/api-zod";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isPendingProfile, setIsPendingProfile] = useState(false);
  const [isRejectedProfile, setIsRejectedProfile] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [currentUserData, setCurrentUserData] = useState<any>(null);

  const form = useForm({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: any) {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();
      if (response.status === 403) {
        setRejectionReason(data.rejectionReason || "O motivo não foi especificado.");
        setIsRejectedProfile(true);
        return;
      }
      if (!response.ok) {
        throw new Error(data.error || "Erro ao entrar");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      if (data.requiresApproval) {
        setIsPendingProfile(true);
        setCurrentUserData(data.user);
        return; // Don't navigate, show pending screen
      }

      toast({ title: "Bem-vindo!", description: "Login realizado com sucesso." });
      
      if (data.user?.role === "admin") {
        setLocation("/admin");
      } else if (data.user?.role === "mentor") {
        setLocation("/mentor");
      } else {
        setLocation("/dashboard");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro no Login",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function cancelRequest() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/cancel-request", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json"
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erro ao cancelar pedido");
      
      toast({ title: "Cancelado", description: "O seu pedido e todos os dados foram apagados." });
      setIsPendingProfile(false);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch(err: any) {
      toast({ variant: "destructive", title: "Erro", description: err.message });
    } finally {
      setIsLoading(false);
    }
  }

  if (isPendingProfile) {
    return (
      <div className="min-h-screen bg-[#001F33] text-white flex flex-col justify-center items-center p-6 py-12 md:py-6 relative overflow-hidden font-sans">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#0EA5E9]/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#F97316]/10 blur-[120px] rounded-full"></div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg bg-white/5 backdrop-blur-xl border-4 border-[#0EA5E9] p-8 md:p-12 shadow-[16px_16px_0px_0px_rgba(249,115,22,1)] flex flex-col items-center text-center"
        >
          <img src="/assets/logo.png" alt="Carreira 360" className="h-20 w-auto object-contain mb-8" />
          <h2 className="text-2xl font-bold text-[#0EA5E9] mb-4 uppercase tracking-wider">Aprovação Pendente</h2>
          <p className="text-white/80 mb-6">
            Olá <strong>{currentUserData?.name}</strong>, a tua conta e os teus dados encontram-se atualmente em revisão. A nossa equipa irá avaliar a tua candidatura antes de libertar o acesso.
          </p>
          
          <div className="bg-black/20 p-4 border border-white/10 mb-8 w-full">
            <p className="text-sm text-white/60 mb-1 uppercase tracking-widest font-bold text-left">E-mail Registo</p>
            <p className="text-white font-medium text-left lowercase">{currentUserData?.email}</p>
          </div>

          <p className="text-sm text-white/50 mb-6">
            Se desististe ou tiveste algum contratempo, podes apagar os teus dados já.
          </p>

          <Button 
            onClick={cancelRequest} 
            disabled={isLoading}
            variant="destructive"
            className="w-full h-14 font-display text-xl uppercase rounded-none border-2 border-red-500/50 hover:border-red-500 hover:bg-red-500/20"
          >
            {isLoading ? "A Cancelar..." : "Cancelar Pedido"}
          </Button>

          <Button 
            onClick={() => { setIsPendingProfile(false); localStorage.removeItem("token"); }} 
            variant="ghost"
            className="mt-4 text-white/50 hover:text-white uppercase tracking-widest text-xs"
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
      <div className="w-full max-w-md flex justify-start mb-6 z-20 relative">
        <Link href="/">
          <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10 uppercase font-bold tracking-widest text-xs flex items-center gap-2 px-2 -ml-2">
            ← Voltar para o Início
          </Button>
        </Link>
      </div>

      {/* Background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#0EA5E9]/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#F97316]/10 blur-[120px] rounded-full"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-xl border-4 border-[#0EA5E9] p-8 md:p-12 shadow-[16px_16px_0px_0px_rgba(249,115,22,1)]"
      >
        <div className="mb-8 text-center flex flex-col items-center">
          <Link href="/">
            <img 
              src="/assets/logo.png" 
              alt="Carreira 360" 
              className="h-24 md:h-32 w-auto object-contain mb-8 cursor-pointer hover:scale-105 transition-transform"
            />
          </Link>
          <p className="text-white/50 font-medium uppercase tracking-widest text-sm">Entra na tua conta</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#0EA5E9] uppercase tracking-widest font-bold">E-mail</FormLabel>
                <FormControl>
                  <Input placeholder="O teu e-mail" {...field} className="bg-white/5 border-2 border-white/20 text-white h-14 rounded-none focus-visible:border-[#0EA5E9] focus-visible:ring-0 placeholder:text-white/20" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#0EA5E9] uppercase tracking-widest font-bold">Palavra-passe</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} className="bg-white/5 border-2 border-white/20 text-white h-14 rounded-none focus-visible:border-[#0EA5E9] focus-visible:ring-0 placeholder:text-white/20" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <Button 
              type="submit" 
              className="w-full h-14 bg-[#0EA5E9] hover:bg-[#F97316] text-[#001F33] font-display text-xl uppercase rounded-none transition-colors"
              disabled={isLoading}
            >
              {isLoading ? "A Processar..." : "Entrar"}
            </Button>
          </form>
        </Form>

        <div className="mt-8 text-center">
          <p className="text-white/40 font-medium font-sans">
            Ainda não tens conta?{" "}
            <Link href="/auth/register" className="text-[#0EA5E9] font-bold hover:underline">Regista-te agora</Link>
          </p>
        </div>
      </motion.div>

      {/* Modal de Recusa */}
      <Dialog open={isRejectedProfile} onOpenChange={setIsRejectedProfile}>
        <DialogContent className="max-w-md bg-[#EBDCC6] border-4 border-red-500 rounded-none p-10 shadow-[16px_16px_0px_0px_rgba(239,68,68,1)]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display uppercase text-red-600 tracking-tighter">Perfil Recusado</DialogTitle>
          </DialogHeader>
          <div className="py-6 space-y-6">
            <div className="bg-red-50 p-6 border-2 border-red-200">
              <p className="text-[10px] font-bold uppercase tracking-widest text-red-600 mb-2">Motivo da Decisão:</p>
              <p className="text-[#001F33] font-bold text-lg leading-tight italic">"{rejectionReason}"</p>
            </div>
            <p className="text-sm font-bold text-[#001F33]/60 leading-relaxed">
              Infelizmente, o seu acesso não foi aprovado nesta fase. Verifique o motivo acima e tente contactar o suporte se acreditar que houve um erro.
            </p>
          </div>
          <DialogFooter>
            <Button 
              onClick={() => setIsRejectedProfile(false)} 
              className="w-full bg-[#001F33] text-white uppercase font-bold text-xs h-16 rounded-none shadow-xl hover:bg-[#0EA5E9] transition-all tracking-[0.2em]"
            >
              Entendido, Tentar Novamente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
