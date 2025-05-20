import axios from "axios";
import type { Route } from "./+types/github-star";

export async function loader({ context, request }: Route.LoaderArgs) {
  const apis_url = [
    "https://api.github.com/users/jacksonw111/starred",
    "https://api.github.com/users/johnwen002/starred",
    "https://api.github.com/users/jacksonwen001/starred",
  ];
  const results = [];
  for (const url of apis_url) {
    const response = await axios.get(url);
    const avatar_url = response.data.get("owner").get("avatar_url");
    const username = response.data.get("owner").get("login");
    const repo = response.data.get("html_url");
    const description = response.data.get("description");
    results.push({
      avatar_url,
      username,
      repo,
      description,
    });
  }

  return results;
}

const GitHubStart = ({ loaderData }: Route.ComponentProps) => {
  return (
    <div>
      {loaderData.map((result) => (
        <div>{}</div>
      ))}
    </div>
  );
};
export default GitHubStart;
