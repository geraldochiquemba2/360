import { Router } from "express";
import { db } from "@workspace/db";
import { forumTopicsTable, forumPostsTable, forumLikesTable, usersTable, userStatsTable } from "@workspace/db";
import { eq, and, desc, sql, asc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const forumRouter = Router();

// FUNÇÃO HELPER PARA ADICIONAR XP
async function addXP(userId: number, amount: number) {
  if (!db) return;
  const XP_PER_LEVEL = 500;
  
  const [stats] = await db.select().from(userStatsTable).where(eq(userStatsTable.userId, userId));
  const currentXp = (stats?.xp || 0) + amount;
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
}

// 1. LISTAR TÓPICOS
forumRouter.get("/topics", async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not configured" });
    const { category } = req.query;
    
    let query = db.select({
      id: forumTopicsTable.id,
      title: forumTopicsTable.title,
      content: forumTopicsTable.content,
      category: forumTopicsTable.category,
      createdAt: forumTopicsTable.createdAt,
      authorName: usersTable.name,
      likeCount: sql<number>`count(distinct ${forumLikesTable.id})`.mapWith(Number),
      commentCount: sql<number>`count(distinct ${forumPostsTable.id})`.mapWith(Number),
    })
    .from(forumTopicsTable)
    .leftJoin(usersTable, eq(forumTopicsTable.authorId, usersTable.id))
    .leftJoin(forumLikesTable, eq(forumLikesTable.topicId, forumTopicsTable.id))
    .leftJoin(forumPostsTable, eq(forumPostsTable.topicId, forumTopicsTable.id))
    .groupBy(forumTopicsTable.id, usersTable.id)
    .orderBy(desc(forumTopicsTable.createdAt));

    if (category) {
      query = query.where(eq(forumTopicsTable.category, category as string)) as any;
    }

    const topics = await query;
    return res.json(topics);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch topics" });
  }
});

// 2. CRIAR TÓPICO (+100 XP)
forumRouter.post("/topics", requireAuth, async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not configured" });
    const userId = (req as any).user.id;
    const { title, content, category } = req.body;

    const [newTopic] = await db.insert(forumTopicsTable).values({
      authorId: userId,
      title,
      content,
      category
    }).returning();

    await addXP(userId, 100);

    return res.status(201).json(newTopic);
  } catch (err) {
    return res.status(500).json({ error: "Failed to create topic" });
  }
});

// 3. VER DETALHES DO TÓPICO + RESPOSTAS + LISTA DE LIKES
forumRouter.get("/topics/:id", async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not configured" });
    const topicId = parseInt(req.params.id);

    // Detalhes do tópico
    const [topic] = await db.select({
      id: forumTopicsTable.id,
      title: forumTopicsTable.title,
      content: forumTopicsTable.content,
      category: forumTopicsTable.category,
      createdAt: forumTopicsTable.createdAt,
      authorId: forumTopicsTable.authorId,
      authorName: usersTable.name,
    })
    .from(forumTopicsTable)
    .leftJoin(usersTable, eq(forumTopicsTable.authorId, usersTable.id))
    .where(eq(forumTopicsTable.id, topicId));

    if (!topic) return res.status(404).json({ error: "Topic not found" });

    // Comentários
    const comments = await db.select({
      id: forumPostsTable.id,
      content: forumPostsTable.content,
      createdAt: forumPostsTable.createdAt,
      authorName: usersTable.name,
    })
    .from(forumPostsTable)
    .leftJoin(usersTable, eq(forumPostsTable.authorId, usersTable.id))
    .where(eq(forumPostsTable.topicId, topicId))
    .orderBy(asc(forumPostsTable.createdAt));

    // Quem deu like
    const likes = await db.select({
      userId: forumLikesTable.userId,
      userName: usersTable.name,
    })
    .from(forumLikesTable)
    .leftJoin(usersTable, eq(forumLikesTable.userId, usersTable.id))
    .where(eq(forumLikesTable.topicId, topicId));

    return res.json({ topic, comments, likes });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch topic details" });
  }
});

// 4. RESPONDER AO TÓPICO (+20 XP)
forumRouter.post("/topics/:id/posts", requireAuth, async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not configured" });
    const userId = (req as any).user.id;
    const topicId = parseInt(req.params.id);
    const { content } = req.body;

    const [newPost] = await db.insert(forumPostsTable).values({
      topicId,
      authorId: userId,
      content
    }).returning();

    await addXP(userId, 20);

    return res.status(201).json(newPost);
  } catch (err) {
    return res.status(500).json({ error: "Failed to post comment" });
  }
});

// 5. DAR LIKE / REMOVER LIKE (+10 XP para o autor se for novo like)
forumRouter.post("/topics/:id/like", requireAuth, async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not configured" });
    const userId = (req as any).user.id;
    const topicId = parseInt(req.params.id);

    // Verificar se já deu like
    const [existing] = await db.select().from(forumLikesTable)
      .where(and(eq(forumLikesTable.topicId, topicId), eq(forumLikesTable.userId, userId)));

    if (existing) {
      await db.delete(forumLikesTable).where(eq(forumLikesTable.id, existing.id));
      return res.json({ liked: false });
    } else {
      await db.insert(forumLikesTable).values({ topicId, userId });
      
      // Dar XP ao autor do tópico
      const [topic] = await db.select().from(forumTopicsTable).where(eq(forumTopicsTable.id, topicId));
      if (topic && topic.authorId !== userId) {
        await addXP(topic.authorId, 10);
      }
      
      return res.json({ liked: true });
    }
  } catch (err) {
    return res.status(500).json({ error: "Failed to toggle like" });
  }
});

export default forumRouter;
