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
  { value: "management", label: "Management / Admin" },
  { value: "teacher", label: "Teacher" },
  { value: "staff", label: "Staff (Bursar, Librarian, Registrar)" },
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
  const [schoolValidation, setSchoolValidation] = useState<{
    valid: boolean;
    schoolName: string | null;
  } | null>(null);

  // Query to validate school code in real-time
  const validationResult = useQuery(
    api.tenants.validateSchoolCode,
    schoolCode.length >= 3 ? { schoolCode } : "skip",
  );

  // Update validation state when query result changes
  const handleSchoolCodeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const code = e.target.value.toUpperCase();
      setSchoolCode(code);
      if (code.length < 3) {
        setSchoolValidation(null);
      }
    },
    [],
  );

  // Show validation result
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
          Create your account
        </h2>
        <p className="text-muted-foreground mt-1.5 text-sm">
          Enter your details to get started with corelms
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
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="signup-name">Full Name</Label>
          <div className="relative">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
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
              className="pl-10 h-11"
              autoComplete="name"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="signup-email">Email</Label>
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
              id="signup-email"
              name="email"
              type="email"
              required
              placeholder="Enter your email"
              className="pl-10 h-11"
              autoComplete="email"
            />
          </div>
        </div>

        {/* School Code */}
        <div className="space-y-2">
          <Label htmlFor="signup-school-code">School Code</Label>
          <div className="relative">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
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
              className="pl-10 h-11 uppercase"
              value={schoolCode}
              onChange={handleSchoolCodeChange}
            />
          </div>
          {/* School code validation feedback */}
          {displayValidation && (
            <p
              className={`text-xs ${displayValidation.valid ? "text-green-600" : "text-destructive"}`}
            >
              {displayValidation.valid
                ? `✓ School found: ${displayValidation.schoolName}`
                : "✗ No school found with this code"}
            </p>
          )}
        </div>

        {/* Role */}
        <div className="space-y-2">
          <Label htmlFor="signup-role">Your Role</Label>
          <Select
            value={role}
            onValueChange={(val, _event) => setRole(val ?? "")}
          >
            <SelectTrigger id="signup-role" className="h-11">
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
        <div className="space-y-2">
          <Label htmlFor="signup-password">Password</Label>
          <div className="relative">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
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
              className="pl-10 h-11"
              autoComplete="new-password"
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
              Creating account...
            </span>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>

      {/* Link to Sign In */}
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-brand-blue hover:text-brand-royal transition-colors"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
