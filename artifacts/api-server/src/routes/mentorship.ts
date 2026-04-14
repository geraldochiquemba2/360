import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, mentorsTable, availabilityTable, bookingsTable } from "@workspace/db";
import { eq, and, desc, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const mentorshipRouter = Router();

// LISTAR MENTORES ATIVOS
mentorshipRouter.get("/mentors", async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not configured" });
    
    // Join Mentors com Users para obter o nome
    const list = await db.select({
      id: mentorsTable.id,
      name: usersTable.name,
      bio: mentorsTable.bio,
      specialties: mentorsTable.specialties,
      imageUrl: mentorsTable.imageUrl,
      linkedinUrl: mentorsTable.linkedinUrl
    })
    .from(mentorsTable)
    .innerJoin(usersTable, eq(mentorsTable.userId, usersTable.id))
    .where(eq(mentorsTable.status, "ativo"));

    return res.json(list);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch mentors" });
  }
});

// OBTER DISPONIBILIDADE DE UM MENTOR
mentorshipRouter.get("/mentors/:id/availability", async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not configured" });
    const mentorId = parseInt(req.params.id);
    const slots = await db.select().from(availabilityTable).where(eq(availabilityTable.mentorId, mentorId));
    return res.json(slots);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch availability" });
  }
});

// SOLICITAR AGENDAMENTO (CANDIDATO)
mentorshipRouter.post("/book", requireAuth, async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not configured" });
    const candidateId = (req as any).user.id;
    const { mentorId, dateTime, notes } = req.body;

    const [newBooking] = await db.insert(bookingsTable).values({
      mentorId,
      candidateId,
      dateTime: new Date(dateTime),
      notes,
      status: "pendente"
    }).returning();

    return res.status(201).json(newBooking);
  } catch (err) {
    return res.status(500).json({ error: "Failed to create booking" });
  }
});

// LISTAR MEUS AGENDAMENTOS (CANDIDATO)
mentorshipRouter.get("/my-sessions", requireAuth, async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not configured" });
    const userId = (req as any).user.id;

    const sessions = await db.select({
      id: bookingsTable.id,
      mentorName: usersTable.name,
      dateTime: bookingsTable.dateTime,
      status: bookingsTable.status,
      meetingLink: bookingsTable.meetingLink
    })
    .from(bookingsTable)
    .innerJoin(mentorsTable, eq(bookingsTable.mentorId, mentorsTable.id))
    .innerJoin(usersTable, eq(mentorsTable.userId, usersTable.id))
    .where(eq(bookingsTable.candidateId, userId))
    .orderBy(desc(bookingsTable.dateTime));

    return res.json(sessions);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

// --- ROTAS DO MENTOR ---

// OBTER SESSÕES SOLICITADAS (PARA O MENTOR)
mentorshipRouter.get("/mentor-sessions", requireAuth, async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not configured" });
    const userId = (req as any).user.id;

    // Encontrar o ID de mentor deste user
    const [mentor] = await db.select().from(mentorsTable).where(eq(mentorsTable.userId, userId));
    if (!mentor) return res.status(403).json({ error: "Not a mentor" });

    const sessions = await db.select({
      id: bookingsTable.id,
      candidateId: usersTable.id,
      candidateName: usersTable.name,
      candidateEmail: usersTable.email,
      candidatePhone: usersTable.phone,
      formation: usersTable.formation,
      areaOfInterest: usersTable.areaOfInterest,
      experienceLevel: usersTable.experienceLevel,
      difficulties: usersTable.difficulties,
      province: usersTable.province,
      municipality: usersTable.municipality,
      cvUrl: usersTable.cvUrl,
      socialLink: usersTable.socialLink,
      dateTime: bookingsTable.dateTime,
      status: bookingsTable.status,
      notes: bookingsTable.notes
    })
    .from(bookingsTable)
    .innerJoin(usersTable, eq(bookingsTable.candidateId, usersTable.id))
    .where(eq(bookingsTable.mentorId, mentor.id))
    .orderBy(desc(bookingsTable.dateTime));

    return res.json(sessions);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch mentor sessions" });
  }
});

// APROVAR/CANCELAR SESSÃO (MENTOR)
mentorshipRouter.patch("/sessions/:id", requireAuth, async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not configured" });
    const { status, meetingLink } = req.body; // 'confirmado' ou 'cancelado'
    const sessionId = parseInt(req.params.id as string);

    await db.update(bookingsTable)
      .set({ status, meetingLink })
      .where(eq(bookingsTable.id, sessionId));

    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update session" });
  }
});

// --- NOVAS ROTAS DE GESTÃO DO MENTOR ---

// OBTER PERFIL DO MENTOR LOGADO
mentorshipRouter.get("/profile", requireAuth, async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not configured" });
    const userId = (req as any).user.id;

    const [mentor] = await db.select({
      id: mentorsTable.id,
      bio: mentorsTable.bio,
      specialties: mentorsTable.specialties,
      linkedinUrl: mentorsTable.linkedinUrl,
      imageUrl: mentorsTable.imageUrl,
      name: usersTable.name,
      email: usersTable.email
    })
    .from(mentorsTable)
    .innerJoin(usersTable, eq(mentorsTable.userId, usersTable.id))
    .where(eq(mentorsTable.userId, userId));

    if (!mentor) return res.status(404).json({ error: "Perfil de mentor não encontrado" });
    return res.json(mentor);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// ATUALIZAR PERFIL DO MENTOR
mentorshipRouter.patch("/profile", requireAuth, async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not configured" });
    const userId = (req as any).user.id;
    const { bio, specialties, linkedinUrl } = req.body;

    await db.update(mentorsTable)
      .set({ bio, specialties, linkedinUrl })
      .where(eq(mentorsTable.userId, userId));

    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update profile" });
  }
});

// OBTER MINHA DISPONIBILIDADE
mentorshipRouter.get("/my-availability", requireAuth, async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not configured" });
    const userId = (req as any).user.id;

    const [mentor] = await db.select().from(mentorsTable).where(eq(mentorsTable.userId, userId));
    if (!mentor) return res.status(403).json({ error: "Not a mentor" });

    const slots = await db.select().from(availabilityTable).where(eq(availabilityTable.mentorId, mentor.id));
    return res.json(slots);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch availability" });
  }
});

// ADICIONAR SLOT DE DISPONIBILIDADE
mentorshipRouter.post("/availability", requireAuth, async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not configured" });
    const userId = (req as any).user.id;
    const { dayOfWeek, startTime, endTime } = req.body;

    const [mentor] = await db.select().from(mentorsTable).where(eq(mentorsTable.userId, userId));
    if (!mentor) return res.status(403).json({ error: "Not a mentor" });

    const [newSlot] = await db.insert(availabilityTable).values({
      mentorId: mentor.id,
      dayOfWeek,
      startTime,
      endTime
    }).returning();

    return res.status(201).json(newSlot);
  } catch (err) {
    return res.status(500).json({ error: "Failed to add availability" });
  }
});

// REMOVER SLOT DE DISPONIBILIDADE
mentorshipRouter.delete("/availability/:id", requireAuth, async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not configured" });
    const userId = (req as any).user.id;
    const slotId = parseInt(req.params.id);

    const [mentor] = await db.select().from(mentorsTable).where(eq(mentorsTable.userId, userId));
    if (!mentor) return res.status(403).json({ error: "Not a mentor" });

    await db.delete(availabilityTable).where(
      and(
        eq(availabilityTable.id, slotId),
        eq(availabilityTable.mentorId, mentor.id)
      )
    );

    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete availability" });
  }
});

export default mentorshipRouter;
