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
 * Retrieves a student's expanded profile.
 * Returns null if the profile hasn't been created yet.
 */
export const getProfile = query({
  args: { studentId: v.id("users") },
  handler: async (ctx, { studentId }) => {
    const tenantId = await enforceTenantAccess(ctx);
    if (!tenantId) return null;

    // Verify the requested user belongs to the same tenant and is a student
    const studentUser = await ctx.db.get(studentId);
    if (!studentUser || studentUser.tenantId !== tenantId) {
      return null;
    }

    // Attempt to locate an existing profile
    const profile = await ctx.db
      .query("studentProfiles")
      .withIndex("by_user", (q: any) => q.eq("userId", studentId))
      .first();

    return profile;
  },
});

/**
 * Creates or updates a student's profile.
 * Performs an upsert operation based on the userId.
 */
export const updateProfile = mutation({
  args: {
    studentId: v.id("users"),
    dateOfBirth: v.optional(v.string()),
    gender: v.optional(v.union(v.literal("Male"), v.literal("Female"))),
    nrcNumber: v.optional(v.string()),
    birthCertificateOrUnder5Card: v.optional(v.string()),
    address: v.optional(v.string()),
    medicalConditions: v.optional(v.string()),
    allergies: v.optional(v.string()),
    emergencyContactName: v.optional(v.string()),
    emergencyContactPhone: v.optional(v.string()),
    emergencyContactRelation: v.optional(v.string()),
    guardianId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const tenantId = await enforceTenantAccess(ctx);
    const { studentId, ...profileData } = args;

    if (!tenantId) {
      throw new Error("Cannot modify profile without a tenant");
    }

    // Ensure the updater has rights to update this profile
    const currentUser = await ctx.db.get(
      (await getAuthUserId(ctx)) as Id<"users">,
    );
    const targetStudent = await ctx.db.get(studentId);

    if (!targetStudent || targetStudent.tenantId !== tenantId) {
      throw new Error("Student not found or cross-tenant access denied.");
    }

    const adminRoles = ["superAdmin", "proprietor", "headteacher", "teacher"];
    const isSelf = currentUser?._id === studentId;
    const isAdmin = adminRoles.includes(currentUser?.role ?? "");
    const isGuardian = false; // Could check if targetStudent has guardianId == currentUser._id

    if (!isSelf && !isAdmin && !isGuardian) {
      throw new Error("Unauthorized to edit this profile.");
    }

    const existingProfile = await ctx.db
      .query("studentProfiles")
      .withIndex("by_user", (q: any) => q.eq("userId", studentId))
      .first();

    if (existingProfile) {
      // Update
      await ctx.db.patch(existingProfile._id, profileData);
      return existingProfile._id;
    } else {
      // Create
      return await ctx.db.insert("studentProfiles", {
        ...profileData,
        userId: studentId,
        tenantId,
      });
    }
  },
});

/**
 * Lists all students in the tenant, joining basic profile data and class data.
 * Used for the Student Directory view.
 */
export const listStudents = query({
  args: {
    classId: v.optional(v.id("classes")),
  },
  handler: async (ctx, args) => {
    const tenantId = await enforceTenantAccess(ctx);
    if (!tenantId) return [];

    let usersQuery = ctx.db
      .query("users")
      .withIndex("by_tenant_role", (q: any) =>
        q.eq("tenantId", tenantId).eq("role", "student"),
      );

    const students = await usersQuery.collect();

    // Filter by class if requested
    let filteredStudents = students;
    if (args.classId) {
      filteredStudents = students.filter((s) => s.classId === args.classId);
    }

    return Promise.all(
      filteredStudents.map(async (student: any) => {
        let className = "Unassigned";
        let gradeName = "Unknown";

        if (student.classId) {
          const cls = (await ctx.db.get(student.classId)) as any;
          if (cls) {
            className = cls.name;
            const grade = (await ctx.db.get(cls.gradeId)) as any;
            if (grade) {
              gradeName = grade.name;
            }
          }
        }

        const profile = await ctx.db
          .query("studentProfiles")
          .withIndex("by_user", (q: any) => q.eq("userId", student._id))
          .first();

        let guardian = null;
        if (profile?.guardianId) {
          guardian = await ctx.db.get(profile.guardianId);
        }

        return {
          id: student._id,
          name: student.name || "Unknown Student",
          email: student.email,
          phone: student.phone,
          status: student.status || "active",
          className,
          gradeName,
          classId: student.classId,
          profileId: profile?._id,
          gender: profile?.gender,
          guardianName: guardian?.name,
        };
      }),
    );
  },
});
/**
 * Returns the total count of students in the tenant.
 */
export const countStudents = query({
  args: {},
  handler: async (ctx) => {
    const tenantId = await enforceTenantAccess(ctx);
    if (!tenantId) return 0;

    const students = await ctx.db
      .query("users")
      .withIndex("by_tenant_role", (q: any) =>
        q.eq("tenantId", tenantId).eq("role", "student"),
      )
      .collect();

    return students.length;
  },
});
