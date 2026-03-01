import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Ensures the currently authenticated user belongs to the requested tenant.
 * Returns the user's identity and permissions for RBAC enforcement.
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

  return {
    tenantId: user.tenantId,
    role: user.role || "student",
    userId: user._id,
  };
}

/**
 * Get attendance records for a specific class, date, and optional subject.
 */
export const getClassAttendance = query({
  args: {
    classId: v.id("classes"),
    date: v.string(),
    subjectId: v.optional(v.id("subjects")),
  },
  handler: async (ctx, args) => {
    const access = await enforceTenantAccess(ctx);
    if (!access) return [];
    const { tenantId } = access;

    let q = ctx.db
      .query("attendance")
      .withIndex("by_class_date", (q: any) =>
        q.eq("classId", args.classId).eq("date", args.date),
      )
      .filter((q: any) => q.eq(q.field("tenantId"), tenantId));

    const records = await q.collect();

    // Filter by subjectId if provided, otherwise filter where subjectId is undefined/null
    if (args.subjectId) {
      return records.filter((r: any) => r.subjectId === args.subjectId);
    } else {
      return records.filter((r: any) => !r.subjectId);
    }
  },
});

/**
 * Bulk insert or update attendance records for a class on a specific date.
 */
export const markClassAttendance = mutation({
  args: {
    classId: v.id("classes"),
    date: v.string(),
    subjectId: v.optional(v.id("subjects")),
    records: v.array(
      v.object({
        studentId: v.id("users"),
        status: v.union(
          v.literal("present"),
          v.literal("absent"),
          v.literal("late"),
          v.literal("excused"),
        ),
        notes: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const access = await enforceTenantAccess(ctx);
    if (!access) throw new Error("Unauthorized: No tenant assigned");
    const { tenantId, role, userId } = access;

    const allowedRoles = ["superAdmin", "proprietor", "headteacher", "teacher"];
    if (!allowedRoles.includes(role)) {
      throw new Error("Unauthorized to mark attendance");
    }

    // Fetch existing records for this class/date
    let q = ctx.db
      .query("attendance")
      .withIndex("by_class_date", (q: any) =>
        q.eq("classId", args.classId).eq("date", args.date),
      )
      .filter((q: any) => q.eq(q.field("tenantId"), tenantId));

    const existingRecordsAll = await q.collect();

    // Filter to the specific context (daily vs subject)
    const existingRecords = args.subjectId
      ? existingRecordsAll.filter((r: any) => r.subjectId === args.subjectId)
      : existingRecordsAll.filter((r: any) => !r.subjectId);

    // Create a map of studentId -> existing record ID
    const existingMap = new Map();
    for (const record of existingRecords) {
      existingMap.set(record.studentId, record._id);
    }

    // Process all incoming records
    const promises = args.records.map(async (record) => {
      const existingId = existingMap.get(record.studentId);

      if (existingId) {
        // Update existing record
        return ctx.db.patch(existingId, {
          status: record.status,
          notes: record.notes,
          markedBy: userId,
        });
      } else {
        // Insert new record
        return ctx.db.insert("attendance", {
          tenantId,
          classId: args.classId,
          subjectId: args.subjectId,
          studentId: record.studentId,
          date: args.date,
          status: record.status,
          notes: record.notes,
          markedBy: userId,
        });
      }
    });

    await Promise.all(promises);
    return { success: true, count: args.records.length };
  },
});
