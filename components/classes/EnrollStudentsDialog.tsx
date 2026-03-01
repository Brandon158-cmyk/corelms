import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserAdd01Icon, SearchIcon } from "@hugeicons/core-free-icons";
import { Input } from "@/components/ui/input";

interface EnrollStudentsDialogProps {
  classId: Id<"classes">;
  classNameName?: string;
}

export function EnrollStudentsDialog({
  classId,
  classNameName,
}: EnrollStudentsDialogProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<Id<"users">>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const unassignedStudents = useQuery(api.classes.getUnassignedStudents);
  const enrollStudent = useMutation(api.classes.enrollStudent);

  const toggleStudent = (id: Id<"users">) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleEnroll = async () => {
    if (selectedIds.size === 0) return;
    setIsSubmitting(true);

    try {
      const studentIds = Array.from(selectedIds);
      const results = await Promise.allSettled(
        studentIds.map((studentId) => enrollStudent({ classId, studentId })),
      );

      const fulfilled = results.filter((r) => r.status === "fulfilled");
      const rejected = results.filter((r) => r.status === "rejected");

      if (fulfilled.length > 0) {
        toast.success(`Successfully enrolled ${fulfilled.length} student(s)`);
      }

      if (rejected.length > 0) {
        toast.error(`Failed to enroll ${rejected.length} student(s)`);

        // Update selection to only include failed students so user can retry
        const failedIds = new Set<Id<"users">>();
        results.forEach((res, index) => {
          if (res.status === "rejected") {
            failedIds.add(studentIds[index]);
          }
        });
        setSelectedIds(failedIds);
      } else {
        // Full success
        setOpen(false);
        setSelectedIds(new Set());
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to enroll students";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStudents = unassignedStudents?.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="default"
            className="gap-2 bg-brand-primary hover:bg-brand-primary-dark text-white shadow-sm h-10 px-4"
          />
        }
      >
        <HugeiconsIcon icon={UserAdd01Icon} className="size-4" />
        Enroll Students
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enroll Students</DialogTitle>
          <DialogDescription>
            Select unassigned students to enroll them into{" "}
            {classNameName || "this class"}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="relative">
            <HugeiconsIcon
              icon={SearchIcon}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
            />
            <Input
              placeholder="Search unassigned students..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <ScrollArea className="h-[300px] border rounded-md">
            {filteredStudents === undefined ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Loading students...
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                {search
                  ? "No students matching search."
                  : "No unassigned students available."}
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredStudents.map((student) => (
                  <div
                    key={student._id}
                    className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded-md cursor-pointer transition-colors"
                    onClick={() => toggleStudent(student._id)}
                  >
                    <Checkbox
                      checked={selectedIds.has(student._id)}
                      onCheckedChange={() => toggleStudent(student._id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {student.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {student.email}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="flex justify-between items-center mt-2 border-t pt-4">
          <span className="text-sm text-muted-foreground">
            {selectedIds.size} selected
          </span>
          <div className="flex gap-2">
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button
              onClick={handleEnroll}
              className="bg-brand-primary hover:bg-brand-primary-dark text-white"
              disabled={selectedIds.size === 0 || isSubmitting}
            >
              {isSubmitting ? "Enrolling..." : "Enroll Selected"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
