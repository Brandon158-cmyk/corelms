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
import { Input } from "@/components/ui/input";
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
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home01Icon,
  Add01Icon,
  UserIcon,
  Location01Icon,
  Search01Icon,
  ArrowRight02Icon,
  Building01Icon,
  Tick02Icon,
  BedIcon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";

export default function HostelManagementPage() {
  const hostels = useQuery(api.hostels.listHostels);
  const users = useQuery(api.users.listTenantUsers, {});

  const saveHostel = useMutation(api.hostels.saveHostel);
  const saveDorm = useMutation(api.hostels.saveDormitory);

  const [isHostelOpen, setIsHostelOpen] = useState(false);
  const [isDormOpen, setIsDormOpen] = useState(false);
  const [selectedHostelId, setSelectedHostelId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [hostelData, setHostelData] = useState<{
    name: string;
    gender: "boys" | "girls" | "mixed";
    capacity: string;
    wardenId: string;
  }>({
    name: "",
    gender: "boys",
    capacity: "50",
    wardenId: "",
  });

  const [dormData, setDormData] = useState({
    name: "",
    bedCount: "10",
    floor: "Ground",
  });

  const handleAddHostel = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await saveHostel({
        ...hostelData,
        capacity: parseInt(hostelData.capacity),
        wardenId: hostelData.wardenId
          ? (hostelData.wardenId as any)
          : undefined,
      });
      toast.success("Hostel added successfully");
      setIsHostelOpen(false);
      setHostelData({ name: "", gender: "boys", capacity: "50", wardenId: "" });
    } catch (err: any) {
      toast.error(err.message || "Failed to add hostel");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddDorm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHostelId) return;
    setIsSubmitting(true);
    try {
      await saveDorm({
        hostelId: selectedHostelId as any,
        name: dormData.name,
        bedCount: parseInt(dormData.bedCount),
        floor: dormData.floor,
      });
      toast.success("Dormitory added successfully");
      setIsDormOpen(false);
      setDormData({ name: "", bedCount: "10", floor: "Ground" });
    } catch (err: any) {
      toast.error(err.message || "Failed to add dormitory");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 text-pretty">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-accent">
            Hostel & Boarding
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage student accommodation, room allocations, and boarding
            wardens.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/hostels/exeat">
            <Button variant="outline" size="sm">
              Gate Passes (Exeats)
            </Button>
          </Link>
          <Button
            onClick={() => setIsHostelOpen(true)}
            className="bg-brand-primary hover:bg-brand-primary-deep text-white"
          >
            <HugeiconsIcon icon={Add01Icon} className="size-4 mr-2" />
            Add New Hostel
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {hostels === undefined ? (
          <div className="col-span-full h-32 flex items-center justify-center">
            <Spinner />
          </div>
        ) : hostels.length === 0 ? (
          <Card className="col-span-full border-dashed p-10 text-center">
            <HugeiconsIcon
              icon={Building01Icon}
              className="size-12 mx-auto text-muted-foreground opacity-20"
            />
            <p className="mt-4 text-muted-foreground font-medium">
              No hostels configured yet.
            </p>
          </Card>
        ) : (
          hostels.map((hostel) => (
            <Card
              key={hostel._id}
              className="shadow-sm border-t-4 border-t-brand-primary overflow-hidden"
            >
              <CardHeader className="pb-3 border-b bg-muted/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`size-3 rounded-full ${
                        hostel.gender === "boys"
                          ? "bg-blue-500"
                          : hostel.gender === "girls"
                            ? "bg-pink-500"
                            : "bg-brand-primary"
                      }`}
                    />
                    <CardTitle className="text-lg font-bold text-brand-accent">
                      {hostel.name}
                    </CardTitle>
                  </div>
                  <Badge
                    variant="outline"
                    className="capitalize text-[10px] font-bold"
                  >
                    {hostel.gender}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[10px] uppercase text-muted-foreground">
                      Total Capacity
                    </Label>
                    <div className="text-xl font-bold text-brand-accent">
                      {hostel.capacity}{" "}
                      <span className="text-sm font-normal">Beds</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase text-muted-foreground">
                      Rooms
                    </Label>
                    <div className="text-xl font-bold text-brand-accent">
                      {hostel.dormitories.length}{" "}
                      <span className="text-sm font-normal">Dorms</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 border-t pt-3">
                  <Label className="text-[10px] uppercase text-muted-foreground block mb-2">
                    Dormitories / Rooms
                  </Label>
                  <div className="space-y-1 max-h-32 overflow-y-auto pr-1 thin-scrollbar">
                    {hostel.dormitories.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">
                        No rooms added.
                      </p>
                    ) : (
                      hostel.dormitories.map((dorm: any) => (
                        <div
                          key={dorm._id}
                          className="flex items-center justify-between p-2 rounded bg-muted/50 text-xs"
                        >
                          <span className="font-medium text-brand-accent">
                            {dorm.name}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">
                              {dorm.bedCount} beds
                            </span>
                            <Badge className="bg-brand-primary text-[9px] h-4">
                              Active
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => {
                      setSelectedHostelId(hostel._id);
                      setIsDormOpen(true);
                    }}
                  >
                    <HugeiconsIcon icon={Add01Icon} className="size-3 mr-1.5" />
                    New Dorm
                  </Button>
                  <Link
                    href={`/dashboard/hostels/allocations?hostelId=${hostel._id}`}
                    className="flex-1"
                  >
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full text-xs bg-brand-primary"
                    >
                      Manage Residents
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add Hostel Dialog */}
      <Dialog open={isHostelOpen} onOpenChange={setIsHostelOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Hostel</DialogTitle>
            <DialogDescription>
              Create a main accommodation block for students.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddHostel} className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label>Hostel Name</Label>
              <Input
                required
                placeholder="e.g. Mandela Hall"
                value={hostelData.name}
                onChange={(e) =>
                  setHostelData({ ...hostelData, name: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Gender Category</Label>
                <Select
                  value={hostelData.gender}
                  onValueChange={(v) =>
                    setHostelData({ ...hostelData, gender: v as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="boys">Boys Hostel</SelectItem>
                    <SelectItem value="girls">Girls Hostel</SelectItem>
                    <SelectItem value="mixed">Mixed Hostel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Total Bed Capacity</Label>
                <Input
                  type="number"
                  required
                  value={hostelData.capacity}
                  onChange={(e) =>
                    setHostelData({ ...hostelData, capacity: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Assigned Warden (Optional)</Label>
              <Select
                value={hostelData.wardenId}
                onValueChange={(v) =>
                  setHostelData({ ...hostelData, wardenId: v as string })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select warden..." />
                </SelectTrigger>
                <SelectContent>
                  {users
                    ?.filter((u) => u.role !== "student")
                    .map((u) => (
                      <SelectItem key={u._id} value={u._id}>
                        {u.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsHostelOpen(false)}
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
                Add Hostel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Dormitory Dialog */}
      <Dialog open={isDormOpen} onOpenChange={setIsDormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Dormitory Room</DialogTitle>
            <DialogDescription>
              Add a specific room or dormitory to the selected hostel.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddDorm} className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label>Room / Dorm Name</Label>
              <Input
                required
                placeholder="e.g. Dorm A1, Room 102"
                value={dormData.name}
                onChange={(e) =>
                  setDormData({ ...dormData, name: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Number of Beds</Label>
                <Input
                  type="number"
                  required
                  value={dormData.bedCount}
                  onChange={(e) =>
                    setDormData({ ...dormData, bedCount: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Floor Level</Label>
                <Input
                  placeholder="e.g. Ground"
                  value={dormData.floor}
                  onChange={(e) =>
                    setDormData({ ...dormData, floor: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDormOpen(false)}
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
                Add Room
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
