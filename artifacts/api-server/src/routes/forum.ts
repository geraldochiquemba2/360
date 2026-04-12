import { Router } from "express";
import { db } from "@workspace/db";
import { forumTopicsTable, forumPostsTable, forumLikesTable, usersTable, userStatsTable } from "@workspace/db";
import { eq, and, desc, sql, asc, or, inArray } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env["JWT_SECRET"] || "development-secret";

const forumRouter = Router();

// HELPER: Extrair UserId de forma segura em rotas públicas ou privadas
function getUserIdFromRequest(req: any): number | null {
  if (req.user && req.user.id) return Number(req.user.id);
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const payload = jwt.verify(token, JWT_SECRET) as any;
      if (payload && payload.id) return Number(payload.id);
    } catch (e) {}
  }
  return null;
}

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
      imageUrl: forumTopicsTable.imageUrl,
      videoUrl: forumTopicsTable.videoUrl,
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
    const { title, content, category, imageUrl, videoUrl } = req.body;

    const [newTopic] = await db.insert(forumTopicsTable).values({
      authorId: userId,
      title,
      content,
      category,
      imageUrl: imageUrl || null,
      videoUrl: videoUrl || null
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
      imageUrl: forumTopicsTable.imageUrl,
      videoUrl: forumTopicsTable.videoUrl,
      createdAt: forumTopicsTable.createdAt,
      authorId: forumTopicsTable.authorId,
      authorName: usersTable.name
    })
    .from(forumTopicsTable)
    .leftJoin(usersTable, eq(forumTopicsTable.authorId, usersTable.id))
    .where(eq(forumTopicsTable.id, topicId));

    if (!topic) return res.status(404).json({ error: "Topic not found" });

    // 2. Comentários
    const comments = await db.select({
      id: forumPostsTable.id,
      content: forumPostsTable.content,
      createdAt: forumPostsTable.createdAt,
      authorName: usersTable.name,
      authorId: forumPostsTable.authorId,
      parentId: forumPostsTable.parentId,
      isHidden: forumPostsTable.isHidden,
      hideReason: forumPostsTable.hideReason
    })
    .from(forumPostsTable)
    .leftJoin(usersTable, eq(forumPostsTable.authorId, usersTable.id))
    .where(eq(forumPostsTable.topicId, topicId))
    .orderBy(asc(forumPostsTable.createdAt));

    // 3. Reações (De forma segura e separada)
    const commentIds = comments.map(c => c.id);
    let reactions: any[] = [];
    try {
      // Buscar reações do tópico
      const topicLikesRecords = await db.select({
        id: forumLikesTable.id,
        userId: forumLikesTable.userId,
        type: forumLikesTable.type,
        userName: usersTable.name
      })
      .from(forumLikesTable)
      .leftJoin(usersTable, eq(forumLikesTable.userId, usersTable.id))
      .where(eq(forumLikesTable.topicId, topicId));
      
      reactions = [...topicLikesRecords];

      // Buscar reações dos comentários (apenas se houver comentários)
      if (commentIds.length > 0) {
        const commentLikesRecords = await db.select({
          id: forumLikesTable.id,
          postId: forumLikesTable.postId,
          userId: forumLikesTable.userId,
          type: forumLikesTable.type,
          userName: usersTable.name
        })
        .from(forumLikesTable)
        .leftJoin(usersTable, eq(forumLikesTable.userId, usersTable.id))
        .where(inArray(forumLikesTable.postId, commentIds));
        
        reactions = [...reactions, ...commentLikesRecords];
      }
    } catch (err) {
      console.error("Erro ao buscar reações (não crítico):", err);
    }

    const userId = getUserIdFromRequest(req);

    // 5. Processar Reações do Tópico
    const topicReactions = reactions.filter(r => !r.postId);
    const topicLikes = topicReactions.filter(r => r.type === 'like').length;
    const topicDislikes = topicReactions.filter(r => r.type === 'dislike').length;
    let currentUserReaction: string | null = null;
    
    if (userId) {
      const ur = topicReactions.find(r => Number(r.userId) === Number(userId));
      currentUserReaction = ur ? String(ur.type).toLowerCase() : null;
    }

    const enhancedTopic = {
      ...topic,
      likesCount: topicLikes,
      dislikesCount: topicDislikes,
      userReaction: currentUserReaction,
      likers: topicReactions.filter(r => r.type === 'like').map(r => ({ name: r.userName }))
    };

    // 6. Processar Reações dos Comentários
    const enhancedComments = comments.map(comment => {
      const cr = reactions.filter(r => r.postId && Number(r.postId) === Number(comment.id));
      let userReaction: string | null = null;
      if (userId) {
        const ur = cr.find(r => Number(r.userId) === Number(userId));
        userReaction = ur ? String(ur.type).toLowerCase() : null;
      }
      return {
        ...comment,
        likesCount: cr.filter(r => r.type === 'like').length,
        dislikesCount: cr.filter(r => r.type === 'dislike').length,
        userReaction
      };
    });

    return res.json({ 
      topic: enhancedTopic, 
      comments: enhancedComments,
      likes: topicReactions.filter(r => r.type === 'like')
    });
  } catch (err) {
    console.error("[GetTopicDetails Error]:", err);
    return res.status(500).json({ 
      error: "Failed to fetch topic details", 
      details: err instanceof Error ? err.message : String(err) 
    });
  }
});

