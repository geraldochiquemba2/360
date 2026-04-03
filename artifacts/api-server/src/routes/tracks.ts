import { Router } from "express";
import { db } from "@workspace/db";
import { tracksTable, modulesTable, videosTable, userProgressTable, userStatsTable } from "@workspace/db";
import { eq, and, sql, asc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const tracksRouter = Router();

// LISTAR TODAS AS TRILHAS ATIVAS
tracksRouter.get("/", async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not configured" });
    const list = await db.select().from(tracksTable).where(eq(tracksTable.isActive, true));
    return res.json(list);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch tracks" });
  }
});

// OBTER ESTATÍSTICAS DO UTILIZADOR (XP/NÍVEL)
tracksRouter.get("/my-stats", requireAuth, async (req, res) => {
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
    return res.status(500).json({ error: "Failed to record progress" });
  }
});

export default tracksRouter;
