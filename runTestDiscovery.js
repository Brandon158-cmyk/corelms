const { ConvexHttpClient } = require("convex/browser");
require("dotenv").config({ path: ".env.local" });

async function run() {
  const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
  const result = await client.action("testDiscovery");
  console.log(result);
}

run().catch(console.error);