// 4. RESPONDER AO TÓPICO (+20 XP)
forumRouter.post("/topics/:id/posts", requireAuth, async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not configured" });
    const userId = (req as any).user.id;
    const topicId = parseInt(req.params.id as string);
    const { content, parentId } = req.body;

    const [newPost] = await db.insert(forumPostsTable).values({
      topicId,
      authorId: userId,
      content,
      parentId: parentId || null,
    }).returning();

    await addXP(userId, 20);

    return res.status(201).json(newPost);
  } catch (err) {
    return res.status(500).json({ error: "Failed to post comment" });
  }
});

// 5. REAÇÃO EM TÓPICO (Like/Dislike)
forumRouter.post("/topics/:id/reaction", requireAuth, async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not configured" });
    const userId = (req as any).user.id;
    const topicId = parseInt(req.params.id as string);
    const { type } = req.body; // 'like' | 'dislike'

    if (type !== 'like' && type !== 'dislike') return res.status(400).json({ error: "Tipo de reação inválido." });

    const [existing] = await db.select().from(forumLikesTable)
      .where(and(eq(forumLikesTable.topicId, topicId), eq(forumLikesTable.userId, Number(userId))));

    if (existing) {
      if (existing.type === type) {
        await db.delete(forumLikesTable).where(eq(forumLikesTable.id, existing.id));
        return res.json({ reaction: null });
      } else {
        await db.update(forumLikesTable).set({ type }).where(eq(forumLikesTable.id, existing.id));
        return res.json({ reaction: type });
      }
    } else {
      await db.insert(forumLikesTable).values({ topicId, userId: Number(userId), type });
      if (type === 'like') {
        const [topic] = await db.select().from(forumTopicsTable).where(eq(forumTopicsTable.id, topicId));
        if (topic && Number(topic.authorId) !== Number(userId)) await addXP(topic.authorId, 10);
      }
      return res.json({ reaction: type });
    }
  } catch (err: any) {
    console.error("DEBUG POST reaction:", err);
    return res.status(500).json({ error: "Failed to set reaction", details: err.message || String(err), stack: err.stack });
  }
});

// 5.1. REAÇÃO EM COMENTÁRIO (Like/Dislike)
forumRouter.post("/comments/:id/reaction", requireAuth, async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not configured" });
    const userId = (req as any).user.id;
    const commentId = parseInt(req.params.id as string);
    const { type } = req.body;

    if (type !== 'like' && type !== 'dislike') return res.status(400).json({ error: "Tipo de reação inválido." });

    const [existing] = await db.select().from(forumLikesTable)
      .where(and(eq(forumLikesTable.postId, commentId), eq(forumLikesTable.userId, Number(userId))));

    if (existing) {
      if (existing.type === type) {
        await db.delete(forumLikesTable).where(eq(forumLikesTable.id, existing.id));
        return res.json({ reaction: null });
      } else {
        await db.update(forumLikesTable).set({ type }).where(eq(forumLikesTable.id, existing.id));
        return res.json({ reaction: type });
      }
    } else {
      await db.insert(forumLikesTable).values({ postId: commentId, userId: Number(userId), type });
      if (type === 'like') {
        const [comment] = await db.select().from(forumPostsTable).where(eq(forumPostsTable.id, commentId));
        if (comment && Number(comment.authorId) !== Number(userId)) await addXP(comment.authorId, 5);
      }
      return res.json({ reaction: type });
    }
  } catch (err) {
    console.error("[Reaction Error]:", err);
    return res.status(500).json({ error: "Failed to set reaction on comment", details: err instanceof Error ? err.message : String(err) });
  }
});

