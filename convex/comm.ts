import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";
import { Id } from "./_generated/dataModel";

/**
 * Ensures the currently authenticated user belongs to a tenant.
 */
async function getTenantUser(ctx: any) {
  const userId = await auth.getUserId(ctx);
  if (!userId) throw new Error("Not authenticated");

  const user = await ctx.db.get(userId);
  if (!user || !user.tenantId) {
    throw new Error("User does not belong to a school");
  }

  return {
    userId,
    tenantId: user.tenantId as Id<"tenants">,
    role: user.role as string,
  };
}

/**
 * List active announcements for the tenant.
 */
export const listAnnouncements = query({
  args: {
    audience: v.optional(
      v.union(
        v.literal("all"),
        v.literal("staff"),
        v.literal("parents"),
        v.literal("students"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const { tenantId } = await getTenantUser(ctx);

    let announcements = await ctx.db
      .query("announcements")
      .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
      .order("desc")
      .collect();

    if (args.audience) {
      announcements = announcements.filter(
        (a) => a.audience === args.audience || a.audience === "all",
      );
    }

    // Enrich with author name
    return await Promise.all(
      announcements.map(async (a) => {
        const author = await ctx.db.get(a.authorId);
        return {
          ...a,
          authorName: author?.name || "System",
        };
      }),
    );
  },
});

/**
 * Create a new announcement.
 */
export const createAnnouncement = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    audience: v.union(
      v.literal("all"),
      v.literal("staff"),
      v.literal("parents"),
      v.literal("students"),
    ),
    priority: v.union(v.literal("normal"), v.literal("urgent")),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { tenantId, userId, role } = await getTenantUser(ctx);

    if (
      !["superAdmin", "proprietor", "headteacher", "bursar"].includes(
        role ?? "",
      )
    ) {
      throw new Error("Unauthorized to post announcements");
    }

    return await ctx.db.insert("announcements", {
      tenantId,
      title: args.title,
      content: args.content,
      audience: args.audience,
      authorId: userId,
      priority: args.priority,
      expiresAt: args.expiresAt,
      createdAt: Date.now(),
    });
  },
});

/**
 * List communication logs.
 */
export const listLogs = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { tenantId } = await getTenantUser(ctx);

    const logs = await ctx.db
      .query("communicationLogs")
      .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
      .order("desc")
      .take(args.limit || 50);

    return await Promise.all(
      logs.map(async (log) => {
        const sender = await ctx.db.get(log.senderId);
        return {
          ...log,
          senderName: sender?.name || "System",
        };
      }),
    );
  },
});

/**
 * List message templates.
 */
export const listTemplates = query({
  args: {},
  handler: async (ctx) => {
    const { tenantId } = await getTenantUser(ctx);
    return await ctx.db
      .query("communicationTemplates")
      .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
      .collect();
  },
});

/**
 * Create or update a template.
 */
export const saveTemplate = mutation({
  args: {
    id: v.optional(v.id("communicationTemplates")),
    name: v.string(),
    type: v.union(v.literal("sms"), v.literal("email")),
    content: v.string(),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { tenantId } = await getTenantUser(ctx);

    if (args.id) {
      await ctx.db.patch(args.id, {
        name: args.name,
        type: args.type,
        content: args.content,
        category: args.category,
      });
      return args.id;
    } else {
      return await ctx.db.insert("communicationTemplates", {
        tenantId,
        name: args.name,
        type: args.type,
        content: args.content,
        category: args.category,
      });
    }
  },
});

/**
 * Send bulk messages (Mocked for now).
 * In production, this would be an action calling Twilio/SendGrid.
 */
export const sendBulkMessages = mutation({
  args: {
    recipientIds: v.array(v.id("users")),
    type: v.union(v.literal("sms"), v.literal("email")),
    subject: v.optional(v.string()),
    bodyTemplate: v.string(),
  },
  handler: async (ctx, args) => {
    const { tenantId, userId, role } = await getTenantUser(ctx);

    if (
      !["superAdmin", "proprietor", "headteacher", "bursar"].includes(
        role ?? "",
      )
    ) {
      throw new Error("Unauthorized to send bulk messages");
    }

    const recipients = await Promise.all(
      args.recipientIds.map((id) => ctx.db.get(id)),
    );

    const logs = [];
    for (const recipient of recipients) {
      if (!recipient) continue;

      const contactInfo =
        args.type === "sms" ? recipient.phone : recipient.email;
      if (!contactInfo) continue;

      // Simple template replacement
      const body = args.bodyTemplate.replace(
        "{{name}}",
        recipient.name || "User",
      );

      const logId = await ctx.db.insert("communicationLogs", {
        tenantId,
        senderId: userId,
        type: args.type,
        recipientInfo: contactInfo,
        subject: args.subject,
        body: body,
        status: "sent", // Mocking success
        sentAt: Date.now(),
      });
      logs.push(logId);
    }

    return { count: logs.length };
  },
});

/**
 * Delete an announcement.
 */
export const deleteAnnouncement = mutation({
  args: { id: v.id("announcements") },
  handler: async (ctx, { id }) => {
    const { tenantId, role } = await getTenantUser(ctx);
    if (!["superAdmin", "proprietor", "headteacher"].includes(role ?? "")) {
      throw new Error("Unauthorized");
    }
    const announcement = await ctx.db.get(id);
    if (!announcement || announcement.tenantId !== tenantId) {
      throw new Error("Not found");
    }
    await ctx.db.delete(id);
  },
});
