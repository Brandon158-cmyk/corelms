"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "convex/react";
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
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Grade name must be at least 2 characters.",
  }),
  description: z.string().optional(),
});

export function CreateGradeDialog({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createGrade = useMutation(api.grades.create);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema as any),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      await createGrade({
        name: values.name,
        description: values.description || undefined,
      });

      toast.success("Grade created successfully!");
      setOpen(false);
      form.reset();
    } catch (error) {
      toast.error("Failed to create grade. Please try again.");
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
            <Button className="bg-brand-blue hover:bg-brand-royal text-white">
              Add Grade
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Grade</DialogTitle>
          <DialogDescription>
            Add a new grade level (e.g. Grade 1, Year 7).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <Field>
            <FieldLabel htmlFor="name">Grade Name *</FieldLabel>
            <Input
              id="name"
              placeholder="e.g. Grade 1"
              {...form.register("name")}
            />
            <FieldError errors={[form.formState.errors.name]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <Textarea
              id="description"
              placeholder="Brief description..."
              className="resize-none"
              {...form.register("description")}
            />
            <FieldError errors={[form.formState.errors.description]} />
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
              className="bg-brand-blue hover:bg-brand-royal text-white min-w-[120px]"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Grade"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
