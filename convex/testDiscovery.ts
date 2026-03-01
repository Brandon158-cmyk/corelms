import { action } from "./_generated/server";

export const run = action({
  args: {},
  handler: async (ctx) => {
    try {
      const siteUrl = process.env.CONVEX_SITE_URL;
      if (!siteUrl) {
        throw new Error("CONVEX_SITE_URL environment variable is not set.");
      }

      // Ensure no trailing slash on siteUrl and no double slashes when joining
      const baseUrl = siteUrl.endsWith("/") ? siteUrl.slice(0, -1) : siteUrl;
      const url = `${baseUrl}/.well-known/openid-configuration`;

      console.log("Fetching: " + url);
      const res = await fetch(url);
      const text = await res.text();

      console.log("Status: " + res.status);
      console.log("Body: " + text);

      return {
        success: res.ok,
        status: res.status,
        text,
      };
    } catch (e: any) {
      console.error("Discovery failed", e);
      return { success: false, error: e.message };
    }
  },
});
