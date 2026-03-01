"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CreateSubjectDialog } from "@/components/subjects/CreateSubjectDialog";
import { Spinner } from "@/components/ui/spinner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { HugeiconsIcon } from "@hugeicons/react";
import { Book01Icon, Plus } from "@hugeicons/core-free-icons";

export default function SubjectsPage() {
  const subjects = useQuery(api.subjects.list);

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-brand-primary">
            Subjects Management
          </h1>
          <p className="text-sm text-gray-500">
            Define subjects that can be assigned to different classes.
          </p>
        </div>
        <CreateSubjectDialog />
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden flex-1 flex flex-col">
        {subjects === undefined ? (
          <div className="flex flex-1 items-center justify-center p-8">
            <Spinner className="h-8 w-8 text-brand-primary" />
          </div>
        ) : subjects.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-12 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-lightBlue/30 mb-6">
              <HugeiconsIcon
                icon={Book01Icon}
                className="h-10 w-10 text-brand-primary"
              />
            </div>
            <h3 className="text-lg font-semibold text-brand-primary mb-2">
              No subjects added yet
            </h3>
            <p className="text-sm text-gray-500 max-w-sm mb-6">
              Subjects represent areas of study (e.g. Science, Math) that can be
              tracked across classes.
            </p>
            <CreateSubjectDialog>
              <button className="flex items-center justify-center rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-brand-primary-dark transition-colors">
                <HugeiconsIcon icon={Plus} className="mr-2 h-4 w-4" />
                Create Initial Subject
              </button>
            </CreateSubjectDialog>
          </div>
        ) : (
          <div className="overflow-auto border-t border-gray-100">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead className="w-[300px] font-semibold text-brand-primary">
                    Name
                  </TableHead>
                  <TableHead className="font-semibold text-brand-primary">
                    Description
                  </TableHead>
                  <TableHead className="text-right font-semibold text-brand-primary">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects.map((subject) => (
                  <TableRow
                    key={subject._id}
                    className="hover:bg-brand-lightBlue/10 transition-colors"
                  >
                    <TableCell className="font-medium text-gray-900">
                      {subject.name}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {subject.description || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <button className="text-sm font-medium text-brand-primary hover:text-brand-primary transition-colors">
                        Edit
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
