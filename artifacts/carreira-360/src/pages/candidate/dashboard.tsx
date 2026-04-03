import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function CandidateDashboard() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedStr = localStorage.getItem("user");
    if (!storedStr) {
      setLocation("/auth/login");
      return;
    }
    const parsedUser = JSON.parse(storedStr);
    if (parsedUser.role !== "candidato") {
      setLocation("/");
      return;
    }
    setUser(parsedUser);
  }, [setLocation]);

  if (!user) return <div className="min-h-screen bg-[#001F33]"></div>;

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col p-8">
      <h1 className="text-3xl font-display text-[#001F33] mb-4 uppercase">Painel do Candidato</h1>
      <p className="font-sans text-[#001F33]/80">Bem-vindo, {user.name}!</p>
      <div className="mt-8 p-8 bg-white shadow-xl border-l-4 border-[#0EA5E9] rounded-xl max-w-2xl">
        <h2 className="text-xl font-display text-[#0EA5E9] mb-2 uppercase">Módulo de IA em Desenvolvimento</h2>
        <p className="mb-4">As tuas trilhas de carreira gamificadas e gerador de CV estão a ser construídos de acordo com o plano do projeto!</p>
        <Button onClick={() => {
          localStorage.clear();
          setLocation("/");
        }}>Sair</Button>
      </div>
    </div>
  );
}
