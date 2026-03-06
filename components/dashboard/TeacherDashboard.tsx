"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
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
  TaskDaily01Icon,
  UserMultiple02Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

/* Shared card style */
const cardStyle = {
  background: "var(--color-surface-primary)",
  border: "var(--card-border-width) solid var(--color-border-default)",
  borderRadius: "var(--radius-md-token)",
  boxShadow: "var(--shadow-card)",
};

export function TeacherDashboard() {
  const stats = useQuery(api.dashboard.getTeacherStats);

  if (stats === undefined) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Spinner
          className="size-8"
          style={{ color: "var(--color-accent-primary)" }}
        />
      </div>
    );
  }

  if (stats === null) {
    return <div>Failed to load teacher stats.</div>;
  }

  return (
    <div
      className="flex flex-col"
      style={{ gap: "var(--space-lg)", paddingTop: "var(--space-lg)" }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        {/* Your Classes */}
        <Card style={cardStyle}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle
              style={{
                fontFamily: "var(--font-family-body)",
                fontSize: "var(--font-size-tag)",
                fontWeight: "var(--font-weight-medium)",
                letterSpacing: "var(--letter-spacing-uppercase)",
                textTransform: "uppercase",
                color: "var(--color-text-secondary)",
              }}
            >
              Your Classes
            </CardTitle>
            <div
              className="rounded-full"
              style={{
                padding: "var(--space-sm)",
                background: "rgba(139, 30, 30, 0.08)",
              }}
            >
              <HugeiconsIcon
                icon={UserMultiple02Icon}
                style={{ color: "var(--color-accent-primary)" }}
                size={18}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div
              style={{
                fontFamily: "var(--font-family-heading)",
                fontSize: "var(--font-size-hero)",
                fontWeight: "var(--font-weight-bold)",
                color: "var(--color-text-heading)",
              }}
            >
              {stats.classesCount}
            </div>
            <p
              style={{
                fontFamily: "var(--font-family-body)",
                fontSize: "var(--font-size-tag)",
                color: "var(--color-text-secondary)",
                marginTop: "var(--space-xs)",
              }}
            >
              Classes attached to your profile
            </p>
          </CardContent>
        </Card>

        {/* Open Assignments */}
        <Card style={cardStyle}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle
              style={{
                fontFamily: "var(--font-family-body)",
                fontSize: "var(--font-size-tag)",
                fontWeight: "var(--font-weight-medium)",
                letterSpacing: "var(--letter-spacing-uppercase)",
                textTransform: "uppercase",
                color: "var(--color-text-secondary)",
              }}
            >
              Open Assignments
            </CardTitle>
            <div
              className="rounded-full"
              style={{
                padding: "var(--space-sm)",
                background: "rgba(22, 78, 99, 0.08)",
              }}
            >
              <HugeiconsIcon
                icon={TaskDaily01Icon}
                style={{ color: "var(--color-category-teal)" }}
                size={18}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div
              style={{
                fontFamily: "var(--font-family-heading)",
                fontSize: "var(--font-size-hero)",
                fontWeight: "var(--font-weight-bold)",
                color: "var(--color-text-heading)",
              }}
            >
              {stats.assignmentCount}
            </div>
            <p
              style={{
                fontFamily: "var(--font-family-body)",
                fontSize: "var(--font-size-tag)",
                color: "var(--color-text-secondary)",
                marginTop: "var(--space-xs)",
              }}
            >
              Assignments pending grading
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* My Classes Overview */}
        <Card style={cardStyle}>
          <CardHeader>
            <CardTitle
              style={{
                fontFamily: "var(--font-family-heading)",
                fontSize: "var(--font-size-section-heading)",
                color: "var(--color-text-heading)",
              }}
            >
              My Classes Overview
            </CardTitle>
            <CardDescription
              style={{
                fontFamily: "var(--font-family-body)",
                fontSize: "var(--font-size-caption)",
                color: "var(--color-text-secondary)",
              }}
            >
              Quick access to classes you teach or manage.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.myClasses.length > 0 ? (
              <div className="flex flex-col" style={{ gap: "var(--space-sm)" }}>
                {stats.myClasses.map((c: any) => (
                  <div
                    key={c._id}
                    className="flex items-center justify-between transition-colors"
                    style={{
                      padding: "var(--space-md)",
                      border: "1px solid var(--color-border-default)",
                      borderRadius: "var(--radius-sm-token)",
                    }}
                  >
                    <div
                      className="flex items-center"
                      style={{ gap: "var(--space-md)" }}
                    >
                      <HugeiconsIcon
                        icon={Book01Icon}
                        className="size-5"
                        style={{ color: "var(--color-text-body)" }}
                      />
                      <div>
                        <p
                          style={{
                            fontFamily: "var(--font-family-body)",
                            fontSize: "var(--font-size-body)",
                            fontWeight: "var(--font-weight-medium)",
                            color: "var(--color-text-body)",
                          }}
                        >
                          {c.name}
                        </p>
                        <p
                          style={{
                            fontFamily: "var(--font-family-body)",
                            fontSize: "var(--font-size-caption)",
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          {c.room || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="flex h-[150px] items-center justify-center"
                style={{
                  fontFamily: "var(--font-family-body)",
                  fontSize: "var(--font-size-body)",
                  color: "var(--color-text-secondary)",
                  border: "1px dashed var(--color-border-default)",
                  borderRadius: "var(--radius-sm-token)",
                  background: "var(--color-surface-secondary)",
                }}
              >
                You are not assigned to any classes yet.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Assignments */}
        <Card style={cardStyle}>
          <CardHeader>
            <CardTitle
              style={{
                fontFamily: "var(--font-family-heading)",
                fontSize: "var(--font-size-section-heading)",
                color: "var(--color-text-heading)",
              }}
            >
              Recent Assignments
            </CardTitle>
            <CardDescription
              style={{
                fontFamily: "var(--font-family-body)",
                fontSize: "var(--font-size-caption)",
                color: "var(--color-text-secondary)",
              }}
            >
              Your recently created open tasks.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentAssignments.length > 0 ? (
              <div className="flex flex-col" style={{ gap: "var(--space-sm)" }}>
                {stats.recentAssignments.map((a: any) => (
                  <div
                    key={a._id}
                    className="flex flex-col transition-colors"
                    style={{
                      gap: "var(--space-sm)",
                      padding: "var(--space-md)",
                      border: "1px solid var(--color-border-default)",
                      borderRadius: "var(--radius-sm-token)",
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <p
                        className="line-clamp-1"
                        style={{
                          fontFamily: "var(--font-family-body)",
                          fontSize: "var(--font-size-body)",
                          fontWeight: "var(--font-weight-medium)",
                          color: "var(--color-text-body)",
                        }}
                      >
                        {a.title}
                      </p>
                      <span
                        style={{
                          fontFamily: "var(--font-family-body)",
                          fontSize: "var(--font-size-tag)",
                          fontWeight: "var(--font-weight-medium)",
                          letterSpacing: "var(--letter-spacing-uppercase)",
                          textTransform: "uppercase",
                          color: "var(--color-text-secondary)",
                          background: "var(--color-surface-secondary)",
                          padding: "2px var(--space-sm)",
                          border: "1px solid var(--color-border-default)",
                          borderRadius: "var(--radius-sm-token)",
                        }}
                      >
                        open
                      </span>
                    </div>
                    <div
                      className="flex justify-between items-center"
                      style={{ marginTop: "var(--space-xs)" }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-family-body)",
                          fontSize: "var(--font-size-caption)",
                          color: "var(--color-text-secondary)",
                        }}
                      >
                        Due: {format(new Date(a.dueDate), "MMM dd, yyyy")}
                      </span>
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0"
                        style={{
                          fontFamily: "var(--font-family-body)",
                          fontWeight: "var(--font-weight-medium)",
                          color: "var(--color-accent-primary)",
                        }}
                        nativeButton={false}
                        render={
                          <Link
                            href={`/dashboard/lms/assignments?id=${a._id}`}
                          />
                        }
                      >
                        View{" "}
                        <HugeiconsIcon
                          icon={ArrowRight01Icon}
                          className="size-3 ml-1"
                        />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="flex h-[150px] items-center justify-center"
                style={{
                  fontFamily: "var(--font-family-body)",
                  fontSize: "var(--font-size-body)",
                  color: "var(--color-text-secondary)",
                  border: "1px dashed var(--color-border-default)",
                  borderRadius: "var(--radius-sm-token)",
                  background: "var(--color-surface-secondary)",
                }}
              >
                No recent assignments.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
