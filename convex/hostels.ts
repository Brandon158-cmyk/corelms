import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

/**
 * Helper to ensure the user is authenticated and get their tenantId.
 */
async function enforceTenantAccess(ctx: any) {
  const userId = await auth.getUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  const user = await ctx.db.get(userId);
  if (!user || !user.tenantId)
    throw new Error("Unauthorized: No tenant context");
  return { userId, tenantId: user.tenantId, role: user.role };
}

// ─── Hostel & Dormitory Management ────────────────────────────────────

/**
 * List all hostels with their dormitories.
 */
export const listHostels = query({
  args: {},
  handler: async (ctx) => {
    const { tenantId } = await enforceTenantAccess(ctx);
    const hostels = await ctx.db
      .query("hostels")
      .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
      .collect();

    return await Promise.all(
      hostels.map(async (hostel) => {
        const dorms = await ctx.db
          .query("dormitories")
          .withIndex("by_hostel", (q) => q.eq("hostelId", hostel._id))
          .collect();
        return { ...hostel, dormitories: dorms };
      }),
    );
  },
});

/**
 * Save or Update a Hostel.
 */
export const saveHostel = mutation({
  args: {
    id: v.optional(v.id("hostels")),
    name: v.string(),
    gender: v.union(v.literal("boys"), v.literal("girls"), v.literal("mixed")),
    capacity: v.number(),
    wardenId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const { tenantId } = await enforceTenantAccess(ctx);
    const { id, ...data } = args;

    if (id) {
      await ctx.db.patch(id, data);
      return id;
    } else {
      return await ctx.db.insert("hostels", { tenantId, ...data });
    }
  },
});

/**
 * Save or Update a Dormitory.
 */
export const saveDormitory = mutation({
  args: {
    id: v.optional(v.id("dormitories")),
    hostelId: v.id("hostels"),
    name: v.string(),
    bedCount: v.number(),
    floor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { tenantId } = await enforceTenantAccess(ctx);
    const { id, ...data } = args;

    if (id) {
      await ctx.db.patch(id, data);
      return id;
    } else {
      return await ctx.db.insert("dormitories", { tenantId, ...data });
    }
  },
});

// ─── Allocations ───────────────────────────────────────────────────────

/**
 * Allocate a student to a dormitory/bed.
 */
export const allocateStudent = mutation({
  args: {
    studentId: v.id("users"),
    hostelId: v.id("hostels"),
    dormitoryId: v.id("dormitories"),
    bedNumber: v.optional(v.string()),
    termId: v.id("terms"),
  },
  handler: async (ctx, args) => {
    const { tenantId } = await enforceTenantAccess(ctx);

    // Deactivate previous allocations for this student for the same term
    const existing = await ctx.db
      .query("hostelAllocations")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .filter((q) => q.eq(q.field("termId"), args.termId))
      .collect();

    for (const alloc of existing) {
      await ctx.db.patch(alloc._id, { status: "inactive" });
    }

    return await ctx.db.insert("hostelAllocations", {
      tenantId,
      ...args,
      status: "active",
    });
  },
});

/**
 * List allocations for a specific hostel.
 */
export const listAllocations = query({
  args: { hostelId: v.id("hostels") },
  handler: async (ctx, args) => {
    const { tenantId } = await enforceTenantAccess(ctx);
    const allocations = await ctx.db
      .query("hostelAllocations")
      .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
      .filter((q) => q.eq(q.field("hostelId"), args.hostelId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    return await Promise.all(
      allocations.map(async (a) => {
        const student = await ctx.db.get(a.studentId);
        const dorm = await ctx.db.get(a.dormitoryId);
        return {
          ...a,
          studentName: student?.name || "Unknown",
          dormName: dorm?.name || "Unknown",
        };
      }),
    );
  },
});

// ─── Exeat (Gate Pass) Management ─────────────────────────────────────

/**
 * Request an Exeat (Gate Pass).
 */
export const requestExeat = mutation({
  args: {
    studentId: v.id("users"),
    type: v.union(
      v.literal("weekend"),
      v.literal("medical"),
      v.literal("family"),
      v.literal("holiday"),
    ),
    leaveDate: v.number(),
    returnDate: v.number(),
    hostName: v.string(),
    hostContact: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { tenantId } = await enforceTenantAccess(ctx);
    return await ctx.db.insert("exeatRequests", {
      tenantId,
      ...args,
      status: "pending",
    });
  },
});

/**
 * List all exeat requests for the tenant.
 */
export const listExeatRequests = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const { tenantId } = await enforceTenantAccess(ctx);
    let q = ctx.db
      .query("exeatRequests")
      .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId));

    if (args.status) {
      q = q.filter((f) => f.eq(f.field("status"), args.status));
    }

    const requests = await q.collect();

    return await Promise.all(
      requests.map(async (r) => {
        const student = await ctx.db.get(r.studentId);
        return { ...r, studentName: student?.name || "Unknown" };
      }),
    );
  },
});

/**
 * Approve or Reject an Exeat Request.
 */
export const processExeat = mutation({
  args: {
    id: v.id("exeatRequests"),
    status: v.union(
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("returned"),
    ),
  },
  handler: async (ctx, args) => {
    const { userId } = await enforceTenantAccess(ctx);
    return await ctx.db.patch(args.id, {
      status: args.status,
      approvedBy: userId,
    });
  },
});
