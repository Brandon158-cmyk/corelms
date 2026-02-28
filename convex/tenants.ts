import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";
import { TENANT_STATUS } from "./schema";

/**
 * List all tenants (super admin only).
 */
export const listTenants = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user || user.role !== "superAdmin") {
      throw new Error("Unauthorized: Super admin access required");
    }

    return await ctx.db.query("tenants").collect();
  },
});

/**
 * Get a single tenant by its ID.
 */
export const getTenantById = query({
  args: { tenantId: v.id("tenants") },
  handler: async (ctx, { tenantId }) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.get(tenantId);
  },
});

/**
 * Validate a school code without requiring authentication.
 * Used during sign-up to verify the school code before form submission.
 */
export const validateSchoolCode = query({
  args: { schoolCode: v.string() },
  handler: async (ctx, { schoolCode }) => {
    const tenant = await ctx.db
      .query("tenants")
      .withIndex("by_schoolCode", (q) =>
        q.eq("schoolCode", schoolCode.toUpperCase()),
      )
      .unique();

    if (!tenant) {
      return { valid: false, schoolName: null };
    }

    return {
      valid: tenant.status === "active",
      schoolName: tenant.name,
    };
  },
});

/**
 * Create a new tenant (super admin only).
 */
export const createTenant = mutation({
  args: {
    name: v.string(),
    schoolCode: v.string(),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user || user.role !== "superAdmin") {
      throw new Error("Unauthorized: Super admin access required");
    }

    // Check for duplicate school code
    const existing = await ctx.db
      .query("tenants")
      .withIndex("by_schoolCode", (q) =>
        q.eq("schoolCode", args.schoolCode.toUpperCase()),
      )
      .unique();

    if (existing) {
      throw new Error("A school with this code already exists.");
    }

    const tenantId = await ctx.db.insert("tenants", {
      name: args.name,
      schoolCode: args.schoolCode.toUpperCase(),
      address: args.address,
      phone: args.phone,
      email: args.email,
      status: "active",
      createdAt: Date.now(),
    });

    return { tenantId };
  },
});
