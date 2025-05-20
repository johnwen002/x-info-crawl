import { createRequestHandler } from "react-router";
import { x_crawler } from "./x";
import { nanoid } from 'nanoid'
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
   async scheduled(
    request,
    env,
    ctx
  ): Promise<void> {
    const all_results = await x_crawler(3190634521, env.X_TOKEN, 10);
    const sql = `
        INSERT INTO articles (id, content, sha, created_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(sha) DO NOTHING
      `;
    // 2. Prepare batch bindings
    const stmts = [];
    for (const result of all_results) {
      stmts.push(
        env.DB.prepare(sql).bind(
          nanoid(), 
          result.full_text,
          result.sha,
          // await ai(env.OPENROUTER_APIKEY, result.full_text),
          new Date().toISOString()
        )
      );
    }

    await env.DB.batch(stmts);
  },
  async fetch(request, env, ctx) {
    return requestHandler(request, {
      cloudflare: { env, ctx },
    });
  },
} satisfies ExportedHandler<Env>;
