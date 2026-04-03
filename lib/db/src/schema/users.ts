import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("candidato"), // 'candidato' or 'mentor'
  
  // Profile fields for Candidato
  formation: text("formation"),
  areaOfInterest: text("area_of_interest"),
  experienceLevel: text("experience_level"),
  careerGoals: text("career_goals"),
  difficulties: text("difficulties"), // Can store as JSON string or comma-separated
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ 
  id: true, 
  createdAt: true 
});

export const selectUserSchema = createSelectSchema(usersTable).omit({
  passwordHash: true
});

export type User = typeof usersTable.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UserProfile = z.infer<typeof selectUserSchema>;
