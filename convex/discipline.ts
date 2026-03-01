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
 * Log a new disciplinary incident.
 */
export const logIncident = mutation({
  args: {
    studentId: v.id("users"),
    date: v.number(),
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
    const { userId, tenantId, role } = await getTenantUser(ctx);

    // Verify student exists and belongs to the same tenant
    const student = await ctx.db.get(args.studentId);
    if (!student || student.tenantId !== tenantId) {
      throw new Error("Student not found or unauthorized");
    }

    const logId = await ctx.db.insert("disciplineLogs", {
      tenantId,
      studentId: args.studentId,
      reporterId: userId,
      date: args.date,
      category: args.category,
      infraction: args.infraction,
      pointsDeducted: args.pointsDeducted,
      restorativeAction: args.restorativeAction,
      status: args.status,
    });

    return logId;
  },
});

/**
 * Fetch disciplinary logs for a specific student.
 */
export const getStudentLogs = query({
  args: {
    studentId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { tenantId } = await getTenantUser(ctx);

    const logs = await ctx.db
      .query("disciplineLogs")
      .withIndex("by_student", (q: any) => q.eq("studentId", args.studentId))
      .filter((q: any) => q.eq(q.field("tenantId"), tenantId))
      .order("desc") // Newest first
      .collect();

    // Enrich with reporter's name
    const enriched = await Promise.all(
      logs.map(async (log: any) => {
        const reporter = await ctx.db.get(log.reporterId as Id<"users">);
        return {
          ...log,
          reporterName: reporter?.name || "Unknown Staff",
        };
      }),
    );

    return enriched;
  },
});

/**
 * Fetch disciplinary logs for the entire school for the main dashboard.
 */
export const getSchoolLogs = query({
  args: {
    limit: v.optional(v.number()), // e.g., only show recent 100 on dashboard
  },
  handler: async (ctx, args) => {
    const { tenantId } = await getTenantUser(ctx);

    const logs = await ctx.db
      .query("disciplineLogs")
      .withIndex("by_tenant", (q: any) => q.eq("tenantId", tenantId))
      .order("desc")
      .take(args.limit ?? 100);

    // Enrich with student and reporter names
    const enriched = await Promise.all(
      logs.map(async (log: any) => {
        const reporter = await ctx.db.get(log.reporterId as Id<"users">);
        const student = await ctx.db.get(log.studentId as Id<"users">);

        return {
          ...log,
          reporterName: reporter?.name || "Unknown Staff",
          studentName: student?.name || "Unknown Student",
        };
      }),
    );

    return enriched;
  },
});

/**
 * Update the status of a discipline log.
 */
export const updateIncidentStatus = mutation({
  args: {
    logId: v.id("disciplineLogs"),
    status: v.union(
      v.literal("open"),
      v.literal("resolved"),
      v.literal("escalated"),
    ),
    restorativeAction: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { tenantId, role } = await getTenantUser(ctx);

    if (!["superAdmin", "proprietor", "headteacher"].includes(role ?? "")) {
      throw new Error("Unauthorized to update incident statuses");
    }

    const log = await ctx.db.get(args.logId);
    if (!log || log.tenantId !== tenantId) {
      throw new Error("Log not found or unauthorized");
    }

    const updates: any = { status: args.status };
    if (args.restorativeAction !== undefined) {
      updates.restorativeAction = args.restorativeAction;
    }

    await ctx.db.patch(args.logId, updates);
    return { success: true };
  },
});
