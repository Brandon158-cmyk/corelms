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
  Add01Icon,
  UserIcon,
  Tick02Icon,
  Search01Icon,
  Delete02Icon,
  Bus01Icon,
  Settings01Icon,
  ArrowRight02Icon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";

export default function TransportFleetPage() {
  const vehicles = useQuery(api.transport.listVehicles);
  const users = useQuery(api.users.listTenantUsers, {});
  const saveVehicle = useMutation(api.transport.saveVehicle);
  const deleteVehicle = useMutation(api.transport.deleteVehicle);

  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState<{
    name: string;
    plateNumber: string;
    capacity: string;
    driverId: string;
    status: "active" | "maintenance" | "retired";
  }>({
    name: "",
    plateNumber: "",
    capacity: "60",
    driverId: "",
    status: "active",
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.plateNumber) {
      toast.error("Name and plate number are required");
      return;
    }
    setIsSubmitting(true);
    try {
      await saveVehicle({
        name: form.name,
        plateNumber: form.plateNumber.toUpperCase(),
        capacity: parseInt(form.capacity),
        driverId: form.driverId ? (form.driverId as any) : undefined,
        status: form.status,
      });
      toast.success("Vehicle saved");
      setIsOpen(false);
      setForm({
        name: "",
        plateNumber: "",
        capacity: "60",
        driverId: "",
        status: "active",
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to save vehicle");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: any) => {
    if (!confirm("Remove this vehicle from the fleet?")) return;
    try {
      await deleteVehicle({ id });
      toast.success("Vehicle removed");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  };

  const activeCount =
    vehicles?.filter((v) => v.status === "active").length ?? 0;
  const totalCapacity =
    vehicles
      ?.filter((v) => v.status === "active")
      .reduce((sum, v) => sum + v.capacity, 0) ?? 0;

  const filtered = vehicles?.filter(
    (v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.plateNumber.toLowerCase().includes(search.toLowerCase()),
  );

  const statusColors: Record<string, string> = {
    active:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    maintenance:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    retired: "bg-gray-100 text-gray-500 dark:bg-gray-800/30 dark:text-gray-400",
  };

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-accent">
            Transport & Fleet
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage school vehicles, define routes, and track trips.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            render={<Link href="/dashboard/transport/routes" />}
          >
            <HugeiconsIcon icon={ArrowRight02Icon} className="size-4 mr-1" />
            Routes
          </Button>
          <Button
            variant="outline"
            size="sm"
            render={<Link href="/dashboard/transport/trips" />}
          >
            <HugeiconsIcon icon={ArrowRight02Icon} className="size-4 mr-1" />
            Trip Log
          </Button>
          <Button
            onClick={() => setIsOpen(true)}
            className="bg-brand-primary hover:bg-brand-primary-deep text-white"
          >
            <HugeiconsIcon icon={Add01Icon} className="size-4 mr-2" />
            Add Vehicle
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Fleet Size</CardTitle>
            <HugeiconsIcon
              icon={Bus01Icon}
              className="text-brand-primary"
              size={16}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-accent">
              {vehicles === undefined ? "…" : vehicles.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total registered vehicles
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Buses</CardTitle>
            <HugeiconsIcon
              icon={Tick02Icon}
              className="text-emerald-500"
              size={16}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-accent">
              {vehicles === undefined ? "…" : activeCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently operational
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Capacity
            </CardTitle>
            <HugeiconsIcon
              icon={UserIcon}
              className="text-brand-primary"
              size={16}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-accent">
              {vehicles === undefined ? "…" : totalCapacity}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Seats across active buses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Vehicle List */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Vehicle Register</CardTitle>
              <CardDescription>
                All registered school transport vehicles.
              </CardDescription>
            </div>
            <div className="relative w-64">
              <HugeiconsIcon
                icon={Search01Icon}
                className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
              />
              <Input
                placeholder="Search vehicles…"
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {vehicles === undefined ? (
            <div className="flex items-center justify-center py-12">
              <Spinner className="size-6" />
            </div>
          ) : filtered && filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-lg">
              <HugeiconsIcon
                icon={Bus01Icon}
                className="size-12 text-muted-foreground opacity-20 mb-4"
              />
              <p className="text-muted-foreground font-medium">
                {search
                  ? "No vehicles match your search."
                  : "No vehicles registered yet."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Plate Number</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Assigned Driver</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered?.map((v) => (
                  <TableRow key={v._id}>
                    <TableCell className="font-medium">{v.name}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {v.plateNumber}
                    </TableCell>
                    <TableCell>{v.capacity} seats</TableCell>
                    <TableCell>
                      {v.driverName || (
                        <span className="text-muted-foreground italic">
                          Unassigned
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`capitalize text-[10px] ${statusColors[v.status] || ""}`}
                        variant="outline"
                      >
                        {v.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive"
                        onClick={() => handleDelete(v._id)}
                      >
                        <HugeiconsIcon icon={Delete02Icon} className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Vehicle Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Add Vehicle</DialogTitle>
            <DialogDescription>
              Register a new bus or transport vehicle to the school fleet.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label>Vehicle Name</Label>
              <Input
                required
                placeholder="e.g. Bus 2"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Plate Number</Label>
                <Input
                  required
                  placeholder="e.g. BAA 1234"
                  className="uppercase"
                  value={form.plateNumber}
                  onChange={(e) =>
                    setForm({ ...form, plateNumber: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Seat Capacity</Label>
                <Input
                  type="number"
                  required
                  value={form.capacity}
                  onChange={(e) =>
                    setForm({ ...form, capacity: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v: any) => setForm({ ...form, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Assigned Driver</Label>
                <Select
                  value={form.driverId}
                  onValueChange={(v) => setForm({ ...form, driverId: v ?? "" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select…" />
                  </SelectTrigger>
                  <SelectContent>
                    {users
                      ?.filter(
                        (u) => u.role !== "student" && u.role !== "parent",
                      )
                      .map((u) => (
                        <SelectItem key={u._id} value={u._id}>
                          {u.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
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
                Save Vehicle
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
