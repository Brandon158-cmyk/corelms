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

const DAY_ORDER = ["monday", "tuesday", "wednesday", "thursday", "friday"];

// ─── Slots ──────────────────────────────────────────────────────────────

export const listSlots = query({
  args: {},
  handler: async (ctx) => {
    const { tenantId } = await enforceTenantAccess(ctx);
    const slots = await ctx.db
      .query("timetableSlots")
      .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
      .collect();

    // Sort by day order then period number
    return slots.sort((a, b) => {
      const dayDiff = DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day);
      if (dayDiff !== 0) return dayDiff;
      return a.periodNumber - b.periodNumber;
    });
  },
});

export const saveSlot = mutation({
  args: {
    id: v.optional(v.id("timetableSlots")),
    day: v.union(
      v.literal("monday"),
      v.literal("tuesday"),
      v.literal("wednesday"),
      v.literal("thursday"),
      v.literal("friday"),
    ),
    periodNumber: v.number(),
    startTime: v.string(),
    endTime: v.string(),
    type: v.union(
      v.literal("lesson"),
      v.literal("break"),
      v.literal("assembly"),
    ),
    label: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { tenantId } = await enforceTenantAccess(ctx);
    const { id, ...data } = args;

    if (id) {
      await ctx.db.patch(id, data);
      return id;
    } else {
      return await ctx.db.insert("timetableSlots", { tenantId, ...data });
    }
  },
});

export const deleteSlot = mutation({
  args: { id: v.id("timetableSlots") },
  handler: async (ctx, { id }) => {
    await enforceTenantAccess(ctx);
    // Also delete all entries referencing this slot
    const entries = await ctx.db
      .query("timetableEntries")
      .withIndex("by_slot", (q) => q.eq("slotId", id))
      .collect();
    for (const entry of entries) {
      await ctx.db.delete(entry._id);
    }
    await ctx.db.delete(id);
  },
});

// ─── Entries ────────────────────────────────────────────────────────────

export const listEntries = query({
  args: {
    classId: v.id("classes"),
    termId: v.optional(v.id("terms")),
  },
  handler: async (ctx, args) => {
    const { tenantId } = await enforceTenantAccess(ctx);
    let entries = await ctx.db
      .query("timetableEntries")
      .withIndex("by_class", (q) => q.eq("classId", args.classId))
      .collect();

    // Filter by tenant
    entries = entries.filter((e) => e.tenantId === tenantId);

    // Filter by term if specified
    if (args.termId) {
      entries = entries.filter((e) => e.termId === args.termId);
    }

    // Hydrate with slot, subject, teacher info
    return await Promise.all(
      entries.map(async (entry) => {
        const slot = await ctx.db.get(entry.slotId);
        const subject = await ctx.db.get(entry.subjectId);
        const teacher = entry.teacherId
          ? await ctx.db.get(entry.teacherId)
          : null;
        return {
          ...entry,
          day: slot?.day || "monday",
          periodNumber: slot?.periodNumber || 0,
          startTime: slot?.startTime || "",
          endTime: slot?.endTime || "",
          slotType: slot?.type || "lesson",
          subjectName: subject?.name || "Unknown",
          teacherName: teacher?.name || null,
        };
      }),
    );
  },
});

export const saveEntry = mutation({
  args: {
    id: v.optional(v.id("timetableEntries")),
    slotId: v.id("timetableSlots"),
    classId: v.id("classes"),
    subjectId: v.id("subjects"),
    teacherId: v.optional(v.id("users")),
    room: v.optional(v.string()),
    termId: v.optional(v.id("terms")),
  },
  handler: async (ctx, args) => {
    const { tenantId } = await enforceTenantAccess(ctx);
    const { id, ...data } = args;

    // Check for duplicate: same slot + same class already has an entry
    if (!id) {
      const existing = await ctx.db
        .query("timetableEntries")
        .withIndex("by_slot", (q) => q.eq("slotId", args.slotId))
        .filter((q) => q.eq(q.field("classId"), args.classId))
        .first();
      if (existing) {
        throw new Error(
          "This slot already has an entry for this class. Delete it first or edit it.",
        );
      }
    }

    if (id) {
      await ctx.db.patch(id, data);
      return id;
    } else {
      return await ctx.db.insert("timetableEntries", { tenantId, ...data });
    }
  },
});

export const deleteEntry = mutation({
  args: { id: v.id("timetableEntries") },
  handler: async (ctx, { id }) => {
    await enforceTenantAccess(ctx);
    await ctx.db.delete(id);
  },
});

// ─── Teacher Timetable ──────────────────────────────────────────────────

export const getTeacherTimetable = query({
  args: {
    teacherId: v.id("users"),
    termId: v.optional(v.id("terms")),
  },
  handler: async (ctx, args) => {
    const { tenantId } = await enforceTenantAccess(ctx);
    let entries = await ctx.db
      .query("timetableEntries")
      .withIndex("by_teacher", (q) => q.eq("teacherId", args.teacherId))
      .collect();

    entries = entries.filter((e) => e.tenantId === tenantId);

    if (args.termId) {
      entries = entries.filter((e) => e.termId === args.termId);
    }

    return await Promise.all(
      entries.map(async (entry) => {
        const slot = await ctx.db.get(entry.slotId);
        const subject = await ctx.db.get(entry.subjectId);
        const cls = await ctx.db.get(entry.classId);
        return {
          ...entry,
          day: slot?.day || "monday",
          periodNumber: slot?.periodNumber || 0,
          startTime: slot?.startTime || "",
          endTime: slot?.endTime || "",
          subjectName: subject?.name || "Unknown",
          className: cls?.name || "Unknown",
        };
      }),
    );
  },
});

// ─── Conflict Detection ─────────────────────────────────────────────────

export const checkConflicts = query({
  args: {
    slotId: v.id("timetableSlots"),
    teacherId: v.optional(v.id("users")),
    room: v.optional(v.string()),
    excludeEntryId: v.optional(v.id("timetableEntries")),
  },
  handler: async (ctx, args) => {
    await enforceTenantAccess(ctx);
    const conflicts: { type: string; detail: string }[] = [];

    // Get all entries for this same slot
    const slotEntries = await ctx.db
      .query("timetableEntries")
      .withIndex("by_slot", (q) => q.eq("slotId", args.slotId))
      .collect();

    const filtered = args.excludeEntryId
      ? slotEntries.filter((e) => e._id !== args.excludeEntryId)
      : slotEntries;

    // Teacher conflict: same teacher in multiple classes at the same time
    if (args.teacherId) {
      const teacherConflict = filtered.find(
        (e) => e.teacherId === args.teacherId,
      );
      if (teacherConflict) {
        const cls = await ctx.db.get(teacherConflict.classId);
        conflicts.push({
          type: "teacher",
          detail: `Teacher is already assigned to ${cls?.name || "another class"} in this period.`,
        });
      }
    }

    // Room conflict: same room used by multiple classes at the same time
    if (args.room) {
      const roomConflict = filtered.find((e) => e.room && e.room === args.room);
      if (roomConflict) {
        const cls = await ctx.db.get(roomConflict.classId);
        conflicts.push({
          type: "room",
          detail: `Room "${args.room}" is already used by ${cls?.name || "another class"} in this period.`,
        });
      }
    }

    return conflicts;
  },
});
