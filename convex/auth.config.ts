/**
 * Auth configuration for Convex.
 * This tells Convex how to validate JWT tokens issued by Convex Auth.
 * The CONVEX_SITE_URL env var is set automatically by Convex.
 */
export default {
  providers: [
    {
      domain: "https://vivid-armadillo-494.convex.site",
      applicationID: "convex",
    },
  ],
};
