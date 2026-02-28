"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Role-to-dashboard route mapping.
 * Each user role maps to a specific dashboard route.
 */
const ROLE_DASHBOARD_MAP: Record<string, string> = {
  superAdmin: "/dashboard/admin",
  management: "/dashboard/management",
  teacher: "/dashboard/teacher",
  staff: "/dashboard/staff",
  student: "/dashboard/student",
  parent: "/dashboard/parent",
};

/**
 * Hook that redirects the user to their role-specific dashboard.
 * Uses the currentUser query to determine the user's role.
 */
export function useAuthRedirect() {
  const user = useQuery(api.users.currentUser);
  const router = useRouter();

  useEffect(() => {
    if (user === undefined) return; // Loading
    if (user === null) {
      router.replace("/sign-in");
      return;
    }

    const role = user.role as string | undefined;
    const targetRoute = role
      ? ROLE_DASHBOARD_MAP[role] || "/dashboard"
      : "/dashboard";

    router.replace(targetRoute);
  }, [user, router]);

  return { user, isLoading: user === undefined };
}
