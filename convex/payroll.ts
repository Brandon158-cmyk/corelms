import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

/**
 * Helper to ensure the user is authenticated and get their tenantId.
 */
async function enforceAdminAccess(ctx: any) {
  const userId = await auth.getUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  const user = await ctx.db.get(userId);
  if (!user || !user.tenantId)
    throw new Error("Unauthorized: No tenant context");

  if (
    !["superAdmin", "proprietor", "headteacher", "bursar"].includes(
      user.role || "",
    )
  ) {
    throw new Error("Unauthorized: Insufficient permissions for payroll");
  }

  return { userId, tenantId: user.tenantId };
}

// ─── Computational Utilities ───────────────────────────────────────────

/**
 * Calculates PAYE based on 2025 Zambian tax bands.
 */
function calculatePAYE(taxableIncome: number): number {
  if (taxableIncome <= 5100) return 0;

  let tax = 0;
  let remaining = taxableIncome;

  // Band 1: 0 - 5100 @ 0%
  remaining -= 5100;

  // Band 2: Next 2000 (5101 - 7100) @ 20%
  const band2 = Math.min(remaining, 2000);
  tax += band2 * 0.2;
  remaining -= band2;
  if (remaining <= 0) return tax;

  // Band 3: Next 2100 (7101 - 9200) @ 30%
  const band3 = Math.min(remaining, 2100);
  tax += band3 * 0.3;
  remaining -= band3;
  if (remaining <= 0) return tax;

  // Band 4: Above 9200 @ 37%
  tax += remaining * 0.37;

  return tax;
}

/**
 * Calculates NAPSA (5% Employee, 5% Employer) with 2025 statutory cap.
 * Max deduction is ZMW 1,708.20 (based on ZMW 34,164 ceiling).
 */
function calculateNAPSA(grossEarnings: number): {
  employee: number;
  employer: number;
} {
  const ceiling = 34164; // Value that results in 1708.20 cap
  const assessable = Math.min(grossEarnings, ceiling);
  const deduction = assessable * 0.05;
  return {
    employee: parseFloat(deduction.toFixed(2)),
    employer: parseFloat(deduction.toFixed(2)),
  };
}

/**
 * Calculates NHIMA (1% Employee, 1% Employer) strictly on Basic Pay.
 */
function calculateNHIMA(basicPay: number): {
  employee: number;
  employer: number;
} {
  const deduction = basicPay * 0.01;
  return {
    employee: parseFloat(deduction.toFixed(2)),
    employer: parseFloat(deduction.toFixed(2)),
  };
}

// ─── Payroll Actions ───────────────────────────────────────────────────

/**
 * List all payruns for the current tenant.
 */
export const listPayruns = query({
  args: {},
  handler: async (ctx) => {
    const { tenantId } = await enforceAdminAccess(ctx);
    return await ctx.db
      .query("payruns")
      .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
      .order("desc")
      .collect();
  },
});

/**
 * Generate a new payrun for a specific month/year.
 * This reads all staff profiles to create payslips.
 */
export const generatePayrun = mutation({
  args: {
    month: v.number(),
    year: v.number(),
  },
  handler: async (ctx, { month, year }) => {
    const { userId, tenantId } = await enforceAdminAccess(ctx);

    // Check if a payrun already exists for this month
    const existing = await ctx.db
      .query("payruns")
      .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
      .filter((q) =>
        q.and(q.eq(q.field("month"), month), q.eq(q.field("year"), year)),
      )
      .unique();

    if (existing && existing.status !== "void") {
      throw new Error(`A payrun already exists for ${month}/${year}`);
    }

    // Fetch all staff users with profiles
    const staffProfiles = await ctx.db
      .query("staffProfiles")
      .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
      .collect();

    if (staffProfiles.length === 0) {
      throw new Error(
        "No staff profiles found. Please complete staff HR data first.",
      );
    }

    // Create the Payrun record (initially with 0 totals)
    const payrunId = await ctx.db.insert("payruns", {
      tenantId,
      month,
      year,
      status: "draft",
      totalGross: 0,
      totalNet: 0,
      totalTax: 0,
      totalNAPSA: 0,
      totalNHIMA: 0,
      processedBy: userId,
      processedAt: Date.now(),
    });

    let tGross = 0;
    let tNet = 0;
    let tTax = 0;
    let tNAPSA = 0;
    let tNHIMA = 0;

    // Generate individual payslips
    for (const profile of staffProfiles) {
      const basic = profile.basicSalary;
      const h = profile.allowanceHousing || 0;
      const t = profile.allowanceTransport || 0;
      const o = profile.allowanceOther || 0;

      const gross = basic + h + t + o;
      const paye = calculatePAYE(gross);
      const napsa = calculateNAPSA(gross);
      const nhima = calculateNHIMA(basic);
      const skillsLevy = gross * 0.005;

      const totalDeductions = paye + napsa.employee + nhima.employee;
      const net = gross - totalDeductions;

      await ctx.db.insert("payslips", {
        tenantId,
        payrunId,
        userId: profile.userId,
        month,
        year,
        basicPay: basic,
        housingAllowance: h,
        transportAllowance: t,
        otherAllowances: o,
        grossEarnings: gross,
        paye,
        napsaEmployee: napsa.employee,
        napsaEmployer: napsa.employer,
        nhimaEmployee: nhima.employee,
        nhimaEmployer: nhima.employer,
        skillsLevy,
        otherDeductions: 0,
        netPay: net,
        status: "draft",
      });

      tGross += gross;
      tNet += net;
      tTax += paye;
      tNAPSA += napsa.employee;
      tNHIMA += nhima.employee;
    }

    // Update Payrun totals
    await ctx.db.patch(payrunId, {
      totalGross: tGross,
      totalNet: tNet,
      totalTax: tTax,
      totalNAPSA: tNAPSA,
      totalNHIMA: tNHIMA,
    });

    return payrunId;
  },
});

/**
 * Get payslips for a specific payrun.
 */
export const getPayslips = query({
  args: { payrunId: v.id("payruns") },
  handler: async (ctx, { payrunId }) => {
    await enforceAdminAccess(ctx);
    const payslips = await ctx.db
      .query("payslips")
      .withIndex("by_payrun", (q) => q.eq("payrunId", payrunId))
      .collect();

    // Attach user names
    return await Promise.all(
      payslips.map(async (ps) => {
        const user = await ctx.db.get(ps.userId);
        return { ...ps, staffName: user?.name || "Unknown Staff" };
      }),
    );
  },
});

/**
 * Approve a payrun, locking it from further changes.
 */
export const approvePayrun = mutation({
  args: { payrunId: v.id("payruns") },
  handler: async (ctx, { payrunId }) => {
    await enforceAdminAccess(ctx);
    await ctx.db.patch(payrunId, { status: "approved" });
  },
});
