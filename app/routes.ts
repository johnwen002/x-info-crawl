import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/github-star", "routes/github-star.tsx"),
] satisfies RouteConfig;
