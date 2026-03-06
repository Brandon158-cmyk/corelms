"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { HugeiconsIcon } from "@hugeicons/react";
import { BookOpen, SearchIcon } from "@hugeicons/core-free-icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ClassesPage() {
  const [search, setSearch] = useState("");
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

  const filteredClasses = classes?.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.gradeName.toLowerCase().includes(search.toLowerCase()) ||
      (c.room || "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-serif font-bold tracking-tight text-foreground">
            Classes
          </h1>
          <p className="text-base text-muted-foreground mt-2">
            Manage your school's classes and schedules.
            {mode !== "all-time" && (
              <Badge
                variant="outline"
                className="ml-2 text-xs font-semibold uppercase tracking-wider align-middle border-foreground text-foreground rounded-none"
              >
                Filtered: {filterLabel}
              </Badge>
            )}
          </p>
        </div>
        <CreateClassDialog />
      </div>

      <Card className="col-span-1 border-border/50 rounded-none border-t-2 border-t-foreground">
        <CardHeader className="pb-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-serif font-semibold flex items-center gap-2 text-foreground">
              <HugeiconsIcon
                icon={BookOpen}
                className="size-5 text-foreground"
              />
              Class Directory
            </CardTitle>
            <CardDescription className="mt-1">
              Overview of all active classrooms and cohorts.
            </CardDescription>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <HugeiconsIcon
                icon={SearchIcon}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
              />
              <Input
                placeholder="Search classes..."
                className="pl-8 bg-muted/30 border-muted-foreground/20 focus-visible:ring-brand-primary h-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {classes === undefined ? (
            <div className="flex justify-center p-12">
              <Spinner className="w-8 h-8 text-brand-primary" />
            </div>
          ) : classes.length === 0 ? (
            <div className="p-12 text-center h-full flex flex-col items-center justify-center">
              <div className="size-12 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-primary">
                <HugeiconsIcon icon={BookOpen} className="size-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                {mode !== "all-time"
                  ? "No classes found for this filter"
                  : "No classes found"}
              </h3>
              <p className="text-gray-500 mb-4 max-w-sm mx-auto text-sm">
                {mode !== "all-time"
                  ? `No classes match the current filter (${filterLabel}). Try selecting a different term or "All Time".`
                  : "Get started by creating a new class cohort."}
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
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-semibold text-brand-accent pl-4">
                    Class Name
                  </TableHead>
                  <TableHead className="font-semibold text-brand-accent">
                    Grade
                  </TableHead>
                  <TableHead className="font-semibold text-brand-accent">
                    Term
                  </TableHead>
                  <TableHead className="font-semibold text-brand-accent">
                    Room
                  </TableHead>
                  <TableHead className="font-semibold text-brand-accent">
                    Status
                  </TableHead>
                  <TableHead className="text-right font-semibold text-brand-accent pr-4">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClasses?.map((cls) => (
                  <TableRow
                    key={cls._id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="font-medium text-brand-accent pl-4">
                      {cls.name}
                    </TableCell>
                    <TableCell className="text-sm">{cls.gradeName}</TableCell>
                    <TableCell>
                      {cls.termName ? (
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {cls.termName}
                          </span>
                          {cls.yearName && (
                            <span className="text-xs text-muted-foreground">
                              {cls.yearName}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs uppercase tracking-wider">
                          No term
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {cls.room ? (
                        <Badge
                          variant="secondary"
                          className="font-mono text-xs"
                        >
                          {cls.room}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          TBA
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          cls.status === "active"
                            ? "bg-foreground text-background uppercase tracking-widest text-[10px] rounded-none font-semibold border-foreground"
                            : "uppercase tracking-widest text-[10px] rounded-none font-semibold border-muted-foreground text-muted-foreground"
                        }
                      >
                        {cls.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <Link href={`/dashboard/classes/${cls._id}`}>
                        <Button
                          variant="ghost"
                          className="text-foreground hover:text-background hover:bg-foreground h-10 px-3 font-semibold text-sm rounded-none border border-transparent hover:border-foreground"
                        >
                          <HugeiconsIcon
                            icon={BookOpen}
                            className="w-4 h-4 mr-2"
                          />
                          Manage Cohort
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredClasses && filteredClasses.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground text-sm"
                    >
                      No classes found matching your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
