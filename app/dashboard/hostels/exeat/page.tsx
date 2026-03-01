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
import { Input } from "@/components/ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  LicenseIcon,
  Add01Icon,
  Tick02Icon,
  Cancel01Icon,
  Search01Icon,
  Clock01Icon,
  IdentityCardIcon,
  ArrowLeft02Icon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { format } from "date-fns";

export default function ExeatPage() {
  const requests = useQuery(api.hostels.listExeatRequests, {});
  const students = useQuery(api.users.listTenantUsers, {});
  const requestExeat = useMutation(api.hostels.requestExeat);
  const processExeat = useMutation(api.hostels.processExeat);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    studentId: "",
    type: "weekend" as "weekend" | "medical" | "family" | "holiday",
    leaveDate: format(new Date(), "yyyy-MM-dd"),
    returnDate: format(new Date(Date.now() + 86400000 * 2), "yyyy-MM-dd"),
    hostName: "",
    hostContact: "",
    notes: "",
  });

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await requestExeat({
        ...formData,
        studentId: formData.studentId as any,
        leaveDate: new Date(formData.leaveDate).getTime(),
        returnDate: new Date(formData.returnDate).getTime(),
      });
      toast.success("Leave request submitted");
      setIsDialogOpen(false);
      setFormData({
        studentId: "",
        type: "weekend",
        leaveDate: format(new Date(), "yyyy-MM-dd"),
        returnDate: format(new Date(Date.now() + 86400000 * 2), "yyyy-MM-dd"),
        hostName: "",
        hostContact: "",
        notes: "",
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to submit request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProcess = async (
    id: any,
    status: "approved" | "rejected" | "returned",
  ) => {
    try {
      await processExeat({ id, status });
      toast.success(`Request ${status}`);
    } catch (err: any) {
      toast.error(err.message || "Action failed");
    }
  };

  const filteredRequests = requests?.filter(
    (r) =>
      r.studentName.toLowerCase().includes(search.toLowerCase()) ||
      r.hostName.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-1 flex-col gap-6 text-pretty">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-brand-accent">
              Gate Pass (Exeat) Management
            </h1>
            <p className="text-sm text-muted-foreground">
              Monitor student leave requests and authorized weekend exits.
            </p>
          </div>
        </div>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="bg-brand-primary hover:bg-brand-primary-deep text-white"
        >
          <HugeiconsIcon icon={Add01Icon} className="size-4 mr-2" />
          Request Leave
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          {
            label: "Pending Approval",
            status: "pending",
            color: "text-orange-600",
            bg: "border-t-orange-500",
          },
          {
            label: "Active Leave",
            status: "approved",
            color: "text-brand-primary",
            bg: "border-t-brand-primary",
          },
          {
            label: "Returned",
            status: "returned",
            color: "text-green-600",
            bg: "border-t-green-500",
          },
          {
            label: "Denied",
            status: "rejected",
            color: "text-red-600",
            bg: "border-t-red-500",
          },
        ].map((stat) => (
          <Card key={stat.status} className={`shadow-sm border-t-4 ${stat.bg}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-medium text-muted-foreground uppercase">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>
                {requests?.filter((r) => r.status === stat.status).length || 0}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-sm border-t-4 border-t-brand-primary overflow-hidden">
        <CardHeader className="pb-3 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <HugeiconsIcon
              icon={IdentityCardIcon}
              className="size-5 text-brand-primary"
            />
            Gate Pass Registry
          </CardTitle>
          <div className="relative w-full md:w-64">
            <HugeiconsIcon
              icon={Search01Icon}
              className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
            />
            <Input
              placeholder="Search by student/host..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-semibold text-brand-accent">
                  Student
                </TableHead>
                <TableHead className="font-semibold text-brand-accent">
                  Type / Period
                </TableHead>
                <TableHead className="font-semibold text-brand-accent">
                  Authorized Host
                </TableHead>
                <TableHead className="font-semibold text-brand-accent">
                  Status
                </TableHead>
                <TableHead className="text-right sr-only">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests === undefined ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <Spinner className="mx-auto" />
                  </TableCell>
                </TableRow>
              ) : filteredRequests?.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-48 text-center text-muted-foreground"
                  >
                    No leave records found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests?.map((r) => (
                  <TableRow
                    key={r._id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="font-medium text-brand-accent">
                      {r.studentName}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <Badge
                          variant="secondary"
                          className="w-fit text-[10px] capitalize font-bold mb-1"
                        >
                          {r.type}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <HugeiconsIcon
                            icon={Clock01Icon}
                            className="size-2.5"
                          />
                          {format(r.leaveDate, "MMM dd")} -{" "}
                          {format(r.returnDate, "MMM dd")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold">
                          {r.hostName}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {r.hostContact}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`text-[10px] font-bold ${
                          r.status === "pending"
                            ? "bg-orange-100 text-orange-700"
                            : r.status === "approved"
                              ? "bg-brand-primary text-white"
                              : r.status === "returned"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                        } border-none`}
                      >
                        {r.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {r.status === "pending" ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-green-600 border-green-200"
                            onClick={() => handleProcess(r._id, "approved")}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-red-600 border-red-200"
                            onClick={() => handleProcess(r._id, "rejected")}
                          >
                            Deny
                          </Button>
                        </div>
                      ) : r.status === "approved" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8"
                          onClick={() => handleProcess(r._id, "returned")}
                        >
                          Mark Returned
                        </Button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Request Leave Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Request Student Leave (Exeat)</DialogTitle>
            <DialogDescription>
              Submit a formal leave request for a student to leave campus.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRequest} className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label>Student</Label>
              <Select
                value={formData.studentId}
                onValueChange={(v) =>
                  setFormData({ ...formData, studentId: v as string })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select student..." />
                </SelectTrigger>
                <SelectContent>
                  {students
                    ?.filter((u) => u.role === "student")
                    .map((u) => (
                      <SelectItem key={u._id} value={u._id}>
                        {u.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Leave Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) =>
                    setFormData({ ...formData, type: v as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekend">Weekend Leave</SelectItem>
                    <SelectItem value="medical">Medical Outing</SelectItem>
                    <SelectItem value="family">Family Event</SelectItem>
                    <SelectItem value="holiday">Term Holiday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Departure</Label>
                <Input
                  type="date"
                  value={formData.leaveDate}
                  onChange={(e) =>
                    setFormData({ ...formData, leaveDate: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Return Date</Label>
                <Input
                  type="date"
                  value={formData.returnDate}
                  onChange={(e) =>
                    setFormData({ ...formData, returnDate: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Authorized Host</Label>
                <Input
                  placeholder="Full Name"
                  value={formData.hostName}
                  onChange={(e) =>
                    setFormData({ ...formData, hostName: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Host Contact (Phone)</Label>
              <Input
                placeholder="+260..."
                value={formData.hostContact}
                onChange={(e) =>
                  setFormData({ ...formData, hostContact: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Reason / Notes</Label>
              <Input
                placeholder="Details for the Warden..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </div>
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-brand-primary text-white"
              >
                {isSubmitting ? (
                  <Spinner className="size-4 mr-2" />
                ) : (
                  <HugeiconsIcon icon={Tick02Icon} className="size-4 mr-2" />
                )}
                Submit Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
