import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, opportunitiesTable, tracksTable, modulesTable, videosTable, mentorsTable, forumTopicsTable } from "@workspace/db";
import { count, eq, desc, asc, and } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middlewares/auth";
import { sendBulkNotification } from "../services/emailService";
import { logger } from "../lib/logger";

const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);

adminRouter.get("/stats", async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: "Banco de dados não configurado" });
    }

    const [totalJovensResult] = await db.select({ val: count() }).from(usersTable).where(eq(usersTable.role, 'candidato'));
    const [totalMentoresResult] = await db.select({ val: count() }).from(usersTable).where(eq(usersTable.role, 'mentor'));
    const [totalOportunidadesResult] = await db.select({ val: count() }).from(opportunitiesTable);
    const [totalForumResult] = await db.select({ val: count() }).from(forumTopicsTable);

    const statsData = {
      totalJovens: Number(totalJovensResult?.val || 0),
      totalMentores: Number(totalMentoresResult?.val || 0),
      oportunidades: Number(totalOportunidadesResult?.val || 0),
      forumTopics: Number(totalForumResult?.val || 0),
      simulacoes: 0
    };

    return res.json(statsData);
  } catch (err) {
    console.error("Dashboard Stats Error:", err);
    return res.status(500).json({ error: "Erro ao buscar estatísticas" });
  }
});

adminRouter.get("/candidates", async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: "Banco de dados não configurado" });
    }

    const users = await db.select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      phone: usersTable.phone,
      formation: usersTable.formation,
      areaOfInterest: usersTable.areaOfInterest,
      role: usersTable.role,
      status: usersTable.status,
      cvUrl: usersTable.cvUrl,
      socialLink: usersTable.socialLink,
      experienceLevel: usersTable.experienceLevel,
      difficulties: usersTable.difficulties,
      province: usersTable.province,
      municipality: usersTable.municipality,
      rejectionReason: usersTable.rejectionReason,
      createdAt: usersTable.createdAt
    })
    .from(usersTable)
    .orderBy(desc(usersTable.createdAt));

    return res.json(users);
  } catch (err) {
    return res.status(500).json({ error: "Erro ao buscar utilizadores" });
  }
});

adminRouter.patch("/users/:id", async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Banco de dados não configurado" });
    const { status, rejectionReason } = req.body; // 'ativo' | 'rejeitado' | 'pendente'
    const id = parseInt(req.params.id as string);

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
    if (!user) return res.status(404).json({ error: "Utilizador não encontrado" });

    await db.update(usersTable).set({ 
      status, 
      rejectionReason: status === 'rejeitado' ? rejectionReason : null 
    }).where(eq(usersTable.id, id));

    // Se for um mentor a ser ativado, garantir que tem entrada na mentorsTable
    if (status === 'ativo' && user.role === 'mentor') {
      const [existingMentor] = await db.select().from(mentorsTable).where(eq(mentorsTable.userId, id)).limit(1);
      if (!existingMentor) {
        await db.insert(mentorsTable).values({
          userId: id,
          bio: "Especialista em desenvolvimento profissional e mentoria estratégica.",
          specialties: "Carreira, Liderança, Desenvolvimento Pessoal",
          status: "ativo"
        });
      }
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("Update User Error:", err);
    return res.status(500).json({ error: "Erro ao atualizar status do utilizador" });
  }
});

// OPORTUNIDADES CRUD
adminRouter.get("/opportunities", async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not configured" });
    const list = await db.select().from(opportunitiesTable).orderBy(desc(opportunitiesTable.createdAt));
    return res.json(list);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch opportunities" });
  }
});

adminRouter.post("/opportunities", async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not configured" });
    const data = req.body;
    
    const [newItem] = await db.insert(opportunitiesTable).values({
      title: data.title,
      company: data.company,
      location: data.location,
      type: data.type,
      description: data.description,
      requirements: data.requirements,
      link: data.link,
      imageUrl: data.imageUrl,
      deadline: data.deadline ? new Date(data.deadline) : null,
    }).returning();
    
    return res.status(201).json(newItem);
  } catch (err) {
    return res.status(500).json({ error: "Failed to create opportunity" });
  }
});

adminRouter.patch("/opportunities/:id", async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not configured" });
    const id = parseInt(req.params.id as string);
    const data = req.body;
    
    await db.update(opportunitiesTable).set({
      title: data.title,
      company: data.company,
      location: data.location,
      type: data.type,
      description: data.description,
      requirements: data.requirements,
      link: data.link,
      imageUrl: data.imageUrl,
      deadline: data.deadline ? new Date(data.deadline) : null,
    }).where(eq(opportunitiesTable.id, id));
    
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update opportunity" });
  }
});

adminRouter.delete("/opportunities/:id", async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not configured" });
    const id = parseInt(req.params.id as string);
    await db.delete(opportunitiesTable).where(eq(opportunitiesTable.id, id));
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete opportunity" });
  }
});

