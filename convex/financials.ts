import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

// ─── Auth helpers ───

async function enforceTenantAccess(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("unauthorized");
  const user = await ctx.db.get(userId);
  if (!user || !user.tenantId) return null;
  return user.tenantId;
}

async function checkAdminOrBursar(ctx: any): Promise<boolean> {
  const userId = await getAuthUserId(ctx);
  if (!userId) return false;
  const user = await ctx.db.get(userId);
  const allowedRoles = ["superAdmin", "proprietor", "headteacher", "bursar"];
  return allowedRoles.includes(user?.role ?? "");
}

// ─── Fee Types ───

export const listFeeTypes = query({
  args: {},
  handler: async (ctx) => {
    const tenantId = await enforceTenantAccess(ctx);
    if (!tenantId) return [];
    return await ctx.db
      .query("feeTypes")
      .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
      .collect();
  },
});

export const createFeeType = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    amount: v.number(),
    gradeId: v.optional(v.id("grades")),
    termId: v.optional(v.id("terms")),
  },
  handler: async (ctx, args) => {
    const tenantId = await enforceTenantAccess(ctx);
    if (!tenantId) throw new Error("Unauthorized");
    if (!(await checkAdminOrBursar(ctx))) throw new Error("Permission denied");

    return await ctx.db.insert("feeTypes", {
      ...args,
      tenantId,
    });
  },
});

export const updateFeeType = mutation({
  args: {
    id: v.id("feeTypes"),
    name: v.string(),
    description: v.optional(v.string()),
    amount: v.number(),
    gradeId: v.optional(v.id("grades")),
    termId: v.optional(v.id("terms")),
  },
  handler: async (ctx, args) => {
    const { id, ...patch } = args;
    const tenantId = await enforceTenantAccess(ctx);
    const existing = await ctx.db.get(id);
    if (!existing || existing.tenantId !== tenantId)
      throw new Error("Not found");
    if (!(await checkAdminOrBursar(ctx))) throw new Error("Permission denied");

    await ctx.db.patch(id, patch);
  },
});

// ─── Invoices ───

export const generateInvoicesBulk = mutation({
  args: {
    classId: v.id("classes"),
    termId: v.id("terms"),
    dueDate: v.union(v.string(), v.number()),
  },
  handler: async (ctx, args) => {
    const tenantId = await enforceTenantAccess(ctx);
    if (!tenantId) throw new Error("Unauthorized");
    if (!(await checkAdminOrBursar(ctx))) throw new Error("Permission denied");

    const cls = await ctx.db.get(args.classId);
    if (!cls) throw new Error("Class not found");

    // 1. Get all students in this class
    const students = await ctx.db
      .query("users")
      .withIndex("by_class", (q) => q.eq("classId", args.classId))
      .filter((q) => q.eq(q.field("role"), "student"))
      .collect();

    // 2. Get applicable fee types (General + Grade Specific)
    const allFees = await ctx.db
      .query("feeTypes")
      .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
      .collect();

    const applicableFees = allFees.filter(
      (f) =>
        (!f.gradeId || f.gradeId === cls.gradeId) &&
        (!f.termId || f.termId === args.termId),
    );

    if (applicableFees.length === 0)
      throw new Error("No applicable fees defined for this term/grade.");

    const totalAmount = applicableFees.reduce((sum, f) => sum + f.amount, 0);

    let createdCount = 0;
    for (const student of students) {
      // Avoid double-billing for the same term
      const existing = await ctx.db
        .query("invoices")
        .withIndex("by_class_term", (q) =>
          q.eq("classId", args.classId).eq("termId", args.termId),
        )
        .filter((q) => q.eq(q.field("studentId"), student._id))
        .first();

      if (existing) continue;

      // Create Invoice
      const invoiceId = await ctx.db.insert("invoices", {
        tenantId,
        studentId: student._id,
        classId: args.classId,
        termId: args.termId,
        totalAmount,
        balance: totalAmount,
        status: "pending",
        dueDate: args.dueDate,
        createdAt: Date.now(),
      });

      // Create Invoice Items
      for (const fee of applicableFees) {
        await ctx.db.insert("invoiceItems", {
          invoiceId,
          feeTypeId: fee._id,
          amount: fee.amount,
          description: fee.name,
        });
      }
      createdCount++;
    }

    return { success: true, count: createdCount };
  },
});

export const listInvoices = query({
  args: {
    classId: v.optional(v.id("classes")),
    termId: v.optional(v.id("terms")),
    studentId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const tenantId = await enforceTenantAccess(ctx);
    if (!tenantId) return [];

    let q = ctx.db
      .query("invoices")
      .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId));

    if (args.studentId) {
      return await ctx.db
        .query("invoices")
        .withIndex("by_student", (q) => q.eq("studentId", args.studentId!))
        .filter((q) => q.eq(q.field("tenantId"), tenantId))
        .collect();
    }

    const docs = await q.collect();

    // Join student and class info
    return await Promise.all(
      docs
        .filter((d) => {
          if (args.classId && d.classId !== args.classId) return false;
          if (args.termId && d.termId !== args.termId) return false;
          return true;
        })
        .map(async (inv) => {
          const student = (await ctx.db.get(inv.studentId)) as any;
          const cls = (await ctx.db.get(inv.classId)) as any;
          const term = (await ctx.db.get(inv.termId)) as any;
          return {
            ...inv,
            studentName: student?.name || "Unknown",
            className: cls?.name || "Unknown",
            termName: term?.name || "Unknown",
          };
        }),
    );
  },
});

