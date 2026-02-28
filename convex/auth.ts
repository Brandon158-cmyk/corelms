import { convexAuth } from "@convex-dev/auth/server";
import CustomPassword from "./CustomPassword";

/**
 * Convex Auth configuration for corelms.
 * Uses a custom Password provider for email/password authentication.
 * Exports auth utilities used across server functions and HTTP routes.
 */
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [CustomPassword],
});
