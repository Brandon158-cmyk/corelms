import { action } from "./_generated/server";

export const run = action({
  args: {},
  handler: async (ctx) => {
    try {
      const siteUrl = process.env.CONVEX_SITE_URL;
      const url = siteUrl + "/.well-known/openid-configuration";
      console.log("Fetching: " + url);
      const res = await fetch(url);
      const text = await res.text();
      console.log("Status: " + res.status);
      console.log("Body: " + text);
      return { success: true, status: res.status, text };
    } catch (e: any) {
      console.error("Fetch failed", e);
      return { success: false, error: e.message };
    }
  },
});
