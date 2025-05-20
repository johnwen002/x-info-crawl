import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const githubTrending = sqliteTable("github_trendings", {
  id: text("id").primaryKey(),
  name: text("name"),
  url: text("url").unique(),
  desciption: text("description"),
  language: text("language"),
  stars: integer("stars"),
  forks: integer("forks"),
  starsToday: integer("starsToday"),
  created_at: text("created_at"),
});
