"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Password reset will be implemented via Convex Auth's
      // built-in password reset flow in a future iteration.
      // For now, we show a success state.
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSubmitted(true);
    } catch {
      setError("Unable to process your request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center">
        {/* Success State */}
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              className="text-green-600"
            >
              <path
                d="M22 12A10 10 0 1112 2a10 10 0 0110 10z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M8 12l3 3 5-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-brand-navy mb-2">
          Check your email
        </h2>
        <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
          If an account exists with{" "}
          <span className="font-medium text-foreground">{email}</span>, you will
          receive password reset instructions shortly.
        </p>
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
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        {/* Mobile logo */}
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
          Forgot your password?
        </h2>
        <p className="text-muted-foreground mt-1.5 text-sm">
          Enter your email and we&apos;ll send you instructions to reset your
          password.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
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
              className="pl-10 h-11"
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
              <Spinner className="w-4 h-4" />
              Sending instructions...
            </span>
          ) : (
            "Send Reset Link"
          )}
        </Button>
      </form>

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
