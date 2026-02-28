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
const CustomPassword = Password<DataModel>({
  profile(params) {
    return {
      email: params.email as string,
      name: (params.name as string) || "",
      role: (params.role as string) || "student",
    };
  },
  reset: MockPasswordReset,
});

export default CustomPassword;
