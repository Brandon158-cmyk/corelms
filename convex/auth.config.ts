/**
 * Auth configuration for Convex.
 * This tells Convex how to validate JWT tokens issued by Convex Auth.
 * The CONVEX_SITE_URL env var is set automatically by Convex.
 */
const domain = process.env.CONVEX_SITE_URL;

if (!domain) {
  throw new Error(
    "CONVEX_SITE_URL environment variable is not set. " +
      "This is required for Convex Auth to validate JWT tokens. " +
      "Please ensure it is configured in your Convex dashboard or local environment.",
  );
}

export default {
  providers: [
    {
      domain,
      applicationID: "convex",
    },
  ],
};
