import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Ensures the currently authenticated user belongs to the requested tenant.
 * Returns the tenantId to be used for queries and mutations.
 */
async function enforceTenantAccess(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("unauthorized");
  }

  const user = await ctx.db.get(userId);
  if (!user || (!user.tenantId && user.role !== "superAdmin")) {
    throw new Error("No tenant associated with user");
  }

  return user.tenantId;
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const tenantId = await enforceTenantAccess(ctx);

    // Super admins without a tenantId yet (e.g. initial setup) won't have classes
    if (!tenantId) return [];

    return await ctx.db
      .query("classes")
      .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
      .collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    teacherId: v.optional(v.id("users")),
    room: v.optional(v.string()),
    schedule: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("archived")),
  },
  handler: async (ctx, args) => {
    const tenantId = await enforceTenantAccess(ctx);
    if (!tenantId) {
      throw new Error("Cannot create class without a tenant");
    }

    const newClassId = await ctx.db.insert("classes", {
      ...args,
      tenantId,
    });
    return newClassId;
  },
});
