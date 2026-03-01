import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";
import { Id } from "./_generated/dataModel";

/**
 * Ensures the currently authenticated user belongs to a tenant.
 * Returns { userId, tenantId, role }.
 */
async function getTenantUser(ctx: any) {
  const userId = await auth.getUserId(ctx);
  if (!userId) throw new Error("Not authenticated");

  const user = await ctx.db.get(userId);
  if (!user || !user.tenantId) {
    throw new Error("User does not belong to a school");
  }

  return {
    userId,
    tenantId: user.tenantId as Id<"tenants">,
    role: user.role as string,
  };
}

/**
 * List all academic years for the current user's tenant.
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user || !user.tenantId) return [];

    const years = await ctx.db
      .query("academicYears")
      .withIndex("by_tenant", (q: any) => q.eq("tenantId", user.tenantId))
      .collect();

    // Sort by startDate descending (most recent first)
    return years.sort((a: any, b: any) =>
      b.startDate.localeCompare(a.startDate),
    );
  },
});

/**
 * Get a specific academic year by ID.
 */
export const get = query({
  args: { yearId: v.id("academicYears") },
  handler: async (ctx, { yearId }) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    const year = await ctx.db.get(yearId);

    if (!year || year.tenantId !== user?.tenantId) {
      throw new Error("Academic year not found or unauthorized");
    }

    return year;
  },
});

/**
 * Create a new academic year.
 * Only management or superAdmin can create.
 */
export const create = mutation({
  args: {
    name: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    isCurrent: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { tenantId, role } = await getTenantUser(ctx);

    if (!["superAdmin", "proprietor", "headteacher"].includes(role ?? "")) {
      throw new Error("Unauthorized to create academic years");
    }

    // If setting as current, unset all others first
    if (args.isCurrent) {
      const existing = await ctx.db
        .query("academicYears")
        .withIndex("by_tenant", (q: any) => q.eq("tenantId", tenantId))
        .collect();

      for (const year of existing) {
        if (year.isCurrent) {
          await ctx.db.patch(year._id, { isCurrent: false });
        }
      }
    }

    const yearId = await ctx.db.insert("academicYears", {
      tenantId,
      name: args.name,
      startDate: args.startDate,
      endDate: args.endDate,
      isCurrent: args.isCurrent ?? false,
    });

    return yearId;
  },
});

/**
 * Update an existing academic year.
 */
export const update = mutation({
  args: {
    yearId: v.id("academicYears"),
    name: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    isCurrent: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { tenantId, role } = await getTenantUser(ctx);

    if (!["superAdmin", "proprietor", "headteacher"].includes(role ?? "")) {
      throw new Error("Unauthorized to update academic years");
    }

    const year = await ctx.db.get(args.yearId);
    if (!year || year.tenantId !== tenantId) {
      throw new Error("Academic year not found or unauthorized");
    }

    // If setting as current, unset all others first
    if (args.isCurrent) {
      const existing = await ctx.db
        .query("academicYears")
        .withIndex("by_tenant", (q: any) => q.eq("tenantId", tenantId))
        .collect();

      for (const y of existing) {
        if (y.isCurrent && y._id !== args.yearId) {
          await ctx.db.patch(y._id, { isCurrent: false });
        }
      }
    }

    const updates: any = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.startDate !== undefined) updates.startDate = args.startDate;
    if (args.endDate !== undefined) updates.endDate = args.endDate;
    if (args.isCurrent !== undefined) updates.isCurrent = args.isCurrent;

    await ctx.db.patch(args.yearId, updates);
    return { success: true };
  },
});

/**
 * Delete an academic year and all its terms.
 */
export const remove = mutation({
  args: { yearId: v.id("academicYears") },
  handler: async (ctx, { yearId }) => {
    const { tenantId, role } = await getTenantUser(ctx);

    if (!["superAdmin", "proprietor", "headteacher"].includes(role ?? "")) {
      throw new Error("Unauthorized to delete academic years");
    }

    const year = await ctx.db.get(yearId);
    if (!year || year.tenantId !== tenantId) {
      throw new Error("Academic year not found or unauthorized");
    }

    // Delete all terms belonging to this year
    const terms = await ctx.db
      .query("terms")
      .withIndex("by_year", (q: any) => q.eq("yearId", yearId))
      .collect();

    for (const term of terms) {
      await ctx.db.delete(term._id);
    }

    await ctx.db.delete(yearId);
    return { success: true };
  },
});
