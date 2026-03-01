import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

/**
 * List all subjects for the current user's tenant.
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user || !user.tenantId) return [];

    return await ctx.db
      .query("subjects")
      .withIndex("by_tenant", (q) => q.eq("tenantId", user.tenantId as any))
      .collect();
  },
});

/**
 * Get a specific subject by ID.
 */
export const get = query({
  args: { subjectId: v.id("subjects") },
  handler: async (ctx, { subjectId }) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    const subject = await ctx.db.get(subjectId);

    if (!subject || subject.tenantId !== user?.tenantId) {
      throw new Error("Subject not found or unauthorized");
    }

    return subject;
  },
});

/**
 * Create a new subject.
 * Only management or superAdmin can create a subject.
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

    if (!["superAdmin", "proprietor", "headteacher"].includes(user.role ?? "")) {
      throw new Error("Unauthorized to create subjects");
    }

    const subjectId = await ctx.db.insert("subjects", {
      tenantId: user.tenantId,
      name: args.name,
      description: args.description,
    });

    return subjectId;
  },
});

/**
 * Update an existing subject.
 */
export const update = mutation({
  args: {
    subjectId: v.id("subjects"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    const subject = await ctx.db.get(args.subjectId);

    if (!subject || subject.tenantId !== user?.tenantId) {
      throw new Error("Subject not found or unauthorized");
    }

    if (!["superAdmin", "proprietor", "headteacher"].includes(user.role ?? "")) {
      throw new Error("Unauthorized to update subjects");
    }

    const updates: any = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;

    await ctx.db.patch(args.subjectId, updates);
    return { success: true };
  },
});

/**
 * Delete a subject.
 */
export const remove = mutation({
  args: { subjectId: v.id("subjects") },
  handler: async (ctx, { subjectId }) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    const subject = await ctx.db.get(subjectId);

    if (!subject || subject.tenantId !== user?.tenantId) {
      throw new Error("Subject not found or unauthorized");
    }

    if (!["superAdmin", "proprietor", "headteacher"].includes(user.role ?? "")) {
      throw new Error("Unauthorized to delete subjects");
    }

    await ctx.db.delete(subjectId);
    return { success: true };
  },
});