// GESTÃO DE TRILHAS (TRACKS)
adminRouter.get("/tracks", async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not configured" });
    const list = await db.select().from(tracksTable).orderBy(desc(tracksTable.createdAt));
    return res.json(list);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch tracks" });
  }
});

adminRouter.post("/tracks", async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not configured" });
    const [newTrack] = await db.insert(tracksTable).values({
      title: req.body.title,
      description: req.body.description,
      imageUrl: req.body.imageUrl,
      duration: req.body.duration,
      category: req.body.category || "Geral",
      hasCertificate: req.body.hasCertificate !== undefined ? req.body.hasCertificate : true
    }).returning();
    return res.status(201).json(newTrack);
  } catch (err) {
    return res.status(500).json({ error: "Failed to create track" });
  }
});

adminRouter.patch("/tracks/:id", async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not configured" });
    const id = parseInt(req.params.id as string);
    const { title, description, imageUrl, isActive, duration, hasCertificate, category } = req.body;
    
    await db.update(tracksTable).set({
      title,
      description,
      imageUrl,
      duration,
      hasCertificate,
      category,
      isActive: isActive !== undefined ? isActive : undefined
    }).where(eq(tracksTable.id, id));
    
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update track" });
  }
});

adminRouter.delete("/tracks/:id", async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not configured" });
    const id = parseInt(req.params.id as string);
    // Delete modules first if needed (cascade depends on DB setup, but safe to do here)
    await db.delete(tracksTable).where(eq(tracksTable.id, id));
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete track" });
  }
});

// GESTÃO DE MÓDULOS
adminRouter.get("/tracks/:trackId/modules", async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not configured" });
    const list = await db.select().from(modulesTable)
      .where(eq(modulesTable.trackId, parseInt(req.params.trackId as string)))
      .orderBy(asc(modulesTable.order));
    return res.json(list);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch modules" });
  }
});

adminRouter.post("/modules", async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not configured" });
    const [newModule] = await db.insert(modulesTable).values({
      trackId: req.body.trackId,
      title: req.body.title,
      order: req.body.order || 0
    }).returning();
    return res.status(201).json(newModule);
  } catch (err) {
    return res.status(500).json({ error: "Failed to create module" });
  }
});

adminRouter.patch("/modules/:id", async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not configured" });
    const id = parseInt(req.params.id as string);
    const { title, order } = req.body;
    await db.update(modulesTable).set({ title, order }).where(eq(modulesTable.id, id));
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update module" });
  }
});

adminRouter.get("/modules/:moduleId/videos", async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not configured" });
    const list = await db.select().from(videosTable)
      .where(eq(videosTable.moduleId, parseInt(req.params.moduleId as string)))
      .orderBy(asc(videosTable.order));
    return res.json(list);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch videos" });
  }
});

// GESTÃO DE VÍDEOS
adminRouter.post("/videos", async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not configured" });
    const [newVideo] = await db.insert(videosTable).values({
      moduleId: req.body.moduleId,
      trackId: req.body.trackId,
      title: req.body.title,
      url: req.body.url,
      description: req.body.description,
      duration: req.body.duration,
      xpPoints: req.body.xpPoints || 100,
      order: req.body.order || 0
    }).returning();
    return res.status(201).json(newVideo);
  } catch (err) {
    return res.status(500).json({ error: "Failed to create video" });
  }
});

adminRouter.patch("/videos/:id", async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not configured" });
    const id = parseInt(req.params.id as string);
    const { title, url, description, xpPoints, order } = req.body;
    await db.update(videosTable).set({ title, url, description, xpPoints, order }).where(eq(videosTable.id, id));
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update video" });
  }
});

adminRouter.delete("/videos/:id", async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not configured" });
    const id = parseInt(req.params.id as string);
    await db.delete(videosTable).where(eq(videosTable.id, id));
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete video" });
  }
});

// GESTÃO DE MENTORES
adminRouter.get("/mentors", async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not configured" });
    
    const list = await db.select({
      id: mentorsTable.id,
      userId: mentorsTable.userId,
      name: usersTable.name,
      email: usersTable.email,
      specialties: mentorsTable.specialties,
      status: mentorsTable.status,
      createdAt: mentorsTable.createdAt
    })
    .from(mentorsTable)
    .innerJoin(usersTable, eq(mentorsTable.userId, usersTable.id))
    .orderBy(desc(mentorsTable.createdAt));

    return res.json(list);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch mentors" });
  }
});

adminRouter.patch("/mentors/:id", async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not configured" });
    const { status } = req.body; // 'ativo' ou 'inativo'
    const id = parseInt(req.params.id as string);

    await db.update(mentorsTable).set({ status }).where(eq(mentorsTable.id, id));
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update mentor status" });
  }
});

