"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Spinner } from "@/components/ui/spinner";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuthActions } from "@convex-dev/auth/react";
import { AppSidebar } from "@/components/app-sidebar";
import { TermFilterProvider } from "@/components/providers/TermFilterProvider";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Notification03Icon,
  UserIcon,
  Logout01Icon,
  Settings01Icon,
  HelpCircleIcon,
  Calendar03Icon,
} from "@hugeicons/core-free-icons";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Build breadcrumb segments from pathname.
 */
function getBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  // Always start with "corelms" as root
  const crumbs: { label: string; href: string }[] = [];

  let currentPath = "";
  for (const segment of segments) {
    currentPath += `/${segment}`;
    const label = segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    crumbs.push({ label, href: currentPath });
  }
  return crumbs;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useQuery(api.users.currentUser);
  const { signOut } = useAuthActions();
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);

  if (user === undefined) {
    return (
      <div
        className="flex h-screen items-center justify-center"
        style={{ background: "var(--color-surface-secondary)" }}
      >
        <Spinner
          className="w-8 h-8"
          style={{ color: "var(--color-accent-primary)" }}
        />
      </div>
    );
  }

  return (
    <AuthGuard mode="protected">
      <TermFilterProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            {/* Top bar — compact, breadcrumbs + quick links + user controls */}
            <header
              className="sticky top-0 flex shrink-0 items-center justify-between z-10 w-full"
              style={{
                background: "var(--color-surface-primary)",
                height: "48px",
                borderBottom: "1px solid var(--color-border-default)",
                padding: "0 var(--space-md)",
                gap: "var(--space-sm)",
              }}
            >
              {/* Left: Sidebar trigger + Breadcrumbs */}
              <div
                className="flex items-center flex-1 min-w-0"
                style={{ gap: "var(--space-sm)" }}
              >
                <SidebarTrigger
                  className="-ml-1 shrink-0"
                  style={{ color: "var(--color-text-body)" }}
                />
                <Separator
                  orientation="vertical"
                  className="data-[orientation=vertical]:h-4 data-[orientation=vertical]:self-auto shrink-0"
                  style={{ background: "var(--color-border-default)" }}
                />
                <Breadcrumb>
                  <BreadcrumbList>
                    {breadcrumbs.map((crumb, index) => {
                      const isLast = index === breadcrumbs.length - 1;
                      return (
                        <BreadcrumbItem
                          key={crumb.href}
                          className={index === 0 ? "hidden md:block" : ""}
                        >
                          {index > 0 && (
                            <BreadcrumbSeparator
                              className={index === 1 ? "hidden md:block" : ""}
                            />
                          )}
                          {isLast ? (
                            <BreadcrumbPage
                              style={{
                                fontFamily: "var(--font-family-body)",
                                fontSize: "var(--font-size-caption)",
                                fontWeight: "var(--font-weight-medium)",
                                color: "var(--color-text-body)",
                              }}
                            >
                              {crumb.label}
                            </BreadcrumbPage>
                          ) : (
                            <BreadcrumbLink
                              href={crumb.href}
                              style={{
                                fontFamily: "var(--font-family-body)",
                                fontSize: "var(--font-size-caption)",
                                color: "var(--color-text-secondary)",
                              }}
                            >
                              {crumb.label}
                            </BreadcrumbLink>
                          )}
                        </BreadcrumbItem>
                      );
                    })}
                  </BreadcrumbList>
                </Breadcrumb>
              </div>

              {/* Right: Quick links + notifications + user */}
              <div
                className="flex items-center shrink-0"
                style={{ gap: "var(--space-sm)" }}
              >
                {/* Quick links — hidden on small screens */}
                <Link
                  href="/dashboard/terms"
                  className="hidden lg:inline-flex items-center transition-colors rounded-sm hover:bg-[var(--color-surface-secondary)]"
                  style={{
                    gap: "var(--space-xs)",
                    padding: "var(--space-xs) var(--space-sm)",
                    fontFamily: "var(--font-family-body)",
                    fontSize: "var(--font-size-caption)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  <HugeiconsIcon
                    icon={Calendar03Icon}
                    strokeWidth={2}
                    className="size-3.5"
                  />
                  Terms
                </Link>
                <Link
                  href="#"
                  className="hidden lg:inline-flex items-center transition-colors rounded-sm hover:bg-[var(--color-surface-secondary)]"
                  style={{
                    gap: "var(--space-xs)",
                    padding: "var(--space-xs) var(--space-sm)",
                    fontFamily: "var(--font-family-body)",
                    fontSize: "var(--font-size-caption)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  <HugeiconsIcon
                    icon={HelpCircleIcon}
                    strokeWidth={2}
                    className="size-3.5"
                  />
                  Help
                </Link>

                <Separator
                  orientation="vertical"
                  className="hidden md:block"
                  style={{
                    height: "20px",
                    background: "var(--color-border-default)",
                  }}
                />

                {/* Notification Bell */}
                <button
                  className="relative hidden sm:flex items-center justify-center rounded-full transition-colors hover:bg-[var(--color-surface-secondary)]"
                  style={{
                    width: "32px",
                    height: "32px",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  <HugeiconsIcon
                    icon={Notification03Icon}
                    strokeWidth={2}
                    className="size-4"
                  />
                  <span
                    className="absolute rounded-full"
                    style={{
                      top: "6px",
                      right: "6px",
                      width: "6px",
                      height: "6px",
                      background: "var(--color-accent-primary)",
                      border: "1.5px solid var(--color-surface-primary)",
                    }}
                  />
                </button>

                {/* User Avatar & Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <button
                        className="flex items-center outline-none focus-visible:ring-2 rounded-full ring-offset-1"
                        style={{ borderColor: "var(--color-accent-primary)" }}
                      />
                    }
                  >
                    <Avatar
                      className="border"
                      style={{
                        width: "30px",
                        height: "30px",
                        borderColor: "var(--color-border-default)",
                      }}
                    >
                      <AvatarImage
                        src={user?.image}
                        alt={user?.name || "User"}
                      />
                      <AvatarFallback
                        style={{
                          background: "var(--color-accent-primary)",
                          color: "var(--color-text-inverse)",
                          fontFamily: "var(--font-family-body)",
                          fontWeight: "var(--font-weight-medium)",
                          fontSize: "var(--font-size-tag)",
                        }}
                      >
                        {user?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="mt-1"
                    style={{
                      width: "224px",
                      background: "var(--color-surface-primary)",
                      border: "2px solid var(--color-accent-primary)",
                      borderRadius: "var(--radius-lg-token)",
                      boxShadow: "var(--shadow-popover)",
                    }}
                  >
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="font-normal flex flex-col gap-1">
                        <div
                          className="flex flex-col"
                          style={{ gap: "var(--space-xs)" }}
                        >
                          <p
                            className="leading-none"
                            style={{
                              fontFamily: "var(--font-family-body)",
                              fontSize: "var(--font-size-body)",
                              fontWeight: "var(--font-weight-medium)",
                              color: "var(--color-text-body)",
                            }}
                          >
                            {user?.name}
                          </p>
                          <p
                            className="leading-none"
                            style={{
                              fontFamily: "var(--font-family-body)",
                              fontSize: "var(--font-size-tag)",
                              color: "var(--color-text-secondary)",
                            }}
                          >
                            {user?.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer">
                        <HugeiconsIcon
                          icon={UserIcon}
                          className="mr-2 size-4"
                          style={{ color: "var(--color-text-secondary)" }}
                        />
                        <span
                          style={{
                            fontFamily: "var(--font-family-body)",
                            fontSize: "var(--font-size-body)",
                          }}
                        >
                          Profile Options
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">
                        <HugeiconsIcon
                          icon={Settings01Icon}
                          className="mr-2 size-4"
                          style={{ color: "var(--color-text-secondary)" }}
                        />
                        <span
                          style={{
                            fontFamily: "var(--font-family-body)",
                            fontSize: "var(--font-size-body)",
                          }}
                        >
                          Settings
                        </span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => void signOut()}
                      className="cursor-pointer"
                      style={{ color: "var(--color-accent-secondary)" }}
                    >
                      <HugeiconsIcon
                        icon={Logout01Icon}
                        className="mr-2 size-4"
                      />
                      <span
                        style={{
                          fontFamily: "var(--font-family-body)",
                          fontSize: "var(--font-size-body)",
                        }}
                      >
                        Log out
                      </span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </header>

            {/* Main content area — warm off-white background */}
            <main
              className="flex-1 overflow-y-auto"
              style={{
                background: "var(--color-surface-secondary)",
                padding: "0 var(--space-lg) var(--space-lg)",
              }}
            >
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </TermFilterProvider>
    </AuthGuard>
  );
}
