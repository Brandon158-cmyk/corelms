"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AssignSubjectDialog } from "@/components/classes/AssignSubjectDialog";
import { EnrollStudentsDialog } from "@/components/classes/EnrollStudentsDialog";
import {
  BookOpen,
  ChevronLeft,
  GraduationCap,
  Trash2,
  UserRemove01Icon,
  SearchIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export default function ClassDetailsPage({
  params,
}: {
  params: Promise<{ classId: Id<"classes"> }>;
}) {
  const { classId } = React.use(params);
  const cls = useQuery(api.classes.get, classId ? { classId } : "skip");
  const subjects = useQuery(
    api.classes.getSubjects,
    classId ? { classId } : "skip",
  );
  const students = useQuery(
    api.classes.getStudents,
    classId ? { classId } : "skip",
  );

  const [searchSubjects, setSearchSubjects] = useState("");
  const [searchStudents, setSearchStudents] = useState("");

  const removeSubject = useMutation(api.classes.removeSubject);
  const removeStudent = useMutation(api.classes.removeStudent);

  const handleRemoveStudent = async (studentId: Id<"users">) => {
    try {
      await removeStudent({ studentId });
      toast.success("Student un-enrolled from class.");
    } catch (error) {
      toast.error("Failed to un-enroll student.");
    }
  };

  const handleRemoveSubject = async (classSubjectId: Id<"classSubjects">) => {
    try {
      await removeSubject({ classSubjectId });
      toast.success("Subject removed from class.");
    } catch (error) {
      toast.error("Failed to remove subject.");
    }
  };

  if (cls === undefined) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Spinner className="h-8 w-8 text-brand-primary" />
      </div>
    );
  }

  if (cls === null) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-12 text-center text-gray-500">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Class Not Found
        </h2>
        <p>
          This class does not exist or you don't have permission to view it.
        </p>
        <Link
          href="/dashboard/classes"
          className="text-brand-primary hover:underline mt-4"
        >
          Return to Classes
        </Link>
      </div>
    );
  }

  const filteredSubjects = subjects?.filter(
    (s) =>
      s.subjectName.toLowerCase().includes(searchSubjects.toLowerCase()) ||
      s.teacherName?.toLowerCase().includes(searchSubjects.toLowerCase()),
  );

  const filteredStudents = students?.filter(
    (s) =>
      (s.name || "").toLowerCase().includes(searchStudents.toLowerCase()) ||
      (s.email || "").toLowerCase().includes(searchStudents.toLowerCase()),
  );

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8 bg-brand-bg/30">
      {/* Header Panel */}
      <div className="flex flex-col gap-4">
        <Link
          href="/dashboard/classes"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-brand-primary transition-colors w-fit"
        >
          <HugeiconsIcon icon={ChevronLeft} className="mr-1 h-4 w-4" />
          Back to Classes
        </Link>
        <Card className="bg-white shadow-sm border-0 border-l-4 border-l-brand-primary overflow-hidden relative">
          <div className="absolute right-0 top-0 opacity-5 pointer-events-none">
            <HugeiconsIcon
              icon={BookOpen}
              className="w-48 h-48 -translate-y-8 translate-x-8"
            />
          </div>
          <CardContent className="p-5 md:p-6 relative z-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-brand-accent">
                    {cls.name}
                  </h1>
                  <Badge
                    variant={cls.status === "active" ? "default" : "secondary"}
                    className={
                      cls.status === "active"
                        ? "bg-green-100 text-green-800 hover:bg-green-100/90 text-xs px-2 py-0.5"
                        : "text-xs px-2 py-0.5"
                    }
                  >
                    {cls.status}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-muted-foreground text-sm lg:text-base font-medium">
                  <span className="text-brand-primary flex items-center gap-1.5">
                    <HugeiconsIcon icon={GraduationCap} className="w-5 h-5" />{" "}
                    {cls.gradeName}
                  </span>
                  {cls.room && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span>Room {cls.room}</span>
                    </>
                  )}
                  {cls.termName && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span>
                        {cls.termName} {cls.yearName && `(${cls.yearName})`}
                      </span>
                    </>
                  )}
                </div>
                {cls.description && (
                  <p className="text-gray-600 max-w-2xl mt-2 leading-relaxed">
                    {cls.description}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 bg-muted/30 p-2 rounded-2xl border border-muted/50 self-stretch lg:self-auto">
                <div className="bg-white px-5 py-3 rounded-xl flex flex-col items-center justify-center min-w-[110px] shadow-sm">
                  <span className="text-2xl font-bold text-brand-primary">
                    {students?.length || 0}
                  </span>
                  <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground mt-1 flex items-center">
                    <HugeiconsIcon
                      icon={UserGroupIcon}
                      className="w-3 h-3 mr-1"
                    />{" "}
                    Students
                  </span>
                </div>
                <div className="bg-white px-5 py-3 rounded-xl flex flex-col items-center justify-center min-w-[110px] shadow-sm">
                  <span className="text-2xl font-bold text-brand-primary">
                    {subjects?.length || 0}
                  </span>
                  <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground mt-1 flex items-center">
                    <HugeiconsIcon icon={BookOpen} className="w-3 h-3 mr-1" />{" "}
                    Subjects
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Layout */}
      <Tabs defaultValue="subjects" className="space-y-6 mt-2">
        <TabsList className="bg-muted/50 border rounded-lg p-1 h-auto flex w-fit gap-1">
          <TabsTrigger
            value="subjects"
            className="data-[state=active]:bg-white data-[state=active]:text-brand-primary data-[state=active]:shadow-sm py-2 px-6 rounded-md transition-all"
          >
            <HugeiconsIcon icon={BookOpen} className="w-4 h-4 mr-2" />
            Subjects
          </TabsTrigger>
          <TabsTrigger
            value="students"
            className="data-[state=active]:bg-white data-[state=active]:text-brand-primary data-[state=active]:shadow-sm py-2 px-6 rounded-md transition-all"
          >
            <HugeiconsIcon icon={GraduationCap} className="w-4 h-4 mr-2" />
            Enrolled Students
          </TabsTrigger>
        </TabsList>

        <TabsContent value="subjects" className="m-0 outline-none">
          <Card className="col-span-1 shadow-sm border-t-4 border-t-brand-primary">
            <CardHeader className="pb-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-semibold text-brand-accent">
                  Assigned Subjects
                </CardTitle>
                <CardDescription>
                  Manage subjects and teachers mapped to this cohort.
                </CardDescription>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                <div className="relative w-full md:w-64">
                  <HugeiconsIcon
                    icon={SearchIcon}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                  />
                  <Input
                    placeholder="Search subjects or teachers..."
                    className="pl-8 bg-muted/30 border-muted-foreground/20 focus-visible:ring-brand-primary h-10"
                    value={searchSubjects}
                    onChange={(e) => setSearchSubjects(e.target.value)}
                  />
                </div>
                <div className="w-full md:w-auto shrink-0">
                  <AssignSubjectDialog classId={classId!} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {subjects === undefined ? (
                <div className="flex justify-center p-8">
                  <Spinner className="w-6 h-6 text-brand-primary" />
                </div>
              ) : subjects.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center justify-center">
                  <div className="size-12 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-primary">
                    <HugeiconsIcon icon={BookOpen} className="size-6" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    No subjects assigned
                  </h3>
                  <p className="text-sm text-gray-500 mb-4 max-w-sm mx-auto">
                    Click the button above to assign a subject and map a teacher
                    to this class cohort.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="font-semibold text-brand-accent pl-4">
                        Subject
                      </TableHead>
                      <TableHead className="font-semibold text-brand-accent">
                        Assigned Teacher
                      </TableHead>
                      <TableHead className="text-right font-semibold text-brand-accent pr-4">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubjects?.map((sub) => (
                      <TableRow
                        key={sub._id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <TableCell className="font-medium text-brand-accent pl-4">
                          {sub.subjectName}
                        </TableCell>
                        <TableCell className="text-sm">
                          {sub.teacherName}
                        </TableCell>
                        <TableCell className="text-right pr-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 h-10 w-10 text-center"
                            onClick={() => handleRemoveSubject(sub._id)}
                            title="Remove Subject"
                          >
                            <HugeiconsIcon
                              icon={Trash2}
                              className="w-5 h-5 mx-auto"
                            />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredSubjects && filteredSubjects.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="h-24 text-center text-muted-foreground text-sm"
                        >
                          No subjects found matching your search.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="m-0 outline-none">
          <Card className="col-span-1 shadow-sm border-t-4 border-t-brand-accent">
            <CardHeader className="pb-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-semibold text-brand-accent">
                  Class Roster
                </CardTitle>
                <CardDescription>
                  Manage students enrolled in this class cohort.
                </CardDescription>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                <div className="relative w-full md:w-64">
                  <HugeiconsIcon
                    icon={SearchIcon}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                  />
                  <Input
                    placeholder="Search enrolled students..."
                    className="pl-8 bg-muted/30 border-muted-foreground/20 focus-visible:ring-brand-primary h-10"
                    value={searchStudents}
                    onChange={(e) => setSearchStudents(e.target.value)}
                  />
                </div>
                <div className="w-full md:w-auto shrink-0">
                  <EnrollStudentsDialog
                    classId={classId!}
                    classNameName={cls.name}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {students === undefined ? (
                <div className="flex justify-center p-8">
                  <Spinner className="w-6 h-6 text-brand-primary" />
                </div>
              ) : students.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center justify-center">
                  <div className="size-12 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-accent">
                    <HugeiconsIcon icon={GraduationCap} className="size-6" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    No students enrolled
                  </h3>
                  <p className="text-sm text-gray-500 mb-4 max-w-sm mx-auto">
                    Click "Enroll Students" above to map unassigned students
                    into this cohort.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="font-semibold text-brand-accent pl-4">
                        Student Name
                      </TableHead>
                      <TableHead className="font-semibold text-brand-accent">
                        Email
                      </TableHead>
                      <TableHead className="text-right font-semibold text-brand-accent pr-4">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents?.map((student) => (
                      <TableRow
                        key={student._id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <TableCell className="font-medium text-brand-accent pl-4">
                          {student.name || "Unnamed Student"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {student.email || "No Email"}
                        </TableCell>
                        <TableCell className="text-right pr-4">
                          <div className="flex justify-end items-center gap-2">
                            <Link href={`/dashboard/students/${student._id}`}>
                              <Button
                                variant="ghost"
                                className="text-brand-primary hover:text-brand-primary-dark hover:bg-brand-primary/10 h-10 px-3 font-medium"
                              >
                                <HugeiconsIcon
                                  icon={GraduationCap}
                                  className="w-4 h-4 mr-2"
                                />
                                View Profile
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 h-10 w-10 text-center"
                              onClick={() => handleRemoveStudent(student._id)}
                              title="Unenroll student"
                            >
                              <HugeiconsIcon
                                icon={UserRemove01Icon}
                                className="w-5 h-5 mx-auto"
                              />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredStudents && filteredStudents.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="h-24 text-center text-muted-foreground text-sm"
                        >
                          No students found matching your search.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