// 5. MODERAÇÃO DE FÓRUM
adminRouter.get("/forum/topics", async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not configured" });
    const topics = await db.select({
      id: forumTopicsTable.id,
      title: forumTopicsTable.title,
      category: forumTopicsTable.category,
      imageUrl: forumTopicsTable.imageUrl,
      videoUrl: forumTopicsTable.videoUrl,
      createdAt: forumTopicsTable.createdAt,
      authorName: usersTable.name
    })
    .from(forumTopicsTable)
    .leftJoin(usersTable, eq(forumTopicsTable.authorId, usersTable.id))
    .orderBy(desc(forumTopicsTable.createdAt));
    
    return res.json(topics);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch forum topics" });
  }
});

adminRouter.delete("/forum/topics/:id", async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not configured" });
    const id = parseInt(req.params.id as string);
    await db.delete(forumTopicsTable).where(eq(forumTopicsTable.id, id));
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete topic" });
  }
});

// NOTIFICAÇÕES EM MASSA
adminRouter.post("/notifications/bulk", async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not configured" });
    const { subject, content, targetRole } = req.body; // targetRole: 'candidato' | 'mentor' | 'todos'

    let query = db.select({ email: usersTable.email }).from(usersTable).where(eq(usersTable.status, 'ativo'));
    
    if (targetRole === 'candidato') {
      query = db.select({ email: usersTable.email }).from(usersTable).where(and(eq(usersTable.status, 'ativo'), eq(usersTable.role, 'candidato'))) as any;
    } else if (targetRole === 'mentor') {
      query = db.select({ email: usersTable.email }).from(usersTable).where(and(eq(usersTable.status, 'ativo'), eq(usersTable.role, 'mentor'))) as any;
    }

    const users = await query;
    const emails = users.map(u => u.email);

    if (emails.length === 0) {
      return res.status(400).json({ error: "Nenhum utilizador encontrado para este critério." });
    }

    // Chamada não bloqueante para o serviço de email
    sendBulkNotification(emails, subject, content)
      .catch(e => logger.error({ err: e }, "Failed to send bulk notification"));

    return res.json({ success: true, count: emails.length });
  } catch (err) {
    logger.error({ err }, "Error sending bulk notification");
    return res.status(500).json({ error: "Erro ao enviar notificações" });
  }
});

// GERADOR DE TRILHAS VIA IA (GROQ)
adminRouter.post("/generate-track-ai", async (req, res) => {
  const { profession } = req.body;
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "GROQ_API_KEY não configurada no servidor." });
  }

  try {
    logger.info(`Gerando trilha para: ${profession}`);

    const prompt = `Você é um especialista em engenharia de carreiras e mercado de trabalho em Angola.
Gere uma trilha profissional completa e premium para a profissão: "${profession}".
A trilha DEVE ter exatamente 6 fases, evoluindo de "Aprendiz" até "Pronto para o Mercado".

Formato esperado (RETORNE APENAS O JSON, SEM TEXTO ADICIONAL):
{
  "title": "Trilha Profissional: ${profession}",
  "description": "Uma jornada completa para dominar as competências de ${profession} do zero ao mercado.",
  "category": "Engenharia",
  "modules": [
    {
      "title": "FASE 1 — Fundamentos",
      "items": [
        { "title": "Vídeo: Introdução à Área", "type": "video", "description": "Conceitos básicos", "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "xp": 100 },
        { "title": "Quiz: Conceitos Iniciais", "type": "quiz", "description": "Teste seus conhecimentos", "xp": 150 }
      ]
    },
    ... (total de 6 módulos)
  ]
}

REGRAS:
1. A Fase 4 deve focar em "Experiência Simulada" (type: "simulation").
2. A Fase 5 deve focar em "Preparação para o Mercado" (type: "activity" ou "quiz" de entrevista).
3. Use nomes de fases atraentes e profissionais.
4. Adicione descrições ricas em cada item.`;

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        response_format: { type: "json_object" }
      })
    });

    const completion = await groqResponse.json() as any;
    const aiData = JSON.parse(completion.choices[0].message.content);

    if (!db) return res.status(500).json({ error: "Banco de dados não configurado" });

    // Inserir no Banco de Dados
    const [track] = await db.insert(tracksTable).values({
      title: aiData.title,
      description: aiData.description,
      category: aiData.category || "Engenharia",
      imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=80",
      duration: "12 Meses",
      hasCertificate: true
    }).returning();

    for (let i = 0; i < aiData.modules.length; i++) {
      const modData = aiData.modules[i];
      const [module] = await db.insert(modulesTable).values({
        trackId: track.id,
        title: modData.title,
        order: i
      }).returning();

      for (let j = 0; j < modData.items.length; j++) {
        const item = modData.items[j];
        await db.insert(videosTable).values({
          trackId: track.id,
          moduleId: module.id,
          title: item.title,
          description: item.description,
          type: item.type || "video",
          url: item.url || "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          xpPoints: item.xp || 100,
          order: j
        });
      }
    }

    return res.json({ success: true, trackId: track.id });
  } catch (err) {
    console.error("Erro na geração IA:", err);
    return res.status(500).json({ error: "Falha ao gerar trilha com IA." });
  }
});

export default adminRouter;
