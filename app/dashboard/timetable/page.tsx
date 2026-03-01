"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar03Icon,
  Settings01Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday"] as const;
const DAY_LABELS: Record<string, string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
};

const SUBJECT_COLORS = [
  "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
  "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
  "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
  "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
  "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800",
  "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800",
  "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
  "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800",
  "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800",
  "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800",
];

export default function TimetablePage() {
  const classes = useQuery(api.classes.list, {});
  const slots = useQuery(api.timetable.listSlots);
  const user = useQuery(api.users.currentUser);

  const [selectedClassId, setSelectedClassId] = useState<string>("");

  const entries = useQuery(
    api.timetable.listEntries,
    selectedClassId ? { classId: selectedClassId as any } : "skip",
  );

  // Build a color map for subjects
  const subjectColorMap = useMemo(() => {
    const map = new Map<string, string>();
    if (!entries) return map;
    const uniqueSubjects = [...new Set(entries.map((e) => e.subjectName))];
    uniqueSubjects.forEach((name, idx) => {
      map.set(name, SUBJECT_COLORS[idx % SUBJECT_COLORS.length]);
    });
    return map;
  }, [entries]);

  // Get unique periods (by periodNumber) for the row headers
  const periods = useMemo(() => {
    if (!slots) return [];
    const seen = new Map<
      number,
      { startTime: string; endTime: string; type: string; label?: string }
    >();
    for (const s of slots) {
      if (!seen.has(s.periodNumber)) {
        seen.set(s.periodNumber, {
          startTime: s.startTime,
          endTime: s.endTime,
          type: s.type,
          label: s.label,
        });
      }
    }
    return Array.from(seen.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([num, info]) => ({ periodNumber: num, ...info }));
  }, [slots]);

  // Build lookup: day+periodNumber -> entry
  const entryMap = useMemo(() => {
    const map = new Map<
      string,
      typeof entries extends (infer T)[] | undefined ? T : never
    >();
    if (!entries) return map;
    for (const e of entries) {
      map.set(`${e.day}-${e.periodNumber}`, e);
    }
    return map;
  }, [entries]);

  // Build lookup: day+periodNumber -> slot (for finding breaks/assemblies)
  const slotMap = useMemo(() => {
    const map = new Map<string, { type: string; label?: string }>();
    if (!slots) return map;
    for (const s of slots) {
      map.set(`${s.day}-${s.periodNumber}`, { type: s.type, label: s.label });
    }
    return map;
  }, [slots]);

  const isAdmin =
    user?.role === "superAdmin" ||
    user?.role === "headteacher" ||
    user?.role === "proprietor";

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-accent">Timetable</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View the weekly class schedule.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={selectedClassId}
            onValueChange={(v) => setSelectedClassId(v ?? "")}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Select a class…" />
            </SelectTrigger>
            <SelectContent>
              {classes?.map((c) => (
                <SelectItem key={c._id} value={c._id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              render={<Link href="/dashboard/timetable/manage" />}
            >
              <HugeiconsIcon icon={Settings01Icon} className="size-4 mr-1" />
              Manage
            </Button>
          )}
        </div>
      </div>

      {!selectedClassId ? (
        <Card className="border-dashed p-16 text-center">
          <HugeiconsIcon
            icon={Calendar03Icon}
            className="size-12 mx-auto text-muted-foreground opacity-20"
          />
          <p className="mt-4 text-muted-foreground font-medium">
            Select a class to view its weekly timetable.
          </p>
        </Card>
      ) : slots === undefined || entries === undefined ? (
        <div className="flex items-center justify-center py-16">
          <Spinner className="size-6" />
        </div>
      ) : periods.length === 0 ? (
        <Card className="border-dashed p-16 text-center">
          <HugeiconsIcon
            icon={Clock01Icon}
            className="size-12 mx-auto text-muted-foreground opacity-20"
          />
          <p className="mt-4 text-muted-foreground font-medium">
            No period slots have been configured yet.
          </p>
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              render={<Link href="/dashboard/timetable/manage" />}
            >
              Configure Periods
            </Button>
          )}
        </Card>
      ) : (
        <Card className="shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse">
                <thead>
                  <tr className="bg-muted/40">
                    <th className="p-3 text-left text-xs font-semibold text-muted-foreground uppercase w-[100px] border-b border-r">
                      Period
                    </th>
                    {DAYS.map((day) => (
                      <th
                        key={day}
                        className="p-3 text-center text-xs font-semibold text-muted-foreground uppercase border-b border-r last:border-r-0"
                      >
                        {DAY_LABELS[day]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {periods.map((period) => {
                    const isBreak =
                      period.type === "break" || period.type === "assembly";
                    return (
                      <tr
                        key={period.periodNumber}
                        className={isBreak ? "bg-muted/20" : ""}
                      >
                        <td className="p-2 border-b border-r text-center">
                          <div className="text-xs font-bold text-brand-accent">
                            {isBreak
                              ? period.label || period.type
                              : `P${period.periodNumber}`}
                          </div>
                          <div className="text-[10px] text-muted-foreground tabular-nums">
                            {period.startTime} – {period.endTime}
                          </div>
                        </td>
                        {DAYS.map((day) => {
                          if (isBreak) {
                            return (
                              <td
                                key={day}
                                className="p-2 border-b border-r last:border-r-0 text-center"
                              >
                                <span className="text-[10px] text-muted-foreground italic">
                                  {period.label || "Break"}
                                </span>
                              </td>
                            );
                          }
                          const entry = entryMap.get(
                            `${day}-${period.periodNumber}`,
                          );
                          if (!entry) {
                            return (
                              <td
                                key={day}
                                className="p-2 border-b border-r last:border-r-0 text-center"
                              >
                                <span className="text-[10px] text-muted-foreground">
                                  —
                                </span>
                              </td>
                            );
                          }
                          const colorClass =
                            subjectColorMap.get(entry.subjectName) ||
                            SUBJECT_COLORS[0];
                          return (
                            <td
                              key={day}
                              className="p-1.5 border-b border-r last:border-r-0"
                            >
                              <div
                                className={`rounded-md border p-2 text-center ${colorClass}`}
                              >
                                <div className="text-xs font-bold leading-tight">
                                  {entry.subjectName}
                                </div>
                                {entry.teacherName && (
                                  <div className="text-[10px] mt-0.5 opacity-80">
                                    {entry.teacherName}
                                  </div>
                                )}
                                {entry.room && (
                                  <div className="text-[10px] mt-0.5 opacity-60">
                                    {entry.room}
                                  </div>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
