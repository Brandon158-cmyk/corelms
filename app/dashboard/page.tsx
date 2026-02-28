"use client";

import { useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { AuthGuard } from "@/components/auth/AuthGuard";

/**
 * Placeholder dashboard page.
 * Displays the authenticated user's info and a sign-out button.
 * Wrapped with AuthGuard in "protected" mode — redirects to /sign-in if not authenticated.
 */
export default function DashboardPage() {
  return (
    <AuthGuard mode="protected">
      <DashboardContent />
    </AuthGuard>
  );
}

function DashboardContent() {
  const user = useQuery(api.users.currentUser);
  const { signOut } = useAuthActions();

  if (user === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-bg">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="w-8 h-8 text-brand-blue" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (user === null) {
    return null;
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      {/* Top Bar */}
      <header className="bg-brand-navy text-white px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 bg-brand-blue rounded-lg">
            <svg
              width="18"
              height="18"
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
          <h1 className="text-lg font-bold">corelms</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium">{user.name || user.email}</p>
            <p className="text-xs text-white/60 capitalize">
              {(user.role as string) || "User"}{" "}
              {user.tenant ? `• ${user.tenant.name}` : ""}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-white/20 text-white hover:bg-white/10 cursor-pointer"
            onClick={() => void signOut()}
          >
            Sign Out
          </Button>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-xl shadow-sm border p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                width="32"
                height="32"
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
            <h2 className="text-2xl font-bold text-brand-navy mb-2">
              Welcome to corelms!
            </h2>
            <p className="text-muted-foreground">
              You have successfully signed in. Your role-specific dashboard will
              be available in the next sprint.
            </p>
          </div>

          {/* User Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-brand-bg rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">Email</p>
              <p className="text-sm font-medium truncate">{user.email}</p>
            </div>
            <div className="bg-brand-bg rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">Role</p>
              <p className="text-sm font-medium capitalize">
                {(user.role as string) || "Not assigned"}
              </p>
            </div>
            <div className="bg-brand-bg rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">School</p>
              <p className="text-sm font-medium">
                {user.tenant ? user.tenant.name : "Not linked"}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
