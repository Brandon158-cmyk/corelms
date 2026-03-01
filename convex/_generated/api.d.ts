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
import type * as analytics from "../analytics.js";
import type * as assessments from "../assessments.js";
import type * as attendance from "../attendance.js";
import type * as auth from "../auth.js";
import type * as classes from "../classes.js";
import type * as cleanup from "../cleanup.js";
import type * as comm from "../comm.js";
import type * as dashboard from "../dashboard.js";
import type * as discipline from "../discipline.js";
import type * as financials from "../financials.js";
import type * as grades from "../grades.js";
import type * as hostels from "../hostels.js";
import type * as http from "../http.js";
import type * as lms from "../lms.js";
import type * as payroll from "../payroll.js";
import type * as reportCards from "../reportCards.js";
import type * as search from "../search.js";
import type * as seed from "../seed.js";
import type * as sen from "../sen.js";
import type * as setup from "../setup.js";
import type * as staff from "../staff.js";
import type * as students from "../students.js";
import type * as subjects from "../subjects.js";
import type * as tenants from "../tenants.js";
import type * as terms from "../terms.js";
import type * as testDiscovery from "../testDiscovery.js";
import type * as timetable from "../timetable.js";
import type * as tracking from "../tracking.js";
import type * as transport from "../transport.js";
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
  analytics: typeof analytics;
  assessments: typeof assessments;
  attendance: typeof attendance;
  auth: typeof auth;
  classes: typeof classes;
  cleanup: typeof cleanup;
  comm: typeof comm;
  dashboard: typeof dashboard;
  discipline: typeof discipline;
  financials: typeof financials;
  grades: typeof grades;
  hostels: typeof hostels;
  http: typeof http;
  lms: typeof lms;
  payroll: typeof payroll;
  reportCards: typeof reportCards;
  search: typeof search;
  seed: typeof seed;
  sen: typeof sen;
  setup: typeof setup;
  staff: typeof staff;
  students: typeof students;
  subjects: typeof subjects;
  tenants: typeof tenants;
  terms: typeof terms;
  testDiscovery: typeof testDiscovery;
  timetable: typeof timetable;
  tracking: typeof tracking;
  transport: typeof transport;
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
