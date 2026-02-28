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

  // Handle step 1: Request OTP
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

  // Handle step 2: Verify OTP and set new password
  async function handleVerifyAndReset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("email", email); // Pass the email from step 1
    formData.set("flow", "reset-verification");

    try {
      await signIn("password", formData);
      // Wait a moment for authentication state to catch up
      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
    } catch (err: any) {
      setError("Invalid reset code or password too weak. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-6 lg:hidden">
          <div className="flex items-center justify-center w-8 h-8 bg-brand-navy rounded-lg">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              className="text-white"
            >
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-lg font-bold text-brand-navy">corelms</span>
        </div>

        <h2 className="text-2xl font-bold text-brand-navy">
          {step === "forgot"
            ? "Forgot your password?"
            : "Check the server console"}
        </h2>
        <p className="text-muted-foreground mt-1.5 text-sm">
          {step === "forgot"
            ? "Enter your email and we'll send you an 8-character OTP to reset it."
            : "Since this is dev mode, check your server console for the OTP code!"}
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Step 1: Request Code */}
      {step === "forgot" ? (
        <form onSubmit={handleRequestCode} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-email">Email</Label>
            <div className="relative">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
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
                className="pl-10 h-11 uppercase-text-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 text-sm font-semibold bg-brand-blue hover:bg-brand-royal text-white cursor-pointer transition-colors"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Spinner className="w-4 h-4" /> Sending...
              </span>
            ) : (
              "Send Reset Code"
            )}
          </Button>
        </form>
      ) : (
        /* Step 2: Verify Code and Set New Password */
        <form onSubmit={handleVerifyAndReset} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-code">8-Character Reset Code</Label>
            <Input
              id="reset-code"
              name="code"
              type="text"
              required
              placeholder="e.g. A1B2C3D4"
              className="h-11 font-mono tracking-widest uppercase"
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              name="newPassword"
              type="password"
              required
              placeholder="Enter your new password"
              className="h-11"
              autoComplete="new-password"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-11 text-sm font-semibold bg-brand-blue hover:bg-brand-royal text-white cursor-pointer transition-colors"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Spinner className="w-4 h-4" /> Resetting...
              </span>
            ) : (
              "Reset Password & Login"
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full h-11"
            onClick={() => setStep("forgot")}
            disabled={isLoading}
          >
            Back to email
          </Button>
        </form>
      )}

      {/* Back to Sign In */}
      <div className="mt-6 text-center">
        <Link
          href="/sign-in"
          className="inline-flex items-center gap-2 text-sm font-medium text-brand-blue hover:text-brand-royal transition-colors"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            className="text-current"
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
