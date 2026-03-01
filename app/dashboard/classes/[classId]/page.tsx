"use client";

import React from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { AssignSubjectDialog } from "@/components/classes/AssignSubjectDialog";
import { EnrollStudentDialog } from "@/components/classes/EnrollStudentDialog";
import {
  BookOpen,
  ChevronLeft,
  GraduationCap,
  Trash2,
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
  const removeSubject = useMutation(api.classes.removeSubject);

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
        <Spinner className="h-8 w-8 text-brand-blue" />
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
          className="text-brand-blue hover:underline mt-4"
        >
          Return to Classes
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8 bg-brand-bg/30">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/classes"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-brand-blue hover:underline mb-4"
        >
          <HugeiconsIcon icon={ChevronLeft} className="mr-1 h-4 w-4" />
          Back to Classes
        </Link>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold tracking-tight text-brand-navy">
                {cls.name}
              </h1>
              <Badge
                variant={cls.status === "active" ? "default" : "secondary"}
                className={
                  cls.status === "active"
                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                    : ""
                }
              >
                {cls.status}
              </Badge>
            </div>
            <p className="text-muted-foreground text-lg">{cls.gradeName}</p>
          </div>
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border shadow-sm">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Room
              </span>
              <span className="text-sm font-medium text-gray-900">
                {cls.room || "TBA"}
              </span>
            </div>
          </div>
        </div>
        {cls.description && (
          <p className="mt-4 text-gray-600 max-w-3xl">{cls.description}</p>
        )}
      </div>

      {/* Tabs Layout */}
      <Tabs defaultValue="subjects" className="space-y-6 mt-2">
        <TabsList className="bg-white border rounded-lg p-1 h-auto grid grid-cols-2 max-w-[400px]">
          <TabsTrigger
            value="subjects"
            className="data-[state=active]:bg-brand-blue data-[state=active]:text-white data-[state=active]:shadow-sm py-2"
          >
            <HugeiconsIcon icon={BookOpen} className="w-4 h-4 mr-2" />
            Subjects
          </TabsTrigger>
          <TabsTrigger
            value="students"
            className="data-[state=active]:bg-brand-blue data-[state=active]:text-white data-[state=active]:shadow-sm py-2"
          >
            <HugeiconsIcon icon={GraduationCap} className="w-4 h-4 mr-2" />
            Enrolled Students
          </TabsTrigger>
        </TabsList>

        <TabsContent value="subjects" className="m-0 outline-none">
          <div className="rounded-xl border bg-white shadow-sm overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="font-semibold text-lg text-brand-navy">
                  Assigned Subjects
                </h3>
                <p className="text-sm text-muted-foreground">
                  Manage subjects and teachers for this class.
                </p>
              </div>
              <AssignSubjectDialog classId={classId!} />
            </div>
            {subjects === undefined ? (
              <div className="flex justify-center p-8">
                <Spinner className="w-6 h-6 text-brand-blue" />
              </div>
            ) : subjects.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No subjects assigned yet.
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Assigned Teacher</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.map((sub) => (
                    <TableRow key={sub._id}>
                      <TableCell className="font-medium">
                        {sub.subjectName}
                      </TableCell>
                      <TableCell>{sub.teacherName}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleRemoveSubject(sub._id)}
                        >
                          <HugeiconsIcon icon={Trash2} className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        <TabsContent value="students" className="m-0 outline-none">
          <div className="rounded-xl border bg-white shadow-sm overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="font-semibold text-lg text-brand-navy">
                  Class Roster
                </h3>
                <p className="text-sm text-muted-foreground">
                  Manage students enrolled in this class.
                </p>
              </div>
              <EnrollStudentDialog classId={classId!} />
            </div>
            {students === undefined ? (
              <div className="flex justify-center p-8">
                <Spinner className="w-6 h-6 text-brand-blue" />
              </div>
            ) : students.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No students enrolled yet.
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student._id}>
                      <TableCell className="font-medium">
                        {student.name || "Unnamed Student"}
                      </TableCell>
                      <TableCell>{student.email || "No Email"}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-brand-blue"
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
