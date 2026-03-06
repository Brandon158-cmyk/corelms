"use client";

import { ReactNode } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";

/**
 * Auth Layout — Design Language Guide conformant.
 * Dark navy-plum background, white card with maroon accent border.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard mode="guest">
      <div
        className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
        style={{
          background: "var(--color-nav-bg)",
        }}
      >
        {/* Subtle dot grid background — decorative, low opacity */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            opacity: 0.04,
            backgroundImage: `radial-gradient(circle at 2px 2px, var(--color-text-inverse) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />

        <div
          className="z-10 w-full max-w-md flex flex-col items-center"
          style={{ padding: "var(--space-lg)" }}
        >
          {/* Central Logo */}
          <div
            className="flex flex-col items-center"
            style={{ marginBottom: "var(--space-xl)", gap: "var(--space-sm)" }}
          >
            <div
              className="flex items-center justify-center"
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "var(--radius-lg-token)",
                background: "rgba(255, 255, 255, 0.1)",
                color: "var(--color-text-inverse)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
              }}
            >
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
            <span
              style={{
                fontFamily: "var(--font-family-heading)",
                fontSize: "var(--font-size-page-title)",
                fontWeight: "var(--font-weight-bold)",
                color: "var(--color-text-inverse)",
                letterSpacing: "-0.5px",
                lineHeight: "var(--line-height-tight)",
              }}
            >
              corelms
            </span>
          </div>

          {/* Auth Card — popover/modal pattern from design guide */}
          <div
            className="w-full"
            style={{
              background: "var(--color-surface-primary)",
              borderRadius: "var(--radius-lg-token)",
              border: "2px solid var(--color-accent-primary)",
              boxShadow: "var(--shadow-popover)",
              padding: "var(--space-xl)",
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
