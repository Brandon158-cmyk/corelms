import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";
import { Id } from "./_generated/dataModel";

/**
 * Ensures the currently authenticated user belongs to a tenant.
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
 * List all terms for the current user's tenant.
 * Optionally filter by yearId.
 */
export const list = query({
  args: {
    yearId: v.optional(v.id("academicYears")),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user || !user.tenantId) return [];

    let terms;
    if (args.yearId) {
      terms = await ctx.db
        .query("terms")
        .withIndex("by_year", (q: any) => q.eq("yearId", args.yearId))
        .collect();
    } else {
      terms = await ctx.db
        .query("terms")
        .withIndex("by_tenant", (q: any) => q.eq("tenantId", user.tenantId))
        .collect();
    }

    // Enrich with year name
    const enriched = await Promise.all(
      terms.map(async (term: any) => {
        const year = (await ctx.db.get(term.yearId)) as any;
        return {
          ...term,
          yearName: year?.name || "Unknown Year",
        };
      }),
    );

    // Sort by startDate ascending
    return enriched.sort((a: any, b: any) => a.startDate - b.startDate);
  },
});

/**
 * Get a specific term by ID.
 */
export const get = query({
  args: { termId: v.id("terms") },
  handler: async (ctx, { termId }) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    const term = await ctx.db.get(termId);

    if (!term || term.tenantId !== user?.tenantId) {
      throw new Error("Term not found or unauthorized");
    }

    const year = await ctx.db.get(term.yearId);
    return {
      ...term,
      yearName: year?.name || "Unknown Year",
    };
  },
});

/**
 * Get the currently active term for this tenant.
 */
export const getActiveTerm = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user || !user.tenantId) return null;

    const terms = await ctx.db
      .query("terms")
      .withIndex("by_tenant", (q: any) => q.eq("tenantId", user.tenantId))
      .collect();

    const activeTerm = terms.find((t: any) => t.isCurrent);
    if (!activeTerm) return null;

    const year = await ctx.db.get(activeTerm.yearId);
    return {
      ...activeTerm,
      yearName: year?.name || "Unknown Year",
    };
  },
});

/**
 * Create a new term within an academic year.
 */
export const create = mutation({
  args: {
    yearId: v.id("academicYears"),
    name: v.string(),
    startDate: v.number(),
    endDate: v.number(),
    isCurrent: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { tenantId, role } = await getTenantUser(ctx);

    if (role !== "management" && role !== "superAdmin") {
      throw new Error("Unauthorized to create terms");
    }

    // Verify the year belongs to this tenant
    const year = await ctx.db.get(args.yearId);
    if (!year || year.tenantId !== tenantId) {
      throw new Error("Academic year not found or unauthorized");
    }

    // If setting as current, unset all others first
    if (args.isCurrent) {
      const existing = await ctx.db
        .query("terms")
        .withIndex("by_tenant", (q: any) => q.eq("tenantId", tenantId))
        .collect();

      for (const term of existing) {
        if (term.isCurrent) {
          await ctx.db.patch(term._id, { isCurrent: false });
        }
      }
    }

    const termId = await ctx.db.insert("terms", {
      tenantId,
      yearId: args.yearId,
      name: args.name,
      startDate: args.startDate,
      endDate: args.endDate,
      isCurrent: args.isCurrent ?? false,
    });

    return termId;
  },
});

/**
 * Update an existing term.
 */
export const update = mutation({
  args: {
    termId: v.id("terms"),
    name: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    isCurrent: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { tenantId, role } = await getTenantUser(ctx);

    if (role !== "management" && role !== "superAdmin") {
      throw new Error("Unauthorized to update terms");
    }

    const term = await ctx.db.get(args.termId);
    if (!term || term.tenantId !== tenantId) {
      throw new Error("Term not found or unauthorized");
    }

    // If setting as current, unset all others first
    if (args.isCurrent) {
      const existing = await ctx.db
        .query("terms")
        .withIndex("by_tenant", (q: any) => q.eq("tenantId", tenantId))
        .collect();

      for (const t of existing) {
        if (t.isCurrent && t._id !== args.termId) {
          await ctx.db.patch(t._id, { isCurrent: false });
        }
      }
    }

    const updates: any = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.startDate !== undefined) updates.startDate = args.startDate;
    if (args.endDate !== undefined) updates.endDate = args.endDate;
    if (args.isCurrent !== undefined) updates.isCurrent = args.isCurrent;

    await ctx.db.patch(args.termId, updates);
    return { success: true };
  },
});

/**
 * Delete a term.
 */
export const remove = mutation({
  args: { termId: v.id("terms") },
  handler: async (ctx, { termId }) => {
    const { tenantId, role } = await getTenantUser(ctx);

    if (role !== "management" && role !== "superAdmin") {
      throw new Error("Unauthorized to delete terms");
    }

    const term = await ctx.db.get(termId);
    if (!term || term.tenantId !== tenantId) {
      throw new Error("Term not found or unauthorized");
    }

    await ctx.db.delete(termId);
    return { success: true };
  },
});
