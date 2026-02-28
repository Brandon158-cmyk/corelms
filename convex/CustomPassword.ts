import { Password } from "@convex-dev/auth/providers/Password";
import { DataModel } from "./_generated/dataModel";

/**
 * Custom Password provider for corelms.
 * Extends the default Password provider to include additional
 * user profile fields: name, role, and tenantId (via schoolCode).
 *
 * The `profile` callback maps sign-up form fields to user document fields.
 * The schoolCode → tenantId resolution happens in the auth callbacks.
 */
const CustomPassword = Password<DataModel>({
  profile(params) {
    return {
      email: params.email as string,
      name: (params.name as string) || "",
      role: (params.role as string) || "student",
    };
  },
});

export default CustomPassword;
