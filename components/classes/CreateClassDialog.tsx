"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
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
import { Input } from "@/components/ui/input";
import { Controller } from "react-hook-form";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Class name must be at least 2 characters.",
  }),
  gradeId: z.string().min(1, { message: "Please select a grade." }),
  termId: z.string().optional(),
  description: z.string().optional(),
  room: z.string().optional(),
  status: z.enum(["active", "archived"]).default("active"),
});

export function CreateClassDialog({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createClass = useMutation(api.classes.create);
  const grades = useQuery(api.grades.list);
  const allTerms = useQuery(api.terms.list, {});
  const years = useQuery(api.academicYears.list);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema as any),
    defaultValues: {
      name: "",
      gradeId: "",
      termId: "",
      description: "",
      room: "",
      status: "active",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      await createClass({
        name: values.name,
        gradeId: values.gradeId as any,
        termId: values.termId ? (values.termId as any) : undefined,
        description: values.description || undefined,
        room: values.room || undefined,
        status: values.status,
      });

      toast.success("Class created successfully!");
      setOpen(false);
      form.reset();
    } catch (error) {
      toast.error("Failed to create class. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          (children as React.ReactElement) || (
            <Button className="bg-brand-primary hover:bg-brand-primary-dark text-white">
              Add Class
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Class</DialogTitle>
          <DialogDescription>
            Add a new class to your school's schedule. Fill in the details
            below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <Field>
            <FieldLabel htmlFor="name">Class Name *</FieldLabel>
            <Input id="name" placeholder="e.g. B1" {...form.register("name")} />
            <FieldError errors={[form.formState.errors.name]} />
          </Field>

          <Controller
            control={form.control}
            name="gradeId"
            render={({ field }) => (
              <Field>
                <FieldLabel>Grade *</FieldLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={!grades}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        grades === undefined
                          ? "Loading grades..."
                          : "Select a grade"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {grades?.map((grade) => (
                      <SelectItem key={grade._id} value={grade._id}>
                        {grade.name}
                      </SelectItem>
                    ))}
                    {grades && grades.length === 0 && (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        No grades available. Create one first.
                      </div>
                    )}
                  </SelectContent>
                </Select>
                <FieldError errors={[form.formState.errors.gradeId]} />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="termId"
            render={({ field }) => (
              <Field>
                <FieldLabel>Term</FieldLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={!allTerms}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        allTerms === undefined
                          ? "Loading terms..."
                          : "Select a term (optional)"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {years?.map((year) => {
                      const yearTerms =
                        allTerms?.filter((t) => t.yearId === year._id) || [];
                      if (yearTerms.length === 0) return null;
                      return yearTerms.map((term) => (
                        <SelectItem key={term._id} value={term._id}>
                          {term.name} — {year.name}
                        </SelectItem>
                      ));
                    })}
                    {allTerms && allTerms.length === 0 && (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        No terms available. Create one in Terms management.
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />

          <Field>
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <Textarea
              id="description"
              placeholder="Brief description of the course..."
              className="resize-none"
              {...form.register("description")}
            />
            <FieldError errors={[form.formState.errors.description]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="room">Room</FieldLabel>
            <Input
              id="room"
              placeholder="e.g. Room A-2"
              {...form.register("room")}
            />
            <FieldError errors={[form.formState.errors.room]} />
          </Field>

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
              className="bg-brand-primary hover:bg-brand-primary-dark text-white min-w-[120px]"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Class"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
