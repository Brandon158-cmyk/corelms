"use client";

import { useQuery, useMutation } from "convex/react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Tick02Icon,
  Delete02Icon,
  ArrowLeft02Icon,
  Clock01Icon,
  Calendar03Icon,
  Alert02Icon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday"] as const;
const DAY_LABELS: Record<string, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
};

export default function TimetableManagePage() {
  const slots = useQuery(api.timetable.listSlots);
  const classes = useQuery(api.classes.list, {});
  const subjects = useQuery(api.subjects.list);
  const users = useQuery(api.users.listTenantUsers, {});

  const saveSlot = useMutation(api.timetable.saveSlot);
  const deleteSlot = useMutation(api.timetable.deleteSlot);
  const saveEntry = useMutation(api.timetable.saveEntry);
  const deleteEntry = useMutation(api.timetable.deleteEntry);

  // Slot dialog
  const [isSlotOpen, setIsSlotOpen] = useState(false);
  const [slotForm, setSlotForm] = useState({
    day: "monday" as (typeof DAYS)[number],
    periodNumber: "1",
    startTime: "07:30",
    endTime: "08:10",
    type: "lesson" as "lesson" | "break" | "assembly",
    label: "",
  });

  // Entry dialog
  const [isEntryOpen, setIsEntryOpen] = useState(false);
  const [entryClassId, setEntryClassId] = useState("");
  const [entryForm, setEntryForm] = useState({
    slotId: "",
    subjectId: "",
    teacherId: "",
    room: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Group slots by day for display
  const slotsByDay = useMemo(() => {
    if (!slots) return {};
    const grouped: Record<string, typeof slots> = {};
    for (const day of DAYS) {
      grouped[day] = slots
        .filter((s) => s.day === day)
        .sort((a, b) => a.periodNumber - b.periodNumber);
    }
    return grouped;
  }, [slots]);

  // Get unique periods for the "Assign Entries" section
  const lessonSlots = useMemo(() => {
    return slots?.filter((s) => s.type === "lesson") || [];
  }, [slots]);

  // Entries for selected class
  const entries = useQuery(
    api.timetable.listEntries,
    entryClassId ? { classId: entryClassId as any } : "skip",
  );

  const handleSaveSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await saveSlot({
        day: slotForm.day,
        periodNumber: parseInt(slotForm.periodNumber),
        startTime: slotForm.startTime,
        endTime: slotForm.endTime,
        type: slotForm.type,
        label: slotForm.label || undefined,
      });
      toast.success("Period slot saved");
      setIsSlotOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save slot");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSlot = async (id: any) => {
    if (!confirm("Delete this period slot and all its entries?")) return;
    try {
      await deleteSlot({ id });
      toast.success("Slot deleted");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  };

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryClassId || !entryForm.slotId || !entryForm.subjectId) {
      toast.error("Class, period, and subject are required");
      return;
    }
    setIsSubmitting(true);
    try {
      await saveEntry({
        slotId: entryForm.slotId as any,
        classId: entryClassId as any,
        subjectId: entryForm.subjectId as any,
        teacherId: entryForm.teacherId
          ? (entryForm.teacherId as any)
          : undefined,
        room: entryForm.room || undefined,
      });
      toast.success("Entry assigned");
      setIsEntryOpen(false);
      setEntryForm({ slotId: "", subjectId: "", teacherId: "", room: "" });
    } catch (err: any) {
      toast.error(err.message || "Failed to assign entry");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEntry = async (id: any) => {
    try {
      await deleteEntry({ id });
      toast.success("Entry removed");
    } catch (err: any) {
      toast.error(err.message || "Failed");
    }
  };

  const teachers = users?.filter(
    (u) => u.role === "teacher" || u.role === "headteacher",
  );

  const typeColors: Record<string, string> = {
    lesson: "bg-brand-primary/10 text-brand-primary",
    break:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    assembly:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  };

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            render={<Link href="/dashboard/timetable" />}
          >
            <HugeiconsIcon icon={ArrowLeft02Icon} className="size-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-brand-accent">
              Manage Timetable
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Configure period slots and assign subjects to classes.
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="slots" className="space-y-4">
        <TabsList>
          <TabsTrigger value="slots">
            <HugeiconsIcon icon={Clock01Icon} className="mr-2 size-4" />
            Period Slots
          </TabsTrigger>
          <TabsTrigger value="assign">
            <HugeiconsIcon icon={Calendar03Icon} className="mr-2 size-4" />
            Assign Entries
          </TabsTrigger>
        </TabsList>

        {/* ── Period Slots Tab ── */}
        <TabsContent value="slots" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Define the period structure for each day of the week. These slots
              are shared across all classes.
            </p>
            <Button
              onClick={() => setIsSlotOpen(true)}
              className="bg-brand-primary hover:bg-brand-primary-deep text-white"
            >
              <HugeiconsIcon icon={Add01Icon} className="size-4 mr-2" />
              Add Slot
            </Button>
          </div>

          {slots === undefined ? (
            <div className="flex items-center justify-center py-12">
              <Spinner className="size-6" />
            </div>
          ) : slots.length === 0 ? (
            <Card className="border-dashed p-10 text-center">
              <HugeiconsIcon
                icon={Clock01Icon}
                className="size-12 mx-auto text-muted-foreground opacity-20"
              />
              <p className="mt-4 text-muted-foreground font-medium">
                No period slots defined. Add your school's daily schedule.
              </p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-5">
              {DAYS.map((day) => (
                <Card key={day} className="shadow-sm">
                  <CardHeader className="pb-2 border-b bg-muted/20">
                    <CardTitle className="text-sm font-bold text-brand-accent">
                      {DAY_LABELS[day]}
                    </CardTitle>
                    <CardDescription className="text-[10px]">
                      {slotsByDay[day]?.length || 0} periods
                    </CardDescription>
                  </CardHeader>
                  <CardContent
                    className={`pt-3 space-y-1.5 ${!slotsByDay[day]?.length ? "pb-3" : ""}`}
                  >
                    {!slotsByDay[day]?.length ? (
                      <p className="text-xs text-muted-foreground italic text-center py-4">
                        No slots
                      </p>
                    ) : (
                      slotsByDay[day]?.map((slot) => (
                        <div
                          key={slot._id}
                          className="flex items-center justify-between p-2 rounded bg-muted/50 text-xs group"
                        >
                          <div className="flex items-center gap-1.5">
                            <Badge
                              variant="outline"
                              className={`text-[9px] h-4 ${typeColors[slot.type] || ""}`}
                            >
                              {slot.type === "lesson"
                                ? `P${slot.periodNumber}`
                                : slot.label || slot.type}
                            </Badge>
                            <span className="text-muted-foreground tabular-nums">
                              {slot.startTime}–{slot.endTime}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-5 opacity-0 group-hover:opacity-100 text-destructive transition-opacity"
                            onClick={() => handleDeleteSlot(slot._id)}
                          >
                            <HugeiconsIcon
                              icon={Delete02Icon}
                              className="size-3"
                            />
                          </Button>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Assign Entries Tab ── */}
        <TabsContent value="assign" className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Label className="text-sm font-medium">Class:</Label>
              <Select
                value={entryClassId}
                onValueChange={(v) => setEntryClassId(v ?? "")}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select class…" />
                </SelectTrigger>
                <SelectContent>
                  {classes?.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {entryClassId && (
              <Button
                onClick={() => setIsEntryOpen(true)}
                className="bg-brand-primary hover:bg-brand-primary-deep text-white"
              >
                <HugeiconsIcon icon={Add01Icon} className="size-4 mr-2" />
                Assign Subject
              </Button>
            )}
          </div>

          {!entryClassId ? (
            <Card className="border-dashed p-10 text-center">
              <p className="text-muted-foreground font-medium">
                Select a class to manage its timetable entries.
              </p>
            </Card>
          ) : entries === undefined ? (
            <div className="flex items-center justify-center py-12">
              <Spinner className="size-6" />
            </div>
          ) : (
            <Card className="shadow-sm">
              <CardContent className="pt-4">
                {entries.length === 0 ? (
                  <div className="py-10 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                    No subjects assigned to this class yet.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Day</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Teacher</TableHead>
                        <TableHead>Room</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entries
                        .sort((a, b) => {
                          const dayOrder = [
                            "monday",
                            "tuesday",
                            "wednesday",
                            "thursday",
                            "friday",
                          ];
                          const dD =
                            dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
                          if (dD !== 0) return dD;
                          return a.periodNumber - b.periodNumber;
                        })
                        .map((entry) => (
                          <TableRow key={entry._id}>
                            <TableCell className="capitalize font-medium">
                              {entry.day}
                            </TableCell>
                            <TableCell>P{entry.periodNumber}</TableCell>
                            <TableCell className="tabular-nums text-muted-foreground">
                              {entry.startTime}–{entry.endTime}
                            </TableCell>
                            <TableCell className="font-medium">
                              {entry.subjectName}
                            </TableCell>
                            <TableCell>
                              {entry.teacherName || (
                                <span className="text-muted-foreground italic">
                                  Unassigned
                                </span>
                              )}
                            </TableCell>
                            <TableCell>{entry.room || "—"}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-7 text-destructive"
                                onClick={() => handleDeleteEntry(entry._id)}
                              >
                                <HugeiconsIcon
                                  icon={Delete02Icon}
                                  className="size-3.5"
                                />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Slot Dialog */}
      <Dialog open={isSlotOpen} onOpenChange={setIsSlotOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Add Period Slot</DialogTitle>
            <DialogDescription>
              Define a period for a specific day of the week.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveSlot} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Day</Label>
                <Select
                  value={slotForm.day}
                  onValueChange={(v: any) =>
                    setSlotForm({ ...slotForm, day: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {DAY_LABELS[d]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Period #</Label>
                <Input
                  type="number"
                  min="1"
                  required
                  value={slotForm.periodNumber}
                  onChange={(e) =>
                    setSlotForm({ ...slotForm, periodNumber: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  required
                  value={slotForm.startTime}
                  onChange={(e) =>
                    setSlotForm({ ...slotForm, startTime: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>End Time</Label>
                <Input
                  type="time"
                  required
                  value={slotForm.endTime}
                  onChange={(e) =>
                    setSlotForm({ ...slotForm, endTime: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Type</Label>
                <Select
                  value={slotForm.type}
                  onValueChange={(v: any) =>
                    setSlotForm({ ...slotForm, type: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lesson">Lesson</SelectItem>
                    <SelectItem value="break">Break</SelectItem>
                    <SelectItem value="assembly">Assembly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Label (optional)</Label>
                <Input
                  placeholder="e.g. Morning Break"
                  value={slotForm.label}
                  onChange={(e) =>
                    setSlotForm({ ...slotForm, label: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsSlotOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-brand-primary text-white"
              >
                {isSubmitting ? (
                  <Spinner className="size-4 mr-2" />
                ) : (
                  <HugeiconsIcon icon={Tick02Icon} className="size-4 mr-2" />
                )}
                Add Slot
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Entry Dialog */}
      <Dialog open={isEntryOpen} onOpenChange={setIsEntryOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Assign Subject to Period</DialogTitle>
            <DialogDescription>
              Pick a period slot and assign a subject + teacher.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveEntry} className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label>Period Slot</Label>
              <Select
                value={entryForm.slotId}
                onValueChange={(v) =>
                  setEntryForm({ ...entryForm, slotId: v ?? "" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select period…" />
                </SelectTrigger>
                <SelectContent>
                  {lessonSlots.map((s) => (
                    <SelectItem key={s._id} value={s._id}>
                      {DAY_LABELS[s.day]} — P{s.periodNumber} ({s.startTime}–
                      {s.endTime})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Subject</Label>
              <Select
                value={entryForm.subjectId}
                onValueChange={(v) =>
                  setEntryForm({ ...entryForm, subjectId: v ?? "" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subject…" />
                </SelectTrigger>
                <SelectContent>
                  {subjects?.map((s) => (
                    <SelectItem key={s._id} value={s._id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Teacher</Label>
                <Select
                  value={entryForm.teacherId}
                  onValueChange={(v) =>
                    setEntryForm({ ...entryForm, teacherId: v ?? "" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select…" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers?.map((t) => (
                      <SelectItem key={t._id} value={t._id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Room (optional)</Label>
                <Input
                  placeholder="e.g. Lab 1"
                  value={entryForm.room}
                  onChange={(e) =>
                    setEntryForm({ ...entryForm, room: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEntryOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-brand-primary text-white"
              >
                {isSubmitting ? (
                  <Spinner className="size-4 mr-2" />
                ) : (
                  <HugeiconsIcon icon={Tick02Icon} className="size-4 mr-2" />
                )}
                Assign
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
