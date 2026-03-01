"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  Shield01Icon,
  SearchIcon,
} from "@hugeicons/core-free-icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function TrackingDashboardPage() {
  const [search, setSearch] = useState("");

  const disciplineLogs = useQuery(api.tracking.listRecentDiscipline);
  const senAlerts = useQuery(api.tracking.listSENAlerts);

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8 bg-brand-bg/30">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-accent">
            Behavior & SEN Tracking
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor disciplinary infractions and Special Educational Needs (SEN)
            alerts across the institution.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SEN Alerts Panel */}
        <Card className="col-span-1 border-t-4 border-t-red-500 shadow-sm">
          <CardHeader className="pb-3 bg-red-50/50 dark:bg-red-950/10">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-red-600 dark:text-red-400">
              <HugeiconsIcon icon={Alert02Icon} className="size-5" />
              Active SEN Alerts
            </CardTitle>
            <CardDescription className="text-red-900/60 dark:text-red-200/50">
              Students flagged by the MoE Early Grade tool.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y max-h-[500px] overflow-y-auto">
              {senAlerts === undefined ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Loading alerts...
                </div>
              ) : senAlerts.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
                  <div className="size-10 rounded-full bg-green-100 flex items-center justify-center dark:bg-green-900/30">
                    <HugeiconsIcon
                      icon={Shield01Icon}
                      className="size-5 text-green-600"
                    />
                  </div>
                  <p className="text-sm font-medium">No Active Alerts</p>
                  <p className="text-xs text-muted-foreground">
                    All students are scoring above the threshold.
                  </p>
                </div>
              ) : (
                senAlerts.map((alert) => (
                  <div
                    key={alert._id}
                    className="p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-sm">
                        {alert.studentName}
                      </span>
                      <Badge
                        variant="destructive"
                        className="font-mono text-[10px] px-1.5 rounded-sm"
                      >
                        Total Score: {alert.totalScore}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-1 mt-2 mb-2 text-xs">
                      <span className="bg-muted px-2 py-0.5 rounded-sm text-muted-foreground">
                        Vis: {alert.visualScore}
                      </span>
                      <span className="bg-muted px-2 py-0.5 rounded-sm text-muted-foreground">
                        Hear: {alert.hearingScore}
                      </span>
                      <span className="bg-muted px-2 py-0.5 rounded-sm text-muted-foreground">
                        Int: {alert.intellectualScore}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      Note: {alert.notes || "No notes provided."}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-wide">
                      Assessed: {new Date(alert.date).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Global Discipline Feed */}
        <Card className="col-span-1 lg:col-span-2 shadow-sm border-t-4 border-t-brand-primary">
          <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <HugeiconsIcon
                  icon={Shield01Icon}
                  className="size-5 text-brand-primary"
                />
                Recent Disciplinary Logs
              </CardTitle>
              <CardDescription>
                Chronological feed of recorded infractions.
              </CardDescription>
            </div>

            <div className="relative w-[200px]">
              <HugeiconsIcon
                icon={SearchIcon}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
              />
              <Input
                placeholder="Filter logs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[100px] font-semibold text-brand-accent">
                    Date
                  </TableHead>
                  <TableHead className="font-semibold text-brand-accent">
                    Student
                  </TableHead>
                  <TableHead className="font-semibold text-brand-accent hidden md:table-cell">
                    Reporter
                  </TableHead>
                  <TableHead className="font-semibold text-brand-accent">
                    Infraction
                  </TableHead>
                  <TableHead className="font-semibold text-brand-accent text-right">
                    Pts
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {disciplineLogs === undefined ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-32 text-center text-muted-foreground"
                    >
                      Loading feed...
                    </TableCell>
                  </TableRow>
                ) : disciplineLogs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-32 text-center text-muted-foreground bg-muted/10"
                    >
                      No disciplinary records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  disciplineLogs
                    .filter(
                      (log) =>
                        log.studentName
                          .toLowerCase()
                          .includes(search.toLowerCase()) ||
                        log.infraction
                          .toLowerCase()
                          .includes(search.toLowerCase()),
                    )
                    .map((log) => (
                      <TableRow
                        key={log._id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(log.date).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </TableCell>
                        <TableCell className="font-medium">
                          {log.studentName}
                          <div className="text-[10px] text-muted-foreground uppercase mt-0.5">
                            {log.category}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden md:table-cell">
                          {log.reporterName}
                        </TableCell>
                        <TableCell
                          className="max-w-[200px] truncate"
                          title={log.infraction}
                        >
                          <span className="text-sm">{log.infraction}</span>
                          {log.restorativeAction && (
                            <div className="text-xs text-brand-primary truncate mt-0.5">
                              ↳ {log.restorativeAction}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={
                              log.pointsDeducted > 10
                                ? "destructive"
                                : "secondary"
                            }
                            className="font-mono"
                          >
                            -{log.pointsDeducted}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
