import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("unauthorized", "routes/unauthorized.tsx"),
  route("forbidden", "routes/forbidden.tsx"),
  route("parties", "routes/parties.tsx"),
  route("parties/new", "routes/parties-new.tsx"),
] satisfies RouteConfig;
