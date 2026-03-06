"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Search01Icon,
  UserGroupIcon,
  FilterIcon,
  ArrowRightIcon,
  UserMultiple02Icon,
  CheckmarkCircle02Icon,
  UserAccountIcon,
  DashboardCircleIcon,
  SentIcon,
  LegalDocument01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Id } from "@/convex/_generated/dataModel";
import { Spinner } from "@/components/ui/spinner";

export default function StudentsDirectoryPage() {
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [activeDomain, setActiveDomain] = useState("directory");

  // Fetch all classes for the filter dropdown
  const classes = useQuery(api.classes.list, {});

  // Fetch students, optionally filtered by class
  const students = useQuery(api.students.listStudents, {
    classId:
      selectedClass !== "all" ? (selectedClass as Id<"classes">) : undefined,
  });

  const filteredStudents = students?.filter((student) => {
    if (!search) return true;
    const lowerSearch = search.toLowerCase();
    return (
      student.name.toLowerCase().includes(lowerSearch) ||
      (student.email && student.email.toLowerCase().includes(lowerSearch))
    );
  });

  return (
    <div className="flex flex-col gap-0 pb-12">
      {/* ── SECTION 1: Student Enrolment Rail ─────────────────────────────────── */}
      <div
        className="grid grid-cols-2 md:grid-cols-4 border-b border-[var(--color-border-default)] bg-white sticky top-0 z-20 shadow-sm"
        style={{
          margin: "0 calc(var(--space-lg) * -1)",
          padding: "var(--space-md) var(--space-lg)",
        }}
      >
        <div className="flex flex-col gap-1 border-r border-[var(--color-border-default)] px-4">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Total Students
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground font-sans">
              {students?.length || 0}
            </span>
            <span className="text-[10px] text-[var(--color-category-green)] font-bold">
              ACTIVE
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1 border-r border-[var(--color-border-default)] px-4">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Avg Attendance
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground font-sans">
              92%
            </span>
            <span className="text-[10px] text-muted-foreground font-bold">
              Term 2
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1 border-r border-[var(--color-border-default)] px-4">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            New Enrolments
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground font-sans">
              14
            </span>
            <Badge
              variant="outline"
              className="text-[9px] font-bold text-[var(--color-category-purple)] border-[var(--color-category-purple)] px-1 py-0"
            >
              +8% MoM
            </Badge>
          </div>
        </div>
        <div className="flex flex-col gap-1 px-4">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Diversity Ratio
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground font-sans">
              1:1.1
            </span>
            <span className="text-[10px] text-muted-foreground font-bold font-sans">
              M/F Ratio
            </span>
          </div>
        </div>
      </div>

      {/* ── SECTION 2: Split-Pane Workspace ──────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-8 mt-10">
        {/* Domain Navigation */}
        <div className="lg:w-72 shrink-0 flex flex-col gap-1">
          <h2 className="text-[13px] font-bold text-foreground uppercase tracking-wider mb-4 px-2">
            Student Lifecycle
          </h2>
          {[
            {
              id: "directory",
              label: "Registry Directory",
              icon: UserMultiple02Icon,
            },
            {
              id: "attendance",
              label: "Attendance Audit",
              icon: CheckmarkCircle02Icon,
            },
            { id: "behaviour", label: "Discipline & Health", icon: SentIcon },
            {
              id: "reports",
              label: "Performance Reports",
              icon: LegalDocument01Icon,
            },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveDomain(item.id)}
              className={`flex items-center justify-between p-3.5 rounded-md transition-all text-left ${
                activeDomain === item.id
                  ? "bg-white shadow-sm border border-[var(--color-border-default)] text-[var(--color-accent-primary)] font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <HugeiconsIcon icon={item.icon} size={18} />
                <span className="text-[13px]">{item.label}</span>
              </div>
              {activeDomain === item.id && (
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-primary)]" />
              )}
            </button>
          ))}

          <div className="mt-8 px-2">
            <div className="p-5 rounded-xl border border-[var(--color-border-default)] bg-white shadow-sm flex flex-col gap-4">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Registrar Tools
              </span>
              <button className="w-full bg-[var(--color-accent-primary)] text-white text-[11px] font-bold uppercase tracking-widest py-3 rounded-md hover:shadow-md transition-all">
                Enrol New Student
              </button>
              <Link
                href="/dashboard/students/onboarding"
                className="text-[11px] font-bold text-center text-muted-foreground hover:text-foreground"
              >
                Batch Upload CSV
              </Link>
            </div>
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="flex-1">
          {activeDomain === "directory" && (
            <div className="flex flex-col gap-6">
              {/* Search and Filters Bar */}
              <div className="bg-white border border-[var(--color-border-default)] rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center shadow-sm">
                <div className="relative flex-1 w-full">
                  <HugeiconsIcon
                    icon={Search01Icon}
                    className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                  />
                  <Input
                    placeholder="Search students by name, ID or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 h-11 border-[var(--color-border-default)] focus-visible:ring-[var(--color-accent-primary)]"
                  />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <Select
                    value={selectedClass}
                    onValueChange={(val) => val && setSelectedClass(val)}
                  >
                    <SelectTrigger className="w-full md:w-[180px] h-11 border-[var(--color-border-default)]">
                      <HugeiconsIcon
                        icon={FilterIcon}
                        className="size-4 mr-2"
                      />
                      <SelectValue placeholder="All Classes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      {classes?.map((cls) => (
                        <SelectItem key={cls._id} value={cls._id}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Student Records Table */}
              <div className="bg-white border border-[var(--color-border-default)] rounded-xl shadow-sm overflow-hidden min-h-[500px]">
                <div className="px-6 py-5 border-b border-[var(--color-border-default)] bg-[var(--color-surface-secondary)]/30 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-foreground font-sans">
                      Active Records
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Found {filteredStudents?.length || 0} students matching
                      your filters.
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[10px] font-bold uppercase border-muted bg-white px-2 py-0.5"
                  >
                    Registry Live
                  </Badge>
                </div>

                <Table>
                  <TableHeader className="bg-[var(--color-surface-secondary)]/50">
                    <TableRow className="hover:bg-transparent border-b border-[var(--color-border-default)]">
                      <TableHead className="h-12 px-6 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                        Student Name
                      </TableHead>
                      <TableHead className="h-12 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                        Primary Class
                      </TableHead>
                      <TableHead className="h-12 text-[11px] font-bold uppercase tracking-widest text-muted-foreground hidden md:table-cell">
                        Guardian
                      </TableHead>
                      <TableHead className="h-12 text-[11px] font-bold uppercase tracking-widest text-muted-foreground hidden lg:table-cell">
                        Status
                      </TableHead>
                      <TableHead className="h-12 px-6 text-right text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents === undefined ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-64 text-center">
                          <Spinner className="mx-auto size-6 text-[var(--color-accent-primary)]" />
                          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mt-4">
                            Syncing Registry...
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : filteredStudents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-64 text-center">
                          <div className="flex flex-col items-center gap-4 opacity-40">
                            <HugeiconsIcon icon={UserAccountIcon} size={48} />
                            <p className="text-[11px] font-bold uppercase tracking-widest">
                              No student records found
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredStudents.map((student) => (
                        <TableRow
                          key={student.id}
                          className="group hover:bg-[var(--color-surface-secondary)]/50 transition-colors border-b border-[var(--color-border-default)]/50 last:border-0"
                        >
                          <TableCell className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="size-9 rounded-full bg-[var(--color-accent-primary)] text-white text-[11px] font-bold flex items-center justify-center uppercase shadow-sm">
                                {student.name.substring(0, 2)}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-foreground group-hover:text-[var(--color-accent-primary)] transition-colors">
                                  {student.name}
                                </span>
                                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                                  {student.email || "No Email Verified"}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="text-[10px] font-bold border-[rgba(30,20,40,0.1)] text-muted-foreground bg-white"
                            >
                              {student.className}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <span className="text-xs font-semibold text-foreground/80">
                              {student.guardianName || "Not Linked"}
                            </span>
                            <span className="block text-[10px] text-muted-foreground uppercase font-medium mt-0.5">
                              LGL ADRX-01
                            </span>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="flex items-center gap-2">
                              <div className="size-1.5 rounded-full bg-[var(--color-category-green)] shadow-[0_0_8px_rgba(26,92,58,0.4)]" />
                              <span className="text-[11px] font-bold text-foreground uppercase tracking-tight">
                                Active
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="px-6 text-right">
                            <Link href={`/dashboard/students/${student.id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-3 text-[10px] font-bold uppercase tracking-widest hover:bg-[var(--color-accent-primary)] hover:text-white transition-all"
                              >
                                View Audit{" "}
                                <HugeiconsIcon
                                  icon={ArrowRight01Icon}
                                  className="ml-2 size-3"
                                />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
