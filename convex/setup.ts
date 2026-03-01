import { mutation } from "./_generated/server";
import { auth } from "./auth";

/**
 * Development utility to bootstrap your user with a Tenant and superAdmin role.
 * Run this by clicking a button or calling it in the console to test the forms!
 */
export const makeMeAdmin = mutation({
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("You must be logged in to run this setup script.");
    }

    // Check if the user already has a tenant to avoid duplicates
    const user = await ctx.db.get(userId);
    if (user?.tenantId) {
      // Just ensure they are an admin
      await ctx.db.patch(userId, { role: "superAdmin" });
      return "User is already in a tenant. Updated role to superAdmin.";
    }

    // Create a dummy tenant
    // Generate a unique school code with a larger random part and a collision check
    let schoolCode = "";
    let isUnique = false;
    while (!isUnique) {
      const randomPart = Math.floor(100000 + Math.random() * 900000); // 6-digit random
      schoolCode = `DEMO_${randomPart}`;

      const existing = await ctx.db
        .query("tenants")
        .withIndex("by_schoolCode", (q) => q.eq("schoolCode", schoolCode))
        .unique();

      if (!existing) isUnique = true;
    }

    const tenantId = await ctx.db.insert("tenants", {
      name: "CoreLMS Demo School",
      schoolCode,
      status: "active",
      createdAt: Date.now(),
    });

    // Assign to current user
    await ctx.db.patch(userId, {
      tenantId: tenantId,
      role: "superAdmin",
      status: "active",
    });

    return `Successfully created Demo School and made you superAdmin!`;
  },
});
