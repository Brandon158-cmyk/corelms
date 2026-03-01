import { v } from "convex/values";
import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const universal = query({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const user = await ctx.db.get(userId);
    if (!user || !user.tenantId) {
      return [];
    }

    const tenantId = user.tenantId;

    if (!args.query || args.query.trim().length < 2) {
      return [];
    }

    // Execute multiple search queries concurrently for speed
    const [students, staff, classes, subjects] = await Promise.all([
      // Search for students matching the query
      ctx.db
        .query("users")
        .withSearchIndex("search_name", (q) =>
          q
            .search("name", args.query)
            .eq("tenantId", tenantId)
            .eq("role", "student"),
        )
        .take(5),

      // Search for staff matching the query (teachers, admins)
      ctx.db
        .query("users")
        .withSearchIndex("search_name", (q) =>
          q.search("name", args.query).eq("tenantId", tenantId),
        )
        .filter((q) => q.neq(q.field("role"), "student"))
        .filter((q) => q.neq(q.field("role"), "parent"))
        .take(5),

      // Search for classes
      ctx.db
        .query("classes")
        .withSearchIndex("search_name", (q) =>
          q.search("name", args.query).eq("tenantId", tenantId),
        )
        .take(5),

      // Search for subjects
      ctx.db
        .query("subjects")
        .withSearchIndex("search_name", (q) =>
          q.search("name", args.query).eq("tenantId", tenantId),
        )
        .take(5),
    ]);

    // Format all results into a unified array suitable for the Command UI
    const results = [
      ...students.map((s) => ({
        id: s._id,
        type: "Student" as const,
        title: s.name || "Unknown Student",
        subtitle: s.email || "No email",
        href: `/dashboard/students/${s._id}`,
      })),
      ...staff.map((s) => ({
        id: s._id,
        type: "Staff" as const,
        title: s.name || "Unknown Staff",
        subtitle: s.role
          ? s.role.charAt(0).toUpperCase() + s.role.slice(1)
          : "Staff",
        href: `/dashboard/hr/staff/${s._id}`,
      })),
      ...classes.map((c) => ({
        id: c._id,
        type: "Class" as const,
        title: c.name,
        subtitle: c.room ? `Room ${c.room}` : "No assigned room",
        href: `/dashboard/classes/${c._id}`,
      })),
      ...subjects.map((s) => ({
        id: s._id,
        type: "Subject" as const,
        title: s.name,
        subtitle: s.description || "Core Subject",
        href: `/dashboard/subjects`,
      })),
    ];

    return results;
  },
});
