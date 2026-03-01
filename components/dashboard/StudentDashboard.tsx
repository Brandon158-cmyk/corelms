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

export function StudentDashboard() {
  const stats = useQuery(api.dashboard.getStudentStats);

  if (stats === undefined) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (stats === null) {
    return <div>Failed to load student stats.</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">My Class</CardTitle>
            <div className="rounded-full bg-brand-primary/10 p-2">
              <HugeiconsIcon
                icon={BookOpen01Icon}
                className="text-brand-primary"
                size={16}
              />
            </div>
          </CardHeader>
          <CardContent>
            {stats.myClass ? (
              <>
                <div className="text-xl font-bold text-brand-accent">
                  {(stats.myClass as any).name}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Room: {(stats.myClass as any).room || "Not assigned"}
                </p>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">
                Not enrolled yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Assignments Due
            </CardTitle>
            <div className="rounded-full bg-orange-500/10 p-2">
              <HugeiconsIcon
                icon={TaskDaily01Icon}
                className="text-orange-500"
                size={16}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-brand-accent">
              {stats.upcomingAssignments.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active tasks pending your submission
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Next Event</CardTitle>
            <div className="rounded-full bg-blue-500/10 p-2">
              <HugeiconsIcon
                icon={Calendar03Icon}
                className="text-blue-500"
                size={16}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-brand-accent">
              Math Mid-Term
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Coming up on Nov 14th
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Upcoming Assignments</CardTitle>
            <CardDescription>Tasks you need to complete soon.</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.upcomingAssignments.length > 0 ? (
              <div className="space-y-3">
                {stats.upcomingAssignments.map((a: any) => (
                  <div
                    key={a._id}
                    className="flex flex-col gap-1 p-3 border rounded-lg bg-orange-50/50"
                  >
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-semibold line-clamp-1 text-orange-950">
                        {a.title}
                      </p>
                    </div>
                    <div className="flex justify-between items-center text-xs text-orange-800 mt-1">
                      <span>
                        Due: {format(new Date(a.dueDate), "MMM dd, yyyy")}
                      </span>
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-orange-700"
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
              <div className="flex h-[150px] items-center justify-center text-sm text-muted-foreground border border-dashed rounded-lg bg-muted/20">
                You're all caught up! No active assignments.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Recent Grades</CardTitle>
            <CardDescription>
              Your performance on recent assessments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentGrades.length > 0 ? (
              <div className="space-y-3">
                {stats.recentGrades.map((g: any) => (
                  <div
                    key={g._id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-muted/5"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-sm font-semibold">
                          Assessment Score
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {g.comments || "No comments"}
                        </p>
                      </div>
                    </div>
                    <div className="text-lg font-bold text-brand-primary">
                      {g.score}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-[150px] items-center justify-center text-sm text-muted-foreground border border-dashed rounded-lg bg-muted/20">
                No recent grades published.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
