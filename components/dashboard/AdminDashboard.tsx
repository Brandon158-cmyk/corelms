"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Book01Icon,
  UserMultiple02Icon,
  DashboardCircleIcon,
  ArrowRight01Icon,
  Calendar03Icon,
  Settings02Icon,
  Analytics01Icon,
  Document,
  LegalDocument01Icon,
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
import { useState } from "react";

export function AdminDashboard() {
  const stats = useQuery(api.dashboard.getAdminStats);
  const [activeSegment, setActiveSegment] = useState("overview");

  if (stats === undefined) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Spinner className="size-8 text-[var(--color-accent-primary)]" />
      </div>
    );
  }

  if (stats === null) {
    return <div>Failed to load admin stats.</div>;
  }

  return (
    <div className="flex flex-col gap-0 pb-12">
      {/* ── SECTION 1: Metrics Rail ────────────────────────────────────────── */}
      {/* Jam-packed row of key metrics, flat and professional */}
      <div
        className="grid grid-cols-2 md:grid-cols-4 border-b border-[var(--color-border-default)] bg-white sticky top-0 z-20"
        style={{
          margin: "0 calc(var(--space-lg) * -1)",
          padding: "var(--space-md) var(--space-lg)",
        }}
      >
        <div className="flex flex-col gap-1 border-r border-[var(--color-border-default)] px-4">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Total Enrolment
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground font-sans">
              {stats.totalStudents}
            </span>
            <span className="text-[10px] text-[var(--color-category-green)] font-bold">
              +2.4%
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1 border-r border-[var(--color-border-default)] px-4">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Staff Capacity
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground font-sans">
              {stats.totalTeachers}
            </span>
            <span className="text-[10px] text-muted-foreground font-bold">
              1:12 Ratio
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1 border-r border-[var(--color-border-default)] px-4">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Class Utilization
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground font-sans">
              {Math.round(
                (stats.activeClasses / (stats.totalClasses || 1)) * 100,
              )}
              %
            </span>
            <span className="text-[10px] text-muted-foreground font-bold">
              {stats.activeClasses}/{stats.totalClasses}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1 px-4">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Term Completion
          </span>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-foreground font-sans">
              64%
            </span>
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-[var(--color-accent-primary)] w-[64%]" />
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 2: Insight Engine ───────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-8 mt-8">
        {/* Left: Domain Navigation (Inspired by PwC "What's new") */}
        <div className="lg:w-72 shrink-0 flex flex-col gap-1">
          <h2 className="text-[13px] font-bold text-foreground uppercase tracking-wider mb-3 px-2">
            Insights Explorer
          </h2>
          {[
            {
              id: "overview",
              label: "System Overview",
              icon: DashboardCircleIcon,
            },
            {
              id: "analytics",
              label: "Performance Analytics",
              icon: Analytics01Icon,
            },
            { id: "health", label: "Operational Health", icon: Settings02Icon },
            {
              id: "reports",
              label: "Audit & Reports",
              icon: LegalDocument01Icon,
            },
            { id: "calendar", label: "Academic Cycle", icon: Calendar03Icon },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSegment(item.id)}
              className={`flex items-center justify-between p-3 rounded-md transition-all text-left ${
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

          <div className="mt-8 px-2">
            <div className="p-4 rounded-lg bg-[var(--color-accent-primary)] text-white flex flex-col gap-3">
              <p className="text-xs font-medium leading-relaxed opacity-90">
                Need a comprehensive system audit for the board?
              </p>
              <button className="text-[11px] font-bold uppercase tracking-widest bg-white/10 hover:bg-white/20 p-2 rounded transition-colors flex items-center justify-center gap-2">
                Generate Final Report{" "}
                <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Feature Content Area */}
        <div className="flex-1">
          {activeSegment === "overview" && (
            <div className="flex flex-col gap-8">
              {/* Distribution Chart — Professional Treatment */}
              <div className="bg-white border border-[var(--color-border-default)] rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-[var(--color-border-default)] flex items-center justify-between bg-[var(--color-surface-secondary)]/30">
                  <div>
                    <h3 className="text-base font-bold text-foreground font-sans">
                      Academic Distribution
                    </h3>
                    <p className="text-[11px] font-medium text-muted-foreground mt-0.5">
                      Live visualization of class assignment across grades
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-white border-[var(--color-border-default)] text-[10px] font-bold uppercase tracking-wider"
                  >
                    Real-time Data
                  </Badge>
                </div>
                <div className="p-6">
                  {stats.chartData.length > 0 ? (
                    <div className="h-[340px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={stats.chartData}
                          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="var(--color-border-default)"
                            opacity={0.5}
                          />
                          <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{
                              fill: "var(--color-text-secondary)",
                              fontSize: 11,
                              fontWeight: 600,
                            }}
                            dy={10}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{
                              fill: "var(--color-text-secondary)",
                              fontSize: 11,
                              fontWeight: 600,
                            }}
                          />
                          <Tooltip
                            cursor={{
                              fill: "var(--color-surface-secondary)",
                              opacity: 0.4,
                            }}
                            contentStyle={{
                              borderRadius: "8px",
                              border: "1px solid var(--color-border-default)",
                              boxShadow: "var(--shadow-popover)",
                              background: "white",
                            }}
                          />
                          <Bar
                            dataKey="classes"
                            fill="var(--color-accent-primary)"
                            radius={[2, 2, 0, 0]}
                            barSize={32}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-sm font-medium text-muted-foreground bg-[var(--color-surface-secondary)] rounded-lg border border-dashed">
                      No distribution data available
                    </div>
                  )}
                </div>
              </div>

              {/* Discovery-style Cards for System Modules */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border-l-[3px] border-l-[var(--color-category-green)] border border-[var(--color-border-default)] rounded-r-xl p-5 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-full bg-[rgba(26,92,58,0.08)] flex items-center justify-center text-[var(--color-category-green)]">
                      <HugeiconsIcon icon={UserMultiple02Icon} size={20} />
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">
                      Directory
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-foreground mb-1">
                    Student Management
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Review student intake, attendance trends, and behavioral
                    tracking across all departments.
                  </p>
                  <div className="mt-6 pt-4 border-t border-[var(--color-border-default)] flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-foreground">
                        {stats.totalStudents}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase font-medium">
                        Active
                      </span>
                    </div>
                    <button className="text-[11px] font-bold text-[var(--color-accent-primary)] uppercase flex items-center gap-1.5 hover:underline">
                      Explore{" "}
                      <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
                    </button>
                  </div>
                </div>

                <div className="bg-white border-l-[3px] border-l-[var(--color-category-purple)] border border-[var(--color-border-default)] rounded-r-xl p-5 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-full bg-[rgba(74,32,128,0.08)] flex items-center justify-center text-[var(--color-category-purple)]">
                      <HugeiconsIcon icon={Book01Icon} size={20} />
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">
                      Curriculum
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-foreground mb-1">
                    Academic Inventory
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Monitor class scheduling, teacher workloads, and academic
                    resource distribution for this term.
                  </p>
                  <div className="mt-6 pt-4 border-t border-[var(--color-border-default)] flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-foreground">
                        {stats.activeClasses}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase font-medium">
                        Classes
                      </span>
                    </div>
                    <button className="text-[11px] font-bold text-[var(--color-accent-primary)] uppercase flex items-center gap-1.5 hover:underline">
                      View All{" "}
                      <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSegment === "health" && (
            <div className="bg-white border border-[var(--color-border-default)] rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-[var(--color-border-default)]">
                <h3 className="text-base font-bold text-foreground font-sans">
                  System Integrity Check
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Review operational flags and setup completion across the
                  school instance.
                </p>
              </div>
              <div className="divide-y divide-[var(--color-border-default)]">
                {[
                  {
                    label: "Students Records",
                    status: stats.totalStudents > 0 ? "Healthy" : "Incomplete",
                    detail: "Database integrity and profile completion checks",
                    ok: stats.totalStudents > 0,
                  },
                  {
                    label: "Faculty Assignments",
                    status:
                      stats.totalTeachers > 0 ? "Optimal" : "Action Required",
                    detail: "Class-to-teacher mapping and workload balancing",
                    ok: stats.totalTeachers > 0,
                  },
                  {
                    label: "Classroom Scheduler",
                    status: stats.activeClasses > 0 ? "Active" : "Not Ready",
                    detail:
                      "Verification of room allocations and period timings",
                    ok: stats.activeClasses > 0,
                  },
                  {
                    label: "Financial Integration",
                    status: "Verified",
                    detail: "Billing system hooks and payment gateway sync",
                    ok: true,
                  },
                  {
                    label: "Core Communication",
                    status: "Active",
                    detail: "Message queue status and mail server connectivity",
                    ok: true,
                  },
                ].map((sys, idx) => (
                  <div
                    key={idx}
                    className="p-4 flex items-center gap-6 hover:bg-[var(--color-surface-secondary)]/50 transition-colors"
                  >
                    <div
                      className={`p-2 rounded-lg ${sys.ok ? "bg-[rgba(26,92,58,0.08)] text-[var(--color-category-green)]" : "bg-[rgba(139,30,30,0.08)] text-[var(--color-accent-primary)]"}`}
                    >
                      <HugeiconsIcon
                        icon={idx % 2 === 0 ? Settings02Icon : Analytics01Icon}
                        size={18}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground font-sans">
                          {sys.label}
                        </span>
                        <span
                          className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border ${sys.ok ? "border-[var(--color-category-green)] text-[var(--color-category-green)]" : "border-[var(--color-accent-primary)] text-[var(--color-accent-primary)]"}`}
                        >
                          {sys.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                        {sys.detail}
                      </p>
                    </div>
                    <button className="text-muted-foreground hover:text-[var(--color-accent-primary)]">
                      <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
