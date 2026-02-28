"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function DashboardPage() {
  const user = useQuery(api.users.currentUser);

  if (user === undefined || user === null) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
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
            You have successfully signed in. Your role-specific dashboard is
            ready.
          </p>
        </div>

        {/* User Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-brand-bg rounded-lg p-4 border border-gray-100">
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">
              Email
            </p>
            <p className="text-sm font-medium truncate">{user.email}</p>
          </div>
          <div className="bg-brand-bg rounded-lg p-4 border border-gray-100">
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">
              Role
            </p>
            <p className="text-sm font-medium capitalize">
              {(user.role as string) || "Not assigned"}
            </p>
          </div>
          <div className="bg-brand-bg rounded-lg p-4 border border-gray-100">
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">
              School
            </p>
            <p className="text-sm font-medium">
              {user.tenant ? user.tenant.name : "Not linked"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
