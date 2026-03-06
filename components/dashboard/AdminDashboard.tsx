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
  UserMultiple02Icon,
  TeacherIcon,
} from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function AdminDashboard() {
  const stats = useQuery(api.dashboard.getAdminStats);

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
    return <div>Failed to load admin stats.</div>;
  }

  return (
    <div
      className="flex flex-col"
      style={{ gap: "var(--space-lg)", paddingTop: "var(--space-lg)" }}
    >
      <div className="grid gap-4 md:grid-cols-3">
        {/* Stat Card: Total Students */}
        <Card
          style={{
            background: "var(--color-surface-primary)",
            border:
              "var(--card-border-width) solid var(--color-border-default)",
            borderRadius: "var(--radius-md-token)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle
              style={{
                fontFamily: "var(--font-family-body)",
                fontSize: "var(--font-size-caption)",
                fontWeight: "var(--font-weight-medium)",
                color: "var(--color-text-secondary)",
              }}
            >
              Total Students
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
                size={16}
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
              {stats.totalStudents}
            </div>
          </CardContent>
        </Card>

        {/* Stat Card: Total Teachers */}
        <Card
          style={{
            background: "var(--color-surface-primary)",
            border:
              "var(--card-border-width) solid var(--color-border-default)",
            borderRadius: "var(--radius-md-token)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle
              style={{
                fontFamily: "var(--font-family-body)",
                fontSize: "var(--font-size-caption)",
                fontWeight: "var(--font-weight-medium)",
                color: "var(--color-text-secondary)",
              }}
            >
              Total Teachers
            </CardTitle>
            <div
              className="rounded-full"
              style={{
                padding: "var(--space-sm)",
                background: "rgba(22, 78, 99, 0.08)",
              }}
            >
              <HugeiconsIcon
                icon={TeacherIcon}
                style={{ color: "var(--color-category-teal)" }}
                size={16}
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
              {stats.totalTeachers}
            </div>
          </CardContent>
        </Card>

        {/* Stat Card: Active Classes */}
        <Card
          style={{
            background: "var(--color-surface-primary)",
            border:
              "var(--card-border-width) solid var(--color-border-default)",
            borderRadius: "var(--radius-md-token)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle
              style={{
                fontFamily: "var(--font-family-body)",
                fontSize: "var(--font-size-caption)",
                fontWeight: "var(--font-weight-medium)",
                color: "var(--color-text-secondary)",
              }}
            >
              Active Classes
            </CardTitle>
            <div
              className="rounded-full"
              style={{
                padding: "var(--space-sm)",
                background: "rgba(88, 28, 135, 0.08)",
              }}
            >
              <HugeiconsIcon
                icon={Book01Icon}
                style={{ color: "var(--color-category-purple)" }}
                size={16}
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
              {stats.activeClasses}
              <span
                className="ml-2 font-normal"
                style={{
                  fontFamily: "var(--font-family-body)",
                  fontSize: "var(--font-size-caption)",
                  color: "var(--color-text-secondary)",
                }}
              >
                / {stats.totalClasses} total
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Chart Card */}
        <Card
          className="md:col-span-2 lg:col-span-2"
          style={{
            background: "var(--color-surface-primary)",
            border:
              "var(--card-border-width) solid var(--color-border-default)",
            borderRadius: "var(--radius-md-token)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <CardHeader>
            <CardTitle
              style={{
                fontFamily: "var(--font-family-heading)",
                fontSize: "var(--font-size-section-heading)",
                color: "var(--color-text-heading)",
              }}
            >
              Classes per Grade
            </CardTitle>
            <CardDescription
              style={{
                fontFamily: "var(--font-family-body)",
                fontSize: "var(--font-size-caption)",
                color: "var(--color-text-secondary)",
              }}
            >
              Overview of active classes assigned to grades.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.chartData.length > 0 ? (
              <div
                className="h-[300px] w-full"
                style={{ marginTop: "var(--space-md)" }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.chartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="var(--color-border-default)"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: "var(--color-text-secondary)",
                        fontSize: 12,
                      }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: "var(--color-text-secondary)",
                        fontSize: 12,
                      }}
                    />
                    <Tooltip
                      cursor={{ fill: "var(--color-surface-secondary)" }}
                      contentStyle={{
                        borderRadius: "var(--radius-sm-token)",
                        border: "1px solid var(--color-border-default)",
                        boxShadow: "var(--shadow-card)",
                        background: "var(--color-surface-primary)",
                        fontFamily: "var(--font-family-body)",
                        fontSize: "var(--font-size-caption)",
                      }}
                    />
                    <Bar
                      dataKey="classes"
                      fill="var(--color-accent-primary)"
                      radius={[4, 4, 0, 0]}
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div
                className="flex h-[300px] items-center justify-center"
                style={{
                  fontFamily: "var(--font-family-body)",
                  fontSize: "var(--font-size-body)",
                  color: "var(--color-text-secondary)",
                  background: "var(--color-surface-secondary)",
                  borderRadius: "var(--radius-sm-token)",
                  border: "1px dashed var(--color-border-default)",
                }}
              >
                Not enough data for chart. Please create grades and classes.
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Health Card */}
        <Card
          className="flex flex-col"
          style={{
            background: "var(--color-surface-primary)",
            border:
              "var(--card-border-width) solid var(--color-border-default)",
            borderRadius: "var(--radius-md-token)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <CardHeader>
            <CardTitle
              style={{
                fontFamily: "var(--font-family-heading)",
                fontSize: "var(--font-size-section-heading)",
                color: "var(--color-text-heading)",
              }}
            >
              System Health
            </CardTitle>
            <CardDescription
              style={{
                fontFamily: "var(--font-family-body)",
                fontSize: "var(--font-size-caption)",
                color: "var(--color-text-secondary)",
              }}
            >
              Quick overview of your school&apos;s setup.
            </CardDescription>
          </CardHeader>
          <CardContent
            className="flex-1 flex flex-col"
            style={{ gap: "var(--space-sm)" }}
          >
            {[
              { label: "Students Registered", ok: stats.totalStudents > 0 },
              { label: "Classes Active", ok: stats.activeClasses > 0 },
              { label: "Teachers Assigned", ok: stats.totalTeachers > 0 },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between"
                style={{
                  padding: "var(--space-sm) var(--space-md)",
                  border: "1px solid var(--color-border-default)",
                  borderRadius: "var(--radius-sm-token)",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-family-body)",
                    fontSize: "var(--font-size-body)",
                    fontWeight: "var(--font-weight-medium)",
                    color: "var(--color-text-body)",
                  }}
                >
                  {item.label}
                </span>
                <Badge
                  variant={item.ok ? "default" : "secondary"}
                  style={{
                    fontFamily: "var(--font-family-body)",
                    fontSize: "var(--font-size-tag)",
                    background: item.ok
                      ? "var(--color-category-green)"
                      : "var(--color-surface-secondary)",
                    color: item.ok
                      ? "var(--color-text-inverse)"
                      : "var(--color-text-secondary)",
                  }}
                >
                  {item.ok ? "Good" : "Action Required"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
