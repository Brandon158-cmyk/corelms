import { httpRouter } from "convex/server";
import { auth } from "./auth";

/**
 * HTTP router for Convex.
 * Registers Convex Auth HTTP routes for handling
 * sign-in/sign-up/sign-out/token refresh flows.
 */
const http = httpRouter();

auth.addHttpRoutes(http);

export default http;
