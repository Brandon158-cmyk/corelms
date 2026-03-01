import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

// ─── Auth helper ────────────────────────────────────────────────────────

async function enforceTenantAccess(ctx: any) {
  const userId = await auth.getUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  const user = await ctx.db.get(userId);
  if (!user || !user.tenantId)
    throw new Error("Unauthorized: No tenant context");
  return { userId, tenantId: user.tenantId, role: user.role };
}

// ─── Vehicles ───────────────────────────────────────────────────────────

export const listVehicles = query({
  args: {},
  handler: async (ctx) => {
    const { tenantId } = await enforceTenantAccess(ctx);
    const vehicles = await ctx.db
      .query("vehicles")
      .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
      .collect();

    return await Promise.all(
      vehicles.map(async (v) => {
        const driver = v.driverId ? await ctx.db.get(v.driverId) : null;
        return {
          ...v,
          driverName: driver?.name || null,
        };
      }),
    );
  },
});

export const saveVehicle = mutation({
  args: {
    id: v.optional(v.id("vehicles")),
    name: v.string(),
    plateNumber: v.string(),
    capacity: v.number(),
    driverId: v.optional(v.id("users")),
    status: v.union(
      v.literal("active"),
      v.literal("maintenance"),
      v.literal("retired"),
    ),
  },
  handler: async (ctx, args) => {
    const { tenantId } = await enforceTenantAccess(ctx);
    const { id, ...data } = args;

    if (id) {
      await ctx.db.patch(id, data);
      return id;
    } else {
      return await ctx.db.insert("vehicles", { tenantId, ...data });
    }
  },
});

export const deleteVehicle = mutation({
  args: { id: v.id("vehicles") },
  handler: async (ctx, { id }) => {
    await enforceTenantAccess(ctx);
    await ctx.db.delete(id);
  },
});

// ─── Routes ─────────────────────────────────────────────────────────────

export const listRoutes = query({
  args: {},
  handler: async (ctx) => {
    const { tenantId } = await enforceTenantAccess(ctx);
    const routes = await ctx.db
      .query("routes")
      .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
      .collect();

    return await Promise.all(
      routes.map(async (route) => {
        const stops = await ctx.db
          .query("routeStops")
          .withIndex("by_route", (q) => q.eq("routeId", route._id))
          .collect();
        // Sort stops by order
        stops.sort((a, b) => a.order - b.order);
        return { ...route, stops };
      }),
    );
  },
});

export const saveRoute = mutation({
  args: {
    id: v.optional(v.id("routes")),
    name: v.string(),
    type: v.union(
      v.literal("morning"),
      v.literal("afternoon"),
      v.literal("both"),
    ),
    status: v.union(v.literal("active"), v.literal("inactive")),
  },
  handler: async (ctx, args) => {
    const { tenantId } = await enforceTenantAccess(ctx);
    const { id, ...data } = args;

    if (id) {
      await ctx.db.patch(id, data);
      return id;
    } else {
      return await ctx.db.insert("routes", { tenantId, ...data });
    }
  },
});

// ─── Route Stops ────────────────────────────────────────────────────────

export const saveRouteStop = mutation({
  args: {
    id: v.optional(v.id("routeStops")),
    routeId: v.id("routes"),
    name: v.string(),
    order: v.number(),
    pickupTime: v.optional(v.string()),
    dropoffTime: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await enforceTenantAccess(ctx);
    const { id, ...data } = args;

    if (id) {
      await ctx.db.patch(id, data);
      return id;
    } else {
      return await ctx.db.insert("routeStops", data);
    }
  },
});

export const removeRouteStop = mutation({
  args: { id: v.id("routeStops") },
  handler: async (ctx, { id }) => {
    await enforceTenantAccess(ctx);
    await ctx.db.delete(id);
  },
});

// ─── Trip Logs ──────────────────────────────────────────────────────────

export const listTrips = query({
  args: {
    date: v.optional(v.string()),
    vehicleId: v.optional(v.id("vehicles")),
  },
  handler: async (ctx, args) => {
    const { tenantId } = await enforceTenantAccess(ctx);

    let trips;
    if (args.date) {
      trips = await ctx.db
        .query("tripLogs")
        .withIndex("by_date", (q) =>
          q.eq("tenantId", tenantId).eq("date", args.date!),
        )
        .collect();
    } else {
      trips = await ctx.db
        .query("tripLogs")
        .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
        .order("desc")
        .take(50);
    }

    if (args.vehicleId) {
      trips = trips.filter((t) => t.vehicleId === args.vehicleId);
    }

    return await Promise.all(
      trips.map(async (trip) => {
        const vehicle = await ctx.db.get(trip.vehicleId);
        const route = await ctx.db.get(trip.routeId);
        const driver = await ctx.db.get(trip.driverId);
        return {
          ...trip,
          vehicleName: vehicle?.name || "Unknown",
          routeName: route?.name || "Unknown",
          driverName: driver?.name || "Unknown",
          studentCount: trip.boardedStudents.length,
        };
      }),
    );
  },
});

export const startTrip = mutation({
  args: {
    vehicleId: v.id("vehicles"),
    routeId: v.id("routes"),
    date: v.string(),
    direction: v.union(v.literal("pickup"), v.literal("dropoff")),
  },
  handler: async (ctx, args) => {
    const { tenantId, userId } = await enforceTenantAccess(ctx);

    return await ctx.db.insert("tripLogs", {
      tenantId,
      vehicleId: args.vehicleId,
      routeId: args.routeId,
      date: args.date,
      direction: args.direction,
      boardedStudents: [],
      driverId: userId,
      status: "in-progress",
      startedAt: Date.now(),
    });
  },
});

export const boardStudent = mutation({
  args: {
    tripId: v.id("tripLogs"),
    studentId: v.id("users"),
    boardedAt: v.string(), // time string e.g., "07:15"
  },
  handler: async (ctx, args) => {
    await enforceTenantAccess(ctx);
    const trip = await ctx.db.get(args.tripId);
    if (!trip) throw new Error("Trip not found");
    if (trip.status !== "in-progress")
      throw new Error("Trip is not in progress");

    // Prevent duplicate boarding
    const alreadyBoarded = trip.boardedStudents.some(
      (s) => s.studentId === args.studentId,
    );
    if (alreadyBoarded) throw new Error("Student already boarded");

    await ctx.db.patch(args.tripId, {
      boardedStudents: [
        ...trip.boardedStudents,
        { studentId: args.studentId, boardedAt: args.boardedAt },
      ],
    });
  },
});

export const completeTrip = mutation({
  args: {
    tripId: v.id("tripLogs"),
  },
  handler: async (ctx, args) => {
    await enforceTenantAccess(ctx);
    const trip = await ctx.db.get(args.tripId);
    if (!trip) throw new Error("Trip not found");

    await ctx.db.patch(args.tripId, {
      status: "completed",
      completedAt: Date.now(),
    });
  },
});
