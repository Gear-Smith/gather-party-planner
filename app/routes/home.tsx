import type { Route } from "./+types/home";
import { WelcomePage } from "~/pages/welcome/page";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Gather: Party Planner" },
    { name: "description", content: "Welcome to Gather party planning app!" },
  ];
}

export function loader({ context }: Route.LoaderArgs) {
  return { message: context.cloudflare.env.VALUE_FROM_CLOUDFLARE };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return <WelcomePage message={loaderData.message} />;
}
