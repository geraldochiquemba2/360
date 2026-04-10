import { pgTable, text, serial, integer, timestamp, boolean, AnyPgColumn } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const forumTopicsTable = pgTable("forum_topics", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(), // 'geral', 'duvidas', 'carreira', 'vagas'
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const forumPostsTable = pgTable("forum_posts", {
  id: serial("id").primaryKey(),
  topicId: integer("topic_id").notNull().references(() => forumTopicsTable.id, { onDelete: "cascade" }),
  authorId: integer("author_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  isHidden: boolean("is_hidden").notNull().default(false),
  hideReason: text("hide_reason"),
  parentId: integer("parent_id").references((): AnyPgColumn => forumPostsTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const forumLikesTable = pgTable("forum_likes", {
  id: serial("id").primaryKey(),
  topicId: integer("topic_id").notNull().references(() => forumTopicsTable.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertForumTopicSchema = createInsertSchema(forumTopicsTable);
export const insertForumPostSchema = createInsertSchema(forumPostsTable);
export const selectForumTopicSchema = createSelectSchema(forumTopicsTable);
export const selectForumPostSchema = createSelectSchema(forumPostsTable);

export type ForumTopic = typeof forumTopicsTable.$inferSelect;
export type ForumPost = typeof forumPostsTable.$inferSelect;
export type ForumLike = typeof forumLikesTable.$inferSelect;
