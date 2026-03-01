"use client";

import * as React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TopHeader() {
  const user = useQuery(api.users.currentUser);
  const { signOut } = useAuthActions();

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-4 md:px-6 shrink-0 shadow-sm z-10 w-full relative">
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile Sidebar Trigger placeholder (if we add sheet later) */}
        <button className="md:hidden p-2 -ml-2 text-gray-600">
          <svg
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Universal Search */}
        <div className="relative w-full max-w-md hidden sm:flex items-center">
          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500">
            <svg
              width="18"
              height="18"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <Input
            type="search"
            placeholder="Search students, classes, or settings..."
            className="w-full pl-9 bg-gray-50/50 border-gray-200 focus-visible:ring-brand-blue"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        {/* Notification Bell */}
        <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
          <svg
            width="20"
            height="20"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F68048] rounded-full ring-2 ring-white" />
        </button>

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <button className="flex items-center gap-2 outline-none">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-700 leading-none">
                  {user?.name || "Loading..."}
                </p>
                <p className="text-xs text-gray-500 mt-1 capitalize">
                  {user?.role || "User"}{" "}
                  {user?.tenant ? `• ${user.tenant.name}` : ""}
                </p>
              </div>
              <div className="w-9 h-9 rounded-full bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center text-brand-blue font-semibold">
                {user?.name
                  ? user.name.charAt(0).toUpperCase()
                  : user?.email?.charAt(0).toUpperCase() || "U"}
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile Settings</DropdownMenuItem>
            <DropdownMenuItem>Tenant Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => void signOut()}
              className="text-red-600"
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
