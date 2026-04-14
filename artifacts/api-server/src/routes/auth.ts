import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, mentorsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { LoginSchema, RegisterSchema } from "@workspace/api-zod";
import { logger } from "../lib/logger";
import { requireAuth } from "../middlewares/auth";

import multer from "multer";
import path from "path";
import fs from "fs";

const authRouter = Router();
const JWT_SECRET = process.env["JWT_SECRET"] || "development-secret";

// Configure Multer for PDF uploads
const uploadDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.pdf');
  }
});
const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  }
});

authRouter.post("/register", upload.single("cvFile"), async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: "Banco de dados não configurado" });
    }
    
    // Check if CV file is required but missing
    if (!req.file) {
      return res.status(400).json({ error: "O envio do CV em PDF é obrigatório." });
    }

    // Since we're using form-data, let's restructure req.body to match our schema
    let parsedBody = { ...req.body };
    if (typeof parsedBody.difficulties === 'string') {
      try { parsedBody.difficulties = JSON.parse(parsedBody.difficulties); } catch (e) {}
    }

    const result = RegisterSchema.safeParse(parsedBody);
    if (!result.success) {
      return res.status(400).json({ error: "Dados inválidos", details: result.error.errors });
    }

    const { 
      name, email, phone, password, role, formation, areaOfInterest, 
      experienceLevel, careerGoals, difficulties, 
      bio, specialties, linkedinUrl 
    } = result.data;
    
    const socialLink = req.body.socialLink || linkedinUrl || null;
    const cvUrl = `/uploads/${req.file.filename}`;

    // Check if user exists
    const [existingUser] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existingUser) {
      if (existingUser.status === 'pendente') {
        return res.status(400).json({ error: "Este e-mail está com um pedido num estado pendente." });
      }
      return res.status(400).json({ error: "Este e-mail já está registado." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Admins and candidates are auto-approved; only mentors require manual review
    const userStatus = role === 'mentor' ? 'pendente' : 'ativo';

    const [newUser] = await db.insert(usersTable).values({
      name,
      email,
      phone,
      cvUrl,
      socialLink,
      passwordHash,
      role,
      status: userStatus,
      formation,
      areaOfInterest,
      experienceLevel,
      careerGoals,
      difficulties: difficulties ? difficulties.join(",") : null,
      province: result.data.province || null,
      municipality: result.data.municipality || null,
    }).returning();
    
    // Se for mentor, criar entrada inicial na tabela de mentores para evitar erro 403 na gestão
    if (role === 'mentor') {
      await db.insert(mentorsTable).values({
        userId: newUser.id,
        bio: bio || "",
        specialties: specialties || "",
        linkedinUrl: linkedinUrl || socialLink || null,
        status: userStatus // Segue o status do user ('pendente' ou 'ativo')
      });
    }

    const token = jwt.sign({ id: newUser.id, role: newUser.role, status: newUser.status }, JWT_SECRET, { expiresIn: "7d" });

    return res.status(201).json({
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
      },
      token,
      requiresApproval: userStatus === 'pendente'
    });
  } catch (err: any) {
    logger.error({ err }, "Erro no registo");
    return res.status(500).json({ error: err.message || "Erro interno do servidor" });
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

    if (user.status === 'rejeitado') {
      return res.status(403).json({ 
        error: "O seu perfil sofreu uma recusa por parte da administração.",
        rejectionReason: user.rejectionReason 
      });
    }

    // Admins and candidates are always active; only mentors can be pending
    const effectiveStatus = user.role === 'mentor' ? user.status : 'ativo';
    const token = jwt.sign({ id: user.id, role: user.role, status: effectiveStatus }, JWT_SECRET, { expiresIn: "7d" });

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: effectiveStatus,
      },
      token,
      requiresApproval: effectiveStatus === 'pendente'
    });
  } catch (err) {
    logger.error({ err }, "Erro no login");
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

authRouter.post("/cancel-request", requireAuth, async (req: any, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: "Banco de dados não configurado" });
    }
    
    // Validate if the user exists and is still pending
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user.id)).limit(1);
    if (!user) {
      return res.status(404).json({ error: "Utilizador não encontrado" });
    }

    if (user.status !== 'pendente') {
      return res.status(400).json({ error: "O seu pedido já não se encontra pendente. Contacte o suporte." });
    }

    // Delete the user from the database completely removing the pending request
    await db.delete(usersTable).where(eq(usersTable.id, req.user.id));
    
    return res.json({ success: true, message: "Pedido cancelado com sucesso. Todos os dados removidos." });
  } catch (err: any) {
    logger.error({ err }, "Erro no cancelamento do pedido");
    return res.status(500).json({ error: "Erro interno ao processar o cancelamento" });
  }
});

export default authRouter;
