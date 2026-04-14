import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Settings, 
  Save, 
  Linkedin, 
  Tag, 
  User,
  Menu,
  CheckCircle,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { MentorSidebar } from "@/components/layout/MentorSidebar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function MentorSettings() {
  const [location, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Profile state
  const [profile, setProfile] = useState({
    bio: "",
    specialties: "",
    linkedinUrl: "",
    name: "",
    email: ""
  });

  const { toast } = useToast();

  useEffect(() => {
    const storedStr = localStorage.getItem("user");
    if (!storedStr) {
      setLocation("/auth/login");
      return;
    }
    const parsedUser = JSON.parse(storedStr);
    setUser(parsedUser);
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("/api/mentorship/profile", {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProfile({
          bio: data.bio || "",
          specialties: data.specialties || "",
          linkedinUrl: data.linkedinUrl || "",
          name: data.name || "",
          email: data.email || ""
        });
      }
    } catch (err) {
      console.error("Erro ao buscar perfil", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("/api/mentorship/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          bio: profile.bio,
          specialties: profile.specialties,
          linkedinUrl: profile.linkedinUrl
        })
      });

      if (response.ok) {
        toast({ 
           title: "Perfil Atualizado", 
           description: "As suas alterações foram guardadas com sucesso." 
        });
      }
    } catch (err) {
      toast({ title: "Erro", description: "Falha ao guardar perfil.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <div className="min-h-screen bg-[#001F33]"></div>;

  return (
    <div className="min-h-screen bg-[#EBDCC6] flex font-sans text-[#001F33] relative overflow-x-hidden">
      <MentorSidebar 
        currentTab="settings"
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        user={user}
      />

      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
          />
        )}
      </AnimatePresence>

      <main className="flex-1 md:ml-72 min-h-screen p-4 sm:p-10 overflow-hidden">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden text-[#001F33]"
            >
              <Menu size={24} />
            </Button>
            <div>
              <h1 className="text-2xl md:text-4xl font-display uppercase tracking-tight text-[#001F33]">Configurações</h1>
              <p className="text-[#001F33]/50 font-medium text-xs md:text-sm">Personaliza o teu perfil público de mentor.</p>
            </div>
          </div>
          <Button 
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto bg-[#001F33] hover:bg-[#F97316] text-white uppercase font-bold text-[10px] tracking-widest h-12 px-6 rounded-xl shadow-lg shadow-[#001F33]/20 transition-all"
          >
            {saving ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div> : <Save className="mr-2 h-4 w-4" />}
            Guardar Alterações
          </Button>
        </header>

        <div className="max-w-4xl">
          {loading ? (
             <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-4 border-[#F97316] border-t-transparent rounded-full"></div></div>
          ) : (
            <div className="space-y-8">
               {/* Secção: Informação Básica */}
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="bg-white p-5 sm:p-8 rounded-[28px] sm:rounded-[2.5rem] shadow-sm border-2 sm:border-4 border-[#8B4513]"
               >
                  <div className="flex items-center gap-3 mb-8">
                     <div className="h-10 w-10 bg-[#0EA5E9]/10 rounded-xl flex items-center justify-center text-[#0EA5E9]">
                        <User size={20} />
                     </div>
                     <h3 className="text-xl font-display uppercase text-[#001F33]">Informação Principal</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-[#001F33]/40 tracking-widest pl-1">Nome Completo</label>
                        <Input value={profile.name} disabled className="h-12 bg-gray-50 border-[#8B4513]/20 rounded-xl font-semibold opacity-70" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-[#001F33]/40 tracking-widest pl-1">E-mail de Contacto</label>
                        <Input value={profile.email} disabled className="h-12 bg-gray-50 border-[#8B4513]/20 rounded-xl font-semibold opacity-70" />
                     </div>
                  </div>
                  <p className="mt-4 text-[10px] text-[#001F33]/40 italic">* Para alterar o nome ou e-mail, por favor contacte a administração.</p>
               </motion.div>

               {/* Secção: Dados de Mentoria */}
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.1 }}
                 className="bg-white p-5 sm:p-8 rounded-[28px] sm:rounded-[2.5rem] shadow-sm border-2 sm:border-4 border-[#8B4513]"
               >
                  <div className="flex items-center gap-3 mb-8">
                     <div className="h-10 w-10 bg-[#F97316]/10 rounded-xl flex items-center justify-center text-[#F97316]">
                        <Tag size={20} />
                     </div>
                     <h3 className="text-xl font-display uppercase text-[#001F33]">Perfil de Mentoria</h3>
                  </div>

                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-[#001F33]/50 tracking-widest pl-1">Especialidades (separadas por vírgula)</label>
                        <Input 
                           placeholder="Ex: Gestão de Projetos, UI/UX Design, Liderança" 
                           value={profile.specialties}
                           onChange={(e) => setProfile({...profile, specialties: e.target.value})}
                           className="h-12 border-[#8B4513]/50 rounded-xl focus:ring-2 focus:ring-[#0EA5E9]" 
                        />
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-[#001F33]/50 tracking-widest pl-1">Biografia Profissional</label>
                        <Textarea 
                           placeholder="Conta um pouco sobre a tua experiência e como podes ajudar os jovens..." 
                           value={profile.bio}
                           onChange={(e) => setProfile({...profile, bio: e.target.value})}
                           className="min-h-[150px] border-[#8B4513]/50 rounded-2xl focus:ring-2 focus:ring-[#0EA5E9] p-4 text-sm leading-relaxed"
                        />
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-[#001F33]/50 tracking-widest pl-1">Perfil do LinkedIn (URL)</label>
                        <div className="relative">
                           <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600 h-5 w-5" />
                           <Input 
                              placeholder="https://linkedin.com/in/oseunome" 
                              value={profile.linkedinUrl}
                              onChange={(e) => setProfile({...profile, linkedinUrl: e.target.value})}
                              className="h-12 pl-12 border-[#8B4513]/50 rounded-xl focus:ring-2 focus:ring-[#0EA5E9]" 
                           />
                        </div>
                     </div>
                  </div>
               </motion.div>

               <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-100 rounded-2xl text-green-600">
                  <CheckCircle size={18} />
                  <p className="text-xs font-bold uppercase tracking-wider">O seu perfil está visível para candidatos aprovados.</p>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
