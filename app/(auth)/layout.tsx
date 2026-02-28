"use client";

import { ReactNode } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";

/**
 * Auth layout — split-screen design.
 * Left: Branded panel with corelms branding (navy background).
 * Right: Auth form content (white background).
 * Wrapped with AuthGuard in "guest" mode — redirects to /dashboard if authenticated.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard mode="guest">
      <div className="flex min-h-screen">
        {/* Left Brand Panel */}
        <div className="hidden lg:flex lg:w-[45%] bg-brand-navy items-center justify-center relative flex-col overflow-hidden">
          {/* Subtle Background Pattern on the Left Edge */}
          <div
            className="absolute left-0 top-0 bottom-0 w-3/4 opacity-30 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.8) 1px, transparent 0)",
              backgroundSize: "32px 32px",
              maskImage: "linear-gradient(to right, black, transparent)",
              WebkitMaskImage: "linear-gradient(to right, black, transparent)",
            }}
          />

          <div className="relative z-10 flex items-center gap-4 text-white hover:opacity-90 transition-opacity">
            {/* Logo Ipsum abstract geometric shape (isometric cubes/layers) */}
            <svg
              width="48"
              height="48"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-white"
            >
              <path
                d="M16 2.66663L2.66663 9.33329L16 16L29.3333 9.33329L16 2.66663Z"
                fill="currentColor"
                fillOpacity="0.2"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <path
                d="M2.66663 22.6667L16 29.3333L29.3333 22.6667"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2.66663 16L16 22.6667L29.3333 16"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-4xl font-semibold tracking-tight">
              corelms
            </span>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 bg-brand-bg">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </AuthGuard>
  );
}
