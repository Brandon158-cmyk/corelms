import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

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
 * Ensures the updater has administrative or teaching rights.
 */
async function checkAdminOrTeacher(ctx: any): Promise<boolean> {
  const userId = await getAuthUserId(ctx);
  if (!userId) return false;

  const user = await ctx.db.get(userId);
  const allowedRoles = ["superAdmin", "proprietor", "headteacher", "teacher"];
  return allowedRoles.includes(user?.role ?? "");
}

// ==========================================
// DISCIPLINE (BEHAVIORAL MANAGEMENT)
// ==========================================

export const logDiscipline = mutation({
  args: {
    studentId: v.id("users"),
    date: v.string(),
    category: v.union(
      v.literal("minor"),
      v.literal("moderate"),
      v.literal("severe"),
    ),
    infraction: v.string(),
    pointsDeducted: v.number(),
    restorativeAction: v.optional(v.string()),
    status: v.union(
      v.literal("open"),
      v.literal("resolved"),
      v.literal("escalated"),
    ),
  },
  handler: async (ctx, args) => {
    const tenantId = await enforceTenantAccess(ctx);
    if (!tenantId) throw new Error("Unauthorized tenant access.");

    const reporterId = await getAuthUserId(ctx);
    if (!reporterId) throw new Error("Not authenticated.");

    const hasClearance = await checkAdminOrTeacher(ctx);
    if (!hasClearance) {
      throw new Error(
        "Unauthorized role. Only staff can log disciplinary infractions.",
      );
    }

    // Verify student belongs to this tenant
    const student = await ctx.db.get(args.studentId);
    if (!student || student.tenantId !== tenantId) {
      throw new Error("Student not found.");
    }

    return await ctx.db.insert("disciplineLogs", {
      tenantId,
      reporterId: reporterId as Id<"users">,
      studentId: args.studentId,
      date: args.date,
      category: args.category,
      infraction: args.infraction,
      pointsDeducted: args.pointsDeducted,
      restorativeAction: args.restorativeAction,
      status: args.status,
    });
  },
});

export const getDisciplineByStudent = query({
  args: { studentId: v.id("users") },
  handler: async (ctx, { studentId }) => {
    const tenantId = await enforceTenantAccess(ctx);
    if (!tenantId) return [];

    // Verify student belongs to the same tenant
    const student = await ctx.db.get(studentId);
    if (!student || student.tenantId !== tenantId) {
      return [];
    }

    const logs = await ctx.db
      .query("disciplineLogs")
      .withIndex("by_student", (q: any) => q.eq("studentId", studentId))
      .order("desc")
      .collect();

    // Fetch reporter names
    return Promise.all(
      logs.map(async (log: any) => {
        const reporter = (await ctx.db.get(log.reporterId)) as any;
        return {
          ...log,
          reporterName: reporter?.name || "Unknown Staff",
        };
      }),
    );
  },
});

export const listRecentDiscipline = query({
  args: {},
  handler: async (ctx) => {
    const tenantId = await enforceTenantAccess(ctx);
    if (!tenantId) return [];

    let logs = await ctx.db
      .query("disciplineLogs")
      .withIndex("by_tenant", (q: any) => q.eq("tenantId", tenantId))
      .order("desc") // Note: Convex default .order("desc") sorts by _creationTime, not custom date.
      .take(50);

    return Promise.all(
      logs.map(async (log: any) => {
        const student = (await ctx.db.get(log.studentId)) as any;
        const reporter = (await ctx.db.get(log.reporterId)) as any;
        return {
          ...log,
          studentName: student?.name || "Unknown Student",
          reporterName: reporter?.name || "Unknown Staff",
        };
      }),
    );
  },
});

// ==========================================
// SPECIAL EDUCATIONAL NEEDS (SEN)
// ==========================================

export const submitSENAssessment = mutation({
  args: {
    studentId: v.id("users"),
    date: v.string(),
    visualScore: v.number(),
    hearingScore: v.number(),
    intellectualScore: v.number(),
    notes: v.optional(v.string()),
    status: v.union(v.literal("draft"), v.literal("submitted")),
  },
  handler: async (ctx, args) => {
    const tenantId = await enforceTenantAccess(ctx);
    if (!tenantId) throw new Error("Unauthorized tenant access.");

    const authorId = await getAuthUserId(ctx);
    if (!authorId) throw new Error("Not authenticated.");

    const hasClearance = await checkAdminOrTeacher(ctx);
    if (!hasClearance) {
      throw new Error(
        "Unauthorized role. Only staff can submit SEN assessments.",
      );
    }

    const student = await ctx.db.get(args.studentId);
    if (!student || student.tenantId !== tenantId) {
      throw new Error("Student not found.");
    }

    const totalScore =
      args.visualScore + args.hearingScore + args.intellectualScore;
    // Per system.md Section 6.2 requirement: Total <= 14 flags the learner
    const flagged = totalScore <= 14;

    return await ctx.db.insert("senAssessments", {
      tenantId,
      authorId: authorId as Id<"users">,
      studentId: args.studentId,
      date: args.date,
      visualScore: args.visualScore,
      hearingScore: args.hearingScore,
      intellectualScore: args.intellectualScore,
      totalScore,
      flagged,
      notes: args.notes,
      status: args.status,
    });
  },
});

export const getSENByStudent = query({
  args: { studentId: v.id("users") },
  handler: async (ctx, { studentId }) => {
    const tenantId = await enforceTenantAccess(ctx);
    if (!tenantId) return [];

    // Verify student belongs to the same tenant
    const student = await ctx.db.get(studentId);
    if (!student || student.tenantId !== tenantId) {
      return [];
    }

    const assessments = await ctx.db
      .query("senAssessments")
      .withIndex("by_student", (q: any) => q.eq("studentId", studentId))
      .order("desc")
      .collect();

    // Fetch author names
    return Promise.all(
      assessments.map(async (assessment: any) => {
        const author = (await ctx.db.get(assessment.authorId)) as any;
        return {
          ...assessment,
          authorName: author?.name || "Unknown Staff",
        };
      }),
    );
  },
});

export const listSENAlerts = query({
  args: {},
  handler: async (ctx) => {
    const tenantId = await enforceTenantAccess(ctx);
    if (!tenantId) return [];

    let assessments = await ctx.db
      .query("senAssessments")
      .withIndex("by_tenant", (q: any) => q.eq("tenantId", tenantId))
      .filter((q: any) => q.eq(q.field("flagged"), true))
      .order("desc")
      .take(20);

    return Promise.all(
      assessments.map(async (assessment: any) => {
        const student = (await ctx.db.get(assessment.studentId)) as any;
        return {
          ...assessment,
          studentName: student?.name || "Unknown Student",
        };
      }),
    );
  },
});
