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
import { Controller } from "react-hook-form";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  role: z.enum(["teacher", "bursar", "boardingMatron", "student", "parent"]),
});

export function InviteUserDialog({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentUser = useQuery(api.users.currentUser);
  const inviteUser = useMutation(api.users.invite);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema as any),
    defaultValues: {
      name: "",
      email: "",
      role: "student",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      await inviteUser({
        name: values.name,
        email: values.email,
        role: values.role,
      });

      toast.success("User invited successfully!");
      setOpen(false);
      form.reset();
    } catch (error: any) {
      toast.error(error.message || "Failed to invite user.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Hide the button completely if not authorized to invite
  const adminRoles = ["superAdmin", "proprietor", "headteacher"];
  if (currentUser && !adminRoles.includes(currentUser.role ?? "")) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          (children as React.ReactElement) || (
            <Button className="bg-brand-primary hover:bg-brand-primary-dark text-white">
              Invite User
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite User</DialogTitle>
          <DialogDescription>
            Add a new teacher, staff member, or student to your school.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <Field>
            <FieldLabel htmlFor="name">Full Name</FieldLabel>
            <Input
              id="name"
              placeholder="e.g. Jane Doe"
              {...form.register("name")}
            />
            <FieldError errors={[form.formState.errors.name]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="email">Email Address</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="jane@example.com"
              {...form.register("email")}
            />
            <FieldError errors={[form.formState.errors.email]} />
          </Field>

          <Controller
            control={form.control}
            name="role"
            render={({ field }) => (
              <Field>
                <FieldLabel>Role</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="bursar">
                      Bursar / Finance Officer
                    </SelectItem>
                    <SelectItem value="boardingMatron">
                      Boarding Matron
                    </SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="parent">Parent / Guardian</SelectItem>
                  </SelectContent>
                </Select>
                <FieldError errors={[form.formState.errors.role]} />
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
              className="bg-brand-primary hover:bg-brand-primary-dark text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Inviting..." : "Send Invite"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
