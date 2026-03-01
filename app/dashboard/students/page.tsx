"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  SearchIcon,
  UserGroupIcon,
  FilterIcon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Id } from "@/convex/_generated/dataModel";

export default function StudentsDirectoryPage() {
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("all");

  // Fetch all classes for the filter dropdown
  const classes = useQuery(api.classes.list, {});

  // Fetch students, optionally filtered by class
  const students = useQuery(api.students.listStudents, {
    classId:
      selectedClass !== "all" ? (selectedClass as Id<"classes">) : undefined,
  });

  const filteredStudents = students?.filter((student) => {
    if (!search) return true;
    const lowerSearch = search.toLowerCase();
    return (
      student.name.toLowerCase().includes(lowerSearch) ||
      (student.email && student.email.toLowerCase().includes(lowerSearch))
    );
  });

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8 bg-brand-bg/30">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-accent">
            Student Directory
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Search, filter, and view comprehensive student profiles.
          </p>
        </div>
      </div>

      <Card className="shadow-sm border-0 border-t-4 border-t-brand-primary">
        <CardHeader className="pb-3 px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <HugeiconsIcon
                icon={UserGroupIcon}
                className="size-5 text-brand-primary"
              />
              All Students
              {students && (
                <Badge variant="secondary" className="ml-2 font-mono text-xs">
                  {students.length}
                </Badge>
              )}
            </CardTitle>

            <div className="flex w-full sm:w-auto items-center gap-2">
              <div className="relative w-full sm:w-[250px]">
                <HugeiconsIcon
                  icon={SearchIcon}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                />
                <Input
                  placeholder="Search by name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-9"
                />
              </div>

              <Select
                value={selectedClass}
                onValueChange={(val) => val && setSelectedClass(val)}
              >
                <SelectTrigger className="w-[140px] h-9">
                  <HugeiconsIcon
                    icon={FilterIcon}
                    className="size-3.5 mr-2 text-muted-foreground"
                  />
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes?.map((cls) => (
                    <SelectItem key={cls._id} value={cls._id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 sm:px-6 pb-6">
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-semibold text-brand-accent">
                    Name
                  </TableHead>
                  <TableHead className="font-semibold text-brand-accent">
                    Class
                  </TableHead>
                  <TableHead className="font-semibold text-brand-accent hidden md:table-cell">
                    Gender
                  </TableHead>
                  <TableHead className="font-semibold text-brand-accent hidden lg:table-cell">
                    Guardian
                  </TableHead>
                  <TableHead className="font-semibold text-brand-accent text-right">
                    Profile
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents === undefined ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-32 text-center text-muted-foreground"
                    >
                      Loading students...
                    </TableCell>
                  </TableRow>
                ) : filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-32 text-center text-muted-foreground bg-muted/10"
                    >
                      No students found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow
                      key={student.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span className="text-brand-accent">
                            {student.name}
                          </span>
                          <span className="text-xs text-muted-foreground font-normal hidden sm:inline-block">
                            {student.email || "No email"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="text-brand-primary border-brand-primary-dark/20 font-normal"
                        >
                          {student.className}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground hidden md:table-cell">
                        {student.gender || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground hidden lg:table-cell">
                        {student.guardianName || "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          render={
                            <Link href={`/dashboard/students/${student.id}`} />
                          }
                          className="text-brand-primary hover:text-brand-primary-dark"
                        >
                          View
                          <HugeiconsIcon
                            icon={ArrowRight01Icon}
                            className="ml-1 size-3.5"
                          />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
