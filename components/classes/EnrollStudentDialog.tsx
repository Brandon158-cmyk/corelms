"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserAdd01Icon } from "@hugeicons/core-free-icons";

const formSchema = z.object({
  studentId: z.string().min(1, "Please select a student to enroll."),
});

export function EnrollStudentDialog({ classId }: { classId: Id<"classes"> }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const users = useQuery(api.users.listTenantUsers);
  const enrollStudent = useMutation(api.classes.enrollStudent);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema as any),
    defaultValues: {
      studentId: "",
    },
  });

  // Filter students who are not already in THIS class
  const availableStudents =
    users?.filter((u) => u.role === "student" && u.classId !== classId) || [];

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      await enrollStudent({
        classId,
        studentId: values.studentId as Id<"users">,
      });

      toast.success("Student successfully enrolled in class.");
      setOpen(false);
      form.reset();
    } catch (error: any) {
      toast.error(error.message || "Failed to enroll student.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            size="sm"
            className="bg-brand-primary hover:bg-brand-primary-dark text-white"
          >
            <HugeiconsIcon icon={UserAdd01Icon} className="w-4 h-4 mr-2" />
            Enroll Student
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Enroll Student</DialogTitle>
          <DialogDescription>
            Select a student to enroll them into this class.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <Controller
            control={form.control}
            name="studentId"
            render={({ field }) => (
              <Field>
                <FieldLabel>Student *</FieldLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={!users}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        users === undefined ? "Loading..." : "Select a student"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStudents.map((s) => (
                      <SelectItem key={s._id} value={s._id}>
                        {s.name || s.email}
                        {s.classId ? " (Transferring)" : ""}
                      </SelectItem>
                    ))}
                    {users && availableStudents.length === 0 && (
                      <div className="p-2 text-sm text-center text-muted-foreground">
                        No available students found.
                      </div>
                    )}
                  </SelectContent>
                </Select>
                <FieldError errors={[form.formState.errors.studentId]} />
              </Field>
            )}
          />

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-brand-primary hover:bg-brand-primary-dark text-white min-w-[100px]"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enrolling..." : "Enroll"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
