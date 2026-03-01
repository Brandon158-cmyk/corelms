"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon, Loading01Icon } from "@hugeicons/core-free-icons";

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  type: z.enum(["assignment", "quiz", "exam", "project"]),
  totalScore: z.any(),
  date: z.string().min(1, "Date is required."),
});

interface CreateAssessmentDialogProps {
  classId: Id<"classes">;
  subjectId: Id<"subjects">;
  termId: Id<"terms">;
}

export function CreateAssessmentDialog({
  classId,
  subjectId,
  termId,
}: CreateAssessmentDialogProps) {
  const [open, setOpen] = useState(false);
  const createAssessment = useMutation(api.assessments.createAssessment);

  const form = useForm<z.infer<typeof formSchema>>({
    // @ts-ignore zodResolver generic mismatch
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      type: "quiz",
      totalScore: 100,
      date: new Date().toISOString().split("T")[0],
    },
  });

  const onSubmit = async (values: any) => {
    try {
      await createAssessment({
        classId,
        subjectId,
        termId,
        title: values.title,
        type: values.type as any,
        totalScore: Number(values.totalScore),
        date: new Date(values.date).getTime(),
      });
      toast.success("Assessment created successfully.");
      setOpen(false);
      form.reset();
    } catch (error: any) {
      toast.error(error.message || "Failed to create assessment");
    }
  };

  return (
    <>
      <Button
        className="h-10 rounded-l-none focus:z-10 relative"
        onClick={() => setOpen(true)}
      >
        <HugeiconsIcon icon={PlusSignIcon} className="w-4 h-4 mr-1.5" />
        New
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Assessment</DialogTitle>
            <DialogDescription>
              Add a new quiz, exam, or assignment to the gradebook.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pt-4"
          >
            <Field>
              <FieldLabel htmlFor="title">Title *</FieldLabel>
              <Input
                id="title"
                placeholder="e.g. Mid-Term Math Exam"
                {...form.register("title")}
              />
              <FieldError errors={[form.formState.errors.title]} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Controller
                control={form.control}
                name="type"
                render={({ field }: { field: any }) => (
                  <Field>
                    <FieldLabel>Type *</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="quiz">Quiz</SelectItem>
                        <SelectItem value="assignment">Assignment</SelectItem>
                        <SelectItem value="project">Project</SelectItem>
                        <SelectItem value="exam">Exam</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldError errors={[form.formState.errors.type]} />
                  </Field>
                )}
              />

              <Field>
                <FieldLabel htmlFor="totalScore">Max Score *</FieldLabel>
                <Input
                  id="totalScore"
                  type="number"
                  min={1}
                  {...form.register("totalScore")}
                />
                <FieldError errors={[form.formState.errors.totalScore]} />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="date">Date *</FieldLabel>
              <Input id="date" type="date" {...form.register("date")} />
              <FieldError errors={[form.formState.errors.date]} />
            </Field>

            <DialogFooter className="mt-6">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <>
                    <HugeiconsIcon
                      icon={Loading01Icon}
                      className="w-4 h-4 mr-2 animate-spin"
                    />
                    Creating...
                  </>
                ) : (
                  "Create Assessment"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
