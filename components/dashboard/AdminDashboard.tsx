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
        <Spinner className="size-8" />
      </div>
    );
  }

  if (stats === null) {
    return <div>Failed to load admin stats.</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <div className="rounded-full bg-brand-primary/10 p-2">
              <HugeiconsIcon
                icon={UserMultiple02Icon}
                className="text-brand-primary"
                size={16}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-brand-accent">
              {stats.totalStudents}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Teachers
            </CardTitle>
            <div className="rounded-full bg-blue-500/10 p-2">
              <HugeiconsIcon
                icon={TeacherIcon}
                className="text-blue-500"
                size={16}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-brand-accent">
              {stats.totalTeachers}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Active Classes
            </CardTitle>
            <div className="rounded-full bg-purple-500/10 p-2">
              <HugeiconsIcon
                icon={Book01Icon}
                className="text-purple-500"
                size={16}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-brand-accent">
              {stats.activeClasses}
              <span className="text-sm text-muted-foreground ml-2 font-normal">
                / {stats.totalClasses} total
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-sm md:col-span-2 lg:col-span-2">
          <CardHeader>
            <CardTitle>Classes per Grade Distribution</CardTitle>
            <CardDescription>
              Overview of active classes assigned to grades.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.chartData.length > 0 ? (
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.chartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#E5E7EB"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#6B7280", fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#6B7280", fontSize: 12 }}
                    />
                    <Tooltip
                      cursor={{ fill: "#F3F4F6" }}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Bar
                      dataKey="classes"
                      fill="#99282C"
                      radius={[4, 4, 0, 0]}
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                Not enough data for chart. Please create grades and classes.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>
              Quick overview of your school's setup.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm font-medium">Students Registered</span>
              <Badge
                variant={stats.totalStudents > 0 ? "default" : "secondary"}
              >
                {stats.totalStudents > 0 ? "Good" : "Action Required"}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm font-medium">Classes Active</span>
              <Badge
                variant={stats.activeClasses > 0 ? "default" : "secondary"}
              >
                {stats.activeClasses > 0 ? "Good" : "Action Required"}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm font-medium">Teachers Assigned</span>
              <Badge
                variant={stats.totalTeachers > 0 ? "default" : "secondary"}
              >
                {stats.totalTeachers > 0 ? "Good" : "Action Required"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
