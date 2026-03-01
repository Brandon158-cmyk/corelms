"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar01Icon,
  UserGroupIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { useTermFilter } from "@/components/providers/TermFilterProvider";

type AttendanceStatus = "present" | "absent" | "late" | "excused";

interface StudentAttendanceState {
  status: AttendanceStatus;
  notes: string;
}

export default function AttendancePage() {
  const [date, setDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedContext, setSelectedContext] = useState<string>("daily");

  const [attendanceState, setAttendanceState] = useState<
    Record<string, StudentAttendanceState>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mode, selectedTermIds, selectedYearIds } = useTermFilter();

  // Query classes (can be filtered by terms later, keeping simple for now)
  const queryArgs =
    mode === "terms" && selectedTermIds.length > 0
      ? { termIds: selectedTermIds }
      : mode === "years" && selectedYearIds.length > 0
        ? { yearIds: selectedYearIds }
        : {};
  const classes = useQuery(api.classes.list, queryArgs);

  const validClassId = selectedClassId
    ? (selectedClassId as Id<"classes">)
    : undefined;

  const subjects = useQuery(
    api.classes.getSubjects,
    validClassId ? { classId: validClassId } : "skip",
  );

  const students = useQuery(
    api.classes.getStudents,
    validClassId ? { classId: validClassId } : "skip",
  );

  const validSubjectId =
    selectedContext !== "daily"
      ? (selectedContext as Id<"subjects">)
      : undefined;

  const existingAttendance = useQuery(
    api.attendance.getClassAttendance,
    validClassId
      ? { classId: validClassId, date, subjectId: validSubjectId }
      : "skip",
  );

  const filterLabel = useMemo(() => {
    switch (mode) {
      case "all-time":
        return "All Class Cohorts";
      case "years":
        return "Academic Year Cohorts";
      case "terms":
        return "Term Cohorts";
    }
  }, [mode]);

  const markAttendanceMutation = useMutation(
    api.attendance.markClassAttendance,
  );

  // Hydrate state when existing records or students load
  useEffect(() => {
    if (students && existingAttendance !== undefined) {
      const newState: Record<string, StudentAttendanceState> = {};

      // Map existing records
      const existingMap = new Map();
      existingAttendance.forEach((record) => {
        existingMap.set(record.studentId, {
          status: record.status,
          notes: record.notes || "",
        });
      });

      // Populate state (defaulting to 'present' if no record exists yet)
      students.forEach((student) => {
        if (existingMap.has(student._id)) {
          newState[student._id] = existingMap.get(student._id);
        } else {
          newState[student._id] = { status: "present", notes: "" };
        }
      });

      setAttendanceState(newState);
    }
  }, [students, existingAttendance]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceState((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], status },
    }));
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setAttendanceState((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], notes },
    }));
  };

  const setAllStatus = (status: AttendanceStatus) => {
    if (!students) return;
    const newState = { ...attendanceState };
    students.forEach((student) => {
      if (newState[student._id]) {
        newState[student._id].status = status;
      }
    });
    setAttendanceState(newState);
  };

  const handleSave = async () => {
    if (!validClassId) return;

    setIsSubmitting(true);
    try {
      const recordsToSave = Object.entries(attendanceState).map(
        ([studentId, state]) => ({
          studentId: studentId as Id<"users">,
          status: state.status,
          notes: state.notes,
        }),
      );

      await markAttendanceMutation({
        classId: validClassId,
        date,
        subjectId: validSubjectId,
        records: recordsToSave,
      });

      toast.success("Attendance saved successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to save attendance");
    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = useMemo(() => {
    let present = 0;
    let absent = 0;
    let late = 0;
    let excused = 0;

    Object.values(attendanceState).forEach((state) => {
      if (state.status === "present") present++;
      if (state.status === "absent") absent++;
      if (state.status === "late") late++;
      if (state.status === "excused") excused++;
    });

    const total = present + absent + late + excused;
    return { present, absent, late, excused, total };
  }, [attendanceState]);

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8 bg-brand-bg/30">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-accent">
            Attendance Register
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track daily homeroom or subject-specific attendance blocks.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 border-t-4 border-t-brand-primary h-fit">
          <CardHeader className="pb-4 border-b">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <HugeiconsIcon
                icon={Calendar01Icon}
                className="size-5 text-brand-primary"
              />
              Register Details
            </CardTitle>
            <CardDescription>
              Select the class and context to take attendance for.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            <div className="space-y-2">
              <Label>Class Cohort</Label>
              <Select
                value={selectedClassId}
                onValueChange={(val) => val && setSelectedClassId(val)}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      classes === undefined
                        ? "Loading classes..."
                        : "Select a class"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {filterLabel}
                  </div>
                  {classes?.map((cls) => (
                    <SelectItem key={cls._id} value={cls._id}>
                      {cls.name}{" "}
                      <span className="text-muted-foreground text-xs ml-1">
                        ({cls.gradeName})
                      </span>
                    </SelectItem>
                  ))}
                  {classes?.length === 0 && (
                    <div className="p-2 text-sm text-center text-muted-foreground">
                      No classes available context.
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Attendance Context</Label>
              <Select
                value={selectedContext}
                onValueChange={(val) => val && setSelectedContext(val)}
                disabled={!selectedClassId || !subjects}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select context" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">
                    <span className="font-medium">Daily Homeroom</span>
                  </SelectItem>
                  {subjects && subjects.length > 0 && (
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-2 border-t pt-2">
                      Subject Periods
                    </div>
                  )}
                  {subjects?.map((sub) => (
                    <SelectItem key={sub.subjectId} value={sub.subjectId}>
                      {sub.subjectName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full"
              />
            </div>

            {validClassId &&
              existingAttendance &&
              existingAttendance.length > 0 && (
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-md text-sm text-blue-800 flex items-start gap-2">
                  <HugeiconsIcon
                    icon={Tick02Icon}
                    className="size-4 mt-0.5 shrink-0"
                  />
                  <span>
                    Attendance records already exist for this context and have
                    been loaded.
                  </span>
                </div>
              )}
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2 shadow-sm border-t-4 border-t-brand-primary">
          <CardHeader className="pb-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <HugeiconsIcon
                  icon={UserGroupIcon}
                  className="size-5 text-brand-primary"
                />
                Student Roster
              </CardTitle>
              <CardDescription>
                Mark presence manually or use bulk actions.
              </CardDescription>
            </div>
            {students && students.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAllStatus("present")}
                className="shrink-0 h-9"
              >
                Mark All Present
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {!selectedClassId ? (
              <div className="p-12 text-center text-muted-foreground h-full flex flex-col items-center justify-center">
                <HugeiconsIcon
                  icon={Calendar01Icon}
                  className="size-10 mb-4 opacity-20"
                />
                <p>Select a class to view the attendance roster.</p>
              </div>
            ) : students === undefined || existingAttendance === undefined ? (
              <div className="flex justify-center p-12">
                <Spinner className="w-8 h-8 text-brand-primary" />
              </div>
            ) : students.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                No students enrolled in this class yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-[200px] pl-6 font-semibold text-brand-accent">
                        Student
                      </TableHead>
                      <TableHead className="font-semibold text-brand-accent text-center">
                        Status
                      </TableHead>
                      <TableHead className="w-[300px] pr-6 font-semibold text-brand-accent text-right">
                        Notes (Optional)
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => {
                      const state = attendanceState[student._id] || {
                        status: "present",
                        notes: "",
                      };

                      return (
                        <TableRow
                          key={student._id}
                          className="hover:bg-muted/30"
                        >
                          <TableCell className="pl-6 font-medium">
                            <div className="flex flex-col">
                              <span>{student.name}</span>
                              <span className="text-xs text-muted-foreground font-normal">
                                {student.email}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="inline-flex rounded-md shadow-sm border overflow-hidden p-0.5 bg-muted/20">
                              <button
                                type="button"
                                onClick={() =>
                                  handleStatusChange(student._id, "present")
                                }
                                className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors ${state.status === "present" ? "bg-green-100 text-green-800 shadow-sm ring-1 ring-green-200" : "text-muted-foreground hover:bg-muted/50"}`}
                              >
                                Present
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleStatusChange(student._id, "absent")
                                }
                                className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors ${state.status === "absent" ? "bg-red-100 text-red-800 shadow-sm ring-1 ring-red-200" : "text-muted-foreground hover:bg-muted/50"}`}
                              >
                                Absent
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleStatusChange(student._id, "late")
                                }
                                className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors ${state.status === "late" ? "bg-amber-100 text-amber-800 shadow-sm ring-1 ring-amber-200" : "text-muted-foreground hover:bg-muted/50"}`}
                              >
                                Late
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleStatusChange(student._id, "excused")
                                }
                                className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors ${state.status === "excused" ? "bg-blue-100 text-blue-800 shadow-sm ring-1 ring-blue-200" : "text-muted-foreground hover:bg-muted/50"}`}
                              >
                                Excused
                              </button>
                            </div>
                          </TableCell>
                          <TableCell className="pr-6">
                            <Input
                              placeholder="Reason (if not present)..."
                              value={state.notes}
                              onChange={(e) =>
                                handleNotesChange(student._id, e.target.value)
                              }
                              className="text-sm bg-transparent border-dashed h-9 focus:border-solid hover:bg-white"
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t bg-muted/10 p-4 flex sm:flex-row flex-col justify-between items-center gap-4">
            {students && students.length > 0 ? (
              <div className="flex items-center gap-4 text-sm w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                <div className="flex flex-col items-center px-4">
                  <span className="text-2xl font-bold text-green-600">
                    {stats.present}
                  </span>
                  <span className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">
                    Present
                  </span>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="flex flex-col items-center px-4">
                  <span className="text-2xl font-bold text-red-600">
                    {stats.absent}
                  </span>
                  <span className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">
                    Absent
                  </span>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="flex flex-col items-center px-4">
                  <span className="text-2xl font-bold text-amber-600">
                    {stats.late}
                  </span>
                  <span className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">
                    Late
                  </span>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="flex flex-col items-center px-4">
                  <span className="text-2xl font-bold text-blue-600">
                    {stats.excused}
                  </span>
                  <span className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">
                    Excused
                  </span>
                </div>
              </div>
            ) : (
              <div /> // Empty spacer
            )}

            <Button
              size="lg"
              className="bg-brand-primary hover:bg-brand-primary-dark text-white rounded-xl shadow-md w-full sm:w-auto h-12 px-8 min-w-[200px]"
              disabled={
                !validClassId ||
                !students ||
                students.length === 0 ||
                isSubmitting
              }
              onClick={handleSave}
            >
              {isSubmitting ? (
                <>
                  <Spinner className="w-4 h-4 mr-2" />
                  Saving Register...
                </>
              ) : (
                <>
                  <HugeiconsIcon
                    icon={Calendar01Icon}
                    className="w-5 h-5 mr-2"
                  />
                  Save Attendance
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
