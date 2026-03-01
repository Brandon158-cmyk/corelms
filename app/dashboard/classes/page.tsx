"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { CreateClassDialog } from "@/components/classes/CreateClassDialog";
import { useTermFilter } from "@/components/providers/TermFilterProvider";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ClassesPage() {
  const { mode, selectedTermIds, selectedYearIds, filterLabel } =
    useTermFilter();

  // Build query args based on term filter
  const queryArgs =
    mode === "terms" && selectedTermIds.length > 0
      ? { termIds: selectedTermIds }
      : mode === "years" && selectedYearIds.length > 0
        ? { yearIds: selectedYearIds }
        : {};

  const classes = useQuery(api.classes.list, queryArgs);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-brand-accent">
            Classes
          </h2>
          <p className="text-muted-foreground">
            Manage your school's classes and schedules.
            {mode !== "all-time" && (
              <Badge
                variant="outline"
                className="ml-2 text-xs font-normal align-middle"
              >
                Filtered: {filterLabel}
              </Badge>
            )}
          </p>
        </div>
        <CreateClassDialog />
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden min-h-[400px]">
        {classes === undefined ? (
          <div className="flex justify-center p-12">
            <Spinner className="w-8 h-8 text-brand-primary" />
          </div>
        ) : classes.length === 0 ? (
          <div className="p-12 text-center h-full flex flex-col items-center justify-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-primary font-bold">
              📚
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              {mode !== "all-time"
                ? "No classes found for this filter"
                : "No classes found"}
            </h3>
            <p className="text-gray-500 mb-4 max-w-sm mx-auto">
              {mode !== "all-time"
                ? `No classes match the current filter (${filterLabel}). Try selecting a different term or "All Time".`
                : "Get started by creating a new class for this term."}
            </p>
            {mode === "all-time" && (
              <CreateClassDialog>
                <Button
                  variant="outline"
                  className="border-brand-primary/20 text-brand-primary"
                >
                  Create Initial Class
                </Button>
              </CreateClassDialog>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead>Class Name</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Term</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((cls) => (
                <TableRow key={cls._id}>
                  <TableCell className="font-medium text-brand-accent">
                    {cls.name}
                  </TableCell>
                  <TableCell>{cls.gradeName}</TableCell>
                  <TableCell>
                    {cls.termName ? (
                      <span className="text-sm">
                        {cls.termName}
                        {cls.yearName && (
                          <span className="text-muted-foreground">
                            {" "}
                            — {cls.yearName}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        No term
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{cls.room || "TBA"}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        cls.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {cls.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/dashboard/classes/${cls._id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-brand-primary hover:text-brand-accent"
                      >
                        View
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
