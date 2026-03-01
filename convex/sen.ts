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

// ─── Classification Logic ───────────────────────────────────────────────

function classify(
  totalScore: number,
): "no-challenges" | "monitor" | "suspected-disability" {
  if (totalScore >= 25) return "no-challenges";
  if (totalScore >= 15) return "monitor";
  return "suspected-disability";
}

// ─── Screenings ─────────────────────────────────────────────────────────

export const listScreenings = query({
  args: {},
  handler: async (ctx) => {
    const { tenantId } = await enforceTenantAccess(ctx);
    const screenings = await ctx.db
      .query("senScreenings")
      .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
      .order("desc")
      .collect();

    return await Promise.all(
      screenings.map(async (s) => {
        const student = await ctx.db.get(s.studentId);
        const screener = await ctx.db.get(s.screenedBy);
        return {
          ...s,
          studentName: student?.name || "Unknown",
          screenedByName: screener?.name || "Unknown",
        };
      }),
    );
  },
});

export const getScreening = query({
  args: { id: v.id("senScreenings") },
  handler: async (ctx, { id }) => {
    await enforceTenantAccess(ctx);
    const screening = await ctx.db.get(id);
    if (!screening) return null;

    const student = await ctx.db.get(screening.studentId);
    const screener = await ctx.db.get(screening.screenedBy);

    // Find associated referral
    const referral = await ctx.db
      .query("senReferrals")
      .withIndex("by_student", (q) => q.eq("studentId", screening.studentId))
      .filter((q) => q.eq(q.field("screeningId"), id))
      .first();

    return {
      ...screening,
      studentName: student?.name || "Unknown",
      screenedByName: screener?.name || "Unknown",
      referral: referral || null,
    };
  },
});

export const submitScreening = mutation({
  args: {
    studentId: v.id("users"),
    date: v.string(),
    domains: v.object({
      visual: v.number(),
      hearing: v.number(),
      intellectual: v.number(),
      physical: v.number(),
    }),
    notes: v.optional(v.string()),
    termId: v.optional(v.id("terms")),
  },
  handler: async (ctx, args) => {
    const { tenantId, userId } = await enforceTenantAccess(ctx);

    const totalScore =
      args.domains.visual +
      args.domains.hearing +
      args.domains.intellectual +
      args.domains.physical;

    const classification = classify(totalScore);

    const screeningId = await ctx.db.insert("senScreenings", {
      tenantId,
      studentId: args.studentId,
      screenedBy: userId,
      date: args.date,
      domains: args.domains,
      totalScore,
      classification,
      notes: args.notes,
      termId: args.termId,
    });

    // Auto-create referral if suspected disability
    if (classification === "suspected-disability") {
      await ctx.db.insert("senReferrals", {
        tenantId,
        screeningId,
        studentId: args.studentId,
        referredTo: "SENCO / District Inclusive Education Team",
        status: "pending",
        iepAttached: false,
        createdAt: Date.now(),
      });
    }

    return { screeningId, totalScore, classification };
  },
});

// ─── Referrals ──────────────────────────────────────────────────────────

export const listReferrals = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const { tenantId } = await enforceTenantAccess(ctx);
    let referrals = await ctx.db
      .query("senReferrals")
      .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
      .collect();

    if (args.status) {
      referrals = referrals.filter((r) => r.status === args.status);
    }

    return await Promise.all(
      referrals.map(async (r) => {
        const student = await ctx.db.get(r.studentId);
        const screening = await ctx.db.get(r.screeningId);
        return {
          ...r,
          studentName: student?.name || "Unknown",
          totalScore: screening?.totalScore || 0,
          classification: screening?.classification || "unknown",
        };
      }),
    );
  },
});

export const updateReferral = mutation({
  args: {
    id: v.id("senReferrals"),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("in-progress"),
        v.literal("completed"),
      ),
    ),
    iepAttached: v.optional(v.boolean()),
    notes: v.optional(v.string()),
    referredTo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await enforceTenantAccess(ctx);
    const { id, ...updates } = args;
    const patch: any = {};
    if (updates.status !== undefined) patch.status = updates.status;
    if (updates.iepAttached !== undefined)
      patch.iepAttached = updates.iepAttached;
    if (updates.notes !== undefined) patch.notes = updates.notes;
    if (updates.referredTo !== undefined) patch.referredTo = updates.referredTo;

    await ctx.db.patch(id, patch);
  },
});
