import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

/**
 * Get the currently authenticated user with their tenant data.
 * Returns null if not authenticated.
 */
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    // Fetch tenant data if user has a tenantId
    let tenant = null;
    if (user.tenantId) {
      tenant = await ctx.db.get(user.tenantId);
    }

    return {
      ...user,
      tenant,
    };
  },
});

/**
 * Get a user by their ID (admin-only, for management views).
 */
export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const currentUserId = await auth.getUserId(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    return await ctx.db.get(userId);
  },
});

/**
 * Update the current user's profile information.
 */
export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const updates: Record<string, string> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.phone !== undefined) updates.phone = args.phone;

    await ctx.db.patch(userId, updates);
    return { success: true };
  },
});

/**
 * List all users for the current authenticated user's tenant.
 * Used for the Users management datatable.
 */
export const listTenantUsers = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user || (!user.tenantId && user.role !== "superAdmin")) {
      return [];
    }

    // List all users in this tenant
    return await ctx.db
      .query("users")
      .withIndex("by_tenant", (q) => q.eq("tenantId", user.tenantId as any))
      .collect();
  },
});

/**
 * Link a user to a tenant using a school code.
 * Called during or after sign-up to associate the user with a school.
 */
export const linkUserToTenant = mutation({
  args: {
    schoolCode: v.string(),
    role: v.optional(v.string()),
  },
  handler: async (ctx, { schoolCode, role }) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Find the tenant by school code
    const tenant = await ctx.db
      .query("tenants")
      .withIndex("by_schoolCode", (q) =>
        q.eq("schoolCode", schoolCode.toUpperCase()),
      )
      .unique();

    if (!tenant) {
      throw new Error(
        "Invalid school code. Please check with your school administrator.",
      );
    }

    if (tenant.status !== "active") {
      throw new Error("This school is currently not accepting registrations.");
    }

    // Link user to tenant
    const updates: Record<string, unknown> = { tenantId: tenant._id };
    if (role) updates.role = role;

    await ctx.db.patch(userId, updates);

    return { success: true, schoolName: tenant.name };
  },
});
