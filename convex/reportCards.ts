import { query, mutation, QueryCtx, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";
import { GradingResult, GradingScaleType } from "../lib/grading";

function calculateGradeServer(
  score: number,
  outOf: number,
  scaleType: GradingScaleType,
): GradingResult {
  if (outOf === 0)
    return { grade: "N/A", score: 0, outOf: 0, percentage: 0, color: "slate" };

  const percentage = Math.round((score / outOf) * 100);

  if (scaleType === "primary") {
    const normalizedScore = (score / outOf) * 150;
    let grade = "F (Below Average)";
    let color = "red";
    if (normalizedScore >= 112) {
      grade = "Division One";
      color = "green";
    } else if (normalizedScore >= 90) {
      grade = "Division Two";
      color = "green";
    } else if (normalizedScore >= 75) {
      grade = "Division Three";
      color = "amber";
    } else if (normalizedScore >= 40) {
      grade = "Division Four";
      color = "amber";
    }
    return { grade, score, outOf, percentage, color };
  }

  if (scaleType === "junior_secondary") {
    let grade = "Fail";
    let color = "red";
    if (percentage >= 75) {
      grade = "Distinction";
      color = "green";
    } else if (percentage >= 60) {
      grade = "Merit";
      color = "green";
    } else if (percentage >= 50) {
      grade = "Credit";
      color = "amber";
    } else if (percentage >= 40) {
      grade = "Pass";
      color = "amber";
    }
    return { grade, score, outOf, percentage, color };
  }

  // senior_secondary
  let grade = "9 (Fail)";
  let color = "red";
  if (percentage >= 75) {
    grade = "1 (Distinction)";
    color = "green";
  } else if (percentage >= 70) {
    grade = "2 (Distinction)";
    color = "green";
  } else if (percentage >= 65) {
    grade = "3 (Merit)";
    color = "green";
  } else if (percentage >= 60) {
    grade = "4 (Merit)";
    color = "green";
  } else if (percentage >= 55) {
    grade = "5 (Credit)";
    color = "amber";
  } else if (percentage >= 50) {
    grade = "6 (Credit)";
    color = "amber";
  } else if (percentage >= 45) {
    grade = "7 (Satisfactory)";
    color = "amber";
  } else if (percentage >= 40) {
    grade = "8 (Satisfactory)";
    color = "amber";
  }
  return { grade, score, outOf, percentage, color };
}

// ─── Auth helpers ───

async function enforceTenantAccess(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("unauthorized");
  const user = await ctx.db.get(userId);
  if (!user || !user.tenantId) return null;
  return user.tenantId;
}

async function checkAdminOrTeacher(
  ctx: QueryCtx | MutationCtx,
): Promise<boolean> {
  const userId = await getAuthUserId(ctx);
  if (!userId) return false;
  const user = await ctx.db.get(userId as Id<"users">);
  const allowedRoles = ["superAdmin", "proprietor", "headteacher", "teacher"];
  return allowedRoles.includes(user?.role ?? "");
}

// ─── Generate report cards for all students in a class/term ───

export const generate = mutation({
  args: {
    classId: v.id("classes"),
    termId: v.id("terms"),
    gradingScale: v.union(
      v.literal("primary"),
      v.literal("junior_secondary"),
      v.literal("senior_secondary"),
    ),
  },
  handler: async (ctx, args) => {
    const tenantId = await enforceTenantAccess(ctx);
    if (!tenantId) throw new Error("Unauthorized: No tenant assigned");

    const hasClearance = await checkAdminOrTeacher(ctx);
    if (!hasClearance) throw new Error("Unauthorized role.");

    // 1. Get the term for date range
    const term = await ctx.db.get(args.termId);
    if (!term) throw new Error("Term not found");

    // 2. Get all students enrolled in this class
    const students = await ctx.db
      .query("users")
      .withIndex("by_class", (q: any) => q.eq("classId", args.classId))
      .filter((q: any) => q.eq(q.field("role"), "student"))
      .collect();

    if (students.length === 0)
      throw new Error("No students enrolled in this class.");

    // 3. Get all class-subjects for this class
    const classSubjects = await ctx.db
      .query("classSubjects")
      .withIndex("by_class", (q: any) => q.eq("classId", args.classId))
      .collect();

    // 4. Get subject details
    const subjectDocs = await Promise.all(
      classSubjects.map(async (cs: any) => {
        const subject = (await ctx.db.get(cs.subjectId)) as any;
        return subject ? { id: subject._id, name: subject.name } : null;
      }),
    );
    const validSubjects = subjectDocs.filter(Boolean) as {
      id: Id<"subjects">;
      name: string;
    }[];

    // 5. Fetch all assessments for this class + term, grouped by subject
    const allAssessments = await ctx.db
      .query("assessments")
      .withIndex("by_term", (q: any) => q.eq("termId", args.termId))
      .filter((q: any) => q.eq(q.field("classId"), args.classId))
      .filter((q: any) => q.eq(q.field("tenantId"), tenantId))
      .collect();

    // 6. Fetch all marks for those assessments
    const allMarks: any[] = [];
    for (const assessment of allAssessments) {
      const marks = await ctx.db
        .query("assessmentMarks")
        .withIndex("by_assessment", (q: any) =>
          q.eq("assessmentId", assessment._id),
        )
        .collect();
      allMarks.push(
        ...marks.map((m: any) => ({
          ...m,
          subjectId: assessment.subjectId,
          totalScore: assessment.totalScore,
        })),
      );
    }

    // 7. Fetch attendance records for the term date range
    const termStartDate = term.startDate;
    const termEndDate = term.endDate;

    const allAttendance = await ctx.db
      .query("attendance")
      .withIndex("by_tenant", (q: any) => q.eq("tenantId", tenantId))
      .filter((q: any) => q.eq(q.field("classId"), args.classId))
      .collect();

    // Filter to term date range
    const termAttendance = allAttendance.filter(
      (a: any) => a.date >= termStartDate && a.date <= termEndDate,
    );

    // 8. Fetch discipline logs for the term date range
    const allDiscipline = await ctx.db
      .query("disciplineLogs")
      .withIndex("by_tenant", (q: any) => q.eq("tenantId", tenantId))
      .collect();

    const termDiscipline = allDiscipline.filter(
      (d: any) => d.date >= termStartDate && d.date <= termEndDate,
    );

    // 9. Generate report card for each student
    const results: Id<"reportCards">[] = [];

    for (const student of students) {
      // Subject grades
      const subjectResults = validSubjects.map((subject) => {
        const studentMarksForSubject = allMarks.filter(
          (m: any) => m.studentId === student._id && m.subjectId === subject.id,
        );
        const totalScore = studentMarksForSubject.reduce(
          (sum: number, m: any) => sum + m.score,
          0,
        );
        const totalOutOf = studentMarksForSubject.reduce(
          (sum: number, m: any) => sum + m.totalScore,
          0,
        );
        const gradeResult = calculateGradeServer(
          totalScore,
          totalOutOf,
          args.gradingScale,
        );

        return {
          subjectId: subject.id,
          subjectName: subject.name,
          totalScore,
          totalOutOf,
          percentage: gradeResult.percentage,
          grade: gradeResult.grade,
          color: gradeResult.color,
        };
      });

      // Attendance summary
      const studentAttendance = termAttendance.filter(
        (a: any) => a.studentId === student._id,
      );
      const attendanceSummary = {
        totalDays: studentAttendance.length,
        present: studentAttendance.filter((a: any) => a.status === "present")
          .length,
        absent: studentAttendance.filter((a: any) => a.status === "absent")
          .length,
        late: studentAttendance.filter((a: any) => a.status === "late").length,
        excused: studentAttendance.filter((a: any) => a.status === "excused")
          .length,
      };

      // Discipline summary
      const studentDiscipline = termDiscipline.filter(
        (d: any) => d.studentId === student._id,
      );
      const disciplineSummary = {
        totalIncidents: studentDiscipline.length,
        totalPointsDeducted: studentDiscipline.reduce(
          (sum: number, d: any) => sum + d.pointsDeducted,
          0,
        ),
      };

      // Check for existing report card (upsert)
      const existing = await ctx.db
        .query("reportCards")
        .withIndex("by_class_term", (q: any) =>
          q.eq("classId", args.classId).eq("termId", args.termId),
        )
        .filter((q: any) => q.eq(q.field("studentId"), student._id))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          gradingScale: args.gradingScale,
          subjects: subjectResults,
          attendanceSummary,
          disciplineSummary,
          generatedAt: Date.now(),
        });
        results.push(existing._id);
      } else {
        const id = await ctx.db.insert("reportCards", {
          tenantId,
          studentId: student._id as Id<"users">,
          classId: args.classId,
          termId: args.termId,
          gradingScale: args.gradingScale,
          subjects: subjectResults,
          attendanceSummary,
          disciplineSummary,
          status: "draft",
          generatedAt: Date.now(),
        });
        results.push(id);
      }
    }

    return { success: true, count: results.length };
  },
});

