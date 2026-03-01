"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Id } from "@/convex/_generated/dataModel";

type LogIncidentValues = z.infer<typeof logIncidentSchema>;

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
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon, SearchIcon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";

const logIncidentSchema = z.object({
  studentId: z.string().min(1, "Please select a student"),
  date: z.string().min(1, "Date is required"),
  category: z.enum(["minor", "moderate", "severe"]),
  infraction: z.string().min(2, "Please describe the infraction"),
  pointsDeducted: z.coerce.number().min(0, "Points must be at least 0"),
  restorativeAction: z.string().optional(),
  status: z.enum(["open", "resolved", "escalated"]),
});

export function LogIncidentDialog({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const students = useQuery(api.students.listStudents, {}) || [];

  const logIncident = useMutation(api.discipline.logIncident);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      studentId: "",
      date: new Date().toISOString().split("T")[0],
      category: "minor",
      infraction: "",
      pointsDeducted: 0,
      restorativeAction: "",
      status: "open",
    },
  });

  const selectedStudentId = watch("studentId");

  const filteredStudents = students.filter((s: any) => {
    const name = s.name || "";
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  async function onSubmit(values: any) {
    const result = logIncidentSchema.safeParse(values);
    if (!result.success) {
      const zodError = result.error as any;
      const issues = zodError.issues || zodError.errors || [];
      issues.forEach((err: any) => {
        const field = err.path?.[0] as any;
        if (field) setError(field, { message: err.message });
      });
      return;
    }
    try {
      await logIncident({
        ...result.data,
        studentId: result.data.studentId as Id<"users">,
        date: result.data.date,
      });
      toast.success("Incident logged successfully");
      setOpen(false);
      reset();
    } catch (error: any) {
      toast.error(error.message || "Failed to log incident");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="h-10 bg-brand-primary hover:bg-brand-primary-dark" />
        }
      >
        <HugeiconsIcon icon={PlusSignIcon} className="w-4 h-4 mr-1.5" />
        Log Incident
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log Disciplinary Incident</DialogTitle>
          <DialogDescription>
            Record a behavioral incident for a student. This will be added to
            their permanent conduct record.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Student Picker */}
          <Field data-invalid={!!errors.studentId}>
            <FieldLabel>Student</FieldLabel>
            <div className="space-y-2">
              <div className="relative">
                <HugeiconsIcon
                  icon={SearchIcon}
                  className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"
                />
                <Input
                  placeholder="Search for a student..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="max-h-32 overflow-y-auto border rounded-md">
                {filteredStudents.length === 0 ? (
                  <div className="p-2 text-sm text-center text-muted-foreground">
                    No students found
                  </div>
                ) : (
                  filteredStudents.map((s: any) => (
                    <div
                      key={s.id}
                      onClick={() => setValue("studentId", s.id)}
                      className={`p-2 px-3 text-sm cursor-pointer hover:bg-muted ${selectedStudentId === s.id ? "bg-brand-primary/10 text-brand-primary font-medium" : ""}`}
                    >
                      {s.name}
                    </div>
                  ))
                )}
              </div>
            </div>
            <FieldError errors={[errors.studentId]} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            {/* Date */}
            <Field data-invalid={!!errors.date}>
              <FieldLabel htmlFor="date">Date of Incident</FieldLabel>
              <Input type="date" id="date" {...register("date")} />
              <FieldError errors={[errors.date]} />
            </Field>

            {/* Category */}
            <Field data-invalid={!!errors.category}>
              <FieldLabel>Severity Level</FieldLabel>
              <Select
                defaultValue="minor"
                onValueChange={(val) =>
                  setValue("category", val as "minor" | "moderate" | "severe")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minor">Minor infraction</SelectItem>
                  <SelectItem value="moderate">Moderate infraction</SelectItem>
                  <SelectItem value="severe">Severe infraction</SelectItem>
                </SelectContent>
              </Select>
              <FieldError errors={[errors.category]} />
            </Field>
          </div>

          {/* Infraction */}
          <Field data-invalid={!!errors.infraction}>
            <FieldLabel htmlFor="infraction">Incident Description</FieldLabel>
            <Input
              id="infraction"
              placeholder="e.g. Disruption during class, Vandalism"
              {...register("infraction")}
            />
            <FieldError errors={[errors.infraction]} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            {/* Points */}
            <Field data-invalid={!!errors.pointsDeducted}>
              <FieldLabel htmlFor="pointsDeducted">Penalty Points</FieldLabel>
              <Input
                type="number"
                id="pointsDeducted"
                min={0}
                {...register("pointsDeducted")}
              />
              <FieldError errors={[errors.pointsDeducted]} />
            </Field>

            {/* Status */}
            <Field data-invalid={!!errors.status}>
              <FieldLabel>Status</FieldLabel>
              <Select
                defaultValue="open"
                onValueChange={(val) =>
                  setValue("status", val as "open" | "resolved" | "escalated")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open / Under Review</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="escalated">Escalated to Head</SelectItem>
                </SelectContent>
              </Select>
              <FieldError errors={[errors.status]} />
            </Field>
          </div>

          {/* Restorative Action */}
          <Field>
            <FieldLabel htmlFor="restorativeAction">
              Notes & Restorative Action (Optional)
            </FieldLabel>
            <Textarea
              id="restorativeAction"
              placeholder="e.g. Student apologized, parent contacted, detention scheduled..."
              className="resize-none"
              {...register("restorativeAction")}
            />
          </Field>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-brand-primary hover:bg-brand-primary-dark"
            >
              {isSubmitting ? "Logging..." : "Log Incident"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
