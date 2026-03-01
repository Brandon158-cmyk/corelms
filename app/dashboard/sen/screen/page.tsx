"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Tick02Icon,
  ArrowLeft02Icon,
  Alert02Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { useRouter } from "next/navigation";

const DOMAINS = [
  {
    key: "visual" as const,
    label: "Visual",
    description: "Ability to see clearly, track objects, recognize faces",
  },
  {
    key: "hearing" as const,
    label: "Hearing",
    description: "Ability to hear speech, follow verbal instructions",
  },
  {
    key: "intellectual" as const,
    label: "Intellectual",
    description: "Cognitive ability, problem-solving, memory, comprehension",
  },
  {
    key: "physical" as const,
    label: "Physical",
    description: "Gross and fine motor skills, mobility, coordination",
  },
];

function classifyScore(score: number) {
  if (score >= 25)
    return { label: "No Challenges", color: "bg-emerald-500 text-white" };
  if (score >= 15)
    return { label: "Monitor", color: "bg-amber-500 text-white" };
  return { label: "Suspected Disability", color: "bg-red-500 text-white" };
}

export default function ScreenPage() {
  const router = useRouter();
  const students = useQuery(api.users.listTenantUsers, {});
  const submitScreening = useMutation(api.sen.submitScreening);

  const [studentId, setStudentId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [domains, setDomains] = useState({
    visual: 5,
    hearing: 5,
    intellectual: 5,
    physical: 5,
  });
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");

  const totalScore = useMemo(
    () =>
      domains.visual +
      domains.hearing +
      domains.intellectual +
      domains.physical,
    [domains],
  );

  const classification = useMemo(() => classifyScore(totalScore), [totalScore]);

  const studentList = students?.filter(
    (u) =>
      u.role === "student" &&
      u.name?.toLowerCase().includes(studentSearch.toLowerCase()),
  );

  const selectedStudent = students?.find((u) => u._id === studentId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) {
      toast.error("Please select a student");
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await submitScreening({
        studentId: studentId as any,
        date,
        domains,
        notes: notes || undefined,
      });
      if (result.classification === "suspected-disability") {
        toast.warning(
          `⚠️ ${selectedStudent?.name} has been flagged and a referral has been automatically created.`,
          { duration: 6000 },
        );
      } else {
        toast.success(
          `Screening complete — ${result.classification.replace("-", " ")} (${result.totalScore}/40)`,
        );
      }
      router.push("/dashboard/sen");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit screening");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateDomain = (key: keyof typeof domains, value: number) => {
    setDomains((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex flex-1 flex-col gap-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          render={<Link href="/dashboard/sen" />}
        >
          <HugeiconsIcon icon={ArrowLeft02Icon} className="size-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-brand-accent">
            New Screening
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Early Grade Screening Tool — assess a learner across 4 domains.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Student Select */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Select Student</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <HugeiconsIcon
                icon={Search01Icon}
                className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
              />
              <Input
                placeholder="Search students…"
                className="pl-9"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
              />
            </div>
            {studentId && selectedStudent ? (
              <div className="p-3 rounded-md bg-brand-primary/5 border border-brand-primary/20 flex items-center justify-between">
                <span className="font-medium text-brand-accent">
                  {selectedStudent.name}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() => setStudentId("")}
                >
                  Change
                </Button>
              </div>
            ) : (
              <div className="max-h-40 overflow-y-auto space-y-1">
                {studentList === undefined ? (
                  <div className="flex items-center justify-center py-4">
                    <Spinner className="size-4" />
                  </div>
                ) : studentList.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No students found.
                  </p>
                ) : (
                  studentList.slice(0, 15).map((s) => (
                    <button
                      key={s._id}
                      type="button"
                      onClick={() => {
                        setStudentId(s._id);
                        setStudentSearch("");
                      }}
                      className="w-full text-left p-2 rounded hover:bg-muted/50 text-sm transition-colors"
                    >
                      {s.name}
                    </button>
                  ))
                )}
              </div>
            )}
            <div className="grid gap-2">
              <Label>Screening Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Domain Scores */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Domain Assessment</CardTitle>
            <CardDescription>
              Score each domain from 1 (severe difficulty) to 10 (no
              difficulty).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {DOMAINS.map((domain) => (
              <div key={domain.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">{domain.label}</Label>
                    <p className="text-[11px] text-muted-foreground">
                      {domain.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-brand-accent tabular-nums">
                      {domains[domain.key]}
                    </span>
                    <span className="text-xs text-muted-foreground">/10</span>
                  </div>
                </div>
                <Slider
                  min={1}
                  max={10}
                  step={1}
                  value={[domains[domain.key]]}
                  onValueChange={(val) =>
                    updateDomain(domain.key, Array.isArray(val) ? val[0] : val)
                  }
                  className="w-full"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Live Score Preview */}
        <Card
          className={`shadow-sm border-2 ${
            totalScore < 15
              ? "border-red-300 dark:border-red-800"
              : totalScore < 25
                ? "border-amber-300 dark:border-amber-800"
                : "border-emerald-300 dark:border-emerald-800"
          }`}
        >
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Score
                </p>
                <div className="text-3xl font-bold text-brand-accent tabular-nums">
                  {totalScore}
                  <span className="text-base font-normal text-muted-foreground">
                    /40
                  </span>
                </div>
              </div>
              <Badge className={`${classification.color} text-sm px-3 py-1`}>
                {totalScore < 15 && (
                  <HugeiconsIcon icon={Alert02Icon} className="size-4 mr-1.5" />
                )}
                {classification.label}
              </Badge>
            </div>
            {totalScore < 15 && (
              <p className="text-xs text-red-600 mt-2 font-medium">
                ⚠️ This score will auto-generate a referral to the SENCO /
                District Inclusive Education Team.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        <div className="grid gap-2">
          <Label>Notes (optional)</Label>
          <Textarea
            placeholder="Observations, concerns, or context…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/sen")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !studentId}
            className="bg-brand-primary hover:bg-brand-primary-deep text-white flex-1"
          >
            {isSubmitting ? (
              <Spinner className="size-4 mr-2" />
            ) : (
              <HugeiconsIcon icon={Tick02Icon} className="size-4 mr-2" />
            )}
            Submit Screening
          </Button>
        </div>
      </form>
    </div>
  );
}
