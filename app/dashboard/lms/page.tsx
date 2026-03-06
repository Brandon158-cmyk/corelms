"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Tick02Icon,
  Book01Icon,
  ArrowRight02Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";

export default function LMSPage() {
  const courses = useQuery(api.lms.listCourses, {});
  const classes = useQuery(api.classes.list, {});
  const subjects = useQuery(api.subjects.list);
  const user = useQuery(api.users.currentUser);
  const saveCourse = useMutation(api.lms.saveCourse);

  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    classId: "",
    subjectId: "",
    title: "",
    description: "",
  });

  const isAdmin =
    user?.role === "superAdmin" ||
    user?.role === "headteacher" ||
    user?.role === "proprietor" ||
    user?.role === "teacher";

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.classId || !form.subjectId || !form.title) {
      toast.error("Class, subject, and title are required");
      return;
    }
    setIsSubmitting(true);
    try {
      await saveCourse({
        classId: form.classId as any,
        subjectId: form.subjectId as any,
        title: form.title,
        description: form.description || undefined,
        status: "active",
      });
      toast.success("Course created");
      setIsOpen(false);
      setForm({ classId: "", subjectId: "", title: "", description: "" });
    } catch (err: any) {
      toast.error(err.message || "Failed to create course");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = courses?.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.subjectName.toLowerCase().includes(search.toLowerCase()) ||
      c.className.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-serif font-bold text-foreground">
            Learning (LMS)
          </h1>
          <p className="text-base text-muted-foreground mt-2">
            Browse courses, access lessons, and manage assignments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-56">
            <HugeiconsIcon
              icon={Search01Icon}
              className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
            />
            <Input
              placeholder="Search courses…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/dashboard/lms/assignments" />}
          >
            Assignments
          </Button>
          {isAdmin && (
            <Button
              onClick={() => setIsOpen(true)}
              className="rounded-full h-10 px-5 text-sm font-medium"
            >
              <HugeiconsIcon icon={Add01Icon} className="size-4 mr-2" />
              New Course
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Total Courses
            </CardTitle>
            <HugeiconsIcon
              icon={Book01Icon}
              className="text-foreground"
              size={18}
            />
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-serif font-medium tracking-tight text-foreground">
              {courses === undefined ? "…" : courses.length}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Active
            </CardTitle>
            <HugeiconsIcon
              icon={Tick02Icon}
              className="text-foreground"
              size={18}
            />
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-serif font-medium tracking-tight text-foreground">
              {courses === undefined
                ? "…"
                : courses.filter((c) => c.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Total Lessons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-serif font-medium tracking-tight text-foreground">
              {courses === undefined
                ? "…"
                : courses.reduce((s, c) => s + c.lessonCount, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Cards */}
      {courses === undefined ? (
        <div className="flex items-center justify-center py-16">
          <Spinner className="size-6" />
        </div>
      ) : filtered && filtered.length === 0 ? (
        <Card className="border-dashed p-16 text-center">
          <HugeiconsIcon
            icon={Book01Icon}
            className="size-12 mx-auto text-muted-foreground opacity-20"
          />
          <p className="mt-4 text-muted-foreground font-medium">
            {search
              ? "No courses match your search."
              : "No courses created yet."}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered?.map((course) => (
            <Link key={course._id} href={`/dashboard/lms/${course._id}`}>
              <Card className="border border-border/50 hover:border-foreground transition-colors cursor-pointer h-full rounded-none">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className="text-[10px] uppercase tracking-wider rounded-none font-semibold border-foreground"
                    >
                      {course.subjectName}
                    </Badge>
                    <span className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
                      {course.status}
                    </span>
                  </div>
                  <CardTitle className="text-2xl font-serif font-bold text-foreground mt-4">
                    {course.title}
                  </CardTitle>
                  <CardDescription className="text-sm font-medium text-foreground mt-1">
                    {course.className} • {course.creatorName}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {course.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                      {course.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {course.lessonCount} lesson
                      {course.lessonCount !== 1 ? "s" : ""}
                    </span>
                    <HugeiconsIcon
                      icon={ArrowRight02Icon}
                      className="size-4 text-brand-primary"
                    />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Create Course Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Create Course</DialogTitle>
            <DialogDescription>
              Link a course to a class and subject.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label>Course Title</Label>
              <Input
                required
                placeholder="e.g. Introduction to Biology"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Class</Label>
                <Select
                  value={form.classId}
                  onValueChange={(v) => setForm({ ...form, classId: v ?? "" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select…" />
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
              <div className="grid gap-2">
                <Label>Subject</Label>
                <Select
                  value={form.subjectId}
                  onValueChange={(v) =>
                    setForm({ ...form, subjectId: v ?? "" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select…" />
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
            </div>
            <div className="grid gap-2">
              <Label>Description (optional)</Label>
              <Textarea
                placeholder="Brief course description…"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
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
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
