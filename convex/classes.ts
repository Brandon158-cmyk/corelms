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

  return {
    tenantId: user.tenantId,
    role: user.role || "student",
    userId: user._id,
  };
}

/**
 * List all classes for the current user's tenant.
 * Optionally filter by termIds (array) or yearIds (array).
 */
export const list = query({
  args: {
    termIds: v.optional(v.array(v.id("terms"))),
    yearIds: v.optional(v.array(v.id("academicYears"))),
  },
  handler: async (ctx, args) => {
    const access = await enforceTenantAccess(ctx);

    // Super admins without a tenantId yet (e.g. initial setup) won't have classes
    if (!access) return [];
    const { tenantId } = access;

    const classes = await ctx.db
      .query("classes")
      .withIndex("by_tenant", (q: any) => q.eq("tenantId", tenantId))
      .collect();

    // Apply term filter if provided
    let filtered = classes;

    if (args.termIds && args.termIds.length > 0) {
      // Filter by specific term IDs
      filtered = classes.filter(
        (cls: any) => cls.termId && args.termIds!.includes(cls.termId),
      );
    } else if (args.yearIds && args.yearIds.length > 0) {
      // Filter by year IDs — need to resolve which terms belong to those years
      const allTerms = await ctx.db
        .query("terms")
        .withIndex("by_tenant", (q: any) => q.eq("tenantId", tenantId))
        .collect();

      const termIdsInYears = allTerms
        .filter((t: any) => args.yearIds!.includes(t.yearId))
        .map((t: any) => t._id);

      filtered = classes.filter(
        (cls: any) => cls.termId && termIdsInYears.includes(cls.termId),
      );
    }

    return Promise.all(
      filtered.map(async (cls: any) => {
        const grade = (await ctx.db.get(cls.gradeId)) as any;
        let termName = null;
        let yearName = null;
        if (cls.termId) {
          const term = (await ctx.db.get(cls.termId)) as any;
          if (term) {
            termName = term.name;
            const year = (await ctx.db.get(term.yearId)) as any;
            yearName = year?.name || null;
          }
        }
        return {
          ...cls,
          gradeName: grade?.name || "Unknown Grade",
          termName,
          yearName,
        };
      }),
    );
  },
});

export const create = mutation({
  args: {
    gradeId: v.id("grades"),
    termId: v.optional(v.id("terms")),
    name: v.string(),
    description: v.optional(v.string()),
    teacherId: v.optional(v.id("users")),
    room: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("archived")),
  },
  handler: async (ctx, args) => {
    const access = await enforceTenantAccess(ctx);
    if (!access) {
      throw new Error("Cannot create class without a tenant");
    }
    const { tenantId, role } = access;

    // RBAC: Only authorized roles can create classes
    const allowedRoles = ["superAdmin", "proprietor", "headteacher"];
    if (!allowedRoles.includes(role)) {
      throw new Error("Unauthorized: Only administrators can create classes");
    }

    // Referential Integrity & Tenant Isolation: Grade
    const grade = await ctx.db.get(args.gradeId);
    if (!grade || grade.tenantId !== tenantId) {
      throw new Error("Invalid grade: Grade not found or unauthorized");
    }

    // Referential Integrity & Tenant Isolation: Term (if present)
    if (args.termId) {
      const term = await ctx.db.get(args.termId);
      if (!term || term.tenantId !== tenantId) {
        throw new Error("Invalid term: Term not found or unauthorized");
      }
    }

    // Referential Integrity & Tenant Isolation: Teacher (if present)
    if (args.teacherId) {
      const teacher = await ctx.db.get(args.teacherId);
      if (
        !teacher ||
        teacher.tenantId !== tenantId ||
        teacher.role !== "teacher"
      ) {
        throw new Error("Invalid teacher: Teacher not found or unauthorized");
      }
    }

    const newClassId = await ctx.db.insert("classes", {
      ...args,
      tenantId,
    });
    return newClassId;
  },
});

export const get = query({
  args: { classId: v.id("classes") },
  handler: async (ctx, { classId }) => {
    const access = await enforceTenantAccess(ctx);
    if (!access) return null;
    const { tenantId } = access;

    const cls = await ctx.db.get(classId);
    if (!cls || cls.tenantId !== tenantId) return null;

    const grade = (await ctx.db.get(cls.gradeId)) as any;
    let termName = null;
    let yearName = null;
    if (cls.termId) {
      const term = (await ctx.db.get(cls.termId)) as any;
      if (term) {
        termName = term.name;
        const year = (await ctx.db.get(term.yearId)) as any;
        yearName = year?.name || null;
      }
    }

    return {
      ...cls,
      gradeName: grade?.name || "Unknown Grade",
      termName,
      yearName,
    };
  },
});

