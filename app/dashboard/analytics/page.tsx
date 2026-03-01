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
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Analytics01Icon,
  Alert02Icon,
  Tick02Icon,
  ArrowDown01Icon,
  RefreshIcon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { format } from "date-fns";

const RISK_COLORS: Record<string, { bg: string; text: string; badge: string }> =
  {
    critical: {
      bg: "bg-red-500",
      text: "text-red-700 dark:text-red-400",
      badge:
        "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200",
    },
    high: {
      bg: "bg-orange-500",
      text: "text-orange-700 dark:text-orange-400",
      badge:
        "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200",
    },
    medium: {
      bg: "bg-amber-500",
      text: "text-amber-700 dark:text-amber-400",
      badge:
        "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200",
    },
    low: {
      bg: "bg-emerald-500",
      text: "text-emerald-700 dark:text-emerald-400",
      badge:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200",
    },
  };

function ScoreBar({
  label,
  score,
  max = 100,
}: {
  label: string;
  score: number;
  max?: number;
}) {
  const pct = Math.min(100, Math.max(0, (score / max) * 100));
  const color =
    pct <= 25
      ? "bg-red-500"
      : pct <= 50
        ? "bg-orange-500"
        : pct <= 75
          ? "bg-amber-500"
          : "bg-emerald-500";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-bold tabular-nums">{score}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const summary = useQuery(api.analytics.getRiskSummary);
  const scores = useQuery(api.analytics.listRiskScores);
  const computeRisk = useMutation(api.analytics.computeRiskScores);

  const [isComputing, setIsComputing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleCompute = async () => {
    setIsComputing(true);
    try {
      const result = await computeRisk();
      toast.success(`Risk scores computed for ${result.computed} students`);
    } catch (err: any) {
      toast.error(err.message || "Failed to compute");
    } finally {
      setIsComputing(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-accent">
            Analytics & Early Warning
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Student risk scores based on attendance, academics, and discipline.
          </p>
          {summary?.lastComputed && (
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Last computed:{" "}
              {format(summary.lastComputed, "dd MMM yyyy, HH:mm")}
            </p>
          )}
        </div>
        <Button
          onClick={handleCompute}
          disabled={isComputing}
          className="bg-brand-primary hover:bg-brand-primary-deep text-white"
        >
          {isComputing ? (
            <Spinner className="size-4 mr-2" />
          ) : (
            <HugeiconsIcon icon={RefreshIcon} className="size-4 mr-2" />
          )}
          {isComputing ? "Computing…" : "Compute Scores"}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Scored</CardTitle>
            <HugeiconsIcon
              icon={Analytics01Icon}
              className="text-brand-primary"
              size={16}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-accent">
              {summary === undefined ? "…" : summary.total}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-t-2 border-t-red-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <HugeiconsIcon
              icon={Alert02Icon}
              className="text-red-500"
              size={16}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {summary === undefined ? "…" : summary.critical}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-t-2 border-t-orange-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">High Risk</CardTitle>
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              className="text-orange-500"
              size={16}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {summary === undefined ? "…" : summary.high}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-t-2 border-t-amber-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Medium</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {summary === undefined ? "…" : summary.medium}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-t-2 border-t-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Low Risk</CardTitle>
            <HugeiconsIcon
              icon={Tick02Icon}
              className="text-emerald-500"
              size={16}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {summary === undefined ? "…" : summary.low}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student Risk Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">At-Risk Students</CardTitle>
          <CardDescription>
            Sorted by severity — critical risks first. Click a row to see
            breakdown.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {scores === undefined ? (
            <div className="flex items-center justify-center py-12">
              <Spinner className="size-6" />
            </div>
          ) : scores.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-lg">
              <HugeiconsIcon
                icon={Analytics01Icon}
                className="size-12 text-muted-foreground opacity-20 mb-4"
              />
              <p className="text-muted-foreground font-medium">
                No risk scores computed yet.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Click "Compute Scores" to analyze student data.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead className="text-center">Attendance</TableHead>
                  <TableHead className="text-center">Academic</TableHead>
                  <TableHead className="text-center">Discipline</TableHead>
                  <TableHead className="text-center">Overall</TableHead>
                  <TableHead>Risk Level</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scores.map((s) => {
                  const cfg = RISK_COLORS[s.riskLevel];
                  const isExpanded = expandedId === s._id;
                  return (
                    <>
                      <TableRow
                        key={s._id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setExpandedId(isExpanded ? null : s._id)}
                      >
                        <TableCell className="font-medium">
                          {s.studentName}
                        </TableCell>
                        <TableCell className="text-center tabular-nums">
                          <span
                            className={
                              s.attendanceScore < 50
                                ? "text-red-600 font-bold"
                                : s.attendanceScore < 70
                                  ? "text-amber-600"
                                  : ""
                            }
                          >
                            {s.attendanceScore}%
                          </span>
                        </TableCell>
                        <TableCell className="text-center tabular-nums">
                          <span
                            className={
                              s.academicScore < 50
                                ? "text-red-600 font-bold"
                                : s.academicScore < 65
                                  ? "text-amber-600"
                                  : ""
                            }
                          >
                            {s.academicScore}%
                          </span>
                        </TableCell>
                        <TableCell className="text-center tabular-nums">
                          <span
                            className={
                              s.disciplineScore < 50
                                ? "text-red-600 font-bold"
                                : ""
                            }
                          >
                            {s.disciplineScore}%
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`font-bold tabular-nums text-lg ${cfg?.text || ""}`}
                          >
                            {s.overallRisk}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-[10px] uppercase font-bold ${cfg?.badge || ""}`}
                          >
                            {s.riskLevel}
                          </Badge>
                        </TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow key={`${s._id}-detail`}>
                          <TableCell colSpan={6} className="bg-muted/30 p-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-3">
                                <ScoreBar
                                  label="Attendance (40%)"
                                  score={s.attendanceScore}
                                />
                                <ScoreBar
                                  label="Academic (40%)"
                                  score={s.academicScore}
                                />
                                <ScoreBar
                                  label="Discipline (20%)"
                                  score={s.disciplineScore}
                                />
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                                  Risk Factors
                                </p>
                                {s.factors.length === 0 ? (
                                  <p className="text-xs text-muted-foreground italic">
                                    No specific risk factors identified.
                                  </p>
                                ) : (
                                  <ul className="space-y-1">
                                    {s.factors.map((f, i) => (
                                      <li
                                        key={i}
                                        className="flex items-start gap-2 text-xs"
                                      >
                                        <span className="text-red-500 mt-0.5">
                                          •
                                        </span>
                                        <span>{f}</span>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
