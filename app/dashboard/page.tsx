"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useTermFilter } from "@/components/providers/TermFilterProvider";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar03Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Specific Dashboards
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { TeacherDashboard } from "@/components/dashboard/TeacherDashboard";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";
import { ParentDashboard } from "@/components/dashboard/ParentDashboard";

export default function Page() {
  const user = useQuery(api.users.currentUser);
  const { mode, filterLabel } = useTermFilter();

  if (user === undefined) {
    return (
      <div className="flex flex-1 items-center justify-center p-10">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (user === null) {
    return (
      <Alert className="max-w-2xl mx-auto mt-10">
        <HugeiconsIcon icon={InformationCircleIcon} className="size-4" />
        <AlertTitle>Not Logged In</AlertTitle>
        <AlertDescription>
          You must be logged in to view this page.
        </AlertDescription>
      </Alert>
    );
  }

  // Render correct dashboard based on role
  let DashboardContent = null;

  switch (user.role) {
    case "superAdmin":
    case "proprietor":
    case "headteacher":
    case "bursar":
      DashboardContent = <AdminDashboard />;
      break;
    case "teacher":
      DashboardContent = <TeacherDashboard />;
      break;
    case "student":
      DashboardContent = <StudentDashboard />;
      break;
    case "parent":
      DashboardContent = <ParentDashboard user={user} />;
      break;
    default:
      DashboardContent = (
        <Alert className="max-w-2xl mt-10 border-orange-500/30 bg-orange-500/10 text-orange-800">
          <HugeiconsIcon
            icon={InformationCircleIcon}
            className="size-4"
            color="#f97316"
          />
          <AlertTitle className="text-orange-900">
            Role assignment pending
          </AlertTitle>
          <AlertDescription className="text-orange-800">
            Your account is currently waiting for an administrator to assign you
            a role and link you to a school.
          </AlertDescription>
        </Alert>
      );
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-accent tracking-tight">
            Welcome back, {user.name?.split(" ")[0]}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here's what's happening at {user.tenant?.name || "your school"}.
          </p>
        </div>

        {/* Filter indicator */}
        {mode !== "all-time" &&
          user.role !== "student" &&
          user.role !== "parent" && (
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border shadow-sm">
              <HugeiconsIcon
                icon={Calendar03Icon}
                className="size-4 text-brand-primary"
              />
              <span className="text-sm text-muted-foreground">View:</span>
              <Badge variant="outline" className="text-xs bg-muted/50">
                {filterLabel}
              </Badge>
            </div>
          )}
      </div>

      {DashboardContent}
    </div>
  );
}
