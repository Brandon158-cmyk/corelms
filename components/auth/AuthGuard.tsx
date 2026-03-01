"use client";

import { useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";

/**
 * Client-side auth guard that redirects based on authentication state.
 *
 * @param mode - "protected" redirects unauthenticated users to /sign-in
 *             - "guest" redirects authenticated users to /dashboard
 * @param children - Content to render when auth state matches
 */
export function AuthGuard({
  children,
  mode,
}: {
  children: React.ReactNode;
  mode: "protected" | "guest";
}) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (mode === "protected" && !isAuthenticated) {
      router.replace("/sign-in");
    }

    if (mode === "guest" && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, mode, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-bg">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="w-8 h-8 text-brand-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (mode === "protected" && !isAuthenticated) return null;
  if (mode === "guest" && isAuthenticated) return null;

  return <>{children}</>;
}