export const getSubjects = query({
  args: { classId: v.id("classes") },
  handler: async (ctx, { classId }) => {
    const access = await enforceTenantAccess(ctx);
    if (!access) return [];
    const { tenantId } = access;

    // Verify class ownership
    const cls = await ctx.db.get(classId);
    if (!cls || cls.tenantId !== tenantId) return [];

    const classSubjects = await ctx.db
      .query("classSubjects")
      .withIndex("by_class", (q: any) => q.eq("classId", classId))
      .collect();

    return Promise.all(
      classSubjects.map(async (cs: any) => {
        const subject = (await ctx.db.get(cs.subjectId)) as any;
        const teacher = cs.teacherId
          ? ((await ctx.db.get(cs.teacherId)) as any)
          : null;
        return {
          ...cs,
          subjectName: subject?.name || "Unknown Subject",
          teacherName: teacher?.name || "Unassigned",
        };
      }),
    );
  },
});

export const addSubject = mutation({
  args: {
    classId: v.id("classes"),
    subjectId: v.id("subjects"),
    teacherId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const access = await enforceTenantAccess(ctx);
    if (!access) throw new Error("Unauthorized");
    const { tenantId } = access;

    // Verify class ownership
    const cls = await ctx.db.get(args.classId);
    if (!cls || cls.tenantId !== tenantId) {
      throw new Error("Class not found or unauthorized");
    }

    // Verify subject ownership
    const subject = await ctx.db.get(args.subjectId);
    if (!subject || subject.tenantId !== tenantId) {
      throw new Error("Subject not found or unauthorized");
    }

    // Verify teacher ownership if provided
    if (args.teacherId) {
      const teacher = await ctx.db.get(args.teacherId);
      if (
        !teacher ||
        teacher.tenantId !== tenantId ||
        teacher.role !== "teacher"
      ) {
        throw new Error("Teacher not found or unauthorized");
      }
    }

    // Check if subject is already added to this class
    const existing = await ctx.db
      .query("classSubjects")
      .withIndex("by_class", (q: any) => q.eq("classId", args.classId))
      .filter((q: any) => q.eq(q.field("subjectId"), args.subjectId))
      .first();

    if (existing) {
      throw new Error("This subject is already assigned to this class.");
    }

    await ctx.db.insert("classSubjects", {
      classId: args.classId,
      subjectId: args.subjectId,
      teacherId: args.teacherId,
    });
    return { success: true };
  },
});

export const removeSubject = mutation({
  args: { classSubjectId: v.id("classSubjects") },
  handler: async (ctx, { classSubjectId }) => {
    const access = await enforceTenantAccess(ctx);
    if (!access) throw new Error("Unauthorized");
    const { tenantId } = access;

    // Verify record exists and belongs to this tenant
    const association = await ctx.db.get(classSubjectId);
    if (!association) {
      throw new Error("Association not found");
    }

    const cls = await ctx.db.get(association.classId);
    if (!cls || cls.tenantId !== tenantId) {
      throw new Error("Unauthorized access to class subject");
    }

    await ctx.db.delete(classSubjectId);
    return { success: true };
  },
});

export const getStudents = query({
  args: { classId: v.id("classes") },
  handler: async (ctx, { classId }) => {
    const access = await enforceTenantAccess(ctx);
    if (!access) return [];
    const { tenantId } = access;

    // Verify class ownership
    const cls = await ctx.db.get(classId);
    if (!cls || cls.tenantId !== tenantId) return [];

    return await ctx.db
      .query("users")
      .withIndex("by_class", (q: any) => q.eq("classId", classId))
      .collect();
  },
});

export const enrollStudent = mutation({
  args: {
    classId: v.id("classes"),
    studentId: v.id("users"),
  },
  handler: async (ctx, { classId, studentId }) => {
    const access = await enforceTenantAccess(ctx);
    if (!access) throw new Error("Unauthorized");
    const { tenantId } = access;

    // Verify class ownership
    const cls = await ctx.db.get(classId);
    if (!cls || cls.tenantId !== tenantId) {
      throw new Error("Class not found or unauthorized");
    }

    const student = await ctx.db.get(studentId);
    if (!student || student.tenantId !== tenantId) {
      throw new Error("Student not found or unauthorized.");
    }

    if (student.role !== "student") {
      throw new Error("Only users with the student role can be enrolled.");
    }

    await ctx.db.patch(studentId, { classId });
    return { success: true };
  },
});

export const removeStudent = mutation({
  args: {
    studentId: v.id("users"),
  },
  handler: async (ctx, { studentId }) => {
    const access = await enforceTenantAccess(ctx);
    if (!access) throw new Error("Unauthorized");
    const { tenantId } = access;

    const student = await ctx.db.get(studentId);
    if (!student || student.tenantId !== tenantId) {
      throw new Error("Student not found or unauthorized.");
    }

    // Set classId to undefined instead of null since it's v.optional
    await ctx.db.patch(studentId, { classId: undefined });
    return { success: true };
  },
});

export const getUnassignedStudents = query({
  args: {},
  handler: async (ctx) => {
    const access = await enforceTenantAccess(ctx);
    if (!access) return [];
    const { tenantId } = access;

    // To get unassigned students, we either query all students and filter locally
    // or use the by_tenant index and filter for missing classId.
    const allTenantUsers = await ctx.db
      .query("users")
      .withIndex("by_tenant", (q: any) => q.eq("tenantId", tenantId))
      .filter((q: any) => q.eq(q.field("role"), "student"))
      .collect();

    return allTenantUsers.filter((u) => !u.classId);
  },
});
