"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Tick02Icon,
  UserIcon,
  Alert02Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { format } from "date-fns";

const classificationConfig: Record<string, { label: string; color: string }> = {
  "no-challenges": {
    label: "No Challenges",
    color:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  monitor: {
    label: "Monitor",
    color:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  "suspected-disability": {
    label: "Suspected Disability",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
};

const referralStatusConfig: Record<string, { label: string; color: string }> = {
  pending: {
    label: "Pending",
    color:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  "in-progress": {
    label: "In Progress",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  completed: {
    label: "Completed",
    color:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
};

export default function SENPage() {
  const screenings = useQuery(api.sen.listScreenings);
  const referrals = useQuery(api.sen.listReferrals, {});
  const updateReferral = useMutation(api.sen.updateReferral);

  const [isReferralOpen, setIsReferralOpen] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState<any>(null);
  const [referralUpdate, setReferralUpdate] = useState({
    status: "" as string,
    iepAttached: false,
    notes: "",
  });

  const totalScreened = screenings?.length ?? 0;
  const flaggedCount =
    screenings?.filter((s) => s.classification === "suspected-disability")
      .length ?? 0;
  const monitorCount =
    screenings?.filter((s) => s.classification === "monitor").length ?? 0;
  const pendingReferrals =
    referrals?.filter((r) => r.status === "pending").length ?? 0;

  const handleUpdateReferral = async () => {
    if (!selectedReferral) return;
    try {
      await updateReferral({
        id: selectedReferral._id,
        status: (referralUpdate.status as any) || undefined,
        iepAttached: referralUpdate.iepAttached,
        notes: referralUpdate.notes || undefined,
      });
      toast.success("Referral updated");
      setIsReferralOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update");
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-accent">SEN Support</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Early Grade Screening Tool — track learner assessments and
            referrals.
          </p>
        </div>
        <Button
          className="bg-brand-primary hover:bg-brand-primary-deep text-white"
          render={<Link href="/dashboard/sen/screen" />}
        >
          <HugeiconsIcon icon={Add01Icon} className="size-4 mr-2" />
          New Screening
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Screened
            </CardTitle>
            <HugeiconsIcon
              icon={UserIcon}
              className="text-brand-primary"
              size={16}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-accent">
              {screenings === undefined ? "…" : totalScreened}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">No Challenges</CardTitle>
            <HugeiconsIcon
              icon={Tick02Icon}
              className="text-emerald-500"
              size={16}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-accent">
              {screenings === undefined
                ? "…"
                : totalScreened - flaggedCount - monitorCount}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Monitoring</CardTitle>
            <HugeiconsIcon
              icon={Search01Icon}
              className="text-amber-500"
              size={16}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-accent">
              {screenings === undefined ? "…" : monitorCount}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-t-2 border-t-red-400">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Flagged / Referred
            </CardTitle>
            <HugeiconsIcon
              icon={Alert02Icon}
              className="text-red-500"
              size={16}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {screenings === undefined ? "…" : flaggedCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {pendingReferrals} pending referral
              {pendingReferrals !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="screenings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="screenings">Screenings</TabsTrigger>
          <TabsTrigger value="referrals">
            Referrals
            {pendingReferrals > 0 && (
              <Badge className="ml-2 bg-red-500 text-white text-[10px] h-4 px-1.5">
                {pendingReferrals}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Screenings Tab */}
        <TabsContent value="screenings">
          <Card className="shadow-sm">
            <CardContent className="pt-4">
              {screenings === undefined ? (
                <div className="flex items-center justify-center py-12">
                  <Spinner className="size-6" />
                </div>
              ) : screenings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-lg">
                  <HugeiconsIcon
                    icon={UserIcon}
                    className="size-12 text-muted-foreground opacity-20 mb-4"
                  />
                  <p className="text-muted-foreground font-medium">
                    No screenings recorded yet.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Screened By</TableHead>
                      <TableHead className="text-center">V</TableHead>
                      <TableHead className="text-center">H</TableHead>
                      <TableHead className="text-center">I</TableHead>
                      <TableHead className="text-center">P</TableHead>
                      <TableHead className="text-center">Total</TableHead>
                      <TableHead>Classification</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {screenings.map((s) => {
                      const cfg = classificationConfig[s.classification];
                      return (
                        <TableRow key={s._id}>
                          <TableCell className="font-medium">
                            {s.studentName}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(s.date), "dd MMM yyyy")}
                          </TableCell>
                          <TableCell>{s.screenedByName}</TableCell>
                          <TableCell className="text-center tabular-nums">
                            {s.domains.visual}
                          </TableCell>
                          <TableCell className="text-center tabular-nums">
                            {s.domains.hearing}
                          </TableCell>
                          <TableCell className="text-center tabular-nums">
                            {s.domains.intellectual}
                          </TableCell>
                          <TableCell className="text-center tabular-nums">
                            {s.domains.physical}
                          </TableCell>
                          <TableCell className="text-center font-bold tabular-nums">
                            {s.totalScore}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${cfg?.color || ""}`}
                            >
                              {cfg?.label || s.classification}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Referrals Tab */}
        <TabsContent value="referrals">
          <Card className="shadow-sm">
            <CardContent className="pt-4">
              {referrals === undefined ? (
                <div className="flex items-center justify-center py-12">
                  <Spinner className="size-6" />
                </div>
              ) : referrals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-lg">
                  <p className="text-muted-foreground font-medium">
                    No referrals generated yet.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Referred To</TableHead>
                      <TableHead>IEP</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referrals.map((r) => {
                      const sCfg = referralStatusConfig[r.status];
                      return (
                        <TableRow key={r._id}>
                          <TableCell className="font-medium">
                            {r.studentName}
                          </TableCell>
                          <TableCell className="font-bold tabular-nums text-red-600">
                            {r.totalScore}/40
                          </TableCell>
                          <TableCell>{r.referredTo}</TableCell>
                          <TableCell>
                            {r.iepAttached ? (
                              <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">
                                Attached
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-xs">
                                None
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${sCfg?.color || ""}`}
                            >
                              {sCfg?.label || r.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(r.createdAt, "dd MMM yyyy")}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-7"
                              onClick={() => {
                                setSelectedReferral(r);
                                setReferralUpdate({
                                  status: r.status,
                                  iepAttached: r.iepAttached,
                                  notes: r.notes || "",
                                });
                                setIsReferralOpen(true);
                              }}
                            >
                              Update
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Update Referral Dialog */}
      <Dialog open={isReferralOpen} onOpenChange={setIsReferralOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Update Referral</DialogTitle>
            <DialogDescription>
              Update the referral status for {selectedReferral?.studentName}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select
                value={referralUpdate.status}
                onValueChange={(v) =>
                  setReferralUpdate({
                    ...referralUpdate,
                    status: v ?? "",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="iep"
                checked={referralUpdate.iepAttached}
                onChange={(e) =>
                  setReferralUpdate({
                    ...referralUpdate,
                    iepAttached: e.target.checked,
                  })
                }
                className="rounded border-gray-300"
              />
              <Label htmlFor="iep">
                IEP (Individual Education Plan) Attached
              </Label>
            </div>
            <div className="grid gap-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Additional notes…"
                value={referralUpdate.notes}
                onChange={(e) =>
                  setReferralUpdate({
                    ...referralUpdate,
                    notes: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReferralOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-brand-primary text-white"
              onClick={handleUpdateReferral}
            >
              <HugeiconsIcon icon={Tick02Icon} className="size-4 mr-2" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
