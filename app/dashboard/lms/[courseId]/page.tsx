"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { useParams } from "next/navigation";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Tick02Icon,
  ArrowLeft02Icon,
  Delete02Icon,
  Book01Icon,
  Calendar03Icon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { format } from "date-fns";

const LESSON_TYPE_COLORS: Record<string, string> = {
  lesson: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  quiz: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  resource:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const course = useQuery(
    api.lms.getCourse,
    courseId ? { id: courseId as any } : "skip",
  );
  const user = useQuery(api.users.currentUser);

  const saveLesson = useMutation(api.lms.saveLesson);
  const deleteLesson = useMutation(api.lms.deleteLesson);
  const saveAssignment = useMutation(api.lms.saveAssignment);

  const [isLessonOpen, setIsLessonOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [viewingLesson, setViewingLesson] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [lessonForm, setLessonForm] = useState({
    title: "",
    content: "",
    type: "lesson" as "lesson" | "quiz" | "resource",
  });

  const [assignForm, setAssignForm] = useState({
    title: "",
    instructions: "",
    dueDate: "",
    totalMarks: "100",
  });

  const isAdmin =
    user?.role === "superAdmin" ||
    user?.role === "headteacher" ||
    user?.role === "proprietor" ||
    user?.role === "teacher";

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonForm.title || !lessonForm.content) {
      toast.error("Title and content are required");
      return;
    }
    setIsSubmitting(true);
    try {
      await saveLesson({
        courseId: courseId as any,
        title: lessonForm.title,
        content: lessonForm.content,
        order: (course?.lessons.length || 0) + 1,
        type: lessonForm.type,
      });
      toast.success("Lesson added");
      setIsLessonOpen(false);
      setLessonForm({ title: "", content: "", type: "lesson" });
    } catch (err: any) {
      toast.error(err.message || "Failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLesson = async (id: any) => {
    if (!confirm("Delete this lesson?")) return;
    try {
      await deleteLesson({ id });
      toast.success("Lesson removed");
    } catch (err: any) {
      toast.error(err.message || "Failed");
    }
  };

  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignForm.title || !assignForm.instructions || !assignForm.dueDate) {
      toast.error("All fields are required");
      return;
    }
    setIsSubmitting(true);
    try {
      await saveAssignment({
        courseId: courseId as any,
        title: assignForm.title,
        instructions: assignForm.instructions,
        dueDate: assignForm.dueDate,
        totalMarks: parseInt(assignForm.totalMarks),
        status: "open",
      });
      toast.success("Assignment created");
      setIsAssignOpen(false);
      setAssignForm({
        title: "",
        instructions: "",
        dueDate: "",
        totalMarks: "100",
      });
    } catch (err: any) {
      toast.error(err.message || "Failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (course === undefined) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (course === null) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Course not found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="icon"
          render={<Link href="/dashboard/lms" />}
        >
          <HugeiconsIcon icon={ArrowLeft02Icon} className="size-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge
              variant="outline"
              className="text-[10px] bg-brand-primary/10 text-brand-primary"
            >
              {course.subjectName}
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {course.className}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold text-brand-accent">
            {course.title}
          </h1>
          {course.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {course.description}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Created by {course.creatorName}
          </p>
        </div>
      </div>

      <Tabs defaultValue="lessons" className="space-y-4">
        <TabsList>
          <TabsTrigger value="lessons">
            Lessons ({course.lessons.length})
          </TabsTrigger>
          <TabsTrigger value="assignments">
            Assignments ({course.assignments.length})
          </TabsTrigger>
        </TabsList>

        {/* Lessons Tab */}
        <TabsContent value="lessons" className="space-y-4">
          {isAdmin && (
            <div className="flex justify-end">
              <Button
                onClick={() => setIsLessonOpen(true)}
                className="bg-brand-primary hover:bg-brand-primary-deep text-white"
                size="sm"
              >
                <HugeiconsIcon icon={Add01Icon} className="size-4 mr-2" />
                Add Lesson
              </Button>
            </div>
          )}

          {course.lessons.length === 0 ? (
            <Card className="border-dashed p-10 text-center">
              <HugeiconsIcon
                icon={Book01Icon}
                className="size-12 mx-auto text-muted-foreground opacity-20"
              />
              <p className="mt-4 text-muted-foreground font-medium">
                No lessons added yet.
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {course.lessons.map((lesson: any) => (
                <Card
                  key={lesson._id}
                  className="shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() =>
                    setViewingLesson(
                      viewingLesson?._id === lesson._id ? null : lesson,
                    )
                  }
                >
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="size-7 rounded-full bg-brand-primary text-white text-xs font-bold flex items-center justify-center">
                          {lesson.order}
                        </span>
                        <div>
                          <CardTitle className="text-sm font-bold">
                            {lesson.title}
                          </CardTitle>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`text-[10px] capitalize ${LESSON_TYPE_COLORS[lesson.type] || ""}`}
                        >
                          {lesson.type}
                        </Badge>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteLesson(lesson._id);
                            }}
                          >
                            <HugeiconsIcon
                              icon={Delete02Icon}
                              className="size-3.5"
                            />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  {viewingLesson?._id === lesson._id && (
                    <CardContent className="pt-0 border-t">
                      <div className="prose prose-sm max-w-none pt-3 text-sm whitespace-pre-wrap">
                        {lesson.content}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="space-y-4">
          {isAdmin && (
            <div className="flex justify-end">
              <Button
                onClick={() => setIsAssignOpen(true)}
                className="bg-brand-primary hover:bg-brand-primary-deep text-white"
                size="sm"
              >
                <HugeiconsIcon icon={Add01Icon} className="size-4 mr-2" />
                New Assignment
              </Button>
            </div>
          )}

          {course.assignments.length === 0 ? (
            <Card className="border-dashed p-10 text-center">
              <HugeiconsIcon
                icon={Calendar03Icon}
                className="size-12 mx-auto text-muted-foreground opacity-20"
              />
              <p className="mt-4 text-muted-foreground font-medium">
                No assignments created yet.
              </p>
            </Card>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {course.assignments.map((a: any) => (
                <Link
                  key={a._id}
                  href={`/dashboard/lms/assignments?id=${a._id}`}
                >
                  <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-bold">
                          {a.title}
                        </CardTitle>
                        <Badge
                          variant={
                            a.status === "open" ? "default" : "secondary"
                          }
                          className="text-[10px]"
                        >
                          {a.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {a.instructions}
                      </p>
                      <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                        <span>
                          Due: {format(new Date(a.dueDate), "dd MMM yyyy")}
                        </span>
                        <span>{a.totalMarks} marks</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Lesson Dialog */}
      <Dialog open={isLessonOpen} onOpenChange={setIsLessonOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Lesson</DialogTitle>
            <DialogDescription>Add content to this course.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveLesson} className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label>Title</Label>
              <Input
                required
                placeholder="e.g. Chapter 1: Cell Structure"
                value={lessonForm.title}
                onChange={(e) =>
                  setLessonForm({ ...lessonForm, title: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Type</Label>
              <Select
                value={lessonForm.type}
                onValueChange={(v: any) =>
                  setLessonForm({ ...lessonForm, type: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lesson">Lesson</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="resource">Resource</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Content</Label>
              <Textarea
                required
                rows={8}
                placeholder="Lesson content…"
                value={lessonForm.content}
                onChange={(e) =>
                  setLessonForm({ ...lessonForm, content: e.target.value })
                }
              />
            </div>
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsLessonOpen(false)}
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
                Add Lesson
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* New Assignment Dialog */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Create Assignment</DialogTitle>
            <DialogDescription>
              Set a task for students in this course.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveAssignment} className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label>Title</Label>
              <Input
                required
                placeholder="e.g. Lab Report: Photosynthesis"
                value={assignForm.title}
                onChange={(e) =>
                  setAssignForm({ ...assignForm, title: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Instructions</Label>
              <Textarea
                required
                rows={4}
                placeholder="What should students do?"
                value={assignForm.instructions}
                onChange={(e) =>
                  setAssignForm({ ...assignForm, instructions: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  required
                  value={assignForm.dueDate}
                  onChange={(e) =>
                    setAssignForm({ ...assignForm, dueDate: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Total Marks</Label>
                <Input
                  type="number"
                  required
                  value={assignForm.totalMarks}
                  onChange={(e) =>
                    setAssignForm({ ...assignForm, totalMarks: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAssignOpen(false)}
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
