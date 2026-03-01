"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useTermFilter } from "@/components/providers/TermFilterProvider";
import { GenerateReportDialog } from "@/components/report-cards/GenerateReportDialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  File01Icon,
  Tick02Icon,
  ViewIcon,
  Calendar03Icon,
  UserMultiple02Icon,
  PrinterIcon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";
import { toast } from "sonner";

type GradingScale = "primary" | "junior_secondary" | "senior_secondary";

export default function ReportCardsPage() {
  const { mode, selectedTermIds } = useTermFilter();
  const classes = useQuery(api.classes.list, {});
  const terms = useQuery(api.terms.list, {});

  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedTermId, setSelectedTermId] = useState<string>("");
  const [gradingScale, setGradingScale] =
    useState<GradingScale>("junior_secondary");

  const publishAll = useMutation(api.reportCards.publishAll);

  // Use term filter from sidebar if available
  const effectiveTermId =
    selectedTermId || (selectedTermIds.length === 1 ? selectedTermIds[0] : "");

  const reportCards = useQuery(
    api.reportCards.listByClass,
    selectedClassId && effectiveTermId
      ? {
          classId: selectedClassId as Id<"classes">,
          termId: effectiveTermId as Id<"terms">,
        }
      : "skip",
  );

  const handlePublishAll = async () => {
    if (!selectedClassId || !effectiveTermId) return;
    try {
      const result = await publishAll({
        classId: selectedClassId as Id<"classes">,
        termId: effectiveTermId as Id<"terms">,
      });
      toast.success(`Published ${result.count} report card(s)`);
    } catch (err: any) {
      toast.error(err.message || "Failed to publish");
    }
  };

  const draftCount =
    reportCards?.filter((r) => r.status === "draft").length ?? 0;

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Report Cards</h1>
        <p className="text-muted-foreground">
          Generate and manage termly student report cards.
        </p>
      </div>

      {/* Filters */}
      <Card className="shadow-sm border-t-4 border-t-brand-primary">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <HugeiconsIcon
              icon={Calendar03Icon}
              className="size-5 text-brand-primary"
            />
            Select Class & Term
          </CardTitle>
          <CardDescription>
            Choose a class and term to view or generate report cards.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            {/* Class Select */}
            <div className="flex flex-col gap-1.5 min-w-[200px]">
              <label className="text-sm font-medium text-muted-foreground">
                Class
              </label>
              <Select
                value={selectedClassId}
                onValueChange={(v) => setSelectedClassId(v ?? "")}
              >
                <SelectTrigger id="class-select">
                  <SelectValue placeholder="Select class..." />
                </SelectTrigger>
                <SelectContent>
                  {classes?.map((cls) => (
                    <SelectItem key={cls._id} value={cls._id}>
                      {cls.gradeName} — {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Term Select */}
            <div className="flex flex-col gap-1.5 min-w-[200px]">
              <label className="text-sm font-medium text-muted-foreground">
                Term
              </label>
              <Select
                value={effectiveTermId}
                onValueChange={(v) => setSelectedTermId(v ?? "")}
              >
                <SelectTrigger id="term-select">
                  <SelectValue placeholder="Select term..." />
                </SelectTrigger>
                <SelectContent>
                  {terms?.map((t) => (
                    <SelectItem key={t._id} value={t._id}>
                      {t.yearName} — {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Grading Scale Select */}
            <div className="flex flex-col gap-1.5 min-w-[200px]">
              <label className="text-sm font-medium text-muted-foreground">
                Grading Scale
              </label>
              <Select
                value={gradingScale}
                onValueChange={(v) => setGradingScale(v as GradingScale)}
              >
                <SelectTrigger id="scale-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">Primary (Grades 1-7)</SelectItem>
                  <SelectItem value="junior_secondary">
                    Junior Secondary (Grades 8-9)
                  </SelectItem>
                  <SelectItem value="senior_secondary">
                    Senior Secondary (Grades 10-12)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Generate Button */}
            {selectedClassId && effectiveTermId && (
              <GenerateReportDialog
                classId={selectedClassId as Id<"classes">}
                termId={effectiveTermId as Id<"terms">}
                gradingScale={gradingScale}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {selectedClassId && effectiveTermId ? (
        <Card className="shadow-sm border-t-4 border-t-brand-primary">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-3">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <HugeiconsIcon
                  icon={File01Icon}
                  className="size-5 text-brand-primary"
                />
                Generated Report Cards
              </CardTitle>
              <CardDescription>
                {reportCards?.length ?? 0} report card(s) found
              </CardDescription>
            </div>
            {draftCount > 0 && (
              <Button
                size="sm"
                onClick={handlePublishAll}
                className="bg-brand-primary hover:bg-brand-primary-deep"
              >
                <HugeiconsIcon icon={Tick02Icon} className="size-4 mr-1.5" />
                Publish All Drafts ({draftCount})
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {reportCards === undefined ? (
              <div className="flex justify-center py-12">
                <Spinner className="text-brand-primary" />
              </div>
            ) : reportCards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <HugeiconsIcon
                  icon={File01Icon}
                  className="size-12 text-muted-foreground/40 mb-4"
                />
                <p className="text-muted-foreground font-medium">
                  No report cards generated yet.
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Click &quot;Generate Report Cards&quot; above to create them.
                </p>
              </div>
            ) : (
              <div className="rounded-none border-x-0 border-b-0">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="font-semibold text-brand-accent">
                        Student
                      </TableHead>
                      <TableHead className="text-center font-semibold text-brand-accent">
                        Subjects
                      </TableHead>
                      <TableHead className="text-center font-semibold text-brand-accent">
                        Avg %
                      </TableHead>
                      <TableHead className="text-center font-semibold text-brand-accent">
                        Attendance
                      </TableHead>
                      <TableHead className="text-center font-semibold text-brand-accent">
                        Discipline
                      </TableHead>
                      <TableHead className="text-center font-semibold text-brand-accent">
                        Status
                      </TableHead>
                      <TableHead className="text-right font-semibold text-brand-accent">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportCards.map((report) => (
                      <TableRow key={report._id}>
                        <TableCell className="font-medium">
                          {report.studentName}
                        </TableCell>
                        <TableCell className="text-center">
                          {report.subjects.length}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-semibold">
                            {report.avgPercentage}%
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-xs text-muted-foreground">
                            {report.attendanceSummary.present}P /{" "}
                            {report.attendanceSummary.absent}A /{" "}
                            {report.attendanceSummary.late}L
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {report.disciplineSummary.totalIncidents > 0 ? (
                            <Badge variant="destructive" className="text-xs">
                              {report.disciplineSummary.totalIncidents}{" "}
                              incident(s)
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-xs text-green-600 border-green-200 bg-green-50"
                            >
                              Clean
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {report.status === "published" ? (
                            <Badge className="bg-green-100 text-green-700 border border-green-200 hover:bg-green-100">
                              <HugeiconsIcon
                                icon={Tick02Icon}
                                className="size-3 mr-1"
                              />
                              Published
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Draft
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/dashboard/report-cards/${report._id}`}>
                            <Button variant="ghost" size="sm">
                              <HugeiconsIcon
                                icon={ViewIcon}
                                className="size-4 mr-1"
                              />
                              View
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <HugeiconsIcon
              icon={Calendar03Icon}
              className="size-12 text-muted-foreground/40 mb-4"
            />
            <p className="text-muted-foreground font-medium">
              Select a class and term to get started.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
