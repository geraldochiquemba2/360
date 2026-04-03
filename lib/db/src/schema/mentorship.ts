import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const mentorsTable = pgTable("mentors", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  bio: text("bio").notNull(),
  specialties: text("specialties").notNull(), // Comma-separated or JSON string
  linkedinUrl: text("linkedin_url"),
  imageUrl: text("image_url"),
  status: text("status").notNull().default("pendente"), // 'pendente', 'ativo', 'inativo'
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const availabilityTable = pgTable("mentor_availability", {
  id: serial("id").primaryKey(),
  mentorId: integer("mentor_id").notNull().references(() => mentorsTable.id),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 (Domingo a Sábado)
  startTime: text("start_time").notNull(), // "HH:MM"
  endTime: text("end_time").notNull(),
});

export const bookingsTable = pgTable("mentor_bookings", {
  id: serial("id").primaryKey(),
  mentorId: integer("mentor_id").notNull().references(() => mentorsTable.id),
  candidateId: integer("candidate_id").notNull().references(() => usersTable.id),
  dateTime: timestamp("date_time").notNull(),
  status: text("status").notNull().default("pendente"), // 'pendente', 'confirmado', 'concluido', 'cancelado'
  meetingLink: text("meeting_link"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertMentorSchema = createInsertSchema(mentorsTable);
export const selectMentorSchema = createSelectSchema(mentorsTable);

export type Mentor = typeof mentorsTable.$inferSelect;
export type Booking = typeof bookingsTable.$inferSelect;
