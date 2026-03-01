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
} from "@hugeicons/core-free-icons";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { getAuthUserId } from "@convex-dev/auth/server";

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
  const updateProfile = useMutation(api.students.updateProfile);
  const currentUser = useQuery(api.users.currentUser);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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
        dateOfBirth: formData.dateOfBirth
          ? new Date(formData.dateOfBirth).getTime()
          : undefined,
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

  if (student === undefined || profile === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="size-8 text-brand-primary" />
      </div>
    );
  }

  if (student === null) {
    return <div>Student not found.</div>;
  }

  const formatDOB = (ts?: number) => {
    if (!ts) return "Not provided";
    return new Date(ts).toLocaleDateString("en-ZA", {
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
    <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8 bg-brand-bg/30">
      {/* Header Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-accent">
            {student.name}&apos;s Profile
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Comprehensive student information system record.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Edit Dialog */}
          {isEditor && (
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger render={<Button variant="outline" />}>
                <HugeiconsIcon icon={Edit02Icon} className="mr-2 size-4" />
                Edit Profile
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Profile: {student.name}</DialogTitle>
                  <DialogDescription>
                    Update biographical, health, and emergency contact details.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                  {/* Bio */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-brand-accent border-b pb-2">
                      Biographical
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Date of Birth</Label>
                        <Input
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              dateOfBirth: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Gender</Label>
                        <Select
                          value={formData.gender || ""}
                          onValueChange={(val) =>
                            setFormData({
                              ...formData,
                              gender: val as "Male" | "Female",
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label>NRC Number / ID (Optional)</Label>
                        <Input
                          value={formData.nrcNumber}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              nrcNumber: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label>Home Address</Label>
                        <Textarea
                          value={formData.address}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              address: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Health */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-brand-accent border-b pb-2">
                      Health & Medical
                    </h3>
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label>Allergies</Label>
                        <Input
                          value={formData.allergies}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              allergies: e.target.value,
                            })
                          }
                          placeholder="e.g., Peanuts, Penicillin"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Medical Conditions</Label>
                        <Textarea
                          value={formData.medicalConditions}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              medicalConditions: e.target.value,
                            })
                          }
                          placeholder="e.g., Asthma, Diabetes"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-brand-accent border-b pb-2">
                      Emergency Contact
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2 col-span-2">
                        <Label>Contact Name</Label>
                        <Input
                          value={formData.emergencyContactName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              emergencyContactName: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Relationship</Label>
                        <Input
                          value={formData.emergencyContactRelation}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              emergencyContactRelation: e.target.value,
                            })
                          }
                          placeholder="e.g., Mother, Uncle"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone Number</Label>
                        <Input
                          value={formData.emergencyContactPhone}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              emergencyContactPhone: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSaveProfile}>Save Changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          <Button variant="default">
            <HugeiconsIcon icon={PrinterIcon} className="mr-2 size-4" />
            Print ID Card
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bio Card */}
        <Card className="col-span-1 lg:col-span-2 shadow-sm border-t-4 border-t-brand-primary">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center space-x-2">
              <HugeiconsIcon
                icon={UserIcon}
                className="size-5 text-brand-primary"
              />
              <span>Biographical Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Full Name
              </p>
              <p className="font-medium text-brand-accent">{student.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Date of Birth
              </p>
              <p className="font-medium">{formatDOB(profile?.dateOfBirth)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Gender
              </p>
              <p className="font-medium">
                {profile?.gender || "Not specified"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                NRC / Passport Number
              </p>
              <p className="font-medium font-mono text-sm">
                {profile?.nrcNumber || "—"}
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                Home Address
              </p>
              <p className="min-h-12 bg-muted/40 p-3 rounded-md text-sm">
                {profile?.address || "No address provided."}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Academic Card */}
        <Card className="shadow-sm border-t-4 border-t-brand-primary-dark">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center space-x-2">
              <HugeiconsIcon
                icon={SchoolIcon}
                className="size-5 text-brand-primary-dark"
              />
              <span>Academic Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Current Class
              </p>
              {student.classId ? (
                <Badge
                  variant="outline"
                  className="text-brand-primary-dark border-brand-primary-dark/30"
                >
                  Enrolled
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-muted-foreground">
                  Unassigned
                </Badge>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Email
              </p>
              <p className="font-medium text-sm break-all">
                {student.email || "No email"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Phone
              </p>
              <p className="font-medium">{student.phone || "—"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Health & Emergency Card */}
        <Card className="col-span-1 lg:col-span-3 shadow-sm border-t-4 border-t-red-500">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center space-x-2 text-red-600">
              <span>Health & Emergency</span>
            </CardTitle>
            <CardDescription>
              Critical medical information and emergency contacts. Keep this
              updated.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="bg-red-50 p-4 rounded-lg border border-red-100 dark:bg-red-950/20 dark:border-red-900/30">
                <p className="text-sm font-semibold text-red-800 dark:text-red-400 mb-2 flex items-center gap-2">
                  Known Allergies
                </p>
                <p className="text-sm text-red-900/80 dark:text-red-300">
                  {profile?.allergies || "None stated"}
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 dark:bg-orange-950/20 dark:border-orange-900/30">
                <p className="text-sm font-semibold text-orange-800 dark:text-orange-400 mb-2">
                  Medical Conditions
                </p>
                <p className="text-sm text-orange-900/80 dark:text-orange-300">
                  {profile?.medicalConditions || "None stated"}
                </p>
              </div>
            </div>

            <div className="bg-muted/30 p-5 rounded-lg border">
              <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <HugeiconsIcon
                  icon={Call02Icon}
                  className="size-4 text-muted-foreground"
                />
                Primary Emergency Contact
              </h4>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Name & Relation
                  </p>
                  <p className="font-medium">
                    {profile?.emergencyContactName || "Not provided"}
                    {profile?.emergencyContactRelation && (
                      <span className="text-muted-foreground font-normal ml-2">
                        ({profile.emergencyContactRelation})
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone Number</p>
                  <p className="font-medium font-mono text-brand-primary cursor-pointer hover:underline">
                    {profile?.emergencyContactPhone || "—"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Behavior & Discipline Card */}
        <Card className="col-span-1 lg:col-span-2 shadow-sm border-t-4 border-t-orange-500">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center space-x-2 text-orange-600">
              <HugeiconsIcon icon={Shield01Icon} className="size-5" />
              <span>Behavioral Record</span>
            </CardTitle>
            <CardDescription>
              Disciplinary infractions logged under the restorative justice
              framework.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {disciplineLogs === undefined ? (
              <p className="text-sm text-muted-foreground">
                Loading behavior logs...
              </p>
            ) : disciplineLogs.length === 0 ? (
              <div className="flex items-center justify-center p-6 border border-dashed rounded-lg bg-muted/20">
                <p className="text-sm text-muted-foreground">
                  No disciplinary records found for this student.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {disciplineLogs.map((log) => (
                  <div
                    key={log._id}
                    className="flex justify-between items-start border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-brand-accent">
                          {log.infraction}
                        </span>
                        <Badge
                          variant={
                            log.pointsDeducted > 10
                              ? "destructive"
                              : "secondary"
                          }
                          className="h-5 px-1.5 text-[10px]"
                        >
                          -{log.pointsDeducted} pts
                        </Badge>
                      </div>
                      {log.restorativeAction && (
                        <p className="text-xs text-muted-foreground mt-1 bg-muted/40 p-2 rounded-sm border-l-2 border-orange-300">
                          Action: {log.restorativeAction}
                        </p>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-2 uppercase">
                        Recorded {new Date(log.date).toLocaleDateString()} by{" "}
                        {log.reporterName}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* SEN Assessments Card */}
        <Card className="col-span-1 lg:col-span-1 shadow-sm border-t-4 border-t-purple-500">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center space-x-2 text-purple-600">
              <HugeiconsIcon icon={Alert02Icon} className="size-5" />
              <span>SEN Assessments</span>
            </CardTitle>
            <CardDescription>
              MoE Early Grade Screening results.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {senAssessments === undefined ? (
              <p className="text-sm text-muted-foreground">
                Loading assessments...
              </p>
            ) : senAssessments.length === 0 ? (
              <div className="flex items-center justify-center p-6 border border-dashed rounded-lg bg-muted/20">
                <p className="text-sm text-muted-foreground text-center">
                  No SEN assessments
                  <br />
                  conducted yet.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {senAssessments.map((sen) => (
                  <div
                    key={sen._id}
                    className="bg-muted/30 p-3 rounded-lg border"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold uppercase">
                        {new Date(sen.date).toLocaleDateString()}
                      </span>
                      {sen.flagged ? (
                        <Badge
                          variant="destructive"
                          className="h-5 text-[10px]"
                        >
                          Flagged
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="h-5 text-[10px] text-green-600 border-green-200 bg-green-50/50"
                        >
                          Cleared
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-1 mt-2 text-center text-xs">
                      <div className="bg-background rounded-sm py-1 border shadow-xs">
                        <p className="text-muted-foreground text-[10px]">
                          Visual
                        </p>
                        <p className="font-mono">{sen.visualScore}/10</p>
                      </div>
                      <div className="bg-background rounded-sm py-1 border shadow-xs">
                        <p className="text-muted-foreground text-[10px]">
                          Hearing
                        </p>
                        <p className="font-mono">{sen.hearingScore}/10</p>
                      </div>
                      <div className="bg-background rounded-sm py-1 border shadow-xs">
                        <p className="text-muted-foreground text-[10px]">
                          Intellect
                        </p>
                        <p className="font-mono">{sen.intellectualScore}/10</p>
                      </div>
                    </div>
                    {sen.notes && (
                      <p className="text-xs text-muted-foreground mt-2 border-t pt-2">
                        {sen.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
