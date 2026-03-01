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
  Tick02Icon,
  ArrowLeft02Icon,
  UserMultiple02Icon,
  Search01Icon,
  Clock01Icon,
  Bus01Icon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { format } from "date-fns";

export default function TripsPage() {
  const [dateFilter, setDateFilter] = useState(
    new Date().toISOString().split("T")[0],
  );
  const trips = useQuery(api.transport.listTrips, {
    date: dateFilter || undefined,
  });
  const vehicles = useQuery(api.transport.listVehicles);
  const routes = useQuery(api.transport.listRoutes);
  const students = useQuery(api.users.listTenantUsers, {});

  const startTrip = useMutation(api.transport.startTrip);
  const boardStudent = useMutation(api.transport.boardStudent);
  const completeTrip = useMutation(api.transport.completeTrip);

  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isBoardOpen, setIsBoardOpen] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");

  const [tripForm, setTripForm] = useState({
    vehicleId: "",
    routeId: "",
    direction: "pickup" as "pickup" | "dropoff",
  });

  const handleStartTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripForm.vehicleId || !tripForm.routeId) {
      toast.error("Select a vehicle and route");
      return;
    }
    setIsSubmitting(true);
    try {
      await startTrip({
        vehicleId: tripForm.vehicleId as any,
        routeId: tripForm.routeId as any,
        date: dateFilter,
        direction: tripForm.direction,
      });
      toast.success("Trip started");
      setIsStartOpen(false);
      setTripForm({ vehicleId: "", routeId: "", direction: "pickup" });
    } catch (err: any) {
      toast.error(err.message || "Failed to start trip");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBoardStudent = async (studentId: string) => {
    if (!selectedTripId) return;
    try {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      await boardStudent({
        tripId: selectedTripId as any,
        studentId: studentId as any,
        boardedAt: timeStr,
      });
      toast.success("Student boarded");
    } catch (err: any) {
      toast.error(err.message || "Failed to board student");
    }
  };

  const handleCompleteTrip = async (tripId: string) => {
    try {
      await completeTrip({ tripId: tripId as any });
      toast.success("Trip completed");
    } catch (err: any) {
      toast.error(err.message || "Failed to complete trip");
    }
  };

  const studentList = students?.filter(
    (u) =>
      u.role === "student" &&
      u.name?.toLowerCase().includes(studentSearch.toLowerCase()),
  );

  const statusColors: Record<string, string> = {
    "in-progress":
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    completed:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    cancelled:
      "bg-gray-100 text-gray-500 dark:bg-gray-800/30 dark:text-gray-400",
  };

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            render={<Link href="/dashboard/transport" />}
          >
            <HugeiconsIcon icon={ArrowLeft02Icon} className="size-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-brand-accent">Trip Log</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Start trips, board students, and view trip history.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            className="w-40"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
          <Button
            onClick={() => setIsStartOpen(true)}
            className="bg-brand-primary hover:bg-brand-primary-deep text-white"
          >
            <HugeiconsIcon icon={Add01Icon} className="size-4 mr-2" />
            Start Trip
          </Button>
        </div>
      </div>

      {/* Trips */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>
            Trips for{" "}
            {dateFilter
              ? format(new Date(dateFilter + "T00:00:00"), "EEE, MMM d yyyy")
              : "All Time"}
          </CardTitle>
          <CardDescription>
            Click "Board Students" on active trips to record who boarded.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {trips === undefined ? (
            <div className="flex items-center justify-center py-12">
              <Spinner className="size-6" />
            </div>
          ) : trips.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-lg">
              <HugeiconsIcon
                icon={Bus01Icon}
                className="size-12 text-muted-foreground opacity-20 mb-4"
              />
              <p className="text-muted-foreground font-medium">
                No trips for this date.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Direction</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trips.map((trip) => (
                  <TableRow key={trip._id}>
                    <TableCell className="font-medium">
                      {trip.vehicleName}
                    </TableCell>
                    <TableCell>{trip.routeName}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="capitalize text-[10px]"
                      >
                        {trip.direction}
                      </Badge>
                    </TableCell>
                    <TableCell>{trip.driverName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <HugeiconsIcon
                          icon={UserMultiple02Icon}
                          className="size-3.5 text-muted-foreground"
                        />
                        <span className="font-medium">{trip.studentCount}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`capitalize text-[10px] ${statusColors[trip.status] || ""}`}
                      >
                        {trip.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {trip.status === "in-progress" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-7"
                              onClick={() => {
                                setSelectedTripId(trip._id);
                                setIsBoardOpen(true);
                              }}
                            >
                              Board Students
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              className="text-xs h-7 bg-emerald-600 hover:bg-emerald-700 text-white"
                              onClick={() => handleCompleteTrip(trip._id)}
                            >
                              <HugeiconsIcon
                                icon={Tick02Icon}
                                className="size-3 mr-1"
                              />
                              Complete
                            </Button>
                          </>
                        )}
                        {trip.status === "completed" && (
                          <span className="text-xs text-muted-foreground">
                            <HugeiconsIcon
                              icon={Clock01Icon}
                              className="size-3 inline mr-1"
                            />
                            {trip.completedAt
                              ? format(trip.completedAt, "HH:mm")
                              : "—"}
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Start Trip Dialog */}
      <Dialog open={isStartOpen} onOpenChange={setIsStartOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Start New Trip</DialogTitle>
            <DialogDescription>
              Select a vehicle and route to begin a new trip for {dateFilter}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleStartTrip} className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label>Vehicle</Label>
              <Select
                value={tripForm.vehicleId}
                onValueChange={(v) =>
                  setTripForm({ ...tripForm, vehicleId: v ?? "" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select bus…" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles
                    ?.filter((v) => v.status === "active")
                    .map((v) => (
                      <SelectItem key={v._id} value={v._id}>
                        {v.name} — {v.plateNumber}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Route</Label>
              <Select
                value={tripForm.routeId}
                onValueChange={(v) =>
                  setTripForm({ ...tripForm, routeId: v ?? "" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select route…" />
                </SelectTrigger>
                <SelectContent>
                  {routes
                    ?.filter((r) => r.status === "active")
                    .map((r) => (
                      <SelectItem key={r._id} value={r._id}>
                        {r.name} ({r.stops.length} stops)
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Direction</Label>
              <Select
                value={tripForm.direction}
                onValueChange={(v: any) =>
                  setTripForm({ ...tripForm, direction: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pickup">Pickup (Morning)</SelectItem>
                  <SelectItem value="dropoff">Dropoff (Afternoon)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsStartOpen(false)}
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
                Start Trip
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Board Students Dialog */}
      <Dialog open={isBoardOpen} onOpenChange={setIsBoardOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Board Students</DialogTitle>
            <DialogDescription>
              Search and tap a student to record them boarding. Time is logged
              automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="relative">
              <HugeiconsIcon
                icon={Search01Icon}
                className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
              />
              <Input
                placeholder="Search students by name…"
                className="pl-9"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
              />
            </div>
            <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
              {studentList === undefined ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner className="size-5" />
                </div>
              ) : studentList.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No students found.
                </p>
              ) : (
                studentList.slice(0, 20).map((s) => (
                  <button
                    key={s._id}
                    onClick={() => handleBoardStudent(s._id)}
                    className="w-full flex items-center justify-between p-2.5 rounded-md hover:bg-brand-primary/10 transition-colors text-sm text-left"
                  >
                    <span className="font-medium">{s.name}</span>
                    <Badge
                      variant="outline"
                      className="text-[10px] bg-brand-primary/10 text-brand-primary"
                    >
                      Tap to Board
                    </Badge>
                  </button>
                ))
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBoardOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
