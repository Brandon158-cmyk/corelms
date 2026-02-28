import { redirect } from "next/navigation";

/**
 * Root page — redirects to sign-in.
 * Authenticated users will be caught by middleware and sent to /dashboard.
 */
export default function HomePage() {
  redirect("/sign-in");
}
