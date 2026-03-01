"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, use } from "react";
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
  UserGroupIcon,
  Add01Icon,
  BedIcon,
  Tick02Icon,
  ArrowLeft02Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { Id } from "@/convex/_generated/dataModel";

export default function AllocationsPage(props: {
  searchParams: Promise<{ hostelId: string }>;
}) {
  const searchParams = use(props.searchParams);
  const hostelId = searchParams.hostelId as Id<"hostels">;

  const hostel = useQuery(api.hostels.listHostels)?.find(
    (h) => h._id === hostelId,
  );
  const allocations = useQuery(api.hostels.listAllocations, { hostelId });
  const students = useQuery(api.users.listTenantUsers, {});
  const terms = useQuery(api.terms.listTerms, {});
  const allocate = useMutation(api.hostels.allocateStudent);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<{
    studentId: string;
    dormitoryId: string;
    bedNumber: string;
    termId: string;
  }>({
    studentId: "",
    dormitoryId: "",
    bedNumber: "",
    termId: "",
  });

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId || !formData.dormitoryId || !formData.termId) {
      toast.error("Please fill in all required fields");
      return;
    }
    setIsSubmitting(true);
    try {
      await allocate({
        hostelId,
        studentId: formData.studentId as any,
        dormitoryId: formData.dormitoryId as any,
        termId: formData.termId as any,
        bedNumber: formData.bedNumber || undefined,
      });
      toast.success("Student allocated successfully");
      setIsDialogOpen(false);
      setFormData({
        studentId: "",
        dormitoryId: "",
        bedNumber: "",
        termId: "",
      });
    } catch (err: any) {
      toast.error(err.message || "Allocation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!hostelId)
    return <div className="p-8 text-center">Invalid Hostel ID</div>;

  return (
    <div className="flex flex-1 flex-col gap-6 text-pretty">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/hostels">
            <Button variant="ghost" size="icon" className="rounded-full">
              <HugeiconsIcon icon={ArrowLeft02Icon} className="size-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-brand-accent">
              {hostel?.name || "Loading..."} Residents
            </h1>
            <p className="text-sm text-muted-foreground">
              Currently managing student bed assignments for this hostel.
            </p>
          </div>
        </div>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="bg-brand-primary hover:bg-brand-primary-deep text-white"
        >
          <HugeiconsIcon icon={Add01Icon} className="size-4 mr-2" />
          Assign Student
        </Button>
      </div>

      <Card className="shadow-sm border-t-4 border-t-brand-primary overflow-hidden">
        <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <HugeiconsIcon
              icon={UserGroupIcon}
              className="size-5 text-brand-primary"
            />
            Current Resident List
          </CardTitle>
          <Badge variant="outline" className="font-mono text-[10px]">
            {allocations?.length || 0} OCCUPIED
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-semibold text-brand-accent">
                  Student Name
                </TableHead>
                <TableHead className="font-semibold text-brand-accent">
                  Dormitory / Room
                </TableHead>
                <TableHead className="font-semibold text-brand-accent">
                  Bed Number
                </TableHead>
                <TableHead className="font-semibold text-brand-accent">
                  Status
                </TableHead>
                <TableHead className="text-right sr-only">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allocations === undefined ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <Spinner className="mx-auto" />
                  </TableCell>
                </TableRow>
              ) : allocations.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-48 text-center text-muted-foreground"
                  >
                    No students assigned to this hostel.
                  </TableCell>
                </TableRow>
              ) : (
                allocations.map((a) => (
                  <TableRow
                    key={a._id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="font-medium text-brand-accent">
                      {a.studentName}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="bg-muted text-[10px] font-semibold"
                      >
                        {a.dormName}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-mono">
                      {a.bedNumber || "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none text-[10px]">
                        Resident
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 h-8"
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Allocation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Assign Bed to Student</DialogTitle>
            <DialogDescription>
              Select a student and assign them to a specific room and bed.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAllocate} className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label>Term / Academic Period</Label>
              <Select
                value={formData.termId}
                onValueChange={(v) =>
                  setFormData({ ...formData, termId: v as string })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Term..." />
                </SelectTrigger>
                <SelectContent>
                  {terms?.map((t: any) => (
                    <SelectItem key={t._id} value={t._id}>
                      Term {t.number} ({t.startDate?.split("-")[0] || t.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
                <Label>Choose Dorm</Label>
                <Select
                  value={formData.dormitoryId}
                  onValueChange={(v) =>
                    setFormData({ ...formData, dormitoryId: v as string })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select room..." />
                  </SelectTrigger>
                  <SelectContent>
                    {hostel?.dormitories.map((d: any) => (
                      <SelectItem key={d._id} value={d._id}>
                        {d.name} ({d.bedCount} beds)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Bed No (Optional)</Label>
                <Input
                  placeholder="e.g. B12"
                  value={formData.bedNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, bedNumber: e.target.value })
                  }
                />
              </div>
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
                Confirm Allocation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
