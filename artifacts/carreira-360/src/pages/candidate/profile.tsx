import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Save, 
  Globe, 
  FileText, 
  Upload, 
  CheckCircle,
  Menu,
  ChevronRight,
  ExternalLink,
  Target,
  Tag,
  Linkedin,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  Flag
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { CandidateSidebar } from "@/components/layout/CandidateSidebar";
import { MentorSidebar } from "@/components/layout/MentorSidebar";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { angolaLocations } from "@/lib/angola-locations";
import { formationOptions, areaOptions } from "@/lib/options";

export default function ProfileSettingsPage() {
  const [location, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [initialProfile, setInitialProfile] = useState<any>(null);
  const [pendingNav, setPendingNav] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profile, setProfile] = useState({
    name: "",
    socialLink: "",
    cvUrl: "",
    // Mentor specific
    bio: "",
    specialties: "",
    linkedinUrl: "",
    // Extra fields from registration
    phone: "",
    formation: "",
    areaOfInterest: "",
    province: "",
    municipality: "",
    careerGoals: ""
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

  // Verificar alterações não guardadas
  const isDirty = initialProfile && JSON.stringify(profile) !== JSON.stringify(initialProfile);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const handleNavigateRequest = (href: string) => {
    if (isDirty) {
      setPendingNav(href);
    } else {
      if (href === "LOGOUT") {
        localStorage.clear();
        window.location.href = "/";
      } else {
        setLocation(href);
      }
    }
  };

  const confirmNavigation = () => {
    if (!pendingNav) return;
    if (pendingNav === "LOGOUT") {
      localStorage.clear();
      window.location.href = "/";
    } else {
      setLocation(pendingNav);
    }
    setPendingNav(null);
  };

  const validateProfile = (p: any, u: any) => {
    const missing: string[] = [];
    if (!p.name.trim()) missing.push("name");
    if (!p.phone?.trim()) missing.push("phone");
    if (!p.province || p.province === "Selecione") missing.push("province");
    if (!p.municipality || p.municipality === "Selecione") missing.push("municipality");
    if (!p.formation || p.formation === "Selecione") missing.push("formation");
    if (!p.areaOfInterest || p.areaOfInterest === "Selecione") missing.push("areaOfInterest");
    
    if (u?.role === 'mentor') {
      if (!p.specialties?.trim()) missing.push("specialties");
      if (!p.bio?.trim()) missing.push("bio");
      
      const lurl = p.socialLink || p.linkedinUrl || "";
      if (!lurl.trim() || lurl === "https://" || lurl === "https://...") {
         missing.push("socialLink");
      }
    }

    setErrors(missing);
    // Só bloqueia salvamento se o Nome ou Telemóvel estiverem vazios
    const isBlocking = !p.name.trim();
    return { isValid: missing.length === 0, isBlocking };
  };

  // Validação em tempo real
  useEffect(() => {
    if (profile && user) {
      validateProfile(profile, user);
    }
  }, [profile, user]);

  const fetchProfile = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("/api/user/profile", {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Profile data received:", data); 
        const mappedData = {
          name: data.name || data.fullname || "",
          socialLink: data.socialLink || data.social_link || "",
          cvUrl: data.cvUrl || data.cv_url || "",
          bio: data.mentorProfile?.bio || "",
          specialties: data.mentorProfile?.specialties || "",
          linkedinUrl: data.mentorProfile?.linkedinUrl || data.mentorProfile?.linkedin_url || "",
          phone: data.phone || "",
          formation: data.formation || "",
          areaOfInterest: data.areaOfInterest || data.area_of_interest || "",
          province: data.province || "",
          municipality: data.municipality || "",
          careerGoals: data.careerGoals || data.career_goals || ""
        };
        setProfile(mappedData);
        setInitialProfile(mappedData);
        
        // Validar proativamente após carregar os dados
        setTimeout(() => {
          const missing: string[] = [];
          if (!data.name?.trim()) missing.push("name");
          if (!data.phone?.trim()) missing.push("phone");
          if (!data.province || data.province === "Selecione") missing.push("province");
          if (!data.municipality || data.municipality === "Selecione") missing.push("municipality");
          if (!data.formation || data.formation === "Selecione") missing.push("formation");
          if (!data.areaOfInterest || data.areaOfInterest === "Selecione") missing.push("areaOfInterest");
          
          if (data.role === 'mentor') {
            const mp = data.mentorProfile;
            if (!mp?.specialties?.trim()) missing.push("specialties");
            if (!mp?.bio?.trim()) missing.push("bio");
            if (!mp?.linkedinUrl?.trim() || mp?.linkedinUrl === "https://" || mp?.linkedinUrl === "https://...") missing.push("linkedinUrl");
          }
          setErrors(missing);
        }, 100);
      } else {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        toast({ 
          title: "Erro de Carregamento", 
          description: errorData.error || "Não foi possível carregar os teus dados.", 
          variant: "destructive" 
        });
      }
    } catch (err) {
      console.error("Erro ao buscar perfil", err);
      toast({ 
        title: "Erro de Ligação", 
        description: "Falha ao comunicar com o servidor.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };


  const handleSave = async () => {
    const { isBlocking, isValid } = validateProfile(profile, user);
    
    if (isBlocking) {
      toast({ 
        title: "Nome Obrigatório", 
        description: "Por favor, introduz o teu nome para poderes guardar.", 
        variant: "destructive" 
      });
      return;
    }

    if (!isValid) {
      toast({ 
        title: "Perfil Incompleto", 
        description: "As alterações serão guardadas, mas o teu perfil continuará marcado como incompleto.", 
        variant: "default" 
      });
    }

    setSaving(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      });

      if (response.ok) {
        toast({ 
           title: "Perfil Atualizado", 
           description: "As suas alterações foram guardadas com sucesso." 
        });
        setInitialProfile(profile);
        const updatedUser = { ...user, name: profile.name };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
      } else {
        const errorData = await response.json();
        toast({ 
          title: "Erro ao Guardar", 
          description: errorData.error || "Não foi possível guardar as alterações.", 
          variant: "destructive" 
        });
      }
    } catch (err) {
      console.error("Save error:", err);
      toast({ title: "Erro de Ligação", description: "Falha ao comunicar com o servidor.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast({ title: "Erro", description: "Apenas ficheiros PDF são permitidos.", variant: "destructive" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ 
        title: "Ficheiro muito grande", 
        description: "O tamanho máximo permitido para o Currículo é de 5MB.", 
        variant: "destructive" 
      });
      return;
    }

    setUploading(true);
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("cv", file);

    try {
      const response = await fetch("/api/user/cv", {
        method: "POST",
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(prev => ({ ...prev, cvUrl: data.cvUrl }));
        toast({ title: "CV Atualizado", description: "O teu currículo foi carregado com sucesso." });
      }
    } catch (err) {
      toast({ title: "Erro", description: "Falha ao carregar CV.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  if (!user) return <div className="min-h-screen bg-[#001F33]"></div>;

  const Sidebar = user.role === 'mentor' ? MentorSidebar : CandidateSidebar;

  return (
    <div className="min-h-screen bg-[#EBDCC6] flex font-sans text-[#001F33] relative overflow-x-hidden">
      <Sidebar 
        currentTab="profile"
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        onNavigateRequest={handleNavigateRequest}
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

      <main className="flex-1 md:ml-72 min-h-screen p-4 sm:p-10 pt-32 sm:pt-40">
        <header className="fixed top-0 left-0 md:left-72 right-0 z-40 bg-[#EBDCC6]/95 backdrop-blur-md p-4 sm:p-10 border-b border-[#001F33]/5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
                <h1 className="text-xl md:text-2xl font-display uppercase tracking-tight text-[#001F33]">O Meu Perfil</h1>
                <p className="text-[#001F33]/80 font-bold text-[10px] uppercase tracking-wide">Gere as tuas informações e documentos profissionais.</p>
              </div>
            </div>
            <Button 
              onClick={handleSave}
              disabled={saving}
              className="w-full sm:w-auto bg-[#001F33] hover:bg-[#F97316] text-white uppercase font-black text-[10px] tracking-widest h-12 px-8 rounded-xl shadow-lg shadow-[#001F33]/20 transition-all border border-white/10"
            >
              {saving ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div> : <Save className="mr-2 h-4 w-4" />}
              Guardar Alterações
            </Button>
          </div>
        </header>

        <div className="max-w-4xl pb-20">
          {loading ? (
             <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-4 border-[#F97316] border-t-transparent rounded-full"></div></div>
          ) : (
            <div className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Secção: Identidade */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-[#001F33]/5 h-full"
                  >
                     <div className="flex items-center gap-2 mb-4">
                        <div className="h-8 w-8 bg-[#0EA5E9]/10 rounded-lg flex items-center justify-center text-[#0EA5E9]">
                           <User size={16} />
                        </div>
                        <h3 className="text-base font-display uppercase text-[#001F33]">Identidade</h3>
                     </div>
   
                     <div className="space-y-3">
                        <div className="space-y-1">
                           <label className="text-[10px] sm:text-[11px] font-black uppercase text-[#001F33] tracking-widest ml-1">Nome Completo</label>
                           <Input 
                             value={profile.name} 
                             onChange={(e) => setProfile({...profile, name: e.target.value})}
                             className={`h-10 border-[#001F33]/10 rounded-lg font-semibold focus:ring-2 focus:ring-[#0EA5E9] ${errors.includes('name') ? 'border-red-500 ring-1 ring-red-500' : ''}`} 
                           />
                        </div>
                     </div>
                  </motion.div>

                  {/* Secção: Presença Digital */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-[#001F33]/5 h-full"
                  >
                     <div className="flex items-center gap-2 mb-4">
                        <div className="h-8 w-8 bg-[#F97316]/10 rounded-lg flex items-center justify-center text-[#F97316]">
                           <Globe size={16} />
                        </div>
                        <h3 className="text-base font-display uppercase text-[#001F33]">Presença Digital</h3>
                     </div>
   
                     <div className="space-y-3">
                        <div className="space-y-1">
                           <label className="text-[10px] sm:text-[11px] font-black uppercase text-[#001F33] tracking-widest ml-1">LinkedIn / Link Profissional</label>
                           <div className="relative">
                              <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#001F33]/20" />
                              <Input 
                                placeholder="https://" 
                                value={profile.socialLink}
                                onChange={(e) => setProfile({...profile, socialLink: e.target.value, linkedinUrl: e.target.value})}
                                className={`h-10 border-[#001F33]/10 pl-10 rounded-lg font-semibold focus:ring-2 focus:ring-[#0EA5E9] ${errors.includes('socialLink') ? 'border-red-500 ring-1 ring-red-500' : ''}`} 
                              />
                           </div>
                        </div>
                     </div>
                  </motion.div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Secção: Contacto e Localização */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-[#001F33]/5 md:col-span-3"
                  >
                     <div className="flex items-center gap-2 mb-4">
                        <div className="h-8 w-8 bg-[#0EA5E9]/10 rounded-lg flex items-center justify-center text-[#0EA5E9]">
                           <MapPin size={16} />
                        </div>
                        <h3 className="text-base font-display uppercase text-[#001F33]">Contacto e Localização</h3>
                     </div>
   
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                           <label className="text-[10px] sm:text-[11px] font-black uppercase text-[#001F33] tracking-widest ml-1">Telemóvel</label>
                           <div className="relative">
                              <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#001F33]/20" />
                              <Input 
                                value={profile.phone} 
                                onChange={(e) => setProfile({...profile, phone: e.target.value})}
                                className={`h-10 border-[#001F33]/10 pl-10 rounded-lg font-semibold focus:ring-2 focus:ring-[#0EA5E9] ${errors.includes('phone') ? 'border-red-500 ring-1 ring-red-500' : ''}`} 
                              />
                           </div>
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] sm:text-[11px] font-black uppercase text-[#001F33] tracking-widest ml-1">Província</label>
                           <Select 
                              value={profile.province} 
                              onValueChange={(val) => setProfile({...profile, province: val, municipality: ""})}
                           >
                              <SelectTrigger className={`h-10 border-[#001F33]/10 rounded-lg font-semibold focus:ring-2 focus:ring-[#0EA5E9] bg-white ${errors.includes('province') ? 'border-red-500 ring-1 ring-red-500' : ''}`}>
                                 <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent className="bg-white border-[#001F33]/10 text-[#001F33]">
                                 {angolaLocations.map(p => (
                                    <SelectItem key={p.nome} value={p.nome}>{p.nome}</SelectItem>
                                 ))}
                              </SelectContent>
                           </Select>
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] sm:text-[11px] font-black uppercase text-[#001F33] tracking-widest ml-1">Município</label>
                           <Select 
                              value={profile.municipality} 
                              onValueChange={(val) => setProfile({...profile, municipality: val})}
                              disabled={!profile.province}
                           >
                              <SelectTrigger className={`h-10 border-[#001F33]/10 rounded-lg font-semibold focus:ring-2 focus:ring-[#0EA5E9] bg-white ${errors.includes('municipality') ? 'border-red-500 ring-1 ring-red-500' : ''}`}>
                                 <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent className="bg-white border-[#001F33]/10 text-[#001F33]">
                                 {profile.province && angolaLocations.find(p => p.nome === profile.province)?.municipios.map(m => (
                                    <SelectItem key={m} value={m}>{m}</SelectItem>
                                 ))}
                              </SelectContent>
                           </Select>
                        </div>
                     </div>
                  </motion.div>

                  {/* Secção: Percurso Académico e Profissional */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-[#001F33]/5 md:col-span-2"
                  >
                     <div className="flex items-center gap-2 mb-4">
                        <div className="h-8 w-8 bg-[#F97316]/10 rounded-lg flex items-center justify-center text-[#F97316]">
                           <GraduationCap size={16} />
                        </div>
                        <h3 className="text-base font-display uppercase text-[#001F33]">Percurso Profissional</h3>
                     </div>
   
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                           <label className="text-[10px] sm:text-[11px] font-black uppercase text-[#001F33] tracking-widest ml-1">Formação Académica</label>
                           <Select 
                              value={profile.formation} 
                              onValueChange={(val) => setProfile({...profile, formation: val})}
                           >
                              <SelectTrigger className={`h-10 border-[#001F33]/10 rounded-lg font-semibold focus:ring-2 focus:ring-[#0EA5E9] bg-white ${errors.includes('formation') ? 'border-red-500 ring-1 ring-red-500' : ''}`}>
                                 <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent className="bg-white border-[#001F33]/10 text-[#001F33]">
                                 {formationOptions.map(opt => (
                                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                 ))}
                              </SelectContent>
                           </Select>
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] sm:text-[11px] font-black uppercase text-[#001F33] tracking-widest ml-1">Área de Interesse</label>
                           <Select 
                              value={profile.areaOfInterest} 
                              onValueChange={(val) => setProfile({...profile, areaOfInterest: val})}
                           >
                              <SelectTrigger className={`h-10 border-[#001F33]/10 rounded-lg font-semibold focus:ring-2 focus:ring-[#0EA5E9] bg-white ${errors.includes('areaOfInterest') ? 'border-red-500 ring-1 ring-red-500' : ''}`}>
                                 <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent className="bg-white border-[#001F33]/10 text-[#001F33]">
                                 {areaOptions.map(opt => (
                                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                 ))}
                              </SelectContent>
                           </Select>
                        </div>
                     </div>
                  </motion.div>

                  {/* Secção: Objetivos */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-[#001F33]/5"
                  >
                     <div className="flex items-center gap-2 mb-4">
                        <div className="h-8 w-8 bg-[#0EA5E9]/10 rounded-lg flex items-center justify-center text-[#0EA5E9]">
                           <Flag size={16} />
                        </div>
                        <h3 className="text-base font-display uppercase text-[#001F33]">Objetivos</h3>
                     </div>
                     <div className="space-y-1">
                        <label className="text-[10px] sm:text-[11px] font-black uppercase text-[#001F33] tracking-widest ml-1">Meta Profissional</label>
                        <Textarea 
                          value={profile.careerGoals} 
                          onChange={(e) => setProfile({...profile, careerGoals: e.target.value})}
                          className="min-h-[102px] border-[#001F33]/10 rounded-lg p-3 text-xs font-semibold" 
                        />
                     </div>
                  </motion.div>
               </div>

               {/* Secção: Currículo */}
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.2 }}
                 className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-[#001F33]/5"
               >
                  <div className="flex items-center gap-2 mb-4">
                     <div className="h-8 w-8 bg-[#F97316]/10 rounded-lg flex items-center justify-center text-[#F97316]">
                        <FileText size={16} />
                     </div>
                     <h3 className="text-base font-display uppercase text-[#001F33]">Currículo (CV)</h3>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-gray-50 rounded-xl border border-dashed border-[#001F33]/10">
                     <div className="h-12 w-12 bg-[#0EA5E9]/10 rounded-xl flex items-center justify-center text-[#0EA5E9] shadow-sm">
                        <FileText size={24} />
                     </div>
                     <div className="flex-1 text-center sm:text-left">
                        <p className="font-bold text-[#001F33] text-xs uppercase mb-0.5">
                          {profile.cvUrl ? "CV Ativo" : "Nenhum CV carregado"}
                        </p>
                        <p className="text-[10px] text-[#001F33] font-black uppercase tracking-wider">
                          PDF (Máx. 5MB)
                        </p>
                      </div>
                     <div className="flex items-center gap-2 w-full sm:w-auto">
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleCvUpload} 
                          className="hidden" 
                          accept=".pdf"
                        />
                        <Button 
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          className="flex-1 sm:flex-none bg-[#001F33] hover:bg-[#F97316] text-white text-[9px] font-bold uppercase tracking-widest h-9 px-4 rounded-lg"
                        >
                          {uploading ? "..." : (profile.cvUrl ? "Alterar" : "Carregar")}
                        </Button>
                        {profile.cvUrl && (
                           <Button variant="ghost" asChild className="text-[#0EA5E9] text-[9px] font-black uppercase tracking-widest h-9 px-3 gap-2">
                              <a href={profile.cvUrl} target="_blank">
                                <span>Ver CV</span>
                                <ExternalLink size={12} />
                              </a>
                           </Button>
                        )}
                     </div>
                  </div>
               </motion.div>

                {/* Secção: Mentor Specifics */}
                {user.role === 'mentor' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-[#001F33]/5"
                  >
                     <div className="flex items-center gap-2 mb-4">
                        <div className="h-8 w-8 bg-[#F97316]/10 rounded-lg flex items-center justify-center text-[#F97316]">
                           <Target size={16} />
                        </div>
                        <h3 className="text-base font-display uppercase text-[#001F33]">Perfil de Mentoria</h3>
                     </div>

                     <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-1">
                           <label className="text-[10px] sm:text-[11px] font-black uppercase text-[#001F33] tracking-widest ml-1">Especialidades</label>
                           <Input 
                               placeholder="Tecnologia, Negócios..." 
                               value={profile.specialties}
                               onChange={(e) => setProfile({...profile, specialties: e.target.value})}
                               className={`h-10 border-[#001F33]/10 rounded-lg font-semibold ${errors.includes('specialties') ? 'border-red-500 ring-1 ring-red-500' : ''}`} 
                           />
                        </div>

                        <div className="space-y-1">
                           <label className="text-[10px] sm:text-[11px] font-black uppercase text-[#001F33] tracking-widest ml-1">Biografia Profissional</label>
                           <Textarea 
                               value={profile.bio}
                               onChange={(e) => setProfile({...profile, bio: e.target.value})}
                               className={`min-h-[80px] border-[#001F33]/10 rounded-xl p-3 text-sm font-medium ${errors.includes('bio') ? 'border-red-500 ring-1 ring-red-500' : ''}`} 
                           />
                        </div>
                     </div>
                  </motion.div>
                )}

               <div className={`flex items-center gap-3 p-4 rounded-xl border ${errors.length > 0 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-green-50 border-green-100 text-green-600'}`}>
                  <CheckCircle size={18} />
                  <p className="text-[10px] font-black uppercase tracking-wider">
                    {errors.length > 0 
                      ? "Perfil Incompleto: Por favor preencha todos os campos obrigatórios." 
                      : "Perfil em conformidade com as diretrizes da comunidade."}
                  </p>
               </div>
            </div>
          )}
        </div>
      </main>

      <ConfirmModal 
        isOpen={!!pendingNav}
        onClose={() => setPendingNav(null)}
        onConfirm={confirmNavigation}
      />
    </div>
  );
}
