import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, opportunitiesTable, tracksTable, modulesTable, videosTable } from "@workspace/db";
import { count, eq, desc, asc } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middlewares/auth";

const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);

adminRouter.get("/stats", async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: "Banco de dados não configurado" });
    }

    const totalJovensResult = await db.select({ count: count() }).from(usersTable).where(eq(usersTable.role, 'candidato'));
    const totalMentoresResult = await db.select({ count: count() }).from(usersTable).where(eq(usersTable.role, 'mentor'));

    return res.json({
      totalJovens: totalJovensResult[0].count,
      totalMentores: totalMentoresResult[0].count,
      oportunidades: 0,
      simulacoes: 0
    });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao buscar estatísticas" });
  }
});

adminRouter.get("/candidates", async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: "Banco de dados não configurado" });
    }

    const candidates = await db.select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      phone: usersTable.phone,
      formation: usersTable.formation,
      areaOfInterest: usersTable.areaOfInterest,
      createdAt: usersTable.createdAt
    })
    .from(usersTable)
    .where(eq(usersTable.role, 'candidato'))
    .orderBy(usersTable.createdAt);

    return res.json(candidates);
  } catch (err) {
    return res.status(500).json({ error: "Erro ao buscar candidatos" });
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
      deadline: data.deadline ? new Date(data.deadline) : null,
    }).returning();
    
    return res.status(201).json(newItem);
  } catch (err) {
    return res.status(500).json({ error: "Failed to create opportunity" });
  }
});

adminRouter.delete("/opportunities/:id", async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not configured" });
    const id = parseInt(req.params.id);
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
      imageUrl: req.body.imageUrl
    }).returning();
    return res.status(201).json(newTrack);
  } catch (err) {
    return res.status(500).json({ error: "Failed to create track" });
  }
});

// GESTÃO DE MÓDULOS
adminRouter.get("/tracks/:trackId/modules", async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not configured" });
    const list = await db.select().from(modulesTable)
      .where(eq(modulesTable.trackId, parseInt(req.params.trackId)))
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
      order: req.body.order || 0
    }).returning();
    return res.status(201).json(newVideo);
  } catch (err) {
    return res.status(500).json({ error: "Failed to create video" });
  }
});

export default adminRouter;
