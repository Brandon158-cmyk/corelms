/**
 * ONE-TIME cleanup script to clear orphaned auth data.
 * Delete this file after running it once.
 */
import { mutation } from "./_generated/server";

/**
 * Clears all records from authAccounts, authSessions, and authRefreshTokens.
 * Safe to run when no active users exist.
 * Usage: Run from Convex dashboard → Functions → cleanup:clearAuthData
 */
export const clearAuthData = mutation({
  args: {},
  handler: async (ctx) => {
    // Clear authAccounts
    const accounts = await ctx.db.query("authAccounts").collect();
    for (const account of accounts) {
      await ctx.db.delete(account._id);
    }

    // Clear authSessions
    const sessions = await ctx.db.query("authSessions").collect();
    for (const session of sessions) {
      await ctx.db.delete(session._id);
    }

    // Clear authRefreshTokens
    const tokens = await ctx.db.query("authRefreshTokens").collect();
    for (const token of tokens) {
      await ctx.db.delete(token._id);
    }

    // Clear any users too
    const users = await ctx.db.query("users").collect();
    for (const user of users) {
      await ctx.db.delete(user._id);
    }

    return {
      deleted: {
        accounts: accounts.length,
        sessions: sessions.length,
        tokens: tokens.length,
        users: users.length,
      },
    };
  },
});
