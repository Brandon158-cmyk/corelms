import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Lightweight middleware — no server-side auth validation.
 * Auth state is checked client-side by ConvexAuthProvider.
 * This middleware only handles basic redirects for the root path.
 */
export function middleware(request: NextRequest) {
  // Root path redirects to sign-in
  if (request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
