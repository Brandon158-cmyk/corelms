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

export function TeacherDashboard() {
  const stats = useQuery(api.dashboard.getTeacherStats);

  if (stats === undefined) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (stats === null) {
    return <div>Failed to load teacher stats.</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Your Classes</CardTitle>
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
              {stats.classesCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Classes attached to your profile
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Open Assignments
            </CardTitle>
            <div className="rounded-full bg-blue-500/10 p-2">
              <HugeiconsIcon
                icon={TaskDaily01Icon}
                className="text-blue-500"
                size={16}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-brand-accent">
              {stats.assignmentCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Assignments pending grading
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>My Classes Overview</CardTitle>
            <CardDescription>
              Quick access to classes you teach or manage.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.myClasses.length > 0 ? (
              <div className="space-y-3">
                {stats.myClasses.map((c: any) => (
                  <div
                    key={c._id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-muted/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-brand-primary/10">
                        <HugeiconsIcon
                          icon={Book01Icon}
                          className="size-4 text-brand-primary"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{c.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Room: {c.room || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-[150px] items-center justify-center text-sm text-muted-foreground border border-dashed rounded-lg bg-muted/20">
                You are not assigned to any classes yet.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Recent Assignments</CardTitle>
            <CardDescription>Your recently created open tasks.</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentAssignments.length > 0 ? (
              <div className="space-y-3">
                {stats.recentAssignments.map((a: any) => (
                  <div
                    key={a._id}
                    className="flex flex-col gap-1 p-3 border rounded-lg bg-muted/5"
                  >
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-semibold line-clamp-1">
                        {a.title}
                      </p>
                      <span className="text-[10px] font-semibold tracking-wider text-green-600 bg-green-100 px-2 py-0.5 rounded-full uppercase">
                        open
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
                      <span>
                        Due: {format(new Date(a.dueDate), "MMM dd, yyyy")}
                      </span>
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-brand-primary"
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
              <div className="flex h-[150px] items-center justify-center text-sm text-muted-foreground border border-dashed rounded-lg bg-muted/20">
                No recent assignments.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
