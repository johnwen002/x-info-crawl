import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const articles = sqliteTable("articles", {
  id: text("id").primaryKey(),
  content: text("content").notNull(),
  sha: text("sha").unique(), 
  createdAt: integer("created_at", { mode: "timestamp" }),
});