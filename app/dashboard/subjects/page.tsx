"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CreateSubjectDialog } from "@/components/subjects/CreateSubjectDialog";
import { AcademicNav } from "@/components/academic/AcademicNav";
import { Spinner } from "@/components/ui/spinner";
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
  Book01Icon,
  SearchIcon,
  PlusSignIcon,
  ArrowRight01Icon,
  Edit01Icon,
} from "@hugeicons/core-free-icons";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function SubjectsPage() {
  const [search, setSearch] = useState("");
  const subjects = useQuery(api.subjects.list);

  const filteredSubjects = subjects?.filter((subject) => {
    if (!search) return true;
    const lowerSearch = search.toLowerCase();
    return (
      subject.name.toLowerCase().includes(lowerSearch) ||
      (subject.description &&
        subject.description.toLowerCase().includes(lowerSearch))
    );
  });

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-accent">
            Subjects Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Define and manage areas of study available across the school.
          </p>
        </div>
        <CreateSubjectDialog />
      </div>

      <AcademicNav />

      <Card className="shadow-sm border-0 border-t-4 border-t-brand-primary">
        <CardHeader className="pb-3 px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <HugeiconsIcon
                icon={Book01Icon}
                className="size-5 text-brand-primary"
              />
              Academic Subjects
              {subjects && (
                <Badge variant="secondary" className="ml-2 font-mono text-xs">
                  {subjects.length}
                </Badge>
              )}
            </CardTitle>

            <div className="flex w-full sm:w-auto items-center gap-2">
              <div className="relative w-full sm:w-[300px]">
                <HugeiconsIcon
                  icon={SearchIcon}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                />
                <Input
                  placeholder="Search subjects..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-9"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 sm:px-6 pb-6 mt-4">
          <div className="rounded-md border overflow-hidden">
            {subjects === undefined ? (
              <div className="flex h-32 items-center justify-center">
                <Spinner className="h-8 w-8 text-brand-primary" />
              </div>
            ) : filteredSubjects && filteredSubjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center bg-muted/10">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary/10 mb-4 text-brand-primary">
                  <HugeiconsIcon icon={Book01Icon} className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold text-brand-accent mb-2">
                  No subjects found
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm mb-6">
                  {search
                    ? "Adjust your search to find what you're looking for or add a new subject."
                    : "Get started by adding your first academic subject."}
                </p>
                {!search && (
                  <CreateSubjectDialog>
                    <Button className="bg-brand-primary hover:bg-brand-primary-dark text-white">
                      <HugeiconsIcon
                        icon={PlusSignIcon}
                        className="mr-2 h-4 w-4"
                      />
                      Create Subject
                    </Button>
                  </CreateSubjectDialog>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[300px] font-semibold text-brand-accent">
                      Name
                    </TableHead>
                    <TableHead className="font-semibold text-brand-accent">
                      Description
                    </TableHead>
                    <TableHead className="text-right font-semibold text-brand-accent">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubjects?.map((subject) => (
                    <TableRow
                      key={subject._id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="font-medium">
                        <span className="text-brand-accent">
                          {subject.name}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {subject.description || "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-brand-primary hover:text-brand-primary-dark hover:bg-brand-primary/5"
                        >
                          <HugeiconsIcon
                            icon={Edit01Icon}
                            className="mr-1.5 size-3.5"
                          />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