// ─── Get a single report card with joined data ───

export const get = query({
  args: { reportId: v.id("reportCards") },
  handler: async (ctx, { reportId }) => {
    const tenantId = await enforceTenantAccess(ctx);
    if (!tenantId) return null;

    const report = await ctx.db.get(reportId);
    if (!report || report.tenantId !== tenantId) return null;

    const student = (await ctx.db.get(report.studentId)) as any;
    const cls = (await ctx.db.get(report.classId)) as any;
    const term = (await ctx.db.get(report.termId)) as any;
    const tenant = (await ctx.db.get(report.tenantId)) as any;

    let gradeName = "";
    let yearName = "";
    if (cls?.gradeId) {
      const grade = await ctx.db.get(cls.gradeId);
      gradeName = (grade as any)?.name || "";
    }
    if (term?.yearId) {
      const year = await ctx.db.get(term.yearId);
      yearName = (year as any)?.name || "";
    }

    return {
      ...report,
      studentName: student?.name || "Unknown Student",
      className: cls?.name || "Unknown Class",
      gradeName,
      termName: term?.name || "Unknown Term",
      yearName,
      schoolName: tenant?.name || "Unknown School",
      schoolLogo: (tenant as any)?.logo || undefined,
    };
  },
});

// ─── List report cards for a class + term ───

