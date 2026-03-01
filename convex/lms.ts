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

// ─── Courses ────────────────────────────────────────────────────────────

export const listCourses = query({
  args: { classId: v.optional(v.id("classes")) },
  handler: async (ctx, args) => {
    const { tenantId } = await enforceTenantAccess(ctx);

    let courses;
    if (args.classId) {
      courses = await ctx.db
        .query("courses")
        .withIndex("by_class", (q) => q.eq("classId", args.classId!))
        .collect();
      courses = courses.filter((c) => c.tenantId === tenantId);
    } else {
      courses = await ctx.db
        .query("courses")
        .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
        .collect();
    }

    return await Promise.all(
      courses.map(async (course) => {
        const cls = await ctx.db.get(course.classId);
        const subject = await ctx.db.get(course.subjectId);
        const creator = await ctx.db.get(course.createdBy);
        const lessonCount = (
          await ctx.db
            .query("lessons")
            .withIndex("by_course", (q) => q.eq("courseId", course._id))
            .collect()
        ).length;
        return {
          ...course,
          className: cls?.name || "Unknown",
          subjectName: subject?.name || "Unknown",
          creatorName: creator?.name || "Unknown",
          lessonCount,
        };
      }),
    );
  },
});

export const getCourse = query({
  args: { id: v.id("courses") },
  handler: async (ctx, { id }) => {
    await enforceTenantAccess(ctx);
    const course = await ctx.db.get(id);
    if (!course) return null;

    const cls = await ctx.db.get(course.classId);
    const subject = await ctx.db.get(course.subjectId);
    const creator = await ctx.db.get(course.createdBy);

    const lessons = await ctx.db
      .query("lessons")
      .withIndex("by_course", (q) => q.eq("courseId", id))
      .collect();
    lessons.sort((a, b) => a.order - b.order);

    const assignments = await ctx.db
      .query("lmsAssignments")
      .withIndex("by_course", (q) => q.eq("courseId", id))
      .collect();

    return {
      ...course,
      className: cls?.name || "Unknown",
      subjectName: subject?.name || "Unknown",
      creatorName: creator?.name || "Unknown",
      lessons,
      assignments,
    };
  },
});

export const saveCourse = mutation({
  args: {
    id: v.optional(v.id("courses")),
    classId: v.id("classes"),
    subjectId: v.id("subjects"),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("archived")),
  },
  handler: async (ctx, args) => {
    const { tenantId, userId } = await enforceTenantAccess(ctx);
    const { id, ...data } = args;

    if (id) {
      await ctx.db.patch(id, data);
      return id;
    } else {
      return await ctx.db.insert("courses", {
        tenantId,
        createdBy: userId,
        ...data,
      });
    }
  },
});

// ─── Lessons ────────────────────────────────────────────────────────────

export const saveLesson = mutation({
  args: {
    id: v.optional(v.id("lessons")),
    courseId: v.id("courses"),
    title: v.string(),
    content: v.string(),
    order: v.number(),
    type: v.union(
      v.literal("lesson"),
      v.literal("quiz"),
      v.literal("resource"),
    ),
    attachmentUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await enforceTenantAccess(ctx);
    const { id, ...data } = args;

    if (id) {
      await ctx.db.patch(id, data);
      return id;
    } else {
      return await ctx.db.insert("lessons", data);
    }
  },
});

export const deleteLesson = mutation({
  args: { id: v.id("lessons") },
  handler: async (ctx, { id }) => {
    await enforceTenantAccess(ctx);
    await ctx.db.delete(id);
  },
});

// ─── Assignments ────────────────────────────────────────────────────────

export const listAssignments = query({
  args: { courseId: v.optional(v.id("courses")) },
  handler: async (ctx, args) => {
    const { tenantId } = await enforceTenantAccess(ctx);

    let assignments;
    if (args.courseId) {
      assignments = await ctx.db
        .query("lmsAssignments")
        .withIndex("by_course", (q) => q.eq("courseId", args.courseId!))
        .collect();
    } else {
      assignments = await ctx.db
        .query("lmsAssignments")
        .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
        .collect();
    }

    return await Promise.all(
      assignments.map(async (a) => {
        const course = await ctx.db.get(a.courseId);
        const submissions = await ctx.db
          .query("lmsSubmissions")
          .withIndex("by_assignment", (q) => q.eq("assignmentId", a._id))
          .collect();
        const gradedCount = submissions.filter(
          (s) => s.status === "graded",
        ).length;
        return {
          ...a,
          courseTitle: course?.title || "Unknown",
          submissionCount: submissions.length,
          gradedCount,
        };
      }),
    );
  },
});

export const saveAssignment = mutation({
  args: {
    id: v.optional(v.id("lmsAssignments")),
    courseId: v.id("courses"),
    title: v.string(),
    instructions: v.string(),
    dueDate: v.string(),
    totalMarks: v.number(),
    status: v.union(v.literal("open"), v.literal("closed")),
  },
  handler: async (ctx, args) => {
    const { tenantId, userId } = await enforceTenantAccess(ctx);
    const { id, ...data } = args;

    if (id) {
      await ctx.db.patch(id, data);
      return id;
    } else {
      return await ctx.db.insert("lmsAssignments", {
        tenantId,
        createdBy: userId,
        ...data,
      });
    }
  },
});

// ─── Submissions ────────────────────────────────────────────────────────

export const submitWork = mutation({
  args: {
    assignmentId: v.id("lmsAssignments"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const { tenantId, userId } = await enforceTenantAccess(ctx);

    // Check for existing submission
    const existing = await ctx.db
      .query("lmsSubmissions")
      .withIndex("by_assignment", (q) =>
        q.eq("assignmentId", args.assignmentId),
      )
      .filter((q) => q.eq(q.field("studentId"), userId))
      .first();

    if (existing) {
      throw new Error("You have already submitted work for this assignment");
    }

    // Check if late
    const assignment = await ctx.db.get(args.assignmentId);
    const isLate =
      assignment && new Date().toISOString().split("T")[0] > assignment.dueDate;

    return await ctx.db.insert("lmsSubmissions", {
      tenantId,
      assignmentId: args.assignmentId,
      studentId: userId,
      content: args.content,
      submittedAt: Date.now(),
      status: isLate ? "late" : "submitted",
    });
  },
});

export const listSubmissions = query({
  args: { assignmentId: v.id("lmsAssignments") },
  handler: async (ctx, args) => {
    await enforceTenantAccess(ctx);
    const submissions = await ctx.db
      .query("lmsSubmissions")
      .withIndex("by_assignment", (q) =>
        q.eq("assignmentId", args.assignmentId),
      )
      .collect();

    return await Promise.all(
      submissions.map(async (s) => {
        const student = await ctx.db.get(s.studentId);
        const grader = s.gradedBy ? await ctx.db.get(s.gradedBy) : null;
        return {
          ...s,
          studentName: student?.name || "Unknown",
          graderName: grader?.name || null,
        };
      }),
    );
  },
});

export const gradeSubmission = mutation({
  args: {
    id: v.id("lmsSubmissions"),
    grade: v.number(),
    feedback: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId } = await enforceTenantAccess(ctx);
    await ctx.db.patch(args.id, {
      grade: args.grade,
      feedback: args.feedback,
      gradedBy: userId,
      status: "graded",
    });
  },
});
