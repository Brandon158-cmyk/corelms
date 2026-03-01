import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

/**
 * List all grades for the current user's tenant.
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user || !user.tenantId) return [];

    return await ctx.db
      .query("grades")
      .withIndex("by_tenant", (q) => q.eq("tenantId", user.tenantId as any))
      .collect();
  },
});

/**
 * Get a specific grade by ID.
 */
export const get = query({
  args: { gradeId: v.id("grades") },
  handler: async (ctx, { gradeId }) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    const grade = await ctx.db.get(gradeId);

    if (!grade || grade.tenantId !== user?.tenantId) {
      throw new Error("Grade not found or unauthorized");
    }

    return grade;
  },
});

/**
 * Create a new grade.
 * Only management or superAdmin can create a grade.
 */
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user || !user.tenantId) {
      throw new Error("User does not belong to a school");
    }

    if (user.role !== "management" && user.role !== "superAdmin") {
      throw new Error("Unauthorized to create grades");
    }

    const gradeId = await ctx.db.insert("grades", {
      tenantId: user.tenantId,
      name: args.name,
      description: args.description,
    });

    return gradeId;
  },
});

/**
 * Update an existing grade.
 */
export const update = mutation({
  args: {
    gradeId: v.id("grades"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    const grade = await ctx.db.get(args.gradeId);

    if (!grade || grade.tenantId !== user?.tenantId) {
      throw new Error("Grade not found or unauthorized");
    }

    if (user.role !== "management" && user.role !== "superAdmin") {
      throw new Error("Unauthorized to update grades");
    }

    const updates: any = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;

    await ctx.db.patch(args.gradeId, updates);
    return { success: true };
  },
});

/**
 * Delete a grade.
 * Note: Should ensure no classes are attached before allowing deletion in a real app,
 * or cascade delete. For now, basic deletion.
 */
export const remove = mutation({
  args: { gradeId: v.id("grades") },
  handler: async (ctx, { gradeId }) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    const grade = await ctx.db.get(gradeId);

    if (!grade || grade.tenantId !== user?.tenantId) {
      throw new Error("Grade not found or unauthorized");
    }

    if (user.role !== "management" && user.role !== "superAdmin") {
      throw new Error("Unauthorized to delete grades");
    }

    await ctx.db.delete(gradeId);
    return { success: true };
  },
});