export const listByClass = query({
  args: {
    classId: v.id("classes"),
    termId: v.id("terms"),
  },
  handler: async (ctx, args) => {
    const tenantId = await enforceTenantAccess(ctx);
    if (!tenantId) return [];

    const reports = await ctx.db
      .query("reportCards")
      .withIndex("by_class_term", (q: any) =>
        q.eq("classId", args.classId).eq("termId", args.termId),
      )
      .filter((q: any) => q.eq(q.field("tenantId"), tenantId))
      .collect();

    return Promise.all(
      reports.map(async (report: any) => {
        const student = (await ctx.db.get(report.studentId)) as any;

        // Compute overall average
        const totalPct = report.subjects.reduce(
          (sum: number, s: any) => sum + s.percentage,
          0,
        );
        const avgPercentage =
          report.subjects.length > 0
            ? Math.round(totalPct / report.subjects.length)
            : 0;

        return {
          ...report,
          studentName: student?.name || "Unknown Student",
          avgPercentage,
        };
      }),
    );
  },
});

// ─── Update comments on a report card ───

export const updateComments = mutation({
  args: {
    reportId: v.id("reportCards"),
    classTeacherComment: v.optional(v.string()),
    headteacherComment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const tenantId = await enforceTenantAccess(ctx);
    if (!tenantId) throw new Error("Unauthorized");

    const hasClearance = await checkAdminOrTeacher(ctx);
    if (!hasClearance) {
      throw new Error(
        "Unauthorized: Only teachers and admins can update report card comments",
      );
    }

    const report = await ctx.db.get(args.reportId);
    if (!report || report.tenantId !== tenantId) {
      throw new Error("Report card not found");
    }

    const patch: Record<string, string | undefined> = {};
    if (args.classTeacherComment !== undefined) {
      patch.classTeacherComment = args.classTeacherComment;
    }
    if (args.headteacherComment !== undefined) {
      patch.headteacherComment = args.headteacherComment;
    }

    await ctx.db.patch(args.reportId, patch);
    return { success: true };
  },
});

// ─── Publish a report card ───

export const publish = mutation({
  args: { reportId: v.id("reportCards") },
  handler: async (ctx, { reportId }) => {
    const tenantId = await enforceTenantAccess(ctx);
    if (!tenantId) throw new Error("Unauthorized");

    const hasClearance = await checkAdminOrTeacher(ctx);
    if (!hasClearance) {
      throw new Error(
        "Unauthorized: Only teachers and admins can publish report cards",
      );
    }

    const report = await ctx.db.get(reportId);
    if (!report || report.tenantId !== tenantId) {
      throw new Error("Report card not found");
    }

    await ctx.db.patch(reportId, { status: "published" });
    return { success: true };
  },
});

// ─── Bulk publish all report cards for a class + term ───

export const publishAll = mutation({
  args: {
    classId: v.id("classes"),
    termId: v.id("terms"),
  },
  handler: async (ctx, args) => {
    const tenantId = await enforceTenantAccess(ctx);
    if (!tenantId) throw new Error("Unauthorized");

    const hasClearance = await checkAdminOrTeacher(ctx);
    if (!hasClearance) {
      throw new Error(
        "Unauthorized: Only teachers and admins can publish report cards",
      );
    }

    const reports = await ctx.db
      .query("reportCards")
      .withIndex("by_class_term", (q: any) =>
        q.eq("classId", args.classId).eq("termId", args.termId),
      )
      .filter((q: any) => q.eq(q.field("tenantId"), tenantId))
      .filter((q: any) => q.eq(q.field("status"), "draft"))
      .collect();

    for (const report of reports) {
      await ctx.db.patch(report._id, { status: "published" });
    }

    return { success: true, count: reports.length };
  },
});
