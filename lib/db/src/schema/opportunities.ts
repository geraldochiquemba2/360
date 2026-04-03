import { pgTable, text, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const opportunitiesTable = pgTable("opportunities", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  company: text("company").notNull(),
  location: text("location").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'emprego', 'estagio', 'bolsa'
  description: text("description").notNull(),
  requirements: text("requirements"),
  link: text("link"),
  deadline: timestamp("deadline"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertOpportunitySchema = createInsertSchema(opportunitiesTable).omit({ 
  id: true, 
  createdAt: true 
});

export const selectOpportunitySchema = createSelectSchema(opportunitiesTable);

export type Opportunity = typeof opportunitiesTable.$inferSelect;
export type InsertOpportunity = typeof opportunitiesTable.$inferInsert;
