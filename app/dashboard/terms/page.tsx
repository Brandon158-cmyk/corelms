"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AcademicNav } from "@/components/academic/AcademicNav";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Calendar03Icon,
  Delete02Icon,
  PlusSignIcon,
  ArrowDown01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";

// ─── Create Year Dialog ────────────────────────────────────────────────
function CreateYearDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isCurrent, setIsCurrent] = useState(false);
  const createYear = useMutation(api.academicYears.create);

  const handleSubmit = async () => {
    if (!name || !startDate || !endDate) return;

    await createYear({
      name,
      startDate,
      endDate,
      isCurrent,
    });

    setName("");
    setStartDate("");
    setEndDate("");
    setIsCurrent(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="bg-brand-primary hover:bg-brand-primary-dark text-white">
            <HugeiconsIcon icon={Add01Icon} className="mr-2 size-4" />
            Add Year
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Academic Year</DialogTitle>
          <DialogDescription>
            Add a new academic year for your school.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="year-name">Year Name</Label>
            <Input
              id="year-name"
              placeholder="e.g. 2026"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="year-start">Start Date</Label>
              <Input
                id="year-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="year-end">End Date</Label>
              <Input
                id="year-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              id="year-current"
              checked={isCurrent}
              onCheckedChange={setIsCurrent}
            />
            <Label htmlFor="year-current">Set as current year</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name || !startDate || !endDate}
            className="bg-brand-primary hover:bg-brand-primary-dark text-white"
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Create Term Dialog ────────────────────────────────────────────────
function CreateTermDialog({
  yearId,
  yearName,
}: {
  yearId: Id<"academicYears">;
  yearName: string;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isCurrent, setIsCurrent] = useState(false);
  const createTerm = useMutation(api.terms.create);

  const handleSubmit = async () => {
    if (!name || !startDate || !endDate) return;

    await createTerm({
      yearId,
      name,
      startDate,
      endDate,
      isCurrent,
    });

    setName("");
    setStartDate("");
    setEndDate("");
    setIsCurrent(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-brand-primary/20 text-brand-primary hover:bg-brand-primary/5"
          >
            <HugeiconsIcon icon={Add01Icon} className="mr-1 size-3.5" />
            Add Term
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Term to {yearName}</DialogTitle>
          <DialogDescription>
            Create a new term for the academic year.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="term-name">Term Name</Label>
            <Input
              id="term-name"
              placeholder="e.g. Term 1"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="term-start">Start Date</Label>
              <Input
                id="term-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="term-end">End Date</Label>
              <Input
                id="term-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              id="term-current"
              checked={isCurrent}
              onCheckedChange={setIsCurrent}
            />
            <Label htmlFor="term-current">Set as current term</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name || !startDate || !endDate}
            className="bg-brand-primary hover:bg-brand-primary-dark text-white"
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Year Card ─────────────────────────────────────────────────────────
function YearCard({
  year,
}: {
  year: {
    _id: Id<"academicYears">;
    name: string;
    startDate: string | number;
    endDate: string | number;
    isCurrent: boolean;
  };
}) {
  const terms = useQuery(api.terms.listTerms, { yearId: year._id });
  const removeYear = useMutation(api.academicYears.remove);
  const removeTerm = useMutation(api.terms.remove);
  const updateTerm = useMutation(api.terms.update);
  const [isOpen, setIsOpen] = useState(true);

  const formatDate = (date: string | number) =>
    new Date(date).toLocaleDateString("en-ZA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <Card className="shadow-sm border-0 border-t-4 border-t-brand-primary overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-3">
            <CollapsibleTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 hover:bg-muted"
                />
              }
            >
              <HugeiconsIcon
                icon={ArrowDown01Icon}
                className={`size-4 transition-transform duration-200 ${isOpen ? "" : "-rotate-90"}`}
              />
            </CollapsibleTrigger>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-semibold text-brand-accent">
                  {year.name} Academic Year
                </CardTitle>
                {year.isCurrent && (
                  <Badge
                    variant="default"
                    className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200 text-xs font-medium"
                  >
                    <HugeiconsIcon icon={Tick02Icon} className="mr-1 size-3" />
                    Active Year
                  </Badge>
                )}
              </div>
              <CardDescription className="text-xs mt-0.5 font-medium text-muted-foreground">
                {formatDate(year.startDate)} — {formatDate(year.endDate)}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CreateTermDialog yearId={year._id} yearName={year.name} />
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => {
                if (
                  confirm(
                    "Are you sure you want to delete this academic year and all its terms?",
                  )
                ) {
                  removeYear({ yearId: year._id });
                }
              }}
            >
              <HugeiconsIcon icon={Delete02Icon} className="size-4" />
            </Button>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-0 pb-6 px-6">
            <Separator className="mb-4 opacity-50" />

            {(!terms || terms.length === 0) && (
              <div className="rounded-lg border border-dashed py-8 px-4 text-center bg-muted/20">
                <p className="text-sm text-muted-foreground font-medium">
                  No terms defined for this year yet.
                </p>
                <div className="mt-4">
                  <CreateTermDialog yearId={year._id} yearName={year.name} />
                </div>
              </div>
            )}

            {terms && terms.length > 0 && (
              <div className="grid gap-3">
                {terms.map((term) => (
                  <div
                    key={term._id}
                    className="flex items-center justify-between rounded-xl border p-4 bg-muted/30 hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary shadow-sm ring-1 ring-brand-primary/20">
                        <HugeiconsIcon
                          icon={Calendar03Icon}
                          className="size-5"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-brand-accent">
                            {term.name}
                          </span>
                          {term.isCurrent && (
                            <Badge
                              variant="outline"
                              className="bg-brand-primary/5 text-brand-primary border-brand-primary/20 text-[10px] uppercase tracking-wider py-0 px-1.5 font-bold"
                            >
                              Current Term
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground font-medium flex items-center gap-1 mt-0.5">
                          {formatDate(term.startDate)}{" "}
                          <span className="opacity-40">→</span>{" "}
                          {formatDate(term.endDate)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!term.isCurrent && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-8 border-brand-primary/20 text-brand-primary hover:bg-brand-primary/10 hover:text-brand-primary-dark"
                          onClick={() =>
                            updateTerm({ termId: term._id, isCurrent: true })
                          }
                        >
                          Activate
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          if (
                            confirm(
                              `Are you sure you want to delete ${term.name}?`,
                            )
                          ) {
                            removeTerm({ termId: term._id });
                          }
                        }}
                      >
                        <HugeiconsIcon icon={Delete02Icon} className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────
export default function TermsPage() {
  const years = useQuery(api.academicYears.list);

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-accent">
            Academic Calendar
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure school years and terms to organize academic operations.
          </p>
        </div>
        <CreateYearDialog />
      </div>

      <AcademicNav />

      {/* Years List */}
      {years === undefined ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner className="h-8 w-8 text-brand-primary" />
        </div>
      ) : years.length === 0 ? (
        <Card className="shadow-sm border-0 border-t-4 border-t-brand-primary">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-primary/10 mb-6 text-brand-primary">
              <HugeiconsIcon icon={Calendar03Icon} className="size-10" />
            </div>
            <h3 className="text-xl font-bold text-brand-accent mb-2">
              No academic years yet
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-8">
              Start by creating your first academic year. You can then add terms
              to structure your school's timeline.
            </p>
            <CreateYearDialog />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {years.map((year) => (
            <YearCard key={year._id} year={year} />
          ))}
        </div>
      )}
    </div>
  );
}
