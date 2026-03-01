"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Book01Icon,
  BookOpen01Icon,
  Calendar01Icon,
  UserGroupIcon,
  Tick02Icon,
  FloppyDiskIcon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { useTermFilter } from "@/components/providers/TermFilterProvider";
import { CreateAssessmentDialog } from "@/components/gradebook/CreateAssessmentDialog";
import { calculateGrade, GradingScaleType } from "@/lib/grading";

interface MarkState {
  score: string;
  comments: string;
}

export default function GradebookPage() {
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>("");
  const [scaleType, setScaleType] =
    useState<GradingScaleType>("junior_secondary");

  const [marksState, setMarksState] = useState<Record<string, MarkState>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mode, selectedTermIds, selectedYearIds } = useTermFilter();

  // If in 'terms' mode, pick the first term ID for assessment grouping.
  const activeTermId =
    mode === "terms" && selectedTermIds.length > 0
      ? (selectedTermIds[0] as Id<"terms">)
      : undefined;

  const queryArgs =
    mode === "terms" && selectedTermIds.length > 0
      ? { termIds: selectedTermIds }
      : mode === "years" && selectedYearIds.length > 0
        ? { yearIds: selectedYearIds }
        : {};

  const classes = useQuery(api.classes.list, queryArgs);

  const validClassId = selectedClassId
    ? (selectedClassId as Id<"classes">)
    : undefined;
  const validSubjectId = selectedSubjectId
    ? (selectedSubjectId as Id<"subjects">)
    : undefined;
  const validAssessmentId = selectedAssessmentId
    ? (selectedAssessmentId as Id<"assessments">)
    : undefined;

  const subjects = useQuery(
    api.classes.getSubjects,
    validClassId ? { classId: validClassId } : "skip",
  );

  const assessments = useQuery(
    api.assessments.getAssessments,
    validClassId && validSubjectId && activeTermId
      ? {
          classId: validClassId,
          subjectId: validSubjectId,
          termId: activeTermId,
        }
      : "skip",
  );

  const students = useQuery(
    api.classes.getStudents,
    validClassId ? { classId: validClassId } : "skip",
  );

  const existingMarks = useQuery(
    api.assessments.getMarks,
    validAssessmentId ? { assessmentId: validAssessmentId } : "skip",
  );

  const saveMarksMutation = useMutation(api.assessments.saveMarks);

  const activeAssessment = useMemo(() => {
    return assessments?.find((a) => a._id === validAssessmentId);
  }, [assessments, validAssessmentId]);

  // Attempt to auto-detect Primary/Junior/Senior logic based on class name
  useEffect(() => {
    if (classes && selectedClassId) {
      const cls = classes.find((c) => c._id === selectedClassId);
      if (cls) {
        const lowerName = cls.name.toLowerCase();
        if (
          lowerName.includes("grade 1") ||
          lowerName.includes("grade 2") ||
          lowerName.includes("grade 3") ||
          lowerName.includes("grade 4") ||
          lowerName.includes("grade 5") ||
          lowerName.includes("grade 6") ||
          lowerName.includes("grade 7") ||
          lowerName.includes("primary")
        ) {
          setScaleType("primary");
        } else if (
          lowerName.includes("grade 10") ||
          lowerName.includes("grade 11") ||
          lowerName.includes("grade 12") ||
          lowerName.includes("senior")
        ) {
          setScaleType("senior_secondary");
        } else {
          setScaleType("junior_secondary");
        }
      }
    }

    // Auto-clear selected IDs if they don't exist in the current loaded set
    // to prevent react select from rendering raw convex ID strings.
    if (
      classes &&
      selectedClassId &&
      !classes.some((c) => c._id === selectedClassId)
    ) {
      setSelectedClassId("");
      setSelectedSubjectId("");
      setSelectedAssessmentId("");
    }
  }, [selectedClassId, classes]);

  useEffect(() => {
    if (
      subjects &&
      selectedSubjectId &&
      !subjects.some((s) => s.subjectId === selectedSubjectId)
    ) {
      setSelectedSubjectId("");
      setSelectedAssessmentId("");
    }
  }, [subjects, selectedSubjectId]);

  useEffect(() => {
    if (
      assessments &&
      selectedAssessmentId &&
      !assessments.some((a) => a._id === selectedAssessmentId)
    ) {
      setSelectedAssessmentId("");
    }
  }, [assessments, selectedAssessmentId]);

  // Hydrate state when existing marks or students load
  useEffect(() => {
    if (students && existingMarks !== undefined) {
      const newState: Record<string, MarkState> = {};

      const existingMap = new Map();
      existingMarks.forEach((record) => {
        existingMap.set(record.studentId, {
          score: record.score.toString(),
          comments: record.comments || "",
        });
      });

      students.forEach((student) => {
        if (existingMap.has(student._id)) {
          newState[student._id] = existingMap.get(student._id);
        } else {
          newState[student._id] = { score: "", comments: "" };
        }
      });

      setMarksState(newState);
    }
  }, [students, existingMarks]);

  const handleScoreChange = (studentId: string, val: string) => {
    setMarksState((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], score: val },
    }));
  };

  const handleCommentsChange = (studentId: string, comments: string) => {
    setMarksState((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], comments },
    }));
  };

  const handleSave = async () => {
    if (!validAssessmentId) return;

    setIsSubmitting(true);
    try {
      const recordsToSave = Object.entries(marksState)
        .filter(([_, state]) => state.score.trim() !== "") // Only save ones with actual inputs
        .map(([studentId, state]) => ({
          studentId: studentId as Id<"users">,
          score: parseFloat(state.score),
          comments: state.comments,
        }));

      await saveMarksMutation({
        assessmentId: validAssessmentId,
        marks: recordsToSave,
      });

      toast.success("Marks saved successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to save marks");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTailwindTextColor = (colorWord: string) => {
    if (colorWord === "red") return "text-red-600";
    if (colorWord === "green") return "text-green-600";
    if (colorWord === "amber") return "text-amber-600";
    return "text-blue-600";
  };

  const getTailwindBgColor = (colorWord: string) => {
    if (colorWord === "red") return "bg-red-50";
    if (colorWord === "green") return "bg-green-50";
    if (colorWord === "amber") return "bg-amber-50";
    return "bg-blue-50";
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8 bg-brand-bg/30">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-accent">
            Gradebook & Assessments
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Record raw scores and calculate ECZ grades dynamically.
          </p>
        </div>
      </div>

      {!activeTermId && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-md text-sm">
          Please select a specific <strong>Term</strong> in the sidebar layout
          switcher to manage assessments.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="col-span-1 md:col-span-4 border-t-4 border-t-brand-primary">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center gap-5">
              <div className="space-y-1.5 flex-[1.5] min-w-[220px]">
                <Label>Class Cohort</Label>
                <Select
                  value={selectedClassId}
                  onValueChange={(val) => {
                    if (val) {
                      setSelectedClassId(val);
                      setSelectedSubjectId("");
                      setSelectedAssessmentId("");
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        classes === undefined
                          ? "Loading classes..."
                          : "Select a class"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {classes?.map((cls) => (
                      <SelectItem key={cls._id} value={cls._id}>
                        {cls.name}{" "}
                        <span className="text-muted-foreground text-xs ml-1">
                          ({cls.gradeName})
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 flex-[1.5] min-w-[220px]">
                <Label>Subject</Label>
                <Select
                  value={selectedSubjectId}
                  onValueChange={(val) => {
                    if (val) {
                      setSelectedSubjectId(val);
                      setSelectedAssessmentId("");
                    }
                  }}
                  disabled={!selectedClassId || !subjects}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects?.map((sub) => (
                      <SelectItem key={sub.subjectId} value={sub.subjectId}>
                        {sub.subjectName}
                      </SelectItem>
                    ))}
                    {subjects?.length === 0 && (
                      <div className="p-2 text-sm text-center text-muted-foreground">
                        No subjects assigned.
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 flex-2 min-w-[320px] mb-1.5">
                <Label>Assessment</Label>
                <div className="flex -space-x-px shadow-sm rounded-md items-stretch transition-colors focus-within:ring-2 focus-within:ring-brand-primary/50">
                  <Select
                    value={selectedAssessmentId}
                    onValueChange={(val) => val && setSelectedAssessmentId(val)}
                    disabled={!selectedSubjectId || !assessments}
                  >
                    <SelectTrigger className="flex-1 rounded-r-none focus:z-10 bg-white items-center focus-visible:ring-0 focus-visible:border-input border-r-0">
                      <SelectValue placeholder="Select test" />
                    </SelectTrigger>
                    <SelectContent>
                      {assessments?.map((a) => (
                        <SelectItem key={a._id} value={a._id}>
                          {a.title} ({a.totalScore} pts)
                        </SelectItem>
                      ))}
                      {assessments?.length === 0 && (
                        <div className="p-2 text-sm text-center text-muted-foreground">
                          No assessments found.
                        </div>
                      )}
                    </SelectContent>
                  </Select>

                  {validClassId && validSubjectId && activeTermId ? (
                    <CreateAssessmentDialog
                      classId={validClassId}
                      subjectId={validSubjectId}
                      termId={activeTermId}
                    />
                  ) : (
                    <Button
                      disabled
                      className="h-10 rounded-l-none bg-muted text-muted-foreground border border-input focus:z-10 relative focus-visible:ring-0 focus-visible:border-input"
                      title="Select a term, class, and subject to create an assessment"
                    >
                      <HugeiconsIcon
                        icon={PlusSignIcon}
                        className="w-4 h-4 mr-1.5"
                      />
                      New
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 flex-1 min-w-[180px]">
                <Label>Expected ECZ Scale</Label>
                <Select
                  value={scaleType}
                  onValueChange={(val) =>
                    val && setScaleType(val as GradingScaleType)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Scale" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">Primary (Divisions)</SelectItem>
                    <SelectItem value="junior_secondary">
                      Junior Secondary (Merits)
                    </SelectItem>
                    <SelectItem value="senior_secondary">
                      Senior Secondary (1-9 Scale)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {validAssessmentId && activeAssessment && (
          <Card className="col-span-1 md:col-span-4 shadow-sm">
            <CardHeader className="pb-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <HugeiconsIcon
                    icon={BookOpen01Icon}
                    className="size-5 text-brand-primary"
                  />
                  {activeAssessment.title} — Grade Entry Grid
                </CardTitle>
                <CardDescription>
                  Max Score limit:{" "}
                  <strong className="text-foreground">
                    {activeAssessment.totalScore} points
                  </strong>
                </CardDescription>
              </div>
              <Button
                onClick={handleSave}
                disabled={isSubmitting || !students || students.length === 0}
                className="bg-brand-primary hover:bg-brand-primary-dark"
              >
                {isSubmitting ? (
                  <Spinner className="w-4 h-4 mr-2" />
                ) : (
                  <HugeiconsIcon
                    icon={FloppyDiskIcon}
                    className="w-4 h-4 mr-2"
                  />
                )}
                Save Gradebook
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {students === undefined || existingMarks === undefined ? (
                <div className="flex justify-center p-12">
                  <Spinner className="w-8 h-8 text-brand-primary" />
                </div>
              ) : students.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  No students enrolled in this class to grade.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="w-[250px] pl-6 font-semibold text-brand-accent">
                          Student
                        </TableHead>
                        <TableHead className="w-[150px] font-semibold text-brand-accent">
                          Raw Score
                        </TableHead>
                        <TableHead className="w-[200px] font-semibold text-brand-accent">
                          Analyzed ECZ Grade
                        </TableHead>
                        <TableHead className="pr-6 font-semibold text-brand-accent">
                          Teacher Remarks
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => {
                        const state = marksState[student._id] || {
                          score: "",
                          comments: "",
                        };

                        const scoreNum = parseFloat(state.score);
                        const hasValidScore =
                          !isNaN(scoreNum) && state.score.trim() !== "";

                        let gradeResult = null;
                        if (hasValidScore) {
                          gradeResult = calculateGrade(
                            scoreNum,
                            activeAssessment.totalScore,
                            scaleType,
                          );
                        }

                        return (
                          <TableRow
                            key={student._id}
                            className="hover:bg-muted/30"
                          >
                            <TableCell className="pl-6 font-medium">
                              <div className="flex flex-col">
                                <span>{student.name}</span>
                                <span className="text-xs text-muted-foreground font-normal">
                                  {student.email}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  placeholder="-"
                                  value={state.score}
                                  min={0}
                                  max={activeAssessment.totalScore}
                                  step={0.5}
                                  onChange={(e) =>
                                    handleScoreChange(
                                      student._id,
                                      e.target.value,
                                    )
                                  }
                                  className="w-20 text-center font-semibold bg-white"
                                />
                                <span className="text-sm font-medium text-muted-foreground">
                                  / {activeAssessment.totalScore}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {gradeResult ? (
                                <div
                                  className={`inline-flex items-center px-2.5 py-1 rounded-md text-sm font-semibold border ${getTailwindTextColor(gradeResult.color)} ${getTailwindBgColor(gradeResult.color)} border-${gradeResult.color}-200`}
                                >
                                  {gradeResult.grade}{" "}
                                  <span className="ml-1.5 opacity-70 font-normal">
                                    ({gradeResult.percentage}%)
                                  </span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm italic">
                                  Pending...
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="pr-6">
                              <Input
                                placeholder="Feedback..."
                                value={state.comments}
                                onChange={(e) =>
                                  handleCommentsChange(
                                    student._id,
                                    e.target.value,
                                  )
                                }
                                className="text-sm bg-transparent border-dashed h-9 focus:border-solid hover:bg-white"
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
