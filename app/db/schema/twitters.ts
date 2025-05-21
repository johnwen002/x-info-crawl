import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const articles = sqliteTable("articles", {
  id: text("id").primaryKey(),
  content: text("content").notNull(),
  sha: text("sha").unique(),
  created_at: text("created_at"),
});


export const twitters = sqliteTable("twitters", {
  id: text("id").primaryKey(),
  content: text("content").notNull(),
  sha: text("sha").unique(),
  created_at: text("created_at"),
});