export const getInvoiceDetail = query({
  args: { invoiceId: v.id("invoices") },
  handler: async (ctx, { invoiceId }) => {
    const tenantId = await enforceTenantAccess(ctx);
    const invoice = await ctx.db.get(invoiceId);
    if (!invoice || invoice.tenantId !== tenantId) return null;

    const items = await ctx.db
      .query("invoiceItems")
      .withIndex("by_invoice", (q) => q.eq("invoiceId", invoiceId))
      .collect();

    const payments = await ctx.db
      .query("payments")
      .withIndex("by_invoice", (q) => q.eq("invoiceId", invoiceId))
      .collect();

    const student = (await ctx.db.get(invoice.studentId)) as any;

    return {
      ...invoice,
      studentName: student?.name || "Unknown",
      items,
      payments,
    };
  },
});

// ─── Payments ───

export const recordPayment = mutation({
  args: {
    studentId: v.id("users"),
    invoiceId: v.optional(v.id("invoices")),
    amount: v.number(),
    method: v.union(
      v.literal("momo"),
      v.literal("cash"),
      v.literal("bank"),
      v.literal("cheque"),
    ),
    transactionRef: v.optional(v.string()),
    date: v.union(v.string(), v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const tenantId = await enforceTenantAccess(ctx);
    if (!tenantId) throw new Error("Unauthorized");
    const userId = (await getAuthUserId(ctx))!;

    // 1. Record the payment
    const paymentId = await ctx.db.insert("payments", {
      tenantId,
      studentId: args.studentId,
      invoiceId: args.invoiceId,
      amount: args.amount,
      method: args.method,
      transactionRef: args.transactionRef,
      date: args.date,
      recordedBy: userId,
      notes: args.notes,
    });

    // 2. If linked to an invoice, update invoice balance and status
    if (args.invoiceId) {
      const invoice = await ctx.db.get(args.invoiceId);
      if (invoice) {
        const newBalance = Math.max(0, invoice.balance - args.amount);
        let newStatus: "pending" | "partial" | "paid" = "partial";
        if (newBalance === 0) newStatus = "paid";

        await ctx.db.patch(args.invoiceId, {
          balance: newBalance,
          status: newStatus,
        });
      }
    }

    return paymentId;
  },
});

// ─── Bursaries ───

export const listBursaries = query({
  args: { studentId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    const tenantId = await enforceTenantAccess(ctx);
    if (!tenantId) return [];

    if (args.studentId) {
      return await ctx.db
        .query("bursaries")
        .withIndex("by_student", (q) => q.eq("studentId", args.studentId!))
        .filter((q) => q.eq(q.field("tenantId"), tenantId))
        .collect();
    }

    return await ctx.db
      .query("bursaries")
      .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
      .collect();
  },
});

export const updateBursary = mutation({
  args: {
    studentId: v.id("users"),
    bursaryType: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("declined"),
    ),
    amount: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const tenantId = await enforceTenantAccess(ctx);
    if (!tenantId) throw new Error("Unauthorized");

    const existing = await ctx.db
      .query("bursaries")
      .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
      .filter((q) =>
        q.and(
          q.eq(q.field("studentId"), args.studentId),
          q.eq(q.field("bursaryType"), args.bursaryType),
        ),
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: args.status,
        amount: args.amount,
        notes: args.notes,
        approvalDate: args.status === "approved" ? Date.now() : undefined,
      });
    } else {
      await ctx.db.insert("bursaries", {
        tenantId,
        studentId: args.studentId,
        bursaryType: args.bursaryType,
        status: args.status,
        amount: args.amount,
        notes: args.notes,
        approvalDate: args.status === "approved" ? Date.now() : undefined,
      });
    }
  },
});

// ─── Financial Stats ───

export const getFinancialStats = query({
  args: { termId: v.optional(v.id("terms")) },
  handler: async (ctx, args) => {
    const tenantId = await enforceTenantAccess(ctx);
    if (!tenantId) return null;

    const invoices = await ctx.db
      .query("invoices")
      .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
      .collect();

    const filteredInvoices = args.termId
      ? invoices.filter((i) => i.termId === args.termId)
      : invoices;

    const totalExpected = filteredInvoices.reduce(
      (sum, i) => sum + i.totalAmount,
      0,
    );
    const totalCollected = filteredInvoices.reduce(
      (sum, i) => sum + (i.totalAmount - i.balance),
      0,
    );
    const totalOutstanding = totalExpected - totalCollected;

    return {
      totalExpected,
      totalCollected,
      totalOutstanding,
      invoiceCount: filteredInvoices.length,
      paidCount: filteredInvoices.filter((i) => i.status === "paid").length,
      pendingCount: filteredInvoices.filter(
        (i) => i.status === "pending" || i.status === "partial",
      ).length,
    };
  },
});
