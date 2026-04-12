import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

// 1. TÓPICOS DE DISCUSSÃO
export const forumTopicsTable = pgTable("forum_topics", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id").notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(), // 'cv', 'jobs', 'career', 'education'
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// 2. RESPOSTAS / COMENTÁRIOS
export const forumPostsTable = pgTable("forum_posts", {
  id: serial("id").primaryKey(),
  topicId: integer("topic_id").notNull().references(() => forumTopicsTable.id, { onDelete: 'cascade' }),
  authorId: integer("author_id").notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  content: text("content").notNull(),
  isHidden: boolean("is_hidden").notNull().default(false),
  hideReason: text("hide_reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// 3. GOSTOS / LIKES
export const forumLikesTable = pgTable("forum_likes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  topicId: integer("topic_id").references(() => forumTopicsTable.id, { onDelete: 'cascade' }),
  postId: integer("post_id").references(() => forumPostsTable.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ZOD SCHEMAS
export const insertTopicSchema = createInsertSchema(forumTopicsTable);
export const insertPostSchema = createInsertSchema(forumPostsTable);
export const selectTopicSchema = createSelectSchema(forumTopicsTable);

export type ForumTopic = typeof forumTopicsTable.$inferSelect;
export type ForumPost = typeof forumPostsTable.$inferSelect;
export type ForumLike = typeof forumLikesTable.$inferSelect;
