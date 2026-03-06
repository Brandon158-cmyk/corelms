"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

export default function ForgotPasswordPage() {
  const { signIn } = useAuthActions();
  const router = useRouter();

  const [step, setStep] = useState<"forgot" | "verify">("forgot");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRequestCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("flow", "reset");

    try {
      await signIn("password", formData);
      setStep("verify");
    } catch {
      setError(
        "Unable to process your request. Please try again or check your email.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerifyAndReset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("email", email);
    formData.set("flow", "reset-verification");

    try {
      await signIn("password", formData);
      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
    } catch {
      setError("Invalid reset code or password too weak. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  /* Shared input style — references design tokens */
  const inputStyle = {
    height: "var(--input-height)",
    borderRadius: "var(--radius-sm-token)",
    border: "1px solid var(--color-border-input)",
    fontFamily: "var(--font-family-body)",
    fontSize: "var(--font-size-body)",
  };

  const labelStyle = {
    fontFamily: "var(--font-family-body)",
    fontSize: "var(--font-size-body)",
    fontWeight: "var(--font-weight-medium)" as const,
    color: "var(--color-text-body)",
  };

  /* Primary button style — solid maroon, uppercase */
  const primaryButtonStyle = {
    height: "var(--input-height)",
    background: "var(--color-accent-primary)",
    color: "var(--color-text-inverse)",
    borderRadius: "var(--radius-sm-token)",
    textTransform: "uppercase" as const,
    fontFamily: "var(--font-family-body)",
    fontWeight: "var(--font-weight-medium)" as const,
    fontSize: "var(--font-size-body)",
    letterSpacing: "var(--letter-spacing-uppercase)",
  };

  /* Secondary/ghost button style */
  const ghostButtonStyle = {
    height: "var(--input-height)",
    background: "var(--color-surface-primary)",
    border: "var(--button-border-width) solid var(--color-accent-primary)",
    color: "var(--color-accent-primary)",
    borderRadius: "var(--radius-sm-token)",
    textTransform: "uppercase" as const,
    fontFamily: "var(--font-family-body)",
    fontWeight: "var(--font-weight-medium)" as const,
    fontSize: "var(--font-size-body)",
    letterSpacing: "var(--letter-spacing-uppercase)",
  };

  return (
    <div>
      {/* Page heading — serif */}
      <div style={{ marginBottom: "var(--space-lg)" }}>
        <h2
          style={{
            fontFamily: "var(--font-family-heading)",
            fontSize: "var(--font-size-section-heading)",
            fontWeight: "var(--font-weight-bold)",
            color: "var(--color-text-heading)",
            lineHeight: "var(--line-height-tight)",
          }}
        >
          {step === "forgot" ? "Reset password" : "Verify OTP"}
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
          {step === "forgot"
            ? "Enter your email address and we'll send you a temporary code to reset your password."
            : "Enter the verification code sent to your email address to proceed."}
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

      {/* Step 1: Request Code */}
      {step === "forgot" ? (
        <form
          onSubmit={handleRequestCode}
          className="flex flex-col"
          style={{ gap: "var(--space-md)" }}
        >
          <div className="flex flex-col" style={{ gap: "var(--space-sm)" }}>
            <Label htmlFor="reset-email" style={labelStyle}>
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
                id="reset-email"
                name="email"
                type="email"
                required
                placeholder="Enter your email"
                className="pl-10"
                style={inputStyle}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full cursor-pointer transition-colors"
            style={primaryButtonStyle}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Spinner className="w-4 h-4" /> SENDING...
              </span>
            ) : (
              "SEND RESET CODE"
            )}
          </Button>
        </form>
      ) : (
        /* Step 2: Verify Code and Set New Password */
        <form
          onSubmit={handleVerifyAndReset}
          className="flex flex-col"
          style={{ gap: "var(--space-md)" }}
        >
          <div className="flex flex-col" style={{ gap: "var(--space-sm)" }}>
            <Label htmlFor="reset-code" style={labelStyle}>
              8-Character Reset Code
            </Label>
            <Input
              id="reset-code"
              name="code"
              type="text"
              required
              placeholder="e.g. A1B2C3D4"
              className="font-mono tracking-widest uppercase"
              style={inputStyle}
              autoComplete="off"
            />
          </div>

          <div className="flex flex-col" style={{ gap: "var(--space-sm)" }}>
            <Label htmlFor="new-password" style={labelStyle}>
              New Password
            </Label>
            <Input
              id="new-password"
              name="newPassword"
              type="password"
              required
              placeholder="Enter your new password"
              style={inputStyle}
              autoComplete="new-password"
            />
          </div>

          <Button
            type="submit"
            className="w-full cursor-pointer transition-colors"
            style={primaryButtonStyle}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Spinner className="w-4 h-4" /> RESETTING...
              </span>
            ) : (
              "RESET PASSWORD & LOGIN"
            )}
          </Button>

          {/* Secondary/ghost button — per design guide pattern */}
          <Button
            type="button"
            variant="ghost"
            className="w-full cursor-pointer transition-colors"
            style={ghostButtonStyle}
            onClick={() => setStep("forgot")}
            disabled={isLoading}
          >
            BACK TO EMAIL
          </Button>
        </form>
      )}

      {/* Back to Sign In */}
      <div className="text-center" style={{ marginTop: "var(--space-lg)" }}>
        <Link
          href="/sign-in"
          className="inline-flex items-center transition-colors hover:underline"
          style={{
            gap: "var(--space-sm)",
            fontSize: "var(--font-size-body)",
            fontWeight: "var(--font-weight-medium)",
            color: "var(--color-link)",
            fontFamily: "var(--font-family-body)",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            style={{ color: "currentcolor" }}
          >
            <path
              d="M19 12H5M12 19l-7-7 7-7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}
