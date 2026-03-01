"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { TermSwitcher } from "@/components/term-switcher";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";

/**
 * Role-based navigation structure aligned with system.md Section 8.1.
 * Each item specifies which roles are allowed to see it.
 */
type NavSubItem = {
  title: string;
  url: string;
  allowedRoles: string[];
};

type NavGroup = {
  title: string;
  url: string;
  items?: NavSubItem[];
  allowedRoles?: string[];
};

/** All roles that can access administrative features */
const ADMIN_ROLES = ["superAdmin", "proprietor", "headteacher"];

/** All staff-level roles (admin + operational staff) */
const STAFF_ROLES = [...ADMIN_ROLES, "bursar", "teacher", "boardingMatron"];

/** Every role in the system */
const ALL_ROLES = [...STAFF_ROLES, "student", "parent"];

const navData: NavGroup[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    items: [
      {
        title: "Behavior & SEN",
        url: "/dashboard/tracking",
        allowedRoles: ["superAdmin", "proprietor", "headteacher"],
      },
      {
        title: "Settings",
        url: "#",
        allowedRoles: ["superAdmin", "proprietor"],
      },
    ],
  },
  {
    title: "Academic",
    url: "#",
    items: [
      {
        title: "Assessments",
        url: "/dashboard/gradebook",
        allowedRoles: [...ADMIN_ROLES, "teacher"],
      },
      {
        title: "Students",
        url: "/dashboard/students",
        allowedRoles: [...ADMIN_ROLES, "teacher"],
      },
      {
        title: "Classes",
        url: "/dashboard/classes",
        allowedRoles: [...ADMIN_ROLES, "teacher", "student"],
      },
      {
        title: "Attendance",
        url: "/dashboard/attendance",
        allowedRoles: [...ADMIN_ROLES, "teacher"],
      },
      {
        title: "Report Cards",
        url: "/dashboard/report-cards",
        allowedRoles: [...ADMIN_ROLES, "teacher"],
      },
      {
        title: "Subjects",
        url: "/dashboard/subjects",
        allowedRoles: [...ADMIN_ROLES, "teacher"],
      },
      {
        title: "Terms",
        url: "/dashboard/terms",
        allowedRoles: ADMIN_ROLES,
      },
    ],
  },
  {
    title: "Finance",
    url: "#",
    items: [
      {
        title: "Overview",
        url: "/dashboard/financials",
        allowedRoles: [...ADMIN_ROLES, "bursar"],
      },
      {
        title: "Fee Structure",
        url: "/dashboard/financials/fees",
        allowedRoles: [...ADMIN_ROLES, "bursar"],
      },
      {
        title: "Billing & Invoices",
        url: "/dashboard/financials/invoices",
        allowedRoles: [...ADMIN_ROLES, "bursar"],
      },
    ],
  },
  {
    title: "Administration",
    url: "#",
    items: [
      {
        title: "Users",
        url: "/dashboard/users",
        allowedRoles: ADMIN_ROLES,
      },
    ],
  },
];

/**
 * Filter navigation items based on the current user's role.
 */
function filterNavByRole(groups: NavGroup[], userRole: string): NavGroup[] {
  return groups
    .map((group) => {
      const filteredItems = group.items?.filter((item) =>
        item.allowedRoles.includes(userRole),
      );

      if (!filteredItems || filteredItems.length === 0) return null;

      return { ...group, items: filteredItems };
    })
    .filter(Boolean) as NavGroup[];
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const user = useQuery(api.users.currentUser);
  const userRole = (user?.role as string) || "student";
  const visibleNav = filterNavByRole(navData, userRole);

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <TermSwitcher />
        <SidebarSeparator className="mx-0" />
      </SidebarHeader>
      <SidebarContent className="gap-0">
        {visibleNav.map((item) =>
          item.items ? (
            <Collapsible
              key={item.title}
              title={item.title}
              defaultOpen
              className="group/collapsible"
            >
              <SidebarGroup>
                <SidebarGroupLabel
                  className="group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm"
                  render={<CollapsibleTrigger />}
                >
                  {item.title}{" "}
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    strokeWidth={2}
                    className="ml-auto transition-transform group-data-open/collapsible:rotate-90"
                  />
                </SidebarGroupLabel>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {item.items.map((subItem) => {
                        const isActive =
                          pathname === subItem.url ||
                          (subItem.url !== "/dashboard" &&
                            pathname.startsWith(`${subItem.url}/`));

                        return (
                          <SidebarMenuItem key={subItem.title}>
                            <SidebarMenuButton
                              isActive={isActive}
                              render={<Link href={subItem.url} />}
                            >
                              {subItem.title}
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          ) : (
            <SidebarGroup key={item.title}>
              <SidebarGroupLabel
                className="group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm"
                render={<Link href={item.url} />}
              >
                {item.title}
              </SidebarGroupLabel>
            </SidebarGroup>
          ),
        )}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
