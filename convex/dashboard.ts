import { query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getAdminStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const user = (await ctx.db.get(userId)) as any;
    if (!user || !user.tenantId) {
      throw new Error("Invalid user or no tenant associated.");
    }

    // Role check
    if (
      user.role !== "superAdmin" &&
      user.role !== "proprietor" &&
      user.role !== "headteacher" &&
      user.role !== "bursar"
    ) {
      throw new Error("Unauthorized for admin stats.");
    }

    const tenantId = user.tenantId;

    // Get basic counts
    const students = await ctx.db
      .query("users")
      .withIndex("by_tenant_role", (q) =>
        q.eq("tenantId", tenantId).eq("role", "student"),
      )
      .collect();

    const teachers = await ctx.db
      .query("users")
      .withIndex("by_tenant_role", (q) =>
        q.eq("tenantId", tenantId).eq("role", "teacher"),
      )
      .collect();

    const classes = await ctx.db
      .query("classes")
      .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
      .collect();

    const activeClasses = classes.filter((c) => c.status === "active");

    // Gather data for a chart. Let's make up a "Student Enrollment by Grade" or "Class Distribution" chart.
    // For simplicity, we'll map classes to grades and count students in those classes (if possible),
    // or just show classes per grade.
    const grades = await ctx.db
      .query("grades")
      .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
      .collect();

    const classesPerGrade = grades
      .map((grade) => {
        const gClasses = activeClasses.filter((c) => c.gradeId === grade._id);
        return {
          name: grade.name,
          classes: gClasses.length,
        };
      })
      .filter((g) => g.classes > 0);

    return {
      totalStudents: students.length,
      totalTeachers: teachers.length,
      activeClasses: activeClasses.length,
      totalClasses: classes.length,
      chartData: classesPerGrade,
    };
  },
});

export const getTeacherStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const user = (await ctx.db.get(userId)) as any;
    if (!user || user.role !== "teacher" || !user.tenantId) {
      throw new Error("Unauthorized or invalid user.");
    }

    // Find classes directed by this teacher or where they teach a subject
    const subjectAssignments = await ctx.db
      .query("classSubjects")
      .withIndex("by_teacher", (q) => q.eq("teacherId", userId))
      .collect();

    const classIds = new Set<string>();
    subjectAssignments.forEach((sa) => classIds.add(sa.classId as string));

    // Also include classes where they are the homeroom teacher
    const homeroomClasses = await ctx.db
      .query("classes")
      .withIndex("by_tenant_teacher", (q) =>
        q.eq("tenantId", user.tenantId as any).eq("teacherId", userId),
      )
      .collect();

    homeroomClasses.forEach((hc) => classIds.add(hc._id as string));

    const myClasses = await Promise.all(
      Array.from(classIds).map((id) => ctx.db.get(id as any)),
    );

    // Get assignments created by this teacher that are currently open
    const openAssignments = await ctx.db
      .query("lmsAssignments")
      .withIndex("by_tenant", (q) => q.eq("tenantId", user.tenantId as any))
      .filter((q) =>
        q.and(
          q.eq(q.field("createdBy"), userId),
          q.eq(q.field("status"), "open"),
        ),
      )
      .collect();

    return {
      classesCount: myClasses.length,
      myClasses: myClasses.filter((c) => c !== null),
      assignmentCount: openAssignments.length,
      recentAssignments: openAssignments.slice(0, 5), // top 5
    };
  },
});

export const getStudentStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const user = (await ctx.db.get(userId)) as any;
    if (!user || user.role !== "student" || !user.tenantId) {
      throw new Error("Unauthorized or invalid user.");
    }

    // Attempt to figure out the student's class
    let myClass = null;
    let upcomingAssignments: any[] = [];
    let recentGrades: any[] = [];

    if (user.classId) {
      myClass = await ctx.db.get(user.classId as any);

      // Find courses linked to this class
      const courses = await ctx.db
        .query("courses")
        .withIndex("by_class", (q) => q.eq("classId", user.classId as any))
        .collect();

      // Get open assignments for these courses
      const courseIds = courses.map((c) => c._id);
      const allAssignments = await ctx.db
        .query("lmsAssignments")
        .withIndex("by_tenant", (q) => q.eq("tenantId", user.tenantId as any))
        .filter((q) => q.eq(q.field("status"), "open"))
        .collect();

      // Filter assignments to just the student's courses
      upcomingAssignments = allAssignments
        .filter((a) => courseIds.includes(a.courseId))
        .sort(
          (a, b) =>
            new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
        )
        .slice(0, 5); // next 5 due

      // Get recent assessment marks
      recentGrades = await ctx.db
        .query("assessmentMarks")
        .withIndex("by_student", (q) => q.eq("studentId", userId))
        .order("desc") // Get newest assuming _id insertion relates roughly to time
        .take(5);
    }

    return {
      myClass,
      upcomingAssignments,
      recentGrades,
    };
  },
});
