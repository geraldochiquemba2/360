import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { count, eq } from "drizzle-orm";
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

export default adminRouter;
