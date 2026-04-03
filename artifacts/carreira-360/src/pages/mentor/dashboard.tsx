import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function MentorDashboard() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedStr = localStorage.getItem("user");
    if (!storedStr) {
      setLocation("/auth/login");
      return;
    }
    const parsedUser = JSON.parse(storedStr);
    if (parsedUser.role !== "mentor") {
      setLocation("/");
      return;
    }
    setUser(parsedUser);
  }, [setLocation]);

  if (!user) return <div className="min-h-screen bg-[#001F33]"></div>;

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col p-8">
      <h1 className="text-3xl font-display text-[#001F33] mb-4 uppercase">Painel do Mentor</h1>
      <p className="font-sans text-[#001F33]/80">Bem-vindo, {user.name}!</p>
      <div className="mt-8 p-8 bg-white shadow-xl border-l-4 border-[#F97316] rounded-xl max-w-2xl">
        <h2 className="text-xl font-display text-[#F97316] mb-2 uppercase">Página em Construção</h2>
        <p className="mb-4">O teu acesso para simulações e revisão de CVs estará disponível brevemente.</p>
        <Button onClick={() => {
          localStorage.clear();
          setLocation("/");
        }}>Sair</Button>
      </div>
    </div>
  );
}
