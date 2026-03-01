"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Book01Icon,
  Calendar03Icon,
  SchoolIcon,
} from "@hugeicons/core-free-icons";

export function AcademicNav() {
  const pathname = usePathname();

  const tabs = [
    {
      name: "Subjects",
      href: "/dashboard/subjects",
      icon: Book01Icon,
    },
    {
      name: "Grades",
      href: "/dashboard/grades",
      icon: SchoolIcon,
    },
    {
      name: "Terms & Years",
      href: "/dashboard/terms",
      icon: Calendar03Icon,
    },
  ];

  return (
    <div className="flex items-center gap-1 border-b pb-1 mb-6">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-1",
              isActive
                ? "border-brand-primary text-brand-primary bg-brand-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50",
            )}
          >
            <HugeiconsIcon icon={tab.icon} className="size-4" />
            {tab.name}
          </Link>
        );
      })}
    </div>
  );
}
