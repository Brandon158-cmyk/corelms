/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as CustomPassword from "../CustomPassword.js";
import type * as MockPasswordReset from "../MockPasswordReset.js";
import type * as academicYears from "../academicYears.js";
import type * as auth from "../auth.js";
import type * as classes from "../classes.js";
import type * as cleanup from "../cleanup.js";
import type * as grades from "../grades.js";
import type * as http from "../http.js";
import type * as setup from "../setup.js";
import type * as subjects from "../subjects.js";
import type * as tenants from "../tenants.js";
import type * as terms from "../terms.js";
import type * as testDiscovery from "../testDiscovery.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  CustomPassword: typeof CustomPassword;
  MockPasswordReset: typeof MockPasswordReset;
  academicYears: typeof academicYears;
  auth: typeof auth;
  classes: typeof classes;
  cleanup: typeof cleanup;
  grades: typeof grades;
  http: typeof http;
  setup: typeof setup;
  subjects: typeof subjects;
  tenants: typeof tenants;
  terms: typeof terms;
  testDiscovery: typeof testDiscovery;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
