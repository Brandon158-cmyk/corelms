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
import { PlusSignIcon } from "@hugeicons/core-free-icons";

const formSchema = z.object({
  subjectId: z.string().min(1, "Please select a subject."),
  teacherId: z.string().optional(),
});

export function AssignSubjectDialog({ classId }: { classId: Id<"classes"> }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subjects = useQuery(api.subjects.list);
  const users = useQuery(api.users.listTenantUsers);
  const assignSubject = useMutation(api.classes.addSubject);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema as any),
    defaultValues: {
      subjectId: "",
      teacherId: "",
    },
  });

  const teachers =
    users?.filter(
      (u) =>
        u.role === "teacher" ||
        u.role === "headteacher" ||
        u.role === "superAdmin",
    ) || [];

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      await assignSubject({
        classId,
        subjectId: values.subjectId as Id<"subjects">,
        teacherId: values.teacherId
          ? (values.teacherId as Id<"users">)
          : undefined,
      });

      toast.success("Subject assigned successfully.");
      setOpen(false);
      form.reset();
    } catch (error: any) {
      toast.error(error.message || "Failed to assign subject.");
    } finally {
      setIsSubmitting(false);
    }
  }

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
        <HugeiconsIcon icon={PlusSignIcon} className="size-4" />
        Add Subject
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Subject</DialogTitle>
          <DialogDescription>
            Add a subject to this class and optionally assign a teacher to it.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <Controller
            control={form.control}
            name="subjectId"
            render={({ field }) => (
              <Field>
                <FieldLabel>Subject *</FieldLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={!subjects}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        subjects === undefined
                          ? "Loading..."
                          : "Select a subject"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects?.map((sub) => (
                      <SelectItem key={sub._id} value={sub._id}>
                        {sub.name}
                      </SelectItem>
                    ))}
                    {subjects && subjects.length === 0 && (
                      <div className="p-2 text-sm text-center text-muted-foreground">
                        No subjects found.
                      </div>
                    )}
                  </SelectContent>
                </Select>
                <FieldError errors={[form.formState.errors.subjectId]} />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="teacherId"
            render={({ field }) => (
              <Field>
                <FieldLabel>Teacher (Optional)</FieldLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={!users}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        users === undefined ? "Loading..." : "Unassigned"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      value="unassigned"
                      className="text-muted-foreground italic"
                    >
                      Leave Unassigned
                    </SelectItem>
                    {teachers.map((t) => (
                      <SelectItem key={t._id} value={t._id}>
                        {t.name || t.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[form.formState.errors.teacherId]} />
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
              {isSubmitting ? "Saving..." : "Assign"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
