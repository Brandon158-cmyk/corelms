"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { HugeiconsIcon } from "@hugeicons/react";
import { File01Icon, UserMultiple02Icon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";

interface GenerateReportDialogProps {
  classId: Id<"classes">;
  termId: Id<"terms">;
  gradingScale: "primary" | "junior_secondary" | "senior_secondary";
}

const SCALE_LABELS: Record<string, string> = {
  primary: "Primary (Grades 1-7)",
  junior_secondary: "Junior Secondary (Grades 8-9)",
  senior_secondary: "Senior Secondary (Grades 10-12)",
};

export function GenerateReportDialog({
  classId,
  termId,
  gradingScale,
}: GenerateReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const generate = useMutation(api.reportCards.generate);

  // Fetch class & term info for the summary
  const classInfo = useQuery(api.classes.get, { classId });
  const termInfo = useQuery(api.terms.get, { termId });
  const students = useQuery(api.classes.getStudents, { classId });

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await generate({ classId, termId, gradingScale });
      toast.success(`Successfully generated ${result.count} report card(s)!`);
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate report cards");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="bg-brand-primary hover:bg-brand-primary-deep" />
        }
      >
        <HugeiconsIcon icon={File01Icon} className="size-4 mr-1.5" />
        Generate Report Cards
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HugeiconsIcon
              icon={File01Icon}
              className="size-5 text-brand-primary"
            />
            Generate Report Cards
          </DialogTitle>
          <DialogDescription>
            This will aggregate all assessment marks, attendance records, and
            discipline data for the selected class and term.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground font-medium w-24">
              Class:
            </span>
            <span className="font-semibold">
              {classInfo
                ? `${classInfo.gradeName} — ${classInfo.name}`
                : "Loading..."}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground font-medium w-24">
              Term:
            </span>
            <span className="font-semibold">
              {termInfo
                ? `${termInfo.yearName} — ${termInfo.name}`
                : "Loading..."}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground font-medium w-24">
              Grading Scale:
            </span>
            <span className="font-semibold">{SCALE_LABELS[gradingScale]}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <HugeiconsIcon
              icon={UserMultiple02Icon}
              className="size-4 text-brand-primary"
            />
            <span className="font-semibold">
              {students?.length ?? "..."} student(s)
            </span>
            <span className="text-muted-foreground text-xs">
              will receive report cards
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={loading || !classInfo || !termInfo}
            className="bg-brand-primary hover:bg-brand-primary-deep"
          >
            {loading ? (
              <>
                <Spinner className="size-4 mr-1.5" />
                Generating...
              </>
            ) : (
              "Generate"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
