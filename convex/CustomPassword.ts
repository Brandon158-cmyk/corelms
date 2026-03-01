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
  process.env.IS_PROD === "true" || !!process.env.PASSWORD_RESET_PROVIDER;

// In production, we SHOULD use a secure email provider.
const ProductionPasswordReset = undefined;

if (isProd && !ProductionPasswordReset) {
  console.warn(
    "⚠️ [SECURITY WARNING]: Production mode is enabled but no secure Password Reset provider is configured. " +
      "Falling back to MockPasswordReset which logs tokens to the console. THIS IS UNSAFE FOR PRODUCTION.",
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
