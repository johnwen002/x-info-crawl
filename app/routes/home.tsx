import { count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { useLoaderData } from "react-router";
import CustomPagination from "~/components/ui/custom-pagination";
import { articles } from "~/db/schema/twitters";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Twitter information" },
    { name: "description", content: "Welcome to twitter!" },
  ];
}

export async function loader({ context, request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const page = parseInt(searchParams.get("page") || "0");
  const pageSize = parseInt(searchParams.get("pageSize") || "10");
  const db = drizzle(context.cloudflare.env.DB);
  const article_results = await db
    .select()
    .from(articles)
    .offset(page * pageSize)
    .limit(pageSize);
  const total = await db.select({ value: count() }).from(articles);
  return {
    total,
    articles: article_results,
  };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const loadData = useLoaderData();
  return (
    <>
      {loadData.map((it: any) => (
        <div>{it.full_content}</div>
      ))}
      <CustomPagination totalPages={loadData.total / 10} />
    </>
  );
}
