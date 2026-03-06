"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Book01Icon,
  TaskDaily01Icon,
  UserMultiple02Icon,
  CheckmarkCircle02Icon,
  Notification02Icon,
  PresentationIcon,
  GraduationCap,
  Calendar01Icon,
  ArrowRight,
} from "@hugeicons/core-free-icons";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export function TeacherDashboard() {
  const stats = useQuery(api.dashboard.getTeacherStats);
  const [activeSegment, setActiveSegment] = useState("classes");

  if (stats === undefined) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Spinner className="size-8 text-[var(--color-accent-primary)]" />
      </div>
    );
  }

  if (stats === null) {
    return <div>Failed to load teacher stats.</div>;
  }

  return (
    <div className="flex flex-col gap-10 pb-12">
      {/* ── SECTION 1: Teacher Performance Rail ───────────────────────────────── */}
      <div
        className="grid grid-cols-2 md:grid-cols-4 border-b border-[var(--color-border-default)] bg-white sticky top-0 z-20"
        style={{
          margin: "0 calc(var(--space-lg) * -1)",
          padding: "var(--space-md) var(--space-lg)",
        }}
      >
        <div className="flex flex-col gap-1 border-r border-[var(--color-border-default)] px-4">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Active Classes
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground font-sans">
              {stats.classesCount}
            </span>
            <span className="text-[10px] text-muted-foreground font-bold">
              In-term
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1 border-r border-[var(--color-border-default)] px-4">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Grading Queue
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground font-sans">
              {stats.assignmentCount}
            </span>
            <Badge
              variant="outline"
              className="text-[9px] font-bold text-[var(--color-accent-primary)] border-[var(--color-accent-primary)] px-1 py-0"
            >
              URGENT
            </Badge>
          </div>
        </div>
        <div className="flex flex-col gap-1 border-r border-[var(--color-border-default)] px-4">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Avg Attendance
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground font-sans">
              94.8%
            </span>
            <span className="text-[10px] text-[var(--color-category-green)] font-bold">
              Stable
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1 px-4">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Lessons Today
          </span>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-foreground font-sans">
              4
            </span>
            <div className="flex items-center -space-x-1.5 overflow-hidden">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="size-5 rounded-full border-1.5 border-white bg-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-500"
                >
                  {i}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 2: Faculty Command Center ─────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:w-72 shrink-0 flex flex-col gap-1">
          <h2 className="text-[13px] font-bold text-foreground uppercase tracking-wider mb-4 px-2">
            Teaching Domains
          </h2>
          {[
            {
              id: "classes",
              label: "Class Management",
              icon: PresentationIcon,
            },
            {
              id: "grading",
              label: "Assessments & Grading",
              icon: GraduationCap,
            },
            { id: "lessons", label: "Lesson Planning", icon: Book01Icon },
            {
              id: "attendance",
              label: "Attendance Monitor",
              icon: CheckmarkCircle02Icon,
            },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSegment(item.id)}
              className={`flex items-center justify-between p-3.5 rounded-md transition-all text-left ${
                activeSegment === item.id
                  ? "bg-white shadow-sm border border-[var(--color-border-default)] text-[var(--color-accent-primary)] font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <HugeiconsIcon icon={item.icon} size={18} />
                <span className="text-[13px]">{item.label}</span>
              </div>
              {activeSegment === item.id && (
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-primary)]" />
              )}
            </button>
          ))}

          <div className="mt-10 px-2 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                Reminders
              </span>
              <Badge
                variant="outline"
                className="text-[9px] font-bold rounded-full h-4 min-w-4 p-0 flex items-center justify-center border-muted"
              >
                2
              </Badge>
            </div>
            <div className="flex gap-3 p-3 bg-white border border-[var(--color-border-default)] rounded-lg shadow-sm">
              <div className="size-7 rounded bg-[rgba(139,30,30,0.08)] text-[var(--color-accent-primary)] flex items-center justify-center">
                <HugeiconsIcon icon={Notification02Icon} size={14} />
              </div>
              <div className="flex flex-col">
                <p className="text-[11px] font-bold text-foreground">
                  Grade Term Reports
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Due by Friday 5PM
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeSegment === "classes" && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {stats.myClasses.length > 0 ? (
                  stats.myClasses.map((c: any) => (
                    <div
                      key={c._id}
                      className="bg-white border border-[var(--color-border-default)] rounded-xl group transition-all hover:shadow-md cursor-default flex flex-col overflow-hidden"
                    >
                      <div className="h-24 bg-[var(--color-surface-secondary)]/50 border-b border-[var(--color-border-default)] p-4 flex items-start justify-between">
                        <div className="size-10 rounded-lg bg-white border border-[var(--color-border-default)] shadow-sm flex items-center justify-center text-[var(--color-accent-primary)]">
                          <HugeiconsIcon icon={PresentationIcon} size={20} />
                        </div>
                        <Badge className="bg-white border-[var(--color-border-default)] text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                          {c.room || "No Room"}
                        </Badge>
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="text-[15px] font-bold text-foreground leading-snug group-hover:text-[var(--color-accent-primary)] transition-colors">
                          {c.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                          Active curriculum session for this term. Monitoring
                          student progress and lesson delivery schedules.
                        </p>
                        <div className="mt-6 pt-4 border-t border-[var(--color-border-default)]/60 flex items-center justify-between">
                          <div className="flex items-center gap-4 text-[11px] font-medium text-muted-foreground tracking-wide uppercase">
                            <span className="flex items-center gap-1.5">
                              <HugeiconsIcon
                                icon={UserMultiple02Icon}
                                size={14}
                              />{" "}
                              24 Students
                            </span>
                            <span className="flex items-center gap-1.5">
                              <HugeiconsIcon icon={Calendar01Icon} size={14} />{" "}
                              Daily
                            </span>
                          </div>
                          <button className="text-[var(--color-accent-primary)] opacity-0 group-hover:opacity-100 transition-opacity">
                            <HugeiconsIcon icon={ArrowRight} size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full h-48 border border-dashed rounded-xl flex flex-col items-center justify-center gap-2 bg-[var(--color-surface-secondary)]/30 text-muted-foreground">
                    <HugeiconsIcon icon={Book01Icon} size={24} />
                    <p className="text-xs font-medium uppercase tracking-widest">
                      No assigned classes found
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSegment === "grading" && (
            <div className="bg-white border border-[var(--color-border-default)] rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-[var(--color-border-default)] bg-[var(--color-surface-secondary)]/20 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-foreground font-sans">
                    Pending Submissions
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Review and grade recently submitted student assessments.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-accent-primary)]"
                >
                  Grading History
                </Button>
              </div>
              <div className="divide-y divide-[var(--color-border-default)]">
                {stats.recentAssignments.length > 0 ? (
                  stats.recentAssignments.map((a: any) => (
                    <div
                      key={a._id}
                      className="p-4 flex items-center gap-6 hover:bg-[var(--color-surface-secondary)]/50 transition-colors group"
                    >
                      <div className="size-10 rounded-lg bg-[rgba(22,78,99,0.08)] text-[var(--color-category-teal)] flex items-center justify-center">
                        <HugeiconsIcon icon={TaskDaily01Icon} size={20} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-foreground">
                          {a.title}
                        </h4>
                        <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground font-medium">
                          <span className="flex items-center gap-1.5">
                            <HugeiconsIcon icon={Calendar01Icon} size={12} />{" "}
                            Due {format(new Date(a.dueDate), "MMM dd, yyyy")}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                          <span className="uppercase tracking-widest text-[var(--color-accent-primary)]">
                            12 New Submissions
                          </span>
                        </div>
                      </div>
                      <Link href={`/dashboard/lms/assignments?id=${a._id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-[10px] font-bold uppercase tracking-wider border-[var(--color-accent-primary)] text-[var(--color-accent-primary)] hover:bg-[var(--color-accent-primary)] hover:text-white transition-all"
                        >
                          Grade Now
                        </Button>
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="flex h-48 items-center justify-center text-[11px] font-bold uppercase tracking-widest text-muted-foreground bg-[var(--color-surface-secondary)]/20 p-6 text-center">
                    Queue is completely empty! Great work.
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
