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
  Location01Icon,
  Delete02Icon,
  ArrowLeft02Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";

export default function RoutesPage() {
  const routes = useQuery(api.transport.listRoutes);
  const saveRoute = useMutation(api.transport.saveRoute);
  const saveStop = useMutation(api.transport.saveRouteStop);
  const removeStop = useMutation(api.transport.removeRouteStop);

  const [isRouteOpen, setIsRouteOpen] = useState(false);
  const [isStopOpen, setIsStopOpen] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [routeForm, setRouteForm] = useState<{
    name: string;
    type: "morning" | "afternoon" | "both";
    status: "active" | "inactive";
  }>({
    name: "",
    type: "both",
    status: "active",
  });

  const [stopForm, setStopForm] = useState({
    name: "",
    order: "1",
    pickupTime: "",
    dropoffTime: "",
  });

  const handleSaveRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeForm.name) {
      toast.error("Route name is required");
      return;
    }
    setIsSubmitting(true);
    try {
      await saveRoute(routeForm);
      toast.success("Route saved");
      setIsRouteOpen(false);
      setRouteForm({ name: "", type: "both", status: "active" });
    } catch (err: any) {
      toast.error(err.message || "Failed to save route");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveStop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stopForm.name || !selectedRouteId) {
      toast.error("Stop name is required");
      return;
    }
    setIsSubmitting(true);
    try {
      await saveStop({
        routeId: selectedRouteId as any,
        name: stopForm.name,
        order: parseInt(stopForm.order),
        pickupTime: stopForm.pickupTime || undefined,
        dropoffTime: stopForm.dropoffTime || undefined,
      });
      toast.success("Stop added");
      setIsStopOpen(false);
      setStopForm({ name: "", order: "1", pickupTime: "", dropoffTime: "" });
    } catch (err: any) {
      toast.error(err.message || "Failed to add stop");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveStop = async (id: any) => {
    if (!confirm("Remove this stop?")) return;
    try {
      await removeStop({ id });
      toast.success("Stop removed");
    } catch (err: any) {
      toast.error(err.message || "Failed");
    }
  };

  const typeColors: Record<string, string> = {
    morning:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    afternoon:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
    both: "bg-brand-primary/10 text-brand-primary",
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
            <h1 className="text-2xl font-bold text-brand-accent">Bus Routes</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Define pickup/dropoff routes with ordered stops.
            </p>
          </div>
        </div>
        <Button
          onClick={() => setIsRouteOpen(true)}
          className="bg-brand-primary hover:bg-brand-primary-deep text-white"
        >
          <HugeiconsIcon icon={Add01Icon} className="size-4 mr-2" />
          New Route
        </Button>
      </div>

      {routes === undefined ? (
        <div className="flex items-center justify-center py-16">
          <Spinner className="size-6" />
        </div>
      ) : routes.length === 0 ? (
        <Card className="border-dashed p-10 text-center">
          <HugeiconsIcon
            icon={Location01Icon}
            className="size-12 mx-auto text-muted-foreground opacity-20"
          />
          <p className="mt-4 text-muted-foreground font-medium">
            No routes defined yet. Create your first bus route.
          </p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {routes.map((route) => (
            <Card
              key={route._id}
              className="shadow-sm border-t-4 border-t-brand-primary overflow-hidden"
            >
              <CardHeader className="pb-3 border-b bg-muted/20">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold text-brand-accent">
                      {route.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="outline"
                        className={`capitalize text-[10px] ${typeColors[route.type] || ""}`}
                      >
                        {route.type}
                      </Badge>
                      <Badge
                        variant={
                          route.status === "active" ? "default" : "secondary"
                        }
                        className="text-[10px]"
                      >
                        {route.status}
                      </Badge>
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-brand-accent">
                      {route.stops.length}
                    </div>
                    <span className="text-[10px] text-muted-foreground uppercase">
                      Stops
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {route.stops.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic py-4 text-center">
                    No stops defined for this route.
                  </p>
                ) : (
                  <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                    {route.stops.map((stop: any, idx: number) => (
                      <div
                        key={stop._id}
                        className="flex items-center justify-between p-2 rounded bg-muted/50 text-xs group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="size-5 rounded-full bg-brand-primary text-white text-[10px] font-bold flex items-center justify-center">
                            {stop.order}
                          </span>
                          <span className="font-medium text-brand-accent">
                            {stop.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {stop.pickupTime && (
                            <span className="text-muted-foreground flex items-center gap-0.5">
                              <HugeiconsIcon
                                icon={Clock01Icon}
                                className="size-3"
                              />
                              {stop.pickupTime}
                            </span>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-6 opacity-0 group-hover:opacity-100 text-destructive transition-opacity"
                            onClick={() => handleRemoveStop(stop._id)}
                          >
                            <HugeiconsIcon
                              icon={Delete02Icon}
                              className="size-3"
                            />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => {
                    setSelectedRouteId(route._id);
                    setStopForm({
                      name: "",
                      order: String(route.stops.length + 1),
                      pickupTime: "",
                      dropoffTime: "",
                    });
                    setIsStopOpen(true);
                  }}
                >
                  <HugeiconsIcon icon={Add01Icon} className="size-3 mr-1.5" />
                  Add Stop
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* New Route Dialog */}
      <Dialog open={isRouteOpen} onOpenChange={setIsRouteOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Create Route</DialogTitle>
            <DialogDescription>
              Define a new bus route for pickup or dropoff.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveRoute} className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label>Route Name</Label>
              <Input
                required
                placeholder="e.g. Kabulonga Morning"
                value={routeForm.name}
                onChange={(e) =>
                  setRouteForm({ ...routeForm, name: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Type</Label>
                <Select
                  value={routeForm.type}
                  onValueChange={(v: any) =>
                    setRouteForm({ ...routeForm, type: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning</SelectItem>
                    <SelectItem value="afternoon">Afternoon</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select
                  value={routeForm.status}
                  onValueChange={(v: any) =>
                    setRouteForm({ ...routeForm, status: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsRouteOpen(false)}
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
                Create Route
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Stop Dialog */}
      <Dialog open={isStopOpen} onOpenChange={setIsStopOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Add Stop</DialogTitle>
            <DialogDescription>
              Add a pickup/dropoff point to this route.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveStop} className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label>Stop Name</Label>
              <Input
                required
                placeholder="e.g. Arcades Mall"
                value={stopForm.name}
                onChange={(e) =>
                  setStopForm({ ...stopForm, name: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>Order</Label>
                <Input
                  type="number"
                  required
                  min="1"
                  value={stopForm.order}
                  onChange={(e) =>
                    setStopForm({ ...stopForm, order: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Pickup Time</Label>
                <Input
                  type="time"
                  value={stopForm.pickupTime}
                  onChange={(e) =>
                    setStopForm({ ...stopForm, pickupTime: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Dropoff Time</Label>
                <Input
                  type="time"
                  value={stopForm.dropoffTime}
                  onChange={(e) =>
                    setStopForm({ ...stopForm, dropoffTime: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsStopOpen(false)}
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
                Add Stop
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
