import { Password } from "@convex-dev/auth/providers/Password";
import { DataModel } from "./_generated/dataModel";
import { MockPasswordReset } from "./MockPasswordReset";

/**
 * Custom Password provider for corelms.
 * Extends the default Password provider to include additional
 * user profile fields: name, role, and tenantId (via schoolCode).
 *
 * The `profile` callback maps sign-up form fields to user document fields.
 * The `reset` option handles the password reset OTP flow.
 */
const isProd =
  process.env.NODE_ENV === "production" ||
  !!process.env.PASSWORD_RESET_PROVIDER;

// In production, we MUST use a secure email provider.
// If one is not configured, we throw an error during initialization to prevent
// MockPasswordReset (which logs tokens to console) from being used.
const ProductionPasswordReset = undefined;

if (isProd && !ProductionPasswordReset) {
  console.error(
    "❌ [SECURITY ALERT]: Production environment detected but no secure Password Reset provider is configured.",
  );
  throw new Error(
    "Production password reset provider is not configured. " +
      "MockPasswordReset is UNSAFE for production as it logs tokens to the console. " +
      "Please configure a ProductionEmailReset or SmtpPasswordReset in convex/CustomPassword.ts",
  );
}

const CustomPassword = Password<DataModel>({
  profile(params) {
    return {
      email: params.email as string,
      name: (params.name as string) || "",
      role: (params.role as string) || "student",
    };
  },
  reset: isProd ? ProductionPasswordReset : MockPasswordReset,
});

export default CustomPassword;