// 6. APAGAR COMENTÁRIO
forumRouter.delete("/comments/:id", requireAuth, async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not configured" });
    const commentId = parseInt(req.params.id as string);
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;

    const [comment] = await db.select().from(forumPostsTable).where(eq(forumPostsTable.id, commentId));
    if (!comment) return res.status(404).json({ error: "Comentário não encontrado." });

    console.log(`[DeleteComment] Attempting to delete comment ${commentId} by user ${userId} (role: ${userRole})`);
    console.log(`[DeleteComment] Comment authorId: ${comment?.authorId}`);

    // Robust comparison using Number to avoid string/number mismatch
    const isAuthor = Number(comment.authorId) === Number(userId);
    const isAdmin = userRole === 'admin';

    if (!isAuthor && !isAdmin) {
      console.warn(`[DeleteComment] Unauthorized: User ${userId} is not author nor admin`);
      return res.status(403).json({ error: "Não tens permissão para apagar este comentário." });
    }

    await db.delete(forumPostsTable).where(eq(forumPostsTable.id, commentId));
    return res.json({ success: true, message: "Comentário apagado." });
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete comment" });
  }
});

// 7. OCULTAR COMENTÁRIO
forumRouter.post("/comments/:id/hide", requireAuth, async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not configured" });
    const commentId = parseInt(req.params.id as string);
    const userRole = (req as any).user.role;
    const { hideReason } = req.body;

    if (userRole !== 'admin') {
      return res.status(403).json({ error: "Apenas administradores podem ocultar comentários." });
    }

    const [comment] = await db.select().from(forumPostsTable).where(eq(forumPostsTable.id, commentId));
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    console.log(`[DEBUG] Ocultando comentário ID: ${commentId}`);

    await db.update(forumPostsTable)
      .set({ isHidden: true, hideReason: hideReason || "Nenhum motivo fornecido." })
      .where(eq(forumPostsTable.id, commentId));

    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Failed to hide comment" });
  }
});

// 7.1. DESOCULTAR COMENTÁRIO
forumRouter.post("/comments/:id/unhide", requireAuth, async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not configured" });
    const commentId = parseInt(req.params.id as string);
    const userRole = (req as any).user.role;

    if (userRole !== 'admin') {
      return res.status(403).json({ error: "Apenas administradores podem desocultar comentários." });
    }

    const [comment] = await db.select().from(forumPostsTable).where(eq(forumPostsTable.id, commentId));
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    await db.update(forumPostsTable)
      .set({ isHidden: false, hideReason: null })
      .where(eq(forumPostsTable.id, commentId));

    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Failed to unhide comment" });
  }
});

// 8. EDITAR TÓPICO (Apenas Admin ou Autor)
forumRouter.patch("/topics/:id", requireAuth, async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not configured" });
    const topicId = parseInt(req.params.id as string);
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;
    const { title, content, category, imageUrl, videoUrl } = req.body;

    const [topic] = await db.select().from(forumTopicsTable).where(eq(forumTopicsTable.id, topicId));
    if (!topic) return res.status(404).json({ error: "Tópico não encontrado." });

    if (topic.authorId !== userId && userRole !== 'admin') {
      return res.status(403).json({ error: "Não tens permissão para editar este tópico." });
    }

    console.log(`Atualizando tópico ${topicId}:`, { title, content, category, imageUrl, videoUrl });

    const [updatedTopic] = await db.update(forumTopicsTable)
      .set({
        title: title !== undefined ? title : topic.title,
        content: content !== undefined ? content : topic.content,
        category: category !== undefined ? category : topic.category,
        imageUrl: imageUrl !== undefined ? imageUrl : topic.imageUrl,
        videoUrl: videoUrl !== undefined ? videoUrl : topic.videoUrl
      })
      .where(eq(forumTopicsTable.id, topicId))
      .returning();

    if (!updatedTopic) {
      return res.status(404).json({ error: "Falha ao atualizar: Tópico não encontrado após update." });
    }

    return res.json(updatedTopic);
  } catch (err: any) {
    console.error("Erro ao atualizar tópico:", err);
    return res.status(500).json({ error: err.message || "Failed to update topic" });
  }
});

export default forumRouter;
