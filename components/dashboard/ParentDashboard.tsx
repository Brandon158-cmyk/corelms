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
  UserMultiple02Icon,
  HelpCircleIcon,
  Notification02Icon,
  CreditCardIcon,
  LegalDocument01Icon,
} from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export function ParentDashboard({ user }: { user: any }) {
  const [activeSegment, setActiveSegment] = useState("students");

  return (
    <div className="flex flex-col gap-10 pb-12">
      {/* ── SECTION 1: Family Account Rail ───────────────────────────────────── */}
      <div
        className="grid grid-cols-2 md:grid-cols-4 border-b border-[var(--color-border-default)] bg-white sticky top-0 z-20"
        style={{
          margin: "0 calc(var(--space-lg) * -1)",
          padding: "var(--space-md) var(--space-lg)",
        }}
      >
        <div className="flex flex-col gap-1 border-r border-[var(--color-border-default)] px-4">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Linked Children
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground font-sans">
              0
            </span>
            <Badge
              variant="outline"
              className="text-[9px] font-bold text-[var(--color-accent-primary)] border-[var(--color-accent-primary)] px-1 py-0"
            >
              PENDING
            </Badge>
          </div>
        </div>
        <div className="flex flex-col gap-1 border-r border-[var(--color-border-default)] px-4">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Account Balance
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-foreground font-sans">
              ZMW 0.00
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1 border-r border-[var(--color-border-default)] px-4">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Next Term Starts
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground font-sans">
              14 Jan
            </span>
            <span className="text-[10px] text-muted-foreground font-bold">
              Term 1
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1 px-4">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            School Notices
          </span>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-foreground font-sans">
              0
            </span>
            <div className="size-6 rounded-full bg-slate-100 flex items-center justify-center">
              <HugeiconsIcon
                icon={Notification02Icon}
                size={14}
                className="text-slate-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 2: Family Command Center ─────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:w-72 shrink-0 flex flex-col gap-1">
          <h2 className="text-[13px] font-bold text-foreground uppercase tracking-wider mb-4 px-2">
            Family Hub
          </h2>
          {[
            {
              id: "students",
              label: "Student Profiles",
              icon: UserMultiple02Icon,
            },
            { id: "payments", label: "Fees & Payments", icon: CreditCardIcon },
            {
              id: "circulars",
              label: "School Circulars",
              icon: LegalDocument01Icon,
            },
            { id: "support", label: "Help & Support", icon: HelpCircleIcon },
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
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                Quick Actions
              </span>
            </div>
            <button className="flex items-center gap-3 p-3 bg-white border border-[var(--color-border-default)] rounded-xl shadow-sm group hover:border-[var(--color-accent-primary)] transition-all">
              <div className="size-9 rounded-lg bg-[rgba(139,30,30,0.06)] text-[var(--color-accent-primary)] flex items-center justify-center">
                <HugeiconsIcon icon={Notification02Icon} size={16} />
              </div>
              <div className="text-left flex flex-col">
                <p className="text-[12px] font-bold text-foreground mb-0.5">
                  Pay School Fees
                </p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-tight font-medium">
                  Safe & Secure Payment
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeSegment === "students" && (
            <div className="flex flex-col gap-8">
              {/* Discovery-style Cards for Children */}
              <div className="bg-white border-l-[3px] border-l-[var(--color-accent-primary)] border border-[var(--color-border-default)] rounded-r-xl p-8 shadow-sm flex flex-col items-center justify-center text-center">
                <div className="size-20 rounded-full bg-[var(--color-surface-secondary)] border-2 border-dashed border-[var(--color-border-default)] flex items-center justify-center text-muted-foreground/30 mb-6">
                  <HugeiconsIcon icon={UserMultiple02Icon} size={32} />
                </div>
                <h3 className="text-lg font-bold text-foreground font-sans">
                  No Linked Accounts Found
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm mt-3 leading-relaxed">
                  Your family account is not yet connected to any student
                  profiles. Please contact the school's administration office
                  with your student ID to begin tracking progress.
                </p>
                <div className="mt-8 flex items-center gap-4">
                  <button className="text-[11px] font-bold bg-[var(--color-accent-primary)] text-white px-5 py-2.5 rounded-md uppercase tracking-wider shadow-sm hover:shadow-md transition-all">
                    Link my Student
                  </button>
                  <button className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider hover:text-foreground">
                    Contact Admin
                  </button>
                </div>
              </div>

              {/* Notice List */}
              <div className="bg-white border border-[var(--color-border-default)] rounded-xl shadow-sm overflow-hidden min-h-[400px]">
                <div className="px-6 py-5 border-b border-[var(--color-border-default)] bg-[var(--color-surface-secondary)]/30 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-foreground font-sans">
                      Important Circulars
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Official updates from the school management and teachers.
                    </p>
                  </div>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-muted-foreground gap-4">
                  <HugeiconsIcon
                    icon={LegalDocument01Icon}
                    size={48}
                    className="opacity-10"
                  />
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-bold uppercase tracking-widest">
                      No circulars to display
                    </p>
                    <p className="text-[11px] max-w-xs leading-relaxed opacity-60">
                      General announcements for terms and events will appear
                      here once your account is verified.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSegment === "payments" && (
            <div className="bg-white border border-[var(--color-border-default)] rounded-xl shadow-sm overflow-hidden">
              <div className="p-8 flex flex-col items-center justify-center text-center gap-6">
                <div className="size-16 rounded-2xl bg-[rgba(26,92,58,0.06)] border border-[rgba(26,92,58,0.1)] flex items-center justify-center text-[var(--color-category-green)]">
                  <HugeiconsIcon icon={CreditCardIcon} size={32} />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-bold text-foreground font-sans">
                    All payments up to date
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-xs">
                    There are no outstanding invoices for the current academic
                    session.
                  </p>
                </div>
                <button className="text-[11px] font-bold opacity-60 uppercase tracking-widest hover:opacity-100 mt-2">
                  View Payment History
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
