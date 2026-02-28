"use client";

import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL as string,
);

/**
 * Provides Convex client and authentication context to the entire app.
 * Wraps children with ConvexAuthProvider which handles:
 * - Convex client connection
 * - Auth session management
 * - Token refresh
 */
export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <ConvexAuthProvider client={convex}>{children}</ConvexAuthProvider>;
}
