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
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Calendar03Icon,
  Delete02Icon,
  Edit02Icon,
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
      <DialogTrigger render={<Button />}>
        <HugeiconsIcon icon={Add01Icon} className="mr-2 size-4" />
        Add Academic Year
      </DialogTrigger>
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
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <HugeiconsIcon icon={Add01Icon} className="mr-1 size-3.5" />
        Add Term
      </DialogTrigger>
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
    startDate: string;
    endDate: string;
    isCurrent: boolean;
  };
}) {
  const terms = useQuery(api.terms.list, { yearId: year._id });
  const removeYear = useMutation(api.academicYears.remove);
  const removeTerm = useMutation(api.terms.remove);
  const updateTerm = useMutation(api.terms.update);
  const [isOpen, setIsOpen] = useState(true);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-ZA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <Card className="shadow-sm">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-3">
            <CollapsibleTrigger
              render={<Button variant="ghost" size="icon" className="size-7" />}
            >
              <HugeiconsIcon
                icon={ArrowDown01Icon}
                className={`size-4 transition-transform ${isOpen ? "" : "-rotate-90"}`}
              />
            </CollapsibleTrigger>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold">
                  {year.name}
                </CardTitle>
                {year.isCurrent && (
                  <Badge
                    variant="default"
                    className="bg-green-100 text-green-800 hover:bg-green-100 text-xs"
                  >
                    <HugeiconsIcon icon={Tick02Icon} className="mr-1 size-3" />
                    Current
                  </Badge>
                )}
              </div>
              <CardDescription className="text-xs mt-0.5">
                {formatDate(year.startDate)} — {formatDate(year.endDate)}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <CreateTermDialog yearId={year._id} yearName={year.name} />
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-destructive hover:text-destructive"
              onClick={() => removeYear({ yearId: year._id })}
            >
              <HugeiconsIcon icon={Delete02Icon} className="size-4" />
            </Button>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-0">
            {(!terms || terms.length === 0) && (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No terms added yet. Click &quot;Add Term&quot; to get started.
              </p>
            )}

            {terms && terms.length > 0 && (
              <div className="space-y-2">
                {terms.map((term) => (
                  <div
                    key={term._id}
                    className="flex items-center justify-between rounded-lg border p-3 bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <HugeiconsIcon
                        icon={Calendar03Icon}
                        className="size-4 text-brand-primary"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {term.name}
                          </span>
                          {term.isCurrent && (
                            <Badge
                              variant="outline"
                              className="text-green-700 border-green-300 text-[10px] py-0"
                            >
                              Active
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(term.startDate)} —{" "}
                          {formatDate(term.endDate)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {!term.isCurrent && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7"
                          onClick={() =>
                            updateTerm({ termId: term._id, isCurrent: true })
                          }
                        >
                          Set Active
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-destructive hover:text-destructive"
                        onClick={() => removeTerm({ termId: term._id })}
                      >
                        <HugeiconsIcon
                          icon={Delete02Icon}
                          className="size-3.5"
                        />
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-accent">
            Academic Terms
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage academic years and their terms.
          </p>
        </div>
        <CreateYearDialog />
      </div>

      <Separator />

      {/* Years List */}
      {years === undefined && (
        <div className="text-center py-12 text-muted-foreground">Loading…</div>
      )}

      {years && years.length === 0 && (
        <Card className="shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <HugeiconsIcon
              icon={Calendar03Icon}
              className="size-12 text-muted-foreground/40 mb-4"
            />
            <h3 className="text-lg font-semibold text-brand-accent mb-1">
              No academic years yet
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Create your first academic year to start organising your school
              terms. Each year can contain multiple terms.
            </p>
            <div className="mt-6">
              <CreateYearDialog />
            </div>
          </CardContent>
        </Card>
      )}

      {years && years.length > 0 && (
        <div className="grid gap-4">
          {years.map((year) => (
            <YearCard key={year._id} year={year} />
          ))}
        </div>
      )}
    </div>
  );
}
