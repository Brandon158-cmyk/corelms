"use client";

import { ReactNode } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";

/**
 * Centered Auth Layout
 * Simpler design with a focused card in the middle of the screen.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard mode="guest">
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-primary-deep relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div
          className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />

        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-white/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-black/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="z-10 w-full max-w-md px-6 flex flex-col items-center">
          {/* Central Logo */}
          <div className="mb-8 flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/10 text-white shadow-2xl backdrop-blur-sm border border-white/20">
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
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
            </div>
            <span className="text-3xl font-bold text-white tracking-tight drop-shadow-sm">
              corelms
            </span>
          </div>

          {/* Auth Card Content */}
          <div className="w-full bg-white rounded-xl shadow-2xl shadow-black/20 border border-white/10 p-8 sm:p-10 transition-all duration-300">
            {children}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
