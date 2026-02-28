const { spawnSync } = require("child_process");
const fs = require("fs");
const crypto = require("crypto");

async function run() {
  const { exportJWK, exportPKCS8, generateKeyPair } = await import("jose");

  const { privateKey, publicKey } = await generateKeyPair("RS256", {
    extractable: true,
  });

  // The public key needs to be a JWK
  const publicJwk = await exportJWK(publicKey);
  const jwks = JSON.stringify({ keys: [publicJwk] });

  // The private key needs to be a PKCS#8 formatted PEM string!
  const priv = await exportPKCS8(privateKey);

  const authSecret = crypto.randomBytes(32).toString("base64url");

  const envMap = {
    JWKS: jwks,
    JWT_PRIVATE_KEY: priv,
    AUTH_SECRET: authSecret,
  };

  for (const [name, value] of Object.entries(envMap)) {
    console.log(`Setting ${name}...`);
    const result = spawnSync(
      process.execPath,
      ["./node_modules/convex/bin/main.js", "env", "set", "--", name, value],
      {
        stdio: "inherit",
        shell: false,
      },
    );

    if (result.status !== 0) {
      console.error(`Failed to set ${name}`);
    }
  }
  console.log("Done!");
}

run().catch(console.error);
