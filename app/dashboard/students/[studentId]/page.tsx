"use client";

import { use, useState, useEffect } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserIcon,
  SchoolIcon,
  Edit02Icon,
  Call02Icon,
  PrinterIcon,
  Shield01Icon,
  Alert02Icon,
  Calendar03Icon,
  CheckmarkCircle02Icon,
  UserMultiple02Icon,
  BookOpen01Icon,
  Analytics01Icon,
  GraduationCap,
  ArrowRight01Icon,
  TaskDaily01Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

export default function StudentProfilePage(props: {
  params: Promise<{ studentId: Id<"users"> }>;
}) {
  const params = use(props.params);
  const student = useQuery(api.users.getUserById, { userId: params.studentId });
  const profile = useQuery(api.students.getProfile, {
    studentId: params.studentId,
  });
  const disciplineLogs = useQuery(api.tracking.getDisciplineByStudent, {
    studentId: params.studentId,
  });
  const senAssessments = useQuery(api.tracking.getSENByStudent, {
    studentId: params.studentId,
  });
  const performance = useQuery(api.students.getPerformanceHistory, {
    studentId: params.studentId,
  });
  const classDetails = useQuery(api.classes.get, {
    classId: student?.classId as any,
  });
  const currentUser = useQuery(api.users.currentUser);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("registry");

  // Form State
  const [formData, setFormData] = useState<{
    dateOfBirth: string;
    gender: "Male" | "Female" | undefined;
    nrcNumber: string;
    address: string;
    medicalConditions: string;
    allergies: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    emergencyContactRelation: string;
  }>({
    dateOfBirth: "",
    gender: undefined,
    nrcNumber: "",
    address: "",
    medicalConditions: "",
    allergies: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
  });

  // Sync form state when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        dateOfBirth: profile.dateOfBirth
          ? new Date(profile.dateOfBirth).toISOString().split("T")[0]
          : "",
        gender: profile.gender as "Male" | "Female" | undefined,
        nrcNumber: profile.nrcNumber || "",
        address: profile.address || "",
        medicalConditions: profile.medicalConditions || "",
        allergies: profile.allergies || "",
        emergencyContactName: profile.emergencyContactName || "",
        emergencyContactPhone: profile.emergencyContactPhone || "",
        emergencyContactRelation: profile.emergencyContactRelation || "",
      });
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    try {
      await updateProfile({
        studentId: params.studentId,
        dateOfBirth: formData.dateOfBirth || undefined,
        gender: formData.gender,
        nrcNumber: formData.nrcNumber,
        address: formData.address,
        medicalConditions: formData.medicalConditions,
        allergies: formData.allergies,
        emergencyContactName: formData.emergencyContactName,
        emergencyContactPhone: formData.emergencyContactPhone,
        emergencyContactRelation: formData.emergencyContactRelation,
      });
      toast.success("Profile updated successfully!");
      setIsEditDialogOpen(false);
    } catch (e: any) {
      toast.error(e.message || "Failed to update profile");
    }
  };

  if (
    student === undefined ||
    profile === undefined ||
    performance === undefined
  ) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Spinner className="size-8 text-(--color-accent-primary)" />
      </div>
    );
  }

  if (student === null) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] gap-4">
        <HugeiconsIcon
          icon={Alert02Icon}
          size={48}
          className="text-muted-foreground opacity-20"
        />
        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
          Student profile not found
        </p>
      </div>
    );
  }

  const formatDOB = (dateStr?: string) => {
    if (!dateStr) return "Not provided";
    return new Date(dateStr).toLocaleDateString("en-ZA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isEditor =
    currentUser?.role &&
    ["superAdmin", "proprietor", "headteacher", "teacher"].includes(
      currentUser.role,
    );

  return (
    <div className="flex flex-col gap-0 pb-12">
      {/* ── SECTION 1: Academic KPI Rail ──────────────────────────────────────── */}
      <div
        className="grid grid-cols-2 md:grid-cols-4 border-b border-[var(--color-border-default)] bg-white sticky top-0 z-20 shadow-sm"
        style={{
          margin: "0 calc(var(--space-lg) * -1)",
          padding: "var(--space-md) var(--space-lg)",
        }}
      >
        <div className="flex flex-col gap-1 border-r border-[var(--color-border-default)] px-4">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Attendance Rate
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground font-sans">
              94%
            </span>
            <span className="text-[10px] text-[var(--color-category-green)] font-bold">
              OPTIMAL
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1 border-r border-[var(--color-border-default)] px-4">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Behaviour Score
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground font-sans">
              {100 -
                (disciplineLogs?.reduce(
                  (acc, log) => acc + log.pointsDeducted,
                  0,
                ) || 0)}
            </span>
            <Badge
              variant="outline"
              className="text-[9px] font-bold border-muted text-muted-foreground"
            >
              TERM 2
            </Badge>
          </div>
        </div>
        <div className="flex flex-col gap-1 border-r border-[var(--color-border-default)] px-4">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Assessments
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground font-sans">
              {senAssessments?.length || 0}
            </span>
            <span className="text-[10px] text-muted-foreground font-bold">
              COMPLETED
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1 px-4 text-right sm:text-left">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Profile Integrity
          </span>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-foreground font-sans">
              85%
            </span>
            <div className="flex-1 hidden sm:block h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-[var(--color-accent-primary)] w-[85%]" />
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 2: Profile Workbench ───────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-10 mt-10">
        {/* Left Column: Essential Registry Sidebar */}
        <div className="lg:w-80 shrink-0 flex flex-col gap-6">
          <div className="bg-white border border-[var(--color-border-default)] rounded-2xl overflow-hidden shadow-sm">
            <div className="h-24 bg-[var(--color-surface-secondary)]/30 border-b border-[var(--color-border-default)] flex items-center justify-center">
              <div className="size-20 rounded-full border-4 border-white bg-(--color-accent-primary) flex items-center justify-center text-white text-3xl font-bold shadow-md transform translate-y-8">
                {student?.name?.substring(0, 2).toUpperCase() || "ST"}
              </div>
            </div>
            <div className="pt-12 pb-6 px-6 text-center">
              <h2 className="text-xl font-bold text-foreground font-sans tracking-tight">
                {student?.name}
              </h2>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                Student Record #{params.studentId.substring(0, 8)}
              </p>

              <div className="grid grid-cols-2 gap-3 mt-8">
                <div className="bg-[var(--color-surface-secondary)]/50 p-3 rounded-lg border border-[var(--color-border-default)]/60">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                    Current Class
                  </p>
                  <p className="text-xs font-bold text-foreground">
                    {classDetails?.name || "Unassigned"}
                  </p>
                </div>
                <div className="bg-[var(--color-surface-secondary)]/50 p-3 rounded-lg border border-[var(--color-border-default)]/60">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                    Gender
                  </p>
                  <p className="text-xs font-bold text-foreground">
                    {profile?.gender || "Not Set"}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-2">
                {isEditor && (
                  <Dialog
                    open={isEditDialogOpen}
                    onOpenChange={setIsEditDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full h-11 text-[11px] font-bold uppercase tracking-widest border-(--color-border-default)"
                      >
                        <HugeiconsIcon
                          icon={Edit02Icon}
                          className="mr-2 size-4"
                        />
                        Modify Profile
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      {/* Dialog content preserved and slightly cleaned for tokens */}
                      <DialogHeader>
                        <DialogTitle className="font-sans text-xl">
                          Edit Registry Profile: {student?.name}
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                          Update official biographical, health, and emergency
                          contact details for the student information system.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-6 py-4">
                        <div className="space-y-4">
                          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest border-b pb-2">
                            Biographical Data
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-[11px] font-bold uppercase tracking-wider">
                                Date of Birth
                              </Label>
                              <Input
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    dateOfBirth: e.target.value,
                                  })
                                }
                                className="h-10"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-[11px] font-bold uppercase tracking-wider">
                                Gender Identity
                              </Label>
                              <Select
                                value={formData.gender || ""}
                                onValueChange={(val) =>
                                  setFormData({
                                    ...formData,
                                    gender: val as "Male" | "Female",
                                  })
                                }
                              >
                                <SelectTrigger className="h-10">
                                  <SelectValue placeholder="Select..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Male">Male</SelectItem>
                                  <SelectItem value="Female">Female</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="col-span-2 space-y-2">
                              <Label className="text-[11px] font-bold uppercase tracking-wider">
                                National ID / Passport
                              </Label>
                              <Input
                                value={formData.nrcNumber}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    nrcNumber: e.target.value,
                                  })
                                }
                                className="h-10"
                              />
                            </div>
                            <div className="col-span-2 space-y-2">
                              <Label className="text-[11px] font-bold uppercase tracking-wider">
                                Residential Address
                              </Label>
                              <Textarea
                                value={formData.address}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    address: e.target.value,
                                  })
                                }
                                className="min-h-[80px]"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest border-b pb-2">
                            Health & Emergency
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 space-y-2">
                              <Label className="text-[11px] font-bold uppercase tracking-wider">
                                Primary Emergency Contact
                              </Label>
                              <Input
                                value={formData.emergencyContactName}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    emergencyContactName: e.target.value,
                                  })
                                }
                                placeholder="Full Name"
                                className="h-10"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-[11px] font-bold uppercase tracking-wider">
                                Contact Relationship
                              </Label>
                              <Input
                                value={formData.emergencyContactRelation}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    emergencyContactRelation: e.target.value,
                                  })
                                }
                                placeholder="e.g. Mother"
                                className="h-10"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-[11px] font-bold uppercase tracking-wider">
                                Direct Phone
                              </Label>
                              <Input
                                value={formData.emergencyContactPhone}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    emergencyContactPhone: e.target.value,
                                  })
                                }
                                className="h-10"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsEditDialogOpen(false)}
                          className="h-10 text-[11px] font-bold uppercase tracking-widest"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSaveProfile}
                          className="h-10 text-[11px] font-bold uppercase tracking-widest bg-[var(--color-accent-primary)]"
                        >
                          Commit Changes
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
                <Button
                  variant="default"
                  className="w-full h-11 text-[11px] font-bold uppercase tracking-widest bg-[var(--color-accent-primary)] shadow-sm"
                >
                  <HugeiconsIcon icon={PrinterIcon} className="mr-2 size-4" />
                  Print Official ID
                </Button>
              </div>
            </div>
          </div>

          {/* Emergency Quick Glance */}
          <div className="bg-[rgba(139,30,30,0.04)] border border-[rgba(139,30,30,0.1)] rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="size-6 rounded bg-[rgba(139,30,30,0.1)] text-[var(--color-accent-primary)] flex items-center justify-center">
                <HugeiconsIcon icon={Alert02Icon} size={14} />
              </div>
              <h3 className="text-[11px] font-bold text-[var(--color-accent-primary)] uppercase tracking-widest">
                Emergency Critical
              </h3>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">
                  Allergies
                </span>
                <span className="text-xs font-bold text-foreground mt-0.5">
                  {profile?.allergies || "None Disclosed"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">
                  Primary Guardian
                </span>
                <span className="text-xs font-bold text-foreground mt-0.5">
                  {profile?.emergencyContactName || "Not Provided"}
                </span>
                <span className="text-[10px] text-[var(--color-accent-primary)] font-bold mt-1 cursor-pointer hover:underline">
                  {profile?.emergencyContactPhone || ""}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Workspace with Tabs */}
        <div className="flex-1">
          <Tabs
            defaultValue="registry"
            className="w-full"
            onValueChange={setActiveTab}
          >
            <TabsList className="bg-transparent border-b border-[var(--color-border-default)] w-full justify-start rounded-none h-auto p-0 gap-8">
              <TabsTrigger
                value="registry"
                className="bg-transparent border-b-2 border-transparent data-[state=active]:border-[var(--color-accent-primary)] data-[state=active]:text-[var(--state-active-text)] rounded-none px-0 pb-3 text-[13px] font-bold uppercase tracking-wider transition-all"
              >
                Registry & Bio
              </TabsTrigger>
              <TabsTrigger
                value="performance"
                className="bg-transparent border-b-2 border-transparent data-[state=active]:border-[var(--color-accent-primary)] data-[state=active]:text-[var(--state-active-text)] rounded-none px-0 pb-3 text-[13px] font-bold uppercase tracking-wider transition-all"
              >
                Performance
              </TabsTrigger>
              <TabsTrigger
                value="behaviour"
                className="bg-transparent border-b-2 border-transparent data-[state=active]:border-[var(--color-accent-primary)] data-[state=active]:text-[var(--state-active-text)] rounded-none px-0 pb-3 text-[13px] font-bold uppercase tracking-wider transition-all"
              >
                Behaviour
              </TabsTrigger>
              <TabsTrigger
                value="health"
                className="bg-transparent border-b-2 border-transparent data-[state=active]:border-[var(--color-accent-primary)] data-[state=active]:text-[var(--state-active-text)] rounded-none px-0 pb-3 text-[13px] font-bold uppercase tracking-wider transition-all"
              >
                Health & SEN
              </TabsTrigger>
            </TabsList>

            <div className="mt-8">
              <TabsContent value="registry">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="shadow-sm border-[var(--color-border-default)]">
                    <CardHeader className="pb-4 border-b border-[var(--color-border-default)]/50 bg-[var(--color-surface-secondary)]/10">
                      <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <HugeiconsIcon
                          icon={InformationCircleIcon}
                          size={18}
                          className="text-[var(--color-accent-primary)]"
                        />
                        Biographical Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">
                            Official Name
                          </p>
                          <p className="text-sm font-bold text-foreground">
                            {student?.name}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">
                            Birth Date
                          </p>
                          <p className="text-sm font-bold text-foreground">
                            {formatDOB(profile?.dateOfBirth)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">
                            NRC / SID
                          </p>
                          <p className="text-sm font-bold text-foreground font-mono">
                            {profile?.nrcNumber || "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">
                            Nationality
                          </p>
                          <p className="text-sm font-bold text-foreground">
                            Zambian
                          </p>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-[var(--color-border-default)]/40">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-2">
                          Residential Address
                        </p>
                        <p className="text-xs leading-relaxed text-foreground/80 bg-[var(--color-surface-secondary)]/30 p-3 rounded-lg border border-[var(--color-border-default)]">
                          {profile?.address ||
                            "No official address has been documented for this student record."}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm border-[var(--color-border-default)]">
                    <CardHeader className="pb-4 border-b border-[var(--color-border-default)]/50 bg-[var(--color-surface-secondary)]/10">
                      <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <HugeiconsIcon
                          icon={CheckmarkCircle02Icon}
                          size={18}
                          className="text-[var(--color-category-green)]"
                        />
                        Contact Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">
                          School Email
                        </p>
                        <p className="text-sm font-bold text-foreground lowercase">
                          {student?.email || "No school email assigned"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">
                          Primary Phone
                        </p>
                        <p className="text-sm font-bold text-foreground">
                          {student?.phone || "Not Documented"}
                        </p>
                      </div>
                      <div className="pt-4 border-t border-[var(--color-border-default)]/40">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-3">
                          Linked Guardians
                        </p>
                        <div className="p-3 bg-white border border-[var(--color-border-default)] rounded-xl flex items-center gap-4 shadow-sm">
                          <div className="size-10 rounded-full bg-(--color-surface-secondary) flex items-center justify-center text-muted-foreground">
                            <HugeiconsIcon
                              icon={UserMultiple02Icon}
                              size={18}
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-foreground">
                              {profile?.emergencyContactName || "Not Linked"}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">
                              {profile?.emergencyContactRelation || "Guardian"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="performance">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* LMS Submissions */}
                  <Card className="shadow-sm border-(--color-border-default)">
                    <CardHeader className="pb-4 border-b border-(--color-border-default)/50 bg-(--color-surface-secondary)/10">
                      <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <HugeiconsIcon
                          icon={TaskDaily01Icon}
                          size={18}
                          className="text-(--color-accent-primary)"
                        />
                        LMS Submissions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 px-0">
                      <div className="divide-y divide-(--color-border-default)/50">
                        {performance?.submissions &&
                        performance.submissions.length > 0 ? (
                          performance.submissions.map((sub: any) => (
                            <div
                              key={sub._id}
                              className="px-6 py-4 flex items-center justify-between hover:bg-(--color-surface-secondary)/20 transition-colors"
                            >
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-foreground">
                                  {sub.title}
                                </span>
                                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5">
                                  SUBMITTED{" "}
                                  {format(new Date(sub.submittedAt), "MMM dd")}
                                </span>
                              </div>
                              <div className="text-right">
                                {sub.status === "graded" ? (
                                  <span className="text-sm font-bold text-(--color-category-green)">
                                    {sub.grade}/{sub.totalMarks}
                                  </span>
                                ) : (
                                  <Badge
                                    variant="secondary"
                                    className="text-[9px] font-bold uppercase"
                                  >
                                    {sub.status}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-6 py-12 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-40">
                            No LMS submissions documented.
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Formal Assessments */}
                  <Card className="shadow-sm border-(--color-border-default)">
                    <CardHeader className="pb-4 border-b border-(--color-border-default)/50 bg-(--color-surface-secondary)/10">
                      <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <HugeiconsIcon
                          icon={GraduationCap}
                          size={18}
                          className="text-(--color-category-purple)"
                        />
                        Formal Assessments
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 px-0">
                      <div className="divide-y divide-(--color-border-default)/50">
                        {performance?.marks && performance.marks.length > 0 ? (
                          performance.marks.map((mark: any) => (
                            <div
                              key={mark._id}
                              className="px-6 py-4 flex items-center justify-between hover:bg-(--color-surface-secondary)/20 transition-colors"
                            >
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-foreground uppercase tracking-tight">
                                    {mark.title}
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className="text-[8px] font-bold h-4 px-1"
                                  >
                                    {mark.type}
                                  </Badge>
                                </div>
                                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5">
                                  CONDUCTED{" "}
                                  {format(new Date(mark.date), "MMM dd")}
                                </span>
                              </div>
                              <span className="text-sm font-bold text-foreground">
                                {mark.score}/{mark.totalScore}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="px-6 py-12 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-40">
                            No assessment marks documented.
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-8 bg-white border border-(--color-border-default) rounded-2xl p-6 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-(--color-accent-primary)/10 text-(--color-accent-primary) flex items-center justify-center">
                      <HugeiconsIcon icon={Analytics01Icon} size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">
                        Term Performance Index
                      </p>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5">
                        Consolidated Weighted Average
                      </p>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-foreground font-sans">
                      82.4
                    </span>
                    <span className="text-[10px] text-(--color-category-green) font-bold uppercase tracking-widest">
                      STRONG
                    </span>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="behaviour">
                <div className="bg-white border border-[var(--color-border-default)] rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b border-[var(--color-border-default)] bg-[var(--color-surface-secondary)]/20 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <HugeiconsIcon
                        icon={Shield01Icon}
                        size={18}
                        className="text-[var(--color-warning)]"
                      />
                      Incident Records
                    </h3>
                    <Badge
                      variant="outline"
                      className="bg-white text-[10px] font-bold border-muted"
                    >
                      MoE Restorative Shield
                    </Badge>
                  </div>
                  <div className="divide-y divide-[var(--color-border-default)]">
                    {disciplineLogs && disciplineLogs.length > 0 ? (
                      disciplineLogs.map((log) => (
                        <div
                          key={log._id}
                          className="p-5 flex items-start gap-6 hover:bg-[var(--color-surface-secondary)]/30 transition-colors"
                        >
                          <div
                            className={`p-2 rounded-lg ${log.pointsDeducted > 10 ? "bg-[rgba(139,30,30,0.08)] text-[var(--color-accent-primary)]" : "bg-[rgba(201,162,39,0.08)] text-[var(--color-warning)]"}`}
                          >
                            <HugeiconsIcon icon={Alert02Icon} size={18} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold text-brand-accent">
                                {log.infraction}
                              </span>
                              <Badge
                                className={`h-5 text-[9px] font-bold uppercase ${log.pointsDeducted > 10 ? "bg-[var(--color-accent-primary)]" : "bg-[var(--color-warning)]"}`}
                              >
                                -{log.pointsDeducted} PTS
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed italic border-l-2 border-[var(--color-border-default)] pl-3">
                              "
                              {log.restorativeAction ||
                                "Required reflection on behavior and impact on class environment."}
                              "
                            </p>
                            <div className="mt-4 flex items-center gap-4 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                              <span className="flex items-center gap-1.5">
                                <HugeiconsIcon
                                  icon={Calendar03Icon}
                                  size={12}
                                />{" "}
                                {format(new Date(log.date), "MMM dd, yyyy")}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <HugeiconsIcon icon={UserIcon} size={12} /> By{" "}
                                {log.reporterName}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-12 text-center text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex flex-col gap-3">
                        <HugeiconsIcon
                          icon={CheckmarkCircle02Icon}
                          size={32}
                          className="mx-auto opacity-20 text-[var(--color-category-green)]"
                        />
                        Clean Discipline Record
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="health">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 flex flex-col gap-6">
                    <Card className="shadow-sm border-[var(--color-border-default)]">
                      <CardHeader className="pb-4 border-b border-[var(--color-border-default)]/50 bg-[rgba(139,30,30,0.04)]">
                        <CardTitle className="text-sm font-bold flex items-center gap-2 text-[var(--color-accent-primary)]">
                          <HugeiconsIcon icon={Alert02Icon} size={18} />
                          Medical Alerts & Conditions
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-[rgba(139,30,30,0.04)] border border-[rgba(139,30,30,0.1)] p-4 rounded-xl">
                            <p className="text-[10px] font-bold text-[var(--color-accent-primary)] uppercase tracking-widest mb-2">
                              Known Allergies
                            </p>
                            <p className="text-xs font-bold text-foreground leading-relaxed">
                              {profile?.allergies || "No documented allergies."}
                            </p>
                          </div>
                          <div className="bg-[rgba(201,162,39,0.04)] border border-[rgba(201,162,39,0.1)] p-4 rounded-xl">
                            <p className="text-[10px] font-bold text-[var(--color-warning)] uppercase tracking-widest mb-2">
                              Medical Conditions
                            </p>
                            <p className="text-xs font-bold text-foreground leading-relaxed">
                              {profile?.medicalConditions ||
                                "No chronic conditions reported."}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="bg-white border border-[var(--color-border-default)] rounded-xl shadow-sm overflow-hidden">
                      <div className="px-6 py-5 border-b border-[var(--color-border-default)] flex items-center justify-between bg-[var(--color-surface-secondary)]/10">
                        <h4 className="text-sm font-bold text-foreground uppercase tracking-tight">
                          MoE SEN Screenings
                        </h4>
                        <HugeiconsIcon
                          icon={GraduationCap}
                          size={18}
                          className="text-[var(--color-category-purple)]"
                        />
                      </div>
                      <div className="divide-y divide-[var(--color-border-default)]">
                        {senAssessments && senAssessments.length > 0 ? (
                          senAssessments.map((sen) => (
                            <div
                              key={sen._id}
                              className="p-6 flex flex-col gap-6 hover:bg-[var(--color-surface-secondary)]/20 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="size-8 rounded bg-[rgba(74,32,128,0.08)] text-[var(--color-category-purple)] flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                                    SEN
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-xs font-bold text-foreground">
                                      {format(
                                        new Date(sen.date),
                                        "MMMM dd, yyyy",
                                      )}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                                      Early Grade Screening
                                    </span>
                                  </div>
                                </div>
                                {sen.flagged ? (
                                  <Badge className="bg-[var(--color-accent-primary)] text-white text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 border-0">
                                    FLAGGED FOR REVIEW
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="text-[var(--color-category-green)] border-[var(--color-category-green)] text-[9px] font-bold uppercase tracking-widest bg-white"
                                  >
                                    CLEARED
                                  </Badge>
                                )}
                              </div>

                              <div className="grid grid-cols-3 gap-4">
                                {[
                                  {
                                    label: "Visual",
                                    score: sen.visualScore,
                                    color: "teal",
                                  },
                                  {
                                    label: "Hearing",
                                    score: sen.hearingScore,
                                    color: "purple",
                                  },
                                  {
                                    label: "Intellectual",
                                    score: sen.intellectualScore,
                                    color: "maroon",
                                  },
                                ].map((met) => (
                                  <div
                                    key={met.label}
                                    className="bg-white border border-[var(--color-border-default)] rounded-xl p-3 flex flex-col items-center gap-1 shadow-sm"
                                  >
                                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                      {met.label}
                                    </span>
                                    <span className="text-sm font-bold text-foreground font-mono">
                                      {met.score}/10
                                    </span>
                                    <div className="w-full h-1 bg-muted rounded-full overflow-hidden mt-1">
                                      <div
                                        className="h-full bg-[var(--color-accent-primary)]"
                                        style={{ width: `${met.score * 10}%` }}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {sen.notes && (
                                <div className="bg-[var(--color-surface-secondary)]/40 p-3 rounded-lg border border-[var(--color-border-default)]/60">
                                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                    <HugeiconsIcon
                                      icon={InformationCircleIcon}
                                      size={12}
                                    />
                                    Assessor Remarks
                                  </p>
                                  <p className="text-xs text-foreground/80 leading-relaxed italic">
                                    "{sen.notes}"
                                  </p>
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="p-16 text-center text-muted-foreground opacity-40">
                            No SEN assessments documented.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-1">
                    <Card className="shadow-sm border-[var(--color-border-default)]/80 bg-[var(--color-surface-secondary)]/10 border-dashed">
                      <CardHeader className="pb-3 text-center">
                        <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                          Medical Context
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-[11px] leading-relaxed text-muted-foreground text-center italic">
                          "Health records are strictly confidential and only
                          accessible to authorized medical staff and school
                          management."
                        </p>
                        <Button
                          variant="outline"
                          className="w-full h-10 text-[10px] font-bold uppercase tracking-widest border-[var(--color-border-default)] shadow-sm"
                        >
                          Upload Records
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
