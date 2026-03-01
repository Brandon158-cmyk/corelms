"use client";

import { use, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  PrinterIcon,
  ArrowLeft02Icon,
  Tick02Icon,
  Calendar03Icon,
  UserIcon,
  Book01Icon,
  Alert02Icon,
  Shield01Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";
import { toast } from "sonner";

export default function ReportCardDetailPage(props: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = use(props.params);
  const report = useQuery(api.reportCards.get, {
    reportId: reportId as Id<"reportCards">,
  });

  const updateComments = useMutation(api.reportCards.updateComments);
  const publish = useMutation(api.reportCards.publish);

  const [classTeacherComment, setClassTeacherComment] = useState<string | null>(
    null,
  );
  const [headteacherComment, setHeadteacherComment] = useState<string | null>(
    null,
  );
  const [saving, setSaving] = useState(false);

  // Once loaded, initialize local state
  const effectiveCTC = classTeacherComment ?? report?.classTeacherComment ?? "";
  const effectiveHTC = headteacherComment ?? report?.headteacherComment ?? "";

  if (report === undefined) {
    return (
      <div className="flex justify-center items-center py-24">
        <Spinner className="text-brand-primary w-8 h-8" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex flex-col items-center py-24 gap-4">
        <p className="text-muted-foreground">Report card not found.</p>
        <Link href="/dashboard/report-cards">
          <Button variant="outline">
            <HugeiconsIcon icon={ArrowLeft02Icon} className="size-4 mr-1.5" />
            Back to Report Cards
          </Button>
        </Link>
      </div>
    );
  }

  // Compute overall average
  const totalPct = report.subjects.reduce((s, sub) => s + sub.percentage, 0);
  const avgPct =
    report.subjects.length > 0
      ? Math.round(totalPct / report.subjects.length)
      : 0;

  const handleSaveComments = async () => {
    setSaving(true);
    try {
      await updateComments({
        reportId: report._id,
        classTeacherComment: effectiveCTC,
        headteacherComment: effectiveHTC,
      });
      toast.success("Comments saved successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    try {
      await publish({ reportId: report._id });
      toast.success("Report card published");
    } catch (err: any) {
      toast.error(err.message || "Failed to publish");
    }
  };

  const formattedDate = new Date(report.generatedAt).toLocaleDateString(
    "en-ZM",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Toolbar (hidden on print) */}
      <div className="flex items-center justify-between print:hidden">
        <Link href="/dashboard/report-cards">
          <Button variant="ghost" size="sm">
            <HugeiconsIcon icon={ArrowLeft02Icon} className="size-4 mr-1.5" />
            Back
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          {report.status === "draft" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handlePublish}
              className="text-green-600 border-green-200 hover:bg-green-50"
            >
              <HugeiconsIcon icon={Tick02Icon} className="size-4 mr-1.5" />
              Publish
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => window.print()}
            className="bg-brand-primary hover:bg-brand-primary-deep"
          >
            <HugeiconsIcon icon={PrinterIcon} className="size-4 mr-1.5" />
            Print
          </Button>
        </div>
      </div>

      {/* Report Card — Printable Area */}
      <div className="bg-white dark:bg-card border rounded-xl shadow-sm p-8 print:shadow-none print:border-none print:p-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-brand-primary-deep tracking-tight">
            {report.schoolName}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Student Progress Report Card
          </p>
          <Separator className="my-4" />
        </div>

        {/* Student Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
          <div>
            <span className="text-muted-foreground block text-xs font-medium uppercase tracking-wide">
              Student Name
            </span>
            <span className="font-semibold text-base">
              {report.studentName}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block text-xs font-medium uppercase tracking-wide">
              Class
            </span>
            <span className="font-semibold">
              {report.gradeName} — {report.className}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block text-xs font-medium uppercase tracking-wide">
              Term
            </span>
            <span className="font-semibold">{report.termName}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-xs font-medium uppercase tracking-wide">
              Academic Year
            </span>
            <span className="font-semibold">{report.yearName}</span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-3 mb-6">
          {report.status === "published" ? (
            <Badge className="bg-green-100 text-green-700 border border-green-200">
              <HugeiconsIcon icon={Tick02Icon} className="size-3 mr-1" />
              Published
            </Badge>
          ) : (
            <Badge variant="secondary">Draft</Badge>
          )}
          <span className="text-xs text-muted-foreground">
            Generated on {formattedDate}
          </span>
        </div>

        {/* Subject Grades Table */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-2">
            <HugeiconsIcon
              icon={Book01Icon}
              className="size-4 text-brand-primary"
            />
            Academic Performance
          </h2>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Subject</TableHead>
                  <TableHead className="text-center">Score</TableHead>
                  <TableHead className="text-center">Out Of</TableHead>
                  <TableHead className="text-center">%</TableHead>
                  <TableHead className="text-center">Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.subjects.map((sub) => (
                  <TableRow key={sub.subjectId}>
                    <TableCell className="font-medium">
                      {sub.subjectName}
                    </TableCell>
                    <TableCell className="text-center">
                      {sub.totalScore}
                    </TableCell>
                    <TableCell className="text-center">
                      {sub.totalOutOf}
                    </TableCell>
                    <TableCell className="text-center font-semibold">
                      {sub.percentage}%
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={
                          sub.color === "green"
                            ? "text-green-700 border-green-200 bg-green-50"
                            : sub.color === "amber"
                              ? "text-amber-700 border-amber-200 bg-amber-50"
                              : "text-red-700 border-red-200 bg-red-50"
                        }
                      >
                        {sub.grade}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {/* Overall Row */}
                <TableRow className="bg-muted/30 font-semibold">
                  <TableCell>Overall Average</TableCell>
                  <TableCell className="text-center">—</TableCell>
                  <TableCell className="text-center">—</TableCell>
                  <TableCell className="text-center text-brand-primary text-lg">
                    {avgPct}%
                  </TableCell>
                  <TableCell className="text-center">—</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Attendance & Discipline Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Attendance Card */}
          <Card className="shadow-none border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <HugeiconsIcon
                  icon={Calendar03Icon}
                  className="size-4 text-brand-primary"
                />
                Attendance Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Days</span>
                  <span className="font-semibold">
                    {report.attendanceSummary.totalDays}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600">Present</span>
                  <span className="font-semibold text-green-600">
                    {report.attendanceSummary.present}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-600">Absent</span>
                  <span className="font-semibold text-red-600">
                    {report.attendanceSummary.absent}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-600">Late</span>
                  <span className="font-semibold text-amber-600">
                    {report.attendanceSummary.late}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-600">Excused</span>
                  <span className="font-semibold text-blue-600">
                    {report.attendanceSummary.excused}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rate</span>
                  <span className="font-bold">
                    {report.attendanceSummary.totalDays > 0
                      ? Math.round(
                          (report.attendanceSummary.present /
                            report.attendanceSummary.totalDays) *
                            100,
                        )
                      : 0}
                    %
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Discipline Card */}
          <Card className="shadow-none border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <HugeiconsIcon
                  icon={Shield01Icon}
                  className="size-4 text-brand-primary"
                />
                Behavioral Record
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Incidents</span>
                  {report.disciplineSummary.totalIncidents === 0 ? (
                    <Badge
                      variant="outline"
                      className="text-green-600 border-green-200 bg-green-50"
                    >
                      No incidents
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      {report.disciplineSummary.totalIncidents}
                    </Badge>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Points Deducted</span>
                  <span className="font-semibold">
                    {report.disciplineSummary.totalPointsDeducted}
                  </span>
                </div>
                {report.disciplineSummary.totalIncidents === 0 && (
                  <p className="text-xs text-green-600 mt-2">
                    Excellent conduct throughout the term.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comments Section */}
        <div className="space-y-4 mb-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
            <HugeiconsIcon
              icon={UserIcon}
              className="size-4 text-brand-primary"
            />
            Comments
          </h2>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                Class Teacher&apos;s Comment
              </label>
              <Textarea
                value={effectiveCTC}
                onChange={(e) => setClassTeacherComment(e.target.value)}
                placeholder="Enter class teacher's comment..."
                rows={3}
                className="print:border-0 print:p-0 print:resize-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                Headteacher&apos;s Comment
              </label>
              <Textarea
                value={effectiveHTC}
                onChange={(e) => setHeadteacherComment(e.target.value)}
                placeholder="Enter headteacher's comment..."
                rows={3}
                className="print:border-0 print:p-0 print:resize-none"
              />
            </div>
          </div>

          {/* Save Comments Button (hidden on print) */}
          <div className="print:hidden">
            <Button
              size="sm"
              onClick={handleSaveComments}
              disabled={saving}
              className="bg-brand-primary hover:bg-brand-primary-deep"
            >
              {saving ? (
                <>
                  <Spinner className="size-4 mr-1.5" />
                  Saving...
                </>
              ) : (
                "Save Comments"
              )}
            </Button>
          </div>
        </div>

        {/* Signature Lines (visible on print) */}
        <div className="grid grid-cols-2 gap-8 mt-12 pt-4 border-t">
          <div>
            <div className="border-b border-dashed border-muted-foreground/40 mb-2 h-8" />
            <p className="text-xs text-muted-foreground text-center">
              Class Teacher&apos;s Signature
            </p>
          </div>
          <div>
            <div className="border-b border-dashed border-muted-foreground/40 mb-2 h-8" />
            <p className="text-xs text-muted-foreground text-center">
              Headteacher&apos;s Signature &amp; School Stamp
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
