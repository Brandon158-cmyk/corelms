"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Tick02Icon,
  ArrowLeft02Icon,
  Calendar03Icon,
  SentIcon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { format } from "date-fns";

const STATUS_COLORS: Record<string, string> = {
  submitted: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  graded:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  late: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  open: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  closed: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
};

export default function AssignmentsPage() {
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("id");

  const assignments = useQuery(api.lms.listAssignments, {});
  const user = useQuery(api.users.currentUser);

  const submissions = useQuery(
    api.lms.listSubmissions,
    selectedId ? { assignmentId: selectedId as any } : "skip",
  );

  const submitWork = useMutation(api.lms.submitWork);
  const gradeSubmission = useMutation(api.lms.gradeSubmission);

  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isGradeOpen, setIsGradeOpen] = useState(false);
  const [submitContent, setSubmitContent] = useState("");
  const [gradingId, setGradingId] = useState<string | null>(null);
  const [gradeForm, setGradeForm] = useState({ grade: "", feedback: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isTeacher =
    user?.role === "superAdmin" ||
    user?.role === "headteacher" ||
    user?.role === "proprietor" ||
    user?.role === "teacher";

  const selectedAssignment = assignments?.find((a) => a._id === selectedId);

  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !submitContent.trim()) {
      toast.error("Please write your answer");
      return;
    }
    setIsSubmitting(true);
    try {
      await submitWork({
        assignmentId: selectedId as any,
        content: submitContent,
      });
      toast.success("Work submitted successfully!");
      setIsSubmitOpen(false);
      setSubmitContent("");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingId || !gradeForm.grade) {
      toast.error("Grade is required");
      return;
    }
    setIsSubmitting(true);
    try {
      await gradeSubmission({
        id: gradingId as any,
        grade: parseInt(gradeForm.grade),
        feedback: gradeForm.feedback || undefined,
      });
      toast.success("Submission graded");
      setIsGradeOpen(false);
      setGradeForm({ grade: "", feedback: "" });
    } catch (err: any) {
      toast.error(err.message || "Failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          render={<Link href="/dashboard/lms" />}
        >
          <HugeiconsIcon icon={ArrowLeft02Icon} className="size-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-brand-accent">Assignments</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {selectedAssignment
              ? selectedAssignment.title
              : "View and manage all assignments."}
          </p>
        </div>
      </div>

      {/* Assignment List (when none selected) */}
      {!selectedId && (
        <Card className="shadow-sm">
          <CardContent className="pt-4">
            {assignments === undefined ? (
              <div className="flex items-center justify-center py-12">
                <Spinner className="size-6" />
              </div>
            ) : assignments.length === 0 ? (
              <div className="py-16 text-center border-2 border-dashed rounded-lg">
                <HugeiconsIcon
                  icon={Calendar03Icon}
                  className="size-12 mx-auto text-muted-foreground opacity-20 mb-4"
                />
                <p className="text-muted-foreground font-medium">
                  No assignments yet.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Assignment</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead>Submissions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((a) => (
                    <TableRow key={a._id}>
                      <TableCell className="font-medium">{a.title}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {a.courseTitle}
                      </TableCell>
                      <TableCell className="tabular-nums text-muted-foreground">
                        {format(new Date(a.dueDate), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {a.totalMarks}
                      </TableCell>
                      <TableCell>
                        <span className="tabular-nums">
                          {a.gradedCount}/{a.submissionCount}
                        </span>
                        <span className="text-muted-foreground text-[10px] ml-1">
                          graded
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${STATUS_COLORS[a.status] || ""}`}
                        >
                          {a.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-7"
                          render={
                            <Link
                              href={`/dashboard/lms/assignments?id=${a._id}`}
                            />
                          }
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Selected Assignment — Submissions */}
      {selectedId && selectedAssignment && (
        <div className="space-y-4">
          <Card className="shadow-sm border-t-4 border-t-brand-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {selectedAssignment.title}
                  </CardTitle>
                  <CardDescription>
                    {selectedAssignment.courseTitle}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${STATUS_COLORS[selectedAssignment.status] || ""}`}
                  >
                    {selectedAssignment.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1 tabular-nums">
                    Due:{" "}
                    {format(
                      new Date(selectedAssignment.dueDate),
                      "dd MMM yyyy",
                    )}{" "}
                    • {selectedAssignment.totalMarks} marks
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {selectedAssignment.instructions}
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Link href="/dashboard/lms/assignments">
                  <Button variant="outline" size="sm" className="text-xs">
                    ← All Assignments
                  </Button>
                </Link>
                {!isTeacher && selectedAssignment.status === "open" && (
                  <Button
                    size="sm"
                    onClick={() => setIsSubmitOpen(true)}
                    className="bg-brand-primary text-white text-xs"
                  >
                    <HugeiconsIcon icon={SentIcon} className="size-4 mr-1" />
                    Submit Work
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submissions Table */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">
                Submissions ({submissions?.length ?? 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {submissions === undefined ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner className="size-5" />
                </div>
              ) : submissions.length === 0 ? (
                <div className="py-8 text-center border-2 border-dashed rounded-lg text-muted-foreground">
                  No submissions yet.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Answer</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Feedback</TableHead>
                      <TableHead>Status</TableHead>
                      {isTeacher && (
                        <TableHead className="text-right">Actions</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((s) => (
                      <TableRow key={s._id}>
                        <TableCell className="font-medium">
                          {s.studentName}
                        </TableCell>
                        <TableCell className="text-muted-foreground tabular-nums">
                          {format(s.submittedAt, "dd MMM yyyy HH:mm")}
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <p className="text-xs line-clamp-2">{s.content}</p>
                        </TableCell>
                        <TableCell className="font-bold tabular-nums">
                          {s.grade !== undefined && s.grade !== null
                            ? `${s.grade}/${selectedAssignment.totalMarks}`
                            : "—"}
                        </TableCell>
                        <TableCell className="max-w-[150px]">
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {s.feedback || "—"}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${STATUS_COLORS[s.status] || ""}`}
                          >
                            {s.status}
                          </Badge>
                        </TableCell>
                        {isTeacher && (
                          <TableCell className="text-right">
                            {s.status !== "graded" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-7"
                                onClick={() => {
                                  setGradingId(s._id);
                                  setGradeForm({ grade: "", feedback: "" });
                                  setIsGradeOpen(true);
                                }}
                              >
                                Grade
                              </Button>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Submit Work Dialog */}
      <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Submit Your Work</DialogTitle>
            <DialogDescription>
              Write your answer for {selectedAssignment?.title}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitWork} className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label>Your Answer</Label>
              <Textarea
                required
                rows={8}
                placeholder="Type your answer here…"
                value={submitContent}
                onChange={(e) => setSubmitContent(e.target.value)}
              />
            </div>
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsSubmitOpen(false)}
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
                  <HugeiconsIcon icon={SentIcon} className="size-4 mr-2" />
                )}
                Submit
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Grade Dialog */}
      <Dialog open={isGradeOpen} onOpenChange={setIsGradeOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Grade Submission</DialogTitle>
            <DialogDescription>
              Max: {selectedAssignment?.totalMarks} marks
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleGrade} className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label>Grade</Label>
              <Input
                type="number"
                required
                min="0"
                max={selectedAssignment?.totalMarks || 100}
                placeholder="Enter score"
                value={gradeForm.grade}
                onChange={(e) =>
                  setGradeForm({ ...gradeForm, grade: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Feedback (optional)</Label>
              <Textarea
                rows={3}
                placeholder="Comments for the student…"
                value={gradeForm.feedback}
                onChange={(e) =>
                  setGradeForm({ ...gradeForm, feedback: e.target.value })
                }
              />
            </div>
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsGradeOpen(false)}
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
                Save Grade
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
