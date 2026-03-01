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

// ─── Risk Level Classification ──────────────────────────────────────────

function classifyRisk(score: number): "low" | "medium" | "high" | "critical" {
  if (score <= 25) return "critical";
  if (score <= 50) return "high";
  if (score <= 75) return "medium";
  return "low";
}

// ─── Compute Risk Scores ────────────────────────────────────────────────

export const computeRiskScores = mutation({
  args: {},
  handler: async (ctx) => {
    const { tenantId } = await enforceTenantAccess(ctx);

    // Get all students
    const users = await ctx.db
      .query("users")
      .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
      .collect();
    const students = users.filter((u) => u.role === "student");

    let computed = 0;

    for (const student of students) {
      const factors: string[] = [];

      // ── Attendance Score (0–100) ────────────────────────────────
      const attendanceRecords = await ctx.db
        .query("attendance")
        .withIndex("by_student", (q) => q.eq("studentId", student._id))
        .collect();

      let attendanceScore = 100;
      if (attendanceRecords.length > 0) {
        const present = attendanceRecords.filter(
          (a) => a.status === "present" || a.status === "late",
        ).length;
        attendanceScore = Math.round(
          (present / attendanceRecords.length) * 100,
        );
        if (attendanceScore < 70) {
          factors.push(
            `Low attendance: ${attendanceScore}% (${present}/${attendanceRecords.length})`,
          );
        }
        if (attendanceScore < 50) {
          factors.push("Critically low attendance — below 50%");
        }
      } else {
        // No attendance records — neutral
        attendanceScore = 50;
        factors.push("No attendance data available");
      }

      // ── Academic Score (0–100) ──────────────────────────────────
      const marks = await ctx.db
        .query("assessmentMarks")
        .withIndex("by_student", (q) => q.eq("studentId", student._id))
        .collect();

      let academicScore = 100;
      if (marks.length > 0) {
        // Calculate % per assessment and average
        const percentages = await Promise.all(
          marks.map(async (m) => {
            const assessment = await ctx.db.get(m.assessmentId);
            if (!assessment || assessment.totalScore === 0) return null;
            return (m.score / assessment.totalScore) * 100;
          }),
        );
        const valid = percentages.filter((p) => p !== null) as number[];
        if (valid.length > 0) {
          academicScore = Math.round(
            valid.reduce((s, v) => s + v, 0) / valid.length,
          );
        }
        if (academicScore < 50) {
          factors.push(`Failing academic average: ${academicScore}%`);
        } else if (academicScore < 65) {
          factors.push(`Below-average academic performance: ${academicScore}%`);
        }
      } else {
        academicScore = 50;
        factors.push("No assessment marks available");
      }

      // ── Discipline Score (0–100) ───────────────────────────────
      const incidents = await ctx.db
        .query("disciplineLogs")
        .withIndex("by_student", (q) => q.eq("studentId", student._id))
        .collect();

      let disciplineScore = 100;
      if (incidents.length > 0) {
        // Weighted by severity
        const totalPoints = incidents.reduce((s, i) => s + i.pointsDeducted, 0);
        const severeCount = incidents.filter(
          (i) => i.category === "severe",
        ).length;

        // Deduct: each point = -2 from 100, severe incidents extra -10
        disciplineScore = Math.max(0, 100 - totalPoints * 2 - severeCount * 10);

        if (incidents.length >= 5) {
          factors.push(`${incidents.length} disciplinary incidents on record`);
        }
        if (severeCount > 0) {
          factors.push(
            `${severeCount} severe infraction${severeCount > 1 ? "s" : ""}`,
          );
        }
        if (totalPoints >= 20) {
          factors.push(`${totalPoints} penalty points accumulated`);
        }
      }

      // ── Overall Risk Score (weighted average) ──────────────────
      const overallRisk = Math.round(
        attendanceScore * 0.4 + academicScore * 0.4 + disciplineScore * 0.2,
      );
      const riskLevel = classifyRisk(overallRisk);

      // ── Upsert ─────────────────────────────────────────────────
      const existing = await ctx.db
        .query("studentRiskScores")
        .withIndex("by_student", (q) => q.eq("studentId", student._id))
        .first();

      const data = {
        tenantId,
        studentId: student._id,
        attendanceScore,
        academicScore,
        disciplineScore,
        overallRisk,
        riskLevel,
        factors,
        computedAt: Date.now(),
      };

      if (existing) {
        await ctx.db.patch(existing._id, data);
      } else {
        await ctx.db.insert("studentRiskScores", data);
      }
      computed++;
    }

    return { computed };
  },
});

// ─── Queries ────────────────────────────────────────────────────────────

export const listRiskScores = query({
  args: {},
  handler: async (ctx) => {
    const { tenantId } = await enforceTenantAccess(ctx);
    const scores = await ctx.db
      .query("studentRiskScores")
      .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
      .collect();

    // Sort by risk (critical first)
    const riskOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    scores.sort(
      (a, b) =>
        riskOrder[a.riskLevel] - riskOrder[b.riskLevel] ||
        a.overallRisk - b.overallRisk,
    );

    return await Promise.all(
      scores.map(async (s) => {
        const student = await ctx.db.get(s.studentId);
        return {
          ...s,
          studentName: student?.name || "Unknown",
        };
      }),
    );
  },
});

export const getRiskBreakdown = query({
  args: { studentId: v.id("users") },
  handler: async (ctx, { studentId }) => {
    await enforceTenantAccess(ctx);
    const score = await ctx.db
      .query("studentRiskScores")
      .withIndex("by_student", (q) => q.eq("studentId", studentId))
      .first();

    if (!score) return null;

    const student = await ctx.db.get(studentId);
    return {
      ...score,
      studentName: student?.name || "Unknown",
    };
  },
});

export const getRiskSummary = query({
  args: {},
  handler: async (ctx) => {
    const { tenantId } = await enforceTenantAccess(ctx);
    const scores = await ctx.db
      .query("studentRiskScores")
      .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
      .collect();

    return {
      total: scores.length,
      critical: scores.filter((s) => s.riskLevel === "critical").length,
      high: scores.filter((s) => s.riskLevel === "high").length,
      medium: scores.filter((s) => s.riskLevel === "medium").length,
      low: scores.filter((s) => s.riskLevel === "low").length,
      lastComputed:
        scores.length > 0 ? Math.max(...scores.map((s) => s.computedAt)) : null,
    };
  },
});
