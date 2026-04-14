import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, mentorsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { upload } from "../middlewares/upload";

const userRouter = Router();

// OBTER PERFIL COMPLETO (SENSÍVEL AO ROLE)
userRouter.get("/profile", requireAuth, async (req, res) => {
  try {
    console.log("GET /profile request received for user:", (req as any).user.id);
    if (!db) {
       console.error("DB not configured");
       return res.status(500).json({ error: "Database not configured" });
    }
    const userId = (req as any).user.id;

    // Obter dados básicos do user
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (!user) return res.status(404).json({ error: "User not found" });

    // Se for mentor, buscar dados extras da tabela de mentores
    let mentorData = null;
    if (user.role === 'mentor') {
      [mentorData] = await db.select().from(mentorsTable).where(eq(mentorsTable.userId, userId));
    }

    return res.json({
      ...user,
      passwordHash: undefined, // Segurança
      mentorProfile: mentorData
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// ATUALIZAR DADOS DO PERFIL
userRouter.patch("/profile", requireAuth, async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not configured" });
    const userId = (req as any).user.id;
    const { 
      name, 
      socialLink, 
      phone, 
      formation, 
      areaOfInterest, 
      province, 
      municipality, 
      careerGoals,
      bio, 
      specialties, 
      linkedinUrl 
    } = req.body;

    // Atualizar tabela de users (campos comuns e de cadastro)
    await db.update(usersTable)
      .set({ 
        name, 
        socialLink,
        phone,
        formation,
        areaOfInterest,
        province,
        municipality,
        careerGoals
      })
      .where(eq(usersTable.id, userId));

    // Se for mentor, atualizar também a tabela de mentores
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (user?.role === 'mentor') {
      await db.update(mentorsTable)
        .set({ bio, specialties, linkedinUrl })
        .where(eq(mentorsTable.userId, userId));
    }

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to update profile" });
  }
});

// SUBSITITUIR CV
userRouter.post("/cv", requireAuth, upload.single("cv"), async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not configured" });
    const userId = (req as any).user.id;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const cvUrl = `/uploads/${req.file.filename}`;

    await db.update(usersTable)
      .set({ cvUrl })
      .where(eq(usersTable.id, userId));

    return res.json({ success: true, cvUrl });
  } catch (err) {
    return res.status(500).json({ error: "Failed to upload CV" });
  }
});

export default userRouter;
