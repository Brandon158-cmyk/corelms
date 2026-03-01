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
  if (!user || !user.tenantId) {
    return null;
  }

  return user.tenantId;
}

/**
 * Create a new assessment header.
 */
export const createAssessment = mutation({
  args: {
    classId: v.id("classes"),
    subjectId: v.id("subjects"),
    termId: v.id("terms"),
    title: v.string(),
    type: v.union(
      v.literal("assignment"),
      v.literal("quiz"),
      v.literal("exam"),
      v.literal("project"),
    ),
    totalScore: v.number(),
    date: v.number(),
  },
  handler: async (ctx, args) => {
    const tenantId = await enforceTenantAccess(ctx);
    if (!tenantId) throw new Error("Unauthorized: No tenant assigned");
    const teacherId = await getAuthUserId(ctx);
    if (!teacherId) throw new Error("Unauthorized");

    const assessmentId = await ctx.db.insert("assessments", {
      ...args,
      tenantId,
      teacherId,
      status: "published",
    });
    return assessmentId;
  },
});

/**
 * Get all assessments for a specific class and subject combination in a term.
 */
export const getAssessments = query({
  args: {
    classId: v.id("classes"),
    subjectId: v.id("subjects"),
    termId: v.id("terms"),
  },
  handler: async (ctx, args) => {
    const tenantId = await enforceTenantAccess(ctx);
    if (!tenantId) return [];

    let q = ctx.db
      .query("assessments")
      .withIndex("by_class_subject", (q: any) =>
        q.eq("classId", args.classId).eq("subjectId", args.subjectId),
      )
      .filter((q: any) => q.eq(q.field("tenantId"), tenantId))
      .filter((q: any) => q.eq(q.field("termId"), args.termId));

    return await q.collect();
  },
});

/**
 * Get all submitted marks for a given assessment.
 */
export const getMarks = query({
  args: {
    assessmentId: v.id("assessments"),
  },
  handler: async (ctx, args) => {
    const tenantId = await enforceTenantAccess(ctx);
    if (!tenantId) return [];

    // Verify the assessment belongs to this tenant
    const assessment = await ctx.db.get(args.assessmentId);
    if (!assessment || assessment.tenantId !== tenantId) {
      return [];
    }

    return await ctx.db
      .query("assessmentMarks")
      .withIndex("by_assessment", (q: any) =>
        q.eq("assessmentId", args.assessmentId),
      )
      .collect();
  },
});

/**
 * Bulk insert or update scores for students on a specific assessment.
 */
export const saveMarks = mutation({
  args: {
    assessmentId: v.id("assessments"),
    marks: v.array(
      v.object({
        studentId: v.id("users"),
        score: v.number(),
        comments: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const tenantId = await enforceTenantAccess(ctx);
    if (!tenantId) throw new Error("Unauthorized");

    // Verify the assessment belongs to this tenant
    const assessment = await ctx.db.get(args.assessmentId);
    if (!assessment || assessment.tenantId !== tenantId) {
      throw new Error("Unauthorized: Assessment not found or access denied");
    }

    // Fetch existing records for this assessment to know whether to patch or insert
    const existing = await ctx.db
      .query("assessmentMarks")
      .withIndex("by_assessment", (q: any) =>
        q.eq("assessmentId", args.assessmentId),
      )
      .collect();

    const existingMap = new Map();
    for (const record of existing) {
      existingMap.set(record.studentId, record._id);
    }

    const promises = args.marks.map(async (mark) => {
      const existingId = existingMap.get(mark.studentId);
      if (existingId) {
        return ctx.db.patch(existingId, {
          score: mark.score,
          comments: mark.comments,
        });
      } else {
        return ctx.db.insert("assessmentMarks", {
          assessmentId: args.assessmentId,
          studentId: mark.studentId,
          score: mark.score,
          comments: mark.comments,
        });
      }
    });

    await Promise.all(promises);
    return { success: true, updatedCount: args.marks.length };
  },
});
