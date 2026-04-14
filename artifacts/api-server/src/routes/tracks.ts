import { Router } from "express";
import { db } from "@workspace/db";
import { 
  tracksTable, 
  modulesTable, 
  videosTable, 
  userProgressTable, 
  userStatsTable,
  userTracksTable
} from "@workspace/db";
import { eq, and, sql, asc, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const tracksRouter = Router();

// LISTAR CATEGORIAS DISPONÍVEIS
tracksRouter.get("/categories", async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not configured" });
    const categories = await db.select({ 
      category: (tracksTable as any).category 
    })
    .from(tracksTable)
    .where(eq((tracksTable as any).isActive, true))
    .groupBy((tracksTable as any).category);
    
    return res.json(categories.map(c => c.category).filter(Boolean));
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// LISTAR TODAS AS TRILHAS ATIVAS (COM FILTRO OPCIONAL)
tracksRouter.get("/", async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not configured" });
    const { category } = req.query;
    
    let query = db.select().from(tracksTable).where(eq(tracksTable.isActive, true));

    if (category && category !== "all") {
      query = db.select().from(tracksTable).where(
        and(
          eq((tracksTable as any).isActive, true),
          eq((tracksTable as any).category, category as string)
        )
      );
    }

    const list = await query.orderBy(desc(tracksTable.createdAt));
    return res.json(list);
  } catch (err) {
    console.error("Error in GET /tracks:", err);
    return res.status(500).json({ error: (err as Error).message || "Failed to fetch tracks" });
  }
});

// MARCAR INÍCIO DE UMA TRILHA
tracksRouter.post("/:id/start", requireAuth, async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not configured" });
    const userId = (req as any).user.id;
    const trackId = parseInt(req.params.id as string);

    // 1. Verificar se já começou
    const [existing] = await db.select().from(userTracksTable)
      .where(and(eq(userTracksTable.userId, userId), eq(userTracksTable.trackId, trackId)));
    
    if (existing) {
      return res.json({ success: true, message: "Already started", startedAt: existing.startedAt });
    }

    // 2. Registar início
    const [newEnrollment] = await db.insert(userTracksTable).values({ userId, trackId }).returning();
    return res.status(201).json({ success: true, startedAt: newEnrollment.startedAt });
  } catch (err) {
    console.error("Error in POST /:id/start:", err);
    return res.status(500).json({ error: "Failed to start track" });
  }
});

// OBTER CONTEÚDO COMPLETO DA TRILHA (PARA O VISUALIZADOR)
tracksRouter.get("/:id/content", requireAuth, async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not configured" });
    const userId = (req as any).user.id;
    const trackId = parseInt(req.params.id as string);

    // 1. Obter info da trilha
    const [track] = await db.select().from(tracksTable).where(eq(tracksTable.id, trackId));
    if (!track) return res.status(404).json({ error: "Track not found" });

    // 2. Obter módulos
    const modules = await db.select().from(modulesTable)
      .where(eq(modulesTable.trackId, trackId))
      .orderBy(asc(modulesTable.order));

    // 3. Obter vídeos e progresso do utilizador
    const videos = await db.select({
      id: videosTable.id,
      moduleId: videosTable.moduleId,
      title: videosTable.title,
      url: videosTable.url,
      description: videosTable.description,
      duration: videosTable.duration,
      xpPoints: videosTable.xpPoints,
      order: videosTable.order,
      isCompleted: sql<boolean>`CASE WHEN ${userProgressTable.completedAt} IS NOT NULL THEN TRUE ELSE FALSE END`
    })
    .from(videosTable)
    .leftJoin(userProgressTable, and(
      eq(userProgressTable.videoId, videosTable.id),
      eq(userProgressTable.userId, userId)
    ))
    .where(eq(videosTable.trackId, trackId))
    .orderBy(asc(videosTable.order));

    return res.json({
      track,
      modules,
      videos
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch track content" });
  }
});

// OBTER ESTATÍSTICAS DO UTILIZADOR (XP/NÍVEL)
tracksRouter.get("/my-stats", requireAuth, async (req, res) => {
// ... (rest of the file)
  try {
    if (!db) return res.status(500).json({ error: "Database not configured" });
    const userId = (req as any).user.id;
    
    let [stats] = await db.select().from(userStatsTable).where(eq(userStatsTable.userId, userId));
    
    if (!stats) {
      [stats] = await db.insert(userStatsTable).values({ userId, xp: 0, level: 1 }).returning();
    }
    
    return res.json(stats);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// MARCAR VÍDEO COMO CONCLUÍDO (GANHAR XP)
tracksRouter.post("/video-complete", requireAuth, async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not configured" });
    const userId = (req as any).user.id;
    const { videoId, trackId } = req.body;

    // 1. Verificar se já concluiu para não dar XP em duplicado
    const [existing] = await db.select().from(userProgressTable)
      .where(and(eq(userProgressTable.userId, userId), eq(userProgressTable.videoId, videoId)));
    
    if (existing) {
      return res.json({ message: "Already completed", xpGained: 0 });
    }

    // 2. Registar progresso
    await db.insert(userProgressTable).values({ userId, videoId, trackId });

    // 3. Obter os pontos de XP reais deste vídeo
    const [video] = await db.select().from(videosTable).where(eq(videosTable.id, videoId));
    const XP_GAINED = video?.xpPoints || 100;
    const XP_PER_LEVEL = 500;

    const [stats] = await db.select().from(userStatsTable).where(eq(userStatsTable.userId, userId));
    const currentXp = (stats?.xp || 0) + XP_GAINED;
    const currentLevel = Math.floor(currentXp / XP_PER_LEVEL) + 1;

    await db.insert(userStatsTable).values({ 
      userId, 
      xp: currentXp, 
      level: currentLevel,
      updatedAt: new Date()
    })
    .onConflictDoUpdate({
      target: userStatsTable.userId,
      set: { xp: currentXp, level: currentLevel, updatedAt: new Date() }
    });

    return res.json({ 
      success: true, 
      xpGained: XP_GAINED, 
      newXp: currentXp, 
      newLevel: currentLevel,
      levelUp: currentLevel > (stats?.level || 1)
    });
  } catch (err) {
    console.error("Error in POST /video-complete:", err);
    return res.status(500).json({ error: "Failed to record progress" });
  }
});

export default tracksRouter;
