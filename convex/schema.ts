import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

/**
 * User roles across the multi-tenant corelms platform.
 * Each role maps to a specific dashboard and permission set.
 */
export const USER_ROLES = v.union(
  v.literal("superAdmin"),
  v.literal("management"),
  v.literal("teacher"),
  v.literal("staff"),
  v.literal("student"),
  v.literal("parent"),
);

/**
 * Tenant (school) status values.
 */
export const TENANT_STATUS = v.union(
  v.literal("active"),
  v.literal("inactive"),
  v.literal("suspended"),
);

const schema = defineSchema({
  // Convex Auth managed tables (authAccounts, authSessions, authRefreshTokens, etc.)
  ...authTables,

  /**
   * Override the default users table from authTables to add custom fields.
   * Must include all default auth fields as optional + our custom fields.
   * See: https://labs.convex.dev/auth/setup/schema#customizing-the-users-table
   */
  users: defineTable({
    // Default Convex Auth fields (must remain optional)
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    // Custom corelms fields
    role: v.optional(v.string()),
    tenantId: v.optional(v.id("tenants")),
  })
    .index("email", ["email"])
    .index("by_tenant", ["tenantId"])
    .index("by_tenant_role", ["tenantId", "role"]),

  /**
   * Tenants table — represents individual schools/organizations.
   * Each tenant has a unique schoolCode used during sign-up.
   */
  tenants: defineTable({
    name: v.string(),
    schoolCode: v.string(),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    logo: v.optional(v.string()),
    status: TENANT_STATUS,
    subscriptionTier: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_schoolCode", ["schoolCode"])
    .index("by_status", ["status"]),

  /**
   * Password reset tokens for the forgot-password flow.
   * Tokens expire after a configurable duration.
   */
  passwordResetTokens: defineTable({
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
    used: v.boolean(),
  })
    .index("by_token", ["token"])
    .index("by_userId", ["userId"]),
});

export default schema;
