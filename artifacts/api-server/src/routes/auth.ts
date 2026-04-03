import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { LoginSchema, RegisterSchema } from "@workspace/api-zod";
import { logger } from "../lib/logger";

const authRouter = Router();
const JWT_SECRET = process.env["JWT_SECRET"] || "development-secret";

authRouter.post("/register", async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: "Banco de dados não configurado" });
    }
    
    const result = RegisterSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Dados inválidos", details: result.error.errors });
    }

    const { name, email, phone, password, role, formation, areaOfInterest, experienceLevel, careerGoals, difficulties } = result.data;

    // Check if user exists
    const [existingUser] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existingUser) {
      return res.status(400).json({ error: "Este e-mail já está registado." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [newUser] = await db.insert(usersTable).values({
      name,
      email,
      phone,
      passwordHash,
      role,
      formation,
      areaOfInterest,
      experienceLevel,
      careerGoals,
      difficulties: difficulties ? difficulties.join(",") : null,
    }).returning();

    const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: "7d" });

    return res.status(201).json({
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      token,
    });
  } catch (err) {
    logger.error({ err }, "Erro no registo");
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: "Banco de dados não configurado" });
    }

    const result = LoginSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "E-mail ou senha inválidos" });
    }

    const { email, password } = result.data;

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user) {
      return res.status(401).json({ error: "E-mail ou senha incorretos" });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: "E-mail ou senha incorretos" });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    logger.error({ err }, "Erro no login");
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

export default authRouter;
