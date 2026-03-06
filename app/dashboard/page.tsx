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
import { PageBanner } from "@/components/layout/PageBanner";

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
      <div
        className="flex flex-1 items-center justify-center"
        style={{ padding: "var(--space-xxl)" }}
      >
        <Spinner
          className="size-8"
          style={{ color: "var(--color-accent-primary)" }}
        />
      </div>
    );
  }

  if (user === null) {
    return (
      <Alert
        className="max-w-2xl mx-auto"
        style={{ marginTop: "var(--space-xxl)" }}
      >
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
        <Alert
          className="max-w-2xl"
          style={{
            marginTop: "var(--space-lg)",
            border: "1px solid var(--color-warning)",
            background: "rgba(201, 162, 39, 0.08)",
            color: "var(--color-text-body)",
          }}
        >
          <HugeiconsIcon
            icon={InformationCircleIcon}
            className="size-4"
            style={{ color: "var(--color-warning)" }}
          />
          <AlertTitle
            style={{
              fontFamily: "var(--font-family-heading)",
              color: "var(--color-text-heading)",
            }}
          >
            Role assignment pending
          </AlertTitle>
          <AlertDescription
            style={{
              fontFamily: "var(--font-family-body)",
              color: "var(--color-text-secondary)",
            }}
          >
            Your account is currently waiting for an administrator to assign you
            a role and link you to a school.
          </AlertDescription>
        </Alert>
      );
  }

  return (
    <div className="flex flex-1 flex-col" style={{ gap: "var(--space-lg)" }}>
      {/* Hero Banner — main landing page */}
      <PageBanner
        variant="hero"
        title={`Welcome back, ${user.name?.split(" ")[0]}`}
        subtitle={`Here's what's happening at ${user.tenant?.name || "your school"}. Search for students, classes, or subjects below.`}
      />

      {/* Filter indicator */}
      {mode !== "all-time" &&
        user.role !== "student" &&
        user.role !== "parent" && (
          <div
            className="flex items-center self-start"
            style={{
              gap: "var(--space-sm)",
              background: "var(--color-surface-primary)",
              padding: "var(--space-xs) var(--space-sm)",
              borderRadius: "var(--radius-sm-token)",
              border:
                "var(--card-border-width) solid var(--color-border-default)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <HugeiconsIcon
              icon={Calendar03Icon}
              className="size-4"
              style={{ color: "var(--color-accent-primary)" }}
            />
            <span
              style={{
                fontFamily: "var(--font-family-body)",
                fontSize: "var(--font-size-caption)",
                color: "var(--color-text-secondary)",
              }}
            >
              View:
            </span>
            <Badge
              variant="outline"
              style={{
                fontSize: "var(--font-size-tag)",
                fontFamily: "var(--font-family-body)",
              }}
            >
              {filterLabel}
            </Badge>
          </div>
        )}

      {DashboardContent}
    </div>
  );
}
