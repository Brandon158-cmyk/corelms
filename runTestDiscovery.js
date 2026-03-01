const { ConvexHttpClient } = require("convex/browser");
require("dotenv").config({ path: ".env.local" });

async function run() {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL is not defined in environment.");
  }
  const client = new ConvexHttpClient(convexUrl);
  const result = await client.action("testDiscovery:run");
  console.log(result);
}

run().catch(console.error);
