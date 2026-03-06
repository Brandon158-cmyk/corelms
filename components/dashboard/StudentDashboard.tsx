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
  CheckmarkCircle02Icon,
  Award01Icon,
  Clock01Icon,
  GraduationCap,
  Analytics01Icon,
} from "@hugeicons/core-free-icons";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export function StudentDashboard() {
  const stats = useQuery(api.dashboard.getStudentStats);
  const [activeSegment, setActiveSegment] = useState("overview");

  if (stats === undefined) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Spinner className="size-8 text-(--color-accent-primary)" />
      </div>
    );
  }

  if (stats === null) {
    return <div>Failed to load student stats.</div>;
  }

  const myClass = stats.myClass as any;

  return (
    <div className="flex flex-col gap-10 pb-12">
      {/* ── SECTION 1: Academic Performance Rail ───────────────────────────────── */}
      <div
        className="grid grid-cols-2 md:grid-cols-4 border-b border-(--color-border-default) bg-white sticky top-0 z-20"
        style={{
          margin: "0 calc(var(--space-lg) * -1)",
          padding: "var(--space-md) var(--space-lg)",
        }}
      >
        <div className="flex flex-col gap-1 border-r border-[var(--color-border-default)] px-4">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Academic GPA
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground font-sans">
              3.8
            </span>
            <span className="text-[10px] text-(--color-category-green) font-bold">
              EXCELLENT
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1 border-r border-[var(--color-border-default)] px-4">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Task Completion
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground font-sans">
              84%
            </span>
            <span className="text-[10px] text-muted-foreground font-bold">
              {stats.upcomingAssignments.length} PENDING
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1 border-r border-[var(--color-border-default)] px-4">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            School Points
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground font-sans">
              420
            </span>
            <Badge className="bg-[rgba(201,162,39,0.1)] text-(--color-warning) text-[9px] font-bold uppercase border-0">
              +15 XP
            </Badge>
          </div>
        </div>
        <div className="flex flex-col gap-1 px-4">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Daily Streak
          </span>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-foreground font-sans">
              12
            </span>
            <div className="flex items-center -space-x-1.5 overflow-hidden">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`size-5 rounded-full border-1.5 border-white ${i <= 3 ? "bg-(--color-accent-primary) text-white" : "bg-slate-200 text-slate-500"} flex items-center justify-center text-[7px] font-bold`}
                >
                  ✓
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 2: Student Command Center ─────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:w-72 shrink-0 flex flex-col gap-1">
          <h2 className="text-[13px] font-bold text-foreground uppercase tracking-wider mb-4 px-2">
            Learning Hub
          </h2>
          {[
            {
              id: "overview",
              label: "Dashboard Overview",
              icon: GraduationCap,
            },
            {
              id: "assignments",
              label: "Assignments & Due",
              icon: TaskDaily01Icon,
            },
            {
              id: "grades",
              label: "Grade Performance",
              icon: Analytics01Icon,
            },
            { id: "lessons", label: "Today's Schedule", icon: Clock01Icon },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSegment(item.id)}
              className={`flex items-center justify-between p-3.5 rounded-md transition-all text-left ${
                activeSegment === item.id
                  ? "bg-white shadow-sm border border-(--color-border-default) text-(--color-accent-primary) font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <HugeiconsIcon icon={item.icon} size={18} />
                <span className="text-[13px]">{item.label}</span>
              </div>
              {activeSegment === item.id && (
                <div className="w-1.5 h-1.5 rounded-full bg-(--color-accent-primary)" />
              )}
            </button>
          ))}

          <div className="mt-10 px-2 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                Linked Child
              </span>
              <Badge
                variant="outline"
                className="text-[9px] font-bold rounded-full h-4 min-w-4 p-0 flex items-center justify-center border-muted"
              >
                NEW
              </Badge>
            </div>
            <div className="p-4 bg-[rgba(26,92,58,0.06)] border border-[rgba(26,92,58,0.1)] rounded-xl relative overflow-hidden group hover:shadow-md transition-all">
              <div className="flex items-center gap-3 relative z-10">
                <div className="size-10 rounded-lg bg-white shadow-sm border border-(--color-border-default) flex items-center justify-center text-(--color-category-green)">
                  <HugeiconsIcon icon={Award01Icon} size={20} />
                </div>
                <div className="flex flex-col">
                  <p className="text-[12px] font-bold text-foreground">
                    Scholarship Fund
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Applications Open
                  </p>
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <HugeiconsIcon icon={GraduationCap} size={64} />
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeSegment === "overview" && (
            <div className="flex flex-col gap-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current Class Card */}
                <div className="bg-white border-l-[3px] border-l-(--color-accent-primary) border border-(--color-border-default) rounded-r-xl p-6 shadow-sm flex flex-col">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60 tracking-widest">
                      Enrolled Class
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[9px] font-bold uppercase border-muted text-muted-foreground"
                    >
                      Active Term
                    </Badge>
                  </div>
                  {myClass ? (
                    <div className="flex flex-col">
                      <h3 className="text-xl font-bold text-foreground font-sans leading-tight mt-1">
                        {myClass.name}
                      </h3>
                      <div className="flex items-center gap-4 mt-6 text-[11px] font-medium text-muted-foreground tracking-wide uppercase">
                        <span className="flex items-center gap-1.5">
                          <HugeiconsIcon icon={BookOpen01Icon} size={14} /> Room{" "}
                          {myClass.room || "N/A"}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <HugeiconsIcon icon={Clock01Icon} size={14} /> 08:30
                          AM
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm font-medium text-muted-foreground mt-2">
                      No class enrollment found. Contact registrar.
                    </p>
                  )}
                </div>

                {/* Upcoming Event */}
                <div className="bg-white border-l-[3px] border-l-(--color-warning) border border-(--color-border-default) rounded-r-xl p-6 shadow-sm flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60 tracking-widest">
                    Coming Up Next
                  </span>
                  <h3 className="text-xl font-bold text-foreground font-sans leading-tight mt-1">
                    Maths Mid-Term Assessment
                  </h3>
                  <div className="flex items-center gap-3 mt-6 text-[11px] font-medium text-muted-foreground tracking-wide uppercase">
                    <span className="flex items-center gap-1.5 text-(--color-warning)">
                      <HugeiconsIcon icon={Calendar03Icon} size={14} /> Next
                      Thursday
                    </span>
                  </div>
                </div>
              </div>

              {/* Assignments Due List */}
              <div className="bg-white border border-(--color-border-default) rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-(--color-border-default) bg-(--color-surface-secondary)/30 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-foreground font-sans">
                      Active Tasks & Due
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Submit your coursework before the deadlines below.
                    </p>
                  </div>
                  <Badge className="bg-[rgba(139,30,30,0.1)] text-[var(--color-accent-primary)] font-bold text-[10px] uppercase border-0">
                    {stats.upcomingAssignments.length} ACTIONS
                  </Badge>
                </div>
                <div className="divide-y divide-(--color-border-default)">
                  {stats.upcomingAssignments.length > 0 ? (
                    stats.upcomingAssignments.map((a: any) => (
                      <div
                        key={a._id}
                        className="p-4 flex items-center gap-6 hover:bg-(--color-surface-secondary)/50 transition-colors group"
                      >
                        <div className="size-10 rounded-lg bg-[rgba(201,162,39,0.08)] text-[var(--color-warning)] flex items-center justify-center">
                          <HugeiconsIcon icon={TaskDaily01Icon} size={20} />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-foreground group-hover:text-(--color-accent-primary) transition-colors">
                            {a.title}
                          </h4>
                          <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                            <span className="flex items-center gap-1.5">
                              <HugeiconsIcon icon={Calendar03Icon} size={12} />{" "}
                              Due {format(new Date(a.dueDate), "MMM dd, yyyy")}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                            <span className="flex items-center gap-1.5 font-bold text-(--color-category-green)">
                              <HugeiconsIcon
                                icon={CheckmarkCircle02Icon}
                                size={12}
                              />{" "}
                              Pending Submission
                            </span>
                          </div>
                        </div>
                        <Link href={`/dashboard/lms/assignments?id=${a._id}`}>
                          <Button
                            size="sm"
                            className="h-9 px-5 bg-(--color-accent-primary) text-white font-bold uppercase tracking-wider text-[10px] shadow-sm hover:translate-x-1 transition-all"
                          >
                            Start Task{" "}
                            <HugeiconsIcon
                              icon={ArrowRight01Icon}
                              size={12}
                              className="ml-2"
                            />
                          </Button>
                        </Link>
                      </div>
                    ))
                  ) : (
                    <div className="h-40 flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      All assignments are submitted!
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeSegment === "grades" && (
            <div className="bg-white border border-[var(--color-border-default)] rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-[var(--color-border-default)] flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-foreground font-sans">
                    Published Results
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Review your scores and direct feedback from teachers.
                  </p>
                </div>
              </div>
              <div className="p-6">
                {stats.recentGrades.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {stats.recentGrades.map((g: any) => (
                      <div
                        key={g._id}
                        className="p-5 bg-[var(--color-surface-secondary)]/50 border border-[var(--color-border-default)] rounded-xl relative group"
                      >
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60 tracking-widest">
                              Assessment Detail
                            </span>
                            <h4 className="text-sm font-bold text-foreground mt-1">
                              Semester Summary
                            </h4>
                          </div>
                          <div className="text-3xl font-bold text-[var(--color-accent-primary)] font-sans">
                            {g.score}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed italic border-t border-[var(--color-border-default)] pt-4 mt-2">
                          "
                          {g.comments ||
                            "Consistent performance, looking forward to your next module."}
                          "
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-40 flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    No reports published yet this term.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
