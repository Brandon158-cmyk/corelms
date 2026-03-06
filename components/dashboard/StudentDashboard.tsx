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
  BookOpen01Icon,
  Calendar03Icon,
  TaskDaily01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

const cardStyle = {
  background: "var(--color-surface-primary)",
  border: "var(--card-border-width) solid var(--color-border-default)",
  borderRadius: "var(--radius-md-token)",
  boxShadow: "var(--shadow-card)",
};

export function StudentDashboard() {
  const stats = useQuery(api.dashboard.getStudentStats);

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
    return <div>Failed to load student stats.</div>;
  }

  return (
    <div
      className="flex flex-col"
      style={{ gap: "var(--space-lg)", paddingTop: "var(--space-lg)" }}
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* My Class */}
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
              My Class
            </CardTitle>
            <div
              className="rounded-full"
              style={{
                padding: "var(--space-sm)",
                background: "rgba(139, 30, 30, 0.08)",
              }}
            >
              <HugeiconsIcon
                icon={BookOpen01Icon}
                style={{ color: "var(--color-accent-primary)" }}
                size={18}
              />
            </div>
          </CardHeader>
          <CardContent>
            {stats.myClass ? (
              <>
                <div
                  style={{
                    fontFamily: "var(--font-family-heading)",
                    fontSize: "var(--font-size-hero)",
                    fontWeight: "var(--font-weight-bold)",
                    color: "var(--color-text-heading)",
                  }}
                >
                  {(stats.myClass as any).name}
                </div>
                <p
                  style={{
                    fontFamily: "var(--font-family-body)",
                    fontSize: "var(--font-size-tag)",
                    color: "var(--color-text-secondary)",
                    marginTop: "var(--space-xs)",
                  }}
                >
                  Room: {(stats.myClass as any).room || "Not assigned"}
                </p>
              </>
            ) : (
              <div
                style={{
                  fontFamily: "var(--font-family-body)",
                  fontSize: "var(--font-size-body)",
                  color: "var(--color-text-secondary)",
                }}
              >
                Not enrolled yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assignments Due */}
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
              Assignments Due
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
              {stats.upcomingAssignments.length}
            </div>
            <p
              style={{
                fontFamily: "var(--font-family-body)",
                fontSize: "var(--font-size-tag)",
                color: "var(--color-text-secondary)",
                marginTop: "var(--space-xs)",
              }}
            >
              Active tasks pending your submission
            </p>
          </CardContent>
        </Card>

        {/* Next Event */}
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
              Next Event
            </CardTitle>
            <div
              className="rounded-full"
              style={{
                padding: "var(--space-sm)",
                background: "rgba(201, 162, 39, 0.08)",
              }}
            >
              <HugeiconsIcon
                icon={Calendar03Icon}
                style={{ color: "var(--color-warning)" }}
                size={18}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div
              style={{
                fontFamily: "var(--font-family-heading)",
                fontSize: "var(--font-size-section-heading)",
                fontWeight: "var(--font-weight-bold)",
                color: "var(--color-text-heading)",
              }}
            >
              Math Mid-Term
            </div>
            <p
              style={{
                fontFamily: "var(--font-family-body)",
                fontSize: "var(--font-size-tag)",
                color: "var(--color-text-secondary)",
                marginTop: "var(--space-xs)",
              }}
            >
              Coming up on Nov 14th
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Upcoming Assignments */}
        <Card style={cardStyle}>
          <CardHeader>
            <CardTitle
              style={{
                fontFamily: "var(--font-family-heading)",
                fontSize: "var(--font-size-section-heading)",
                color: "var(--color-text-heading)",
              }}
            >
              Upcoming Assignments
            </CardTitle>
            <CardDescription
              style={{
                fontFamily: "var(--font-family-body)",
                fontSize: "var(--font-size-caption)",
                color: "var(--color-text-secondary)",
              }}
            >
              Tasks you need to complete soon.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.upcomingAssignments.length > 0 ? (
              <div className="flex flex-col" style={{ gap: "var(--space-sm)" }}>
                {stats.upcomingAssignments.map((a: any) => (
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
                    <div className="flex justify-between items-center">
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
                        Start{" "}
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
                You&apos;re all caught up! No active assignments.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Grades */}
        <Card style={cardStyle}>
          <CardHeader>
            <CardTitle
              style={{
                fontFamily: "var(--font-family-heading)",
                fontSize: "var(--font-size-section-heading)",
                color: "var(--color-text-heading)",
              }}
            >
              Recent Grades
            </CardTitle>
            <CardDescription
              style={{
                fontFamily: "var(--font-family-body)",
                fontSize: "var(--font-size-caption)",
                color: "var(--color-text-secondary)",
              }}
            >
              Your performance on recent assessments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentGrades.length > 0 ? (
              <div className="flex flex-col" style={{ gap: "var(--space-sm)" }}>
                {stats.recentGrades.map((g: any) => (
                  <div
                    key={g._id}
                    className="flex items-center justify-between transition-colors"
                    style={{
                      padding: "var(--space-md)",
                      border: "1px solid var(--color-border-default)",
                      borderRadius: "var(--radius-sm-token)",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontFamily: "var(--font-family-body)",
                          fontSize: "var(--font-size-body)",
                          fontWeight: "var(--font-weight-medium)",
                          color: "var(--color-text-body)",
                        }}
                      >
                        Assessment Score
                      </p>
                      <p
                        style={{
                          fontFamily: "var(--font-family-body)",
                          fontSize: "var(--font-size-caption)",
                          color: "var(--color-text-secondary)",
                        }}
                      >
                        {g.comments || "No comments"}
                      </p>
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-family-heading)",
                        fontSize: "var(--font-size-hero)",
                        fontWeight: "var(--font-weight-bold)",
                        color: "var(--color-accent-primary)",
                      }}
                    >
                      {g.score}
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
                No recent grades published.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
