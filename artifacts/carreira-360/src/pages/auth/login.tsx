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

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

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
      if (!response.ok) {
        throw new Error(data.error || "Erro ao entrar");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      toast({ title: "Bem-vindo!", description: "Login realizado com sucesso." });
      setLocation("/");
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

  return (
    <div className="min-h-screen bg-[#001F33] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Back Button */}
      <div className="absolute top-8 left-8 z-20">
        <Link href="/">
          <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10 uppercase font-bold tracking-widest text-xs flex items-center gap-2">
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
              className="h-16 w-auto object-contain mb-4 cursor-pointer hover:scale-105 transition-transform"
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
    </div>
  );
}
