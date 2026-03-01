import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

/**
 * Helper to ensure the user is authenticated and get their tenantId.
 */
async function enforceTenantAccess(ctx: any) {
  const userId = await auth.getUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  const user = await ctx.db.get(userId);
  if (!user || !user.tenantId)
    throw new Error("Unauthorized: No tenant context");
  return { userId, tenantId: user.tenantId, role: user.role };
}

/**
 * List all staff members for the current tenant.
 * Filters the 'users' table by roles that are typically staff.
 */
export const listStaff = query({
  args: {},
  handler: async (ctx) => {
    const { tenantId } = await enforceTenantAccess(ctx);

    const staffUsers = await ctx.db
      .query("users")
      .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
      .filter((q) =>
        q.or(
          q.eq(q.field("role"), "teacher"),
          q.eq(q.field("role"), "headteacher"),
          q.eq(q.field("role"), "bursar"),
          q.eq(q.field("role"), "boardingMatron"),
          q.eq(q.field("role"), "proprietor"),
        ),
      )
      .collect();

    // Fetch profile details for each staff member
    const staffWithProfiles = await Promise.all(
      staffUsers.map(async (user) => {
        const profile = await ctx.db
          .query("staffProfiles")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .unique();
        return { ...user, profile };
      }),
    );

    return staffWithProfiles;
  },
});

/**
 * Get detailed profile for a specific staff member.
 */
export const getStaffProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    await enforceTenantAccess(ctx);
    const user = await ctx.db.get(userId);
    const profile = await ctx.db
      .query("staffProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    return { ...user, profile };
  },
});

/**
 * Create or Update a staff profile.
 */
export const saveStaffProfile = mutation({
  args: {
    userId: v.id("users"),
    designation: v.string(),
    idNumber: v.string(),
    tczNumber: v.optional(v.string()),
    tczExpiry: v.optional(v.union(v.string(), v.number())),
    contractType: v.union(
      v.literal("permanent"),
      v.literal("contract"),
      v.literal("part-time"),
      v.literal("probation"),
    ),
    dateJoined: v.union(v.string(), v.number()),
    qualifications: v.array(v.string()),
    bankName: v.optional(v.string()),
    accountNumber: v.optional(v.string()),
    basicSalary: v.number(),
    allowanceHousing: v.optional(v.number()),
    allowanceTransport: v.optional(v.number()),
    allowanceOther: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { tenantId, role } = await enforceTenantAccess(ctx);

    // Only admins or headteachers can save profiles
    if (!["superAdmin", "proprietor", "headteacher"].includes(role || "")) {
      throw new Error("Unauthorized to manage staff profiles");
    }

    const existing = await ctx.db
      .query("staffProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    const profileData = {
      tenantId,
      ...args,
    };

    if (existing) {
      await ctx.db.patch(existing._id, profileData);
      return existing._id;
    } else {
      return await ctx.db.insert("staffProfiles", profileData);
    }
  },
});

/**
 * List daily attendance for all staff on a specific date.
 */
export const listStaffAttendance = query({
  args: { date: v.string() }, // ISO date string YYYY-MM-DD
  handler: async (ctx, { date }) => {
    const { tenantId } = await enforceTenantAccess(ctx);

    // Get all staff users first
    const staff = await ctx.db
      .query("users")
      .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
      .filter((q) =>
        q.or(
          q.eq(q.field("role"), "teacher"),
          q.eq(q.field("role"), "headteacher"),
          q.eq(q.field("role"), "bursar"),
          q.eq(q.field("role"), "boardingMatron"),
        ),
      )
      .collect();

    const attendanceRecords = await Promise.all(
      staff.map(async (user) => {
        const record = await ctx.db
          .query("staffAttendance")
          .withIndex("by_user_date", (q) =>
            q.eq("userId", user._id).eq("date", date),
          )
          .unique();
        return {
          userId: user._id,
          name: user.name,
          role: user.role,
          status: record?.status || "absent",
          checkIn: record?.checkIn,
          checkOut: record?.checkOut,
          notes: record?.notes,
        };
      }),
    );

    return attendanceRecords;
  },
});

/**
 * Record or update attendance for a staff member.
 */
export const recordAttendance = mutation({
  args: {
    userId: v.id("users"),
    date: v.string(),
    status: v.union(
      v.literal("present"),
      v.literal("absent"),
      v.literal("late"),
      v.literal("sick"),
      v.literal("on-leave"),
    ),
    checkIn: v.optional(v.string()),
    checkOut: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { tenantId } = await enforceTenantAccess(ctx);

    const existing = await ctx.db
      .query("staffAttendance")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", args.userId).eq("date", args.date),
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { ...args });
    } else {
      await ctx.db.insert("staffAttendance", {
        tenantId,
        ...args,
      });
    }
  },
});
