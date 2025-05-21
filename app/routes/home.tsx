import { nanoid } from "nanoid";
import { x_crawler } from "workers/x";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Twitter information" },
    { name: "description", content: "Welcome to twitter!" },
  ];
}

export async function loader({ context, request }: Route.LoaderArgs) {
  // const url = new URL(request.url);
  // const searchParams = url.searchParams;
  // const page = parseInt(searchParams.get("page") || "0");
  // const pageSize = parseInt(searchParams.get("pageSize") || "10");
  // const db = drizzle(context.cloudflare.env.DB);
  // const article_results = await db
  //   .select()
  //   .from(githubTrending)
  //   .offset(page * pageSize)
  //   .limit(pageSize);
  // const total_number = await db.select({ count: count() }).from(githubTrending);
  // return {
  //   total: total_number[0],
  //   articles: article_results,
  // };

  // const all_results = await x_crawler(
  //   3190634521,
  //   context.cloudflare.env.X_TOKEN,
  //   10
  // );
  // const sql = `
  //         INSERT INTO articles (id, content, sha, created_at)
  //         VALUES (?, ?, ?, ?)
  //         ON CONFLICT(sha) DO NOTHING
  //       `;
  // // 2. Prepare batch bindings
  // const stmts = [];
  // for (const result of all_results) {
  //   stmts.push(
  //     context.cloudflare.env.DB.prepare(sql).bind(
  //       nanoid(),
  //       result.full_text,
  //       result.sha,
  //       // await ai(env.OPENROUTER_APIKEY, result.full_text),
  //       new Date().toISOString()
  //     )
  //   );
  // }

  // await context.cloudflare.env.DB.batch(stmts);
  // console.log("done");
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <>
      {/* {loaderData.articles.map((it: any) => (
        <div>{it.url}</div>
      ))}
      <CustomPagination totalPages={loaderData.total?.count / 10} /> */}
    </>
  );
}
