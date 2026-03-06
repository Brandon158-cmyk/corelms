"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

export default function SignInPage() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("flow", "signIn");

    try {
      await signIn("password", formData);
      router.push("/dashboard");
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      {/* Page heading — serif, page-title size */}
      <div style={{ marginBottom: "var(--space-xl)" }}>
        <h2
          style={{
            fontFamily: "var(--font-family-heading)",
            fontSize: "var(--font-size-page-title)",
            fontWeight: "var(--font-weight-bold)",
            color: "var(--color-text-heading)",
            lineHeight: "var(--line-height-tight)",
          }}
        >
          Welcome back.
        </h2>
        <p
          style={{
            fontFamily: "var(--font-family-body)",
            fontSize: "var(--font-size-body)",
            color: "var(--color-text-secondary)",
            marginTop: "var(--space-sm)",
            lineHeight: "var(--line-height-relaxed)",
          }}
        >
          Log in to your account to continue.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div
          style={{
            marginBottom: "var(--space-md)",
            borderRadius: "var(--radius-sm-token)",
            border: "1px solid var(--color-accent-secondary)",
            background: "rgba(163, 58, 42, 0.06)",
            padding: "var(--space-sm) var(--space-md)",
            fontSize: "var(--font-size-body)",
            color: "var(--color-accent-secondary)",
            fontFamily: "var(--font-family-body)",
          }}
        >
          {error}
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col"
        style={{ gap: "var(--space-md)" }}
      >
        <div className="flex flex-col" style={{ gap: "var(--space-sm)" }}>
          <Label
            htmlFor="signin-email"
            style={{
              fontFamily: "var(--font-family-body)",
              fontSize: "var(--font-size-body)",
              fontWeight: "var(--font-weight-medium)",
              color: "var(--color-text-body)",
            }}
          >
            Email
          </Label>
          <div className="relative">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--color-text-placeholder)" }}
            >
              <rect
                x="2"
                y="4"
                width="20"
                height="16"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M22 7L13.03 12.7a1.94 1.94 0 01-2.06 0L2 7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <Input
              id="signin-email"
              name="email"
              type="email"
              required
              placeholder="Enter your email"
              className="pl-10"
              style={{
                height: "var(--input-height)",
                borderRadius: "var(--radius-sm-token)",
                border: "1px solid var(--color-border-input)",
                fontFamily: "var(--font-family-body)",
                fontSize: "var(--font-size-body)",
              }}
              autoComplete="email"
            />
          </div>
        </div>

        <div className="flex flex-col" style={{ gap: "var(--space-sm)" }}>
          <Label
            htmlFor="signin-password"
            style={{
              fontFamily: "var(--font-family-body)",
              fontSize: "var(--font-size-body)",
              fontWeight: "var(--font-weight-medium)",
              color: "var(--color-text-body)",
            }}
          >
            Password
          </Label>
          <div className="relative">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--color-text-placeholder)" }}
            >
              <rect
                x="3"
                y="11"
                width="18"
                height="11"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M7 11V7a5 5 0 0110 0v4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <circle cx="12" cy="16" r="1" fill="currentColor" />
            </svg>
            <Input
              id="signin-password"
              name="password"
              type="password"
              required
              placeholder="Enter your password"
              className="pl-10"
              style={{
                height: "var(--input-height)",
                borderRadius: "var(--radius-sm-token)",
                border: "1px solid var(--color-border-input)",
                fontFamily: "var(--font-family-body)",
                fontSize: "var(--font-size-body)",
              }}
              autoComplete="current-password"
            />
          </div>
        </div>

        {/* Primary Button — solid maroon, uppercase, sm radius */}
        <Button
          type="submit"
          className="w-full cursor-pointer transition-colors"
          style={{
            height: "var(--input-height)",
            background: "var(--color-accent-primary)",
            color: "var(--color-text-inverse)",
            borderRadius: "var(--radius-sm-token)",
            textTransform: "uppercase" as const,
            fontFamily: "var(--font-family-body)",
            fontWeight: "var(--font-weight-medium)",
            fontSize: "var(--font-size-body)",
            letterSpacing: "var(--letter-spacing-uppercase)",
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Spinner className="w-4 h-4" />
              Signing in...
            </span>
          ) : (
            "LOG IN"
          )}
        </Button>
      </form>

      {/* Links */}
      <div className="text-center" style={{ marginTop: "var(--space-xl)" }}>
        <p
          style={{
            fontSize: "var(--font-size-body)",
            color: "var(--color-text-secondary)",
            fontFamily: "var(--font-family-body)",
            marginBottom: "var(--space-sm)",
          }}
        >
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            style={{
              fontWeight: "var(--font-weight-semibold)",
              color: "var(--color-link)",
            }}
            className="hover:underline transition-colors"
          >
            Register
          </Link>
        </p>
        <Link
          href="/forgot-password"
          style={{
            fontSize: "var(--font-size-body)",
            fontWeight: "var(--font-weight-semibold)",
            color: "var(--color-link)",
            fontFamily: "var(--font-family-body)",
          }}
          className="hover:underline transition-colors inline-block"
        >
          Forgot password?
        </Link>
      </div>
    </div>
  );
}
