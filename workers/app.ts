import { nanoid } from "nanoid";
import { createRequestHandler } from "react-router";
import { getDailyGitHubTrending } from "workers/github-trending";
import { x_crawler } from "./x";
declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
    };
  }
}

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE
);

export default {
  async scheduled(request, env, ctx): Promise<void> {
    if (request.cron === "0 0 * * *") {
      const allTrending = await getDailyGitHubTrending();
      const stmts = [];
      if (allTrending.length > 0) {
        for (const result of allTrending) {
          const sql = `
            INSERT INTO github_trendings (id, name, url, description, language, stars, forks, starsToday, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(url) DO NOTHING
          `;
          stmts.push(
            env.DB.prepare(sql).bind(
              nanoid(),
              result.name,
              result.url,
              result.description,
              result.language,
              result.stars,
              result.forks,
              result.starsToday,
              new Date().toISOString()
            )
          );
          await env.DB.batch(stmts);
        }
      } else {
        console.log("Could not fetch trending repositories for all languages.");
      }
    }
    try {
      const all_results = await x_crawler(3190634521, env.X_TOKEN, 10);
      const article_sql = `
            INSERT INTO twitters (id, content, sha, created_at)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(sha) DO NOTHING
          `;
      // 2. Prepare batch bindings
      const stmts = [];
      for (const result of all_results) {
        let stmt = env.DB.prepare(article_sql).bind(
          nanoid(),
          result.full_text,
          result.sha,
          new Date().toISOString()
        );
        stmts.push(stmt);
      }
      console.log(all_results);
      await env.DB.batch(stmts);
    } catch (e) {
      console.log("Error in x_crawler:", e);
    }
  },
  async fetch(request, env, ctx) {
    return requestHandler(request, {
      cloudflare: { env, ctx },
    });
  },
} satisfies ExportedHandler<Env>;
