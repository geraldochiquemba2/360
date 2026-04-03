import { pgTable, text, serial, timestamp, integer, varchar, boolean, primaryKey } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

// 1. TRILHAS (Cursos)
export const tracksTable = pgTable("tracks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// 2. MÓDULOS (Grupos de Vídeos)
export const modulesTable = pgTable("modules", {
  id: serial("id").primaryKey(),
  trackId: integer("track_id").notNull().references(() => tracksTable.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  order: integer("order").notNull().default(0),
});

// 3. VÍDEOS (Conteúdo Real)
export const videosTable = pgTable("videos", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id").notNull().references(() => modulesTable.id, { onDelete: 'cascade' }),
  trackId: integer("track_id").notNull().references(() => tracksTable.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  url: text("url").notNull(), // YouTube/Vimeo
  description: text("description"),
  duration: integer("duration"), // em segundos
  order: integer("order").notNull().default(0),
});

// 4. PROGRESSO DO UTILIZADOR (Gamificação)
export const userProgressTable = pgTable("user_progress", {
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  videoId: integer("video_id").notNull().references(() => videosTable.id, { onDelete: 'cascade' }),
  trackId: integer("track_id").notNull().references(() => tracksTable.id, { onDelete: 'cascade' }),
  completedAt: timestamp("completed_at").notNull().defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.videoId] }),
}));

// 5. NÍVEIS E XP (Estado do Utilizador)
export const userStatsTable = pgTable("user_stats", {
  userId: integer("user_id").primaryKey().references(() => usersTable.id, { onDelete: 'cascade' }),
  xp: integer("xp").notNull().default(0),
  level: integer("level").notNull().default(1),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ZOD SCHEMAS
export const insertTrackSchema = createInsertSchema(tracksTable);
export const insertModuleSchema = createInsertSchema(modulesTable);
export const insertVideoSchema = createInsertSchema(videosTable);
export const selectTrackSchema = createSelectSchema(tracksTable);

export type Track = typeof tracksTable.$inferSelect;
export type Video = typeof videosTable.$inferSelect;
export type UserStats = typeof userStatsTable.$inferSelect;
