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

export default adminRouter;
