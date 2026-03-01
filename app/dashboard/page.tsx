"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useTermFilter } from "@/components/providers/TermFilterProvider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Book01Icon,
  UserMultiple02Icon,
  InformationCircleIcon,
  Calendar03Icon,
} from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";

export default function Page() {
  const user = useQuery(api.users.currentUser);
  const { mode, selectedTermIds, selectedYearIds, filterLabel } =
    useTermFilter();

  // Build query args based on term filter
  const queryArgs =
    mode === "terms" && selectedTermIds.length > 0
      ? { termIds: selectedTermIds }
      : mode === "years" && selectedYearIds.length > 0
        ? { yearIds: selectedYearIds }
        : {};

  const classes = useQuery(api.classes.list, queryArgs);

  const activeClassCount =
    classes?.filter((c) => c.status === "active").length ?? 0;
  const totalStudents = 0; // will be computed when student queries are wired

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8 bg-brand-bg/30">
      {/* Filter indicator */}
      {mode !== "all-time" && (
        <div className="flex items-center gap-2">
          <HugeiconsIcon
            icon={Calendar03Icon}
            className="size-4 text-brand-blue"
          />
          <span className="text-sm text-muted-foreground">
            Showing data for:
          </span>
          <Badge variant="outline" className="text-xs">
            {filterLabel}
          </Badge>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Active Classes
            </CardTitle>
            <HugeiconsIcon
              icon={Book01Icon}
              className="text-brand-blue"
              size={16}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-navy">
              {classes === undefined ? "…" : activeClassCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {mode === "all-time" ? "All time" : filterLabel}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <HugeiconsIcon
              icon={UserMultiple02Icon}
              className="text-brand-blue"
              size={16}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-navy">
              {totalStudents}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Enrolled currently
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm bg-brand-navy text-white border-brand-navy">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-white/90">
              Current Role
            </CardTitle>
            <HugeiconsIcon
              icon={InformationCircleIcon}
              className="text-white/60"
              size={16}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {user?.role || "Pending"}
            </div>
            <p className="text-xs text-white/70 mt-1 max-w-[200px] truncate">
              {user?.tenant ? user.tenant.name : "No school linked"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-4">
        <Card className="shadow-sm min-h-[300px]">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Updates from your classes and students.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center min-h-[200px] text-muted-foreground text-sm">
            No recent activity to display.
          </CardContent>
        </Card>
        <Card className="shadow-sm min-h-[300px]">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Shortcut to common tasks.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center min-h-[200px] text-muted-foreground text-sm">
            Roles and permissions are being configured.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
