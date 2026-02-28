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
        <div className="hidden lg:flex lg:w-[45%] flex-col justify-between bg-brand-navy p-10 text-white relative overflow-hidden">
          {/* Decorative gradient overlay */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background:
                "radial-gradient(ellipse at 30% 20%, #2845D6 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, #F68048 0%, transparent 50%)",
            }}
          />

          {/* Logo & Branding */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-10 h-10 bg-brand-blue rounded-lg">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-white"
                >
                  <path
                    d="M12 2L2 7L12 12L22 7L12 2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 17L12 22L22 17"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 12L12 17L22 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold tracking-tight">corelms</h1>
            </div>
            <p className="text-white/60 text-sm">School Management Platform</p>
          </div>

          {/* Center Illustration Area */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center py-12">
            {/* Abstract School Illustration using CSS */}
            <div className="w-64 h-48 relative mb-8">
              {/* Laptop shape */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-56 h-36 bg-brand-royal/40 rounded-xl border border-white/10 backdrop-blur-sm">
                <div className="m-2 h-28 bg-white/10 rounded-lg flex items-center justify-center gap-2 p-3">
                  {/* Dashboard mock cards */}
                  <div className="flex-1 h-full flex flex-col gap-1.5">
                    <div className="h-4 bg-brand-blue/40 rounded" />
                    <div className="h-3 bg-white/15 rounded w-4/5" />
                    <div className="flex-1 bg-brand-orange/30 rounded" />
                  </div>
                  <div className="flex-1 h-full flex flex-col gap-1.5">
                    <div className="flex-1 bg-brand-blue/30 rounded" />
                    <div className="h-6 bg-white/15 rounded" />
                    <div className="h-3 bg-brand-orange/20 rounded w-3/4" />
                  </div>
                </div>
              </div>
              {/* Floating elements */}
              <div className="absolute -top-2 -right-2 w-10 h-10 bg-brand-orange/30 rounded-full flex items-center justify-center animate-pulse">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-brand-orange"
                >
                  <path
                    d="M22 10v6M2 10l10-5 10 5-10 5z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6 12v5c3 3 9 3 12 0v-5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="absolute top-4 -left-4 w-8 h-8 bg-brand-blue/30 rounded-lg flex items-center justify-center">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-brand-blue"
                >
                  <path
                    d="M9 11l3 3L22 4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-center mb-3">
              Empowering Zambian Schools
            </h2>
            <p className="text-white/70 text-center text-sm max-w-xs leading-relaxed">
              Manage academics, fees, attendance, and communication — all in one
              unified platform built for the way you work.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="relative z-10 space-y-3">
            {[
              "Multi-tenant school management",
              "ECZ grading & report cards",
              "Mobile money fee collection (MTN/Airtel)",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-brand-orange/20 flex items-center justify-center flex-shrink-0">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-brand-orange"
                  >
                    <path
                      d="M20 6L9 17l-5-5"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="text-sm text-white/80">{feature}</span>
              </div>
            ))}
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
