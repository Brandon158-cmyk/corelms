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
import { Input } from "@/components/ui/input";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { UniversalSearch } from "@/components/layout/UniversalSearch";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  SearchIcon,
  Notification03Icon,
  UserIcon,
  Logout01Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons";
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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useQuery(api.users.currentUser);
  const { signOut } = useAuthActions();

  if (user === undefined) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Spinner className="w-8 h-8 text-brand-primary" />
      </div>
    );
  }

  return (
    <AuthGuard mode="protected">
      <TermFilterProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="bg-background sticky top-0 flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 z-10 w-full">
              <div className="flex items-center gap-2 flex-1">
                <SidebarTrigger className="-ml-1" />
                <Separator
                  orientation="vertical"
                  className="mr-2 data-[orientation=vertical]:h-4 data-[orientation=vertical]:self-auto"
                />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="/dashboard">corelms</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Dashboard</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>

              {/* Mobile Search Icon (visible only on small screens) */}
              <div className="flex items-center justify-end gap-4 flex-1">
                <button className="sm:hidden relative p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-full transition-colors">
                  <HugeiconsIcon
                    icon={SearchIcon}
                    strokeWidth={2}
                    className="size-5"
                  />
                </button>

                {/* Desktop Search Bar (Right aligned, prominent outline) */}
                <div className="hidden sm:flex relative w-full lg:w-[400px] xl:w-[500px]">
                  <UniversalSearch />
                </div>

                <Separator
                  orientation="vertical"
                  className="h-6 hidden md:block"
                />

                {/* Notification Bell */}
                <button className="relative p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-full transition-colors hidden sm:block">
                  <HugeiconsIcon
                    icon={Notification03Icon}
                    strokeWidth={2}
                    className="size-5"
                  />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-primary rounded-full ring-2 ring-background" />
                </button>

                {/* User Avatar & Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <button className="flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded-full ring-offset-2" />
                    }
                  >
                    <Avatar className="size-9 border border-border shadow-sm">
                      <AvatarImage
                        src={user?.image}
                        alt={user?.name || "User"}
                      />
                      <AvatarFallback className="bg-brand-primary/10 text-brand-primary font-medium">
                        {user?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-1">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="font-normal flex flex-col gap-1">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {user?.name}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user?.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer">
                        <HugeiconsIcon
                          icon={UserIcon}
                          className="mr-2 size-4 text-muted-foreground"
                        />
                        <span>Profile Options</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">
                        <HugeiconsIcon
                          icon={Settings01Icon}
                          className="mr-2 size-4 text-muted-foreground"
                        />
                        <span>Settings</span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => void signOut()}
                      className="text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer dark:text-red-400 dark:focus:bg-red-950/30"
                    >
                      <HugeiconsIcon
                        icon={Logout01Icon}
                        className="mr-2 size-4"
                      />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-brand-bg">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </TermFilterProvider>
    </AuthGuard>
  );
}
