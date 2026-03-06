"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ROLES = [
  { value: "proprietor", label: "School Proprietor / Board" },
  { value: "headteacher", label: "Principal / Headteacher" },
  { value: "bursar", label: "Bursar / Finance Officer" },
  { value: "teacher", label: "Teacher / Instructor" },
  { value: "boardingMatron", label: "Boarding Matron" },
  { value: "student", label: "Student" },
  { value: "parent", label: "Parent / Guardian" },
] as const;

export default function SignUpPage() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [schoolCode, setSchoolCode] = useState("");
  const [role, setRole] = useState("");

  const validationResult = useQuery(
    api.tenants.validateSchoolCode,
    schoolCode.length >= 3 ? { schoolCode } : "skip",
  );

  const handleSchoolCodeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const code = e.target.value.toUpperCase();
      setSchoolCode(code);
    },
    [],
  );

  const displayValidation = schoolCode.length >= 3 ? validationResult : null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!role) {
      setError("Please select your role.");
      return;
    }

    if (!schoolCode) {
      setError("Please enter your school code.");
      return;
    }

    if (validationResult && !validationResult.valid) {
      setError(
        "Invalid or inactive school code. Please check with your school administrator.",
      );
      return;
    }

    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("flow", "signUp");
    formData.set("role", role);

    try {
      await signIn("password", formData);
      router.push("/dashboard");
    } catch {
      setError(
        "Unable to create account. This email may already be registered.",
      );
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

  return (
    <div>
      {/* Page heading — serif, page-title size */}
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
          Create account
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
          Join corelms today to start managing your school more effectively.
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
        {/* Full Name */}
        <div className="flex flex-col" style={{ gap: "var(--space-sm)" }}>
          <Label htmlFor="signup-name" style={labelStyle}>
            Full Name
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
              <circle
                cx="12"
                cy="8"
                r="4"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M20 21a8 8 0 10-16 0"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <Input
              id="signup-name"
              name="name"
              type="text"
              required
              placeholder="Enter your full name"
              className="pl-10"
              style={inputStyle}
              autoComplete="name"
            />
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col" style={{ gap: "var(--space-sm)" }}>
          <Label htmlFor="signup-email" style={labelStyle}>
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
              id="signup-email"
              name="email"
              type="email"
              required
              placeholder="Enter your email"
              className="pl-10"
              style={inputStyle}
              autoComplete="email"
            />
          </div>
        </div>

        {/* School Code */}
        <div className="flex flex-col" style={{ gap: "var(--space-sm)" }}>
          <Label htmlFor="signup-school-code" style={labelStyle}>
            School Code
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
              <path
                d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                points="9,22 9,12 15,12 15,22"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <Input
              id="signup-school-code"
              name="schoolCode"
              type="text"
              required
              placeholder="e.g., SCH-001"
              className="pl-10 uppercase"
              style={inputStyle}
              value={schoolCode}
              onChange={handleSchoolCodeChange}
            />
          </div>
          {/* School code validation feedback */}
          {displayValidation && (
            <p
              style={{
                fontSize: "var(--font-size-tag)",
                fontFamily: "var(--font-family-body)",
                color: displayValidation.valid
                  ? "var(--color-category-green)"
                  : "var(--color-accent-secondary)",
              }}
            >
              {displayValidation.valid
                ? `✓ School found: ${displayValidation.schoolName}`
                : "✗ No school found with this code"}
            </p>
          )}
        </div>

        {/* Role */}
        <div className="flex flex-col" style={{ gap: "var(--space-sm)" }}>
          <Label htmlFor="signup-role" style={labelStyle}>
            Your Role
          </Label>
          <Select value={role} onValueChange={(val) => setRole(val ?? "")}>
            <SelectTrigger id="signup-role" style={inputStyle}>
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Password */}
        <div className="flex flex-col" style={{ gap: "var(--space-sm)" }}>
          <Label htmlFor="signup-password" style={labelStyle}>
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
              id="signup-password"
              name="password"
              type="password"
              required
              minLength={8}
              placeholder="Create a password (min. 8 characters)"
              className="pl-10"
              style={inputStyle}
              autoComplete="new-password"
            />
          </div>
        </div>

        {/* Primary Button — solid maroon, uppercase */}
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
              Creating account...
            </span>
          ) : (
            "CREATE ACCOUNT"
          )}
        </Button>
      </form>

      {/* Link to Sign In */}
      <div className="text-center" style={{ marginTop: "var(--space-lg)" }}>
        <p
          style={{
            fontSize: "var(--font-size-body)",
            color: "var(--color-text-secondary)",
            fontFamily: "var(--font-family-body)",
          }}
        >
          Already have an account?{" "}
          <Link
            href="/sign-in"
            style={{
              fontWeight: "var(--font-weight-medium)",
              color: "var(--color-link)",
            }}
            className="hover:underline transition-colors"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
