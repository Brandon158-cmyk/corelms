"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SearchForm } from "@/components/search-form";
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
} from "@/components/ui/sidebar";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      items: [
        {
          title: "Overview",
          url: "/dashboard",
        },
      ],
    },
    {
      title: "Management",
      url: "#",
      items: [
        {
          title: "Users",
          url: "/dashboard/users",
        },
        {
          title: "Grades",
          url: "/dashboard/grades",
        },
        {
          title: "Classes",
          url: "/dashboard/classes",
        },
        {
          title: "Subjects",
          url: "/dashboard/subjects",
        },
        {
          title: "Terms",
          url: "/dashboard/terms",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <TermSwitcher />
        <SearchForm />
      </SidebarHeader>
      <SidebarContent className="gap-0">
        {data.navMain.map((item) =>
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
