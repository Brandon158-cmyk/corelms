"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserMultiple02Icon, BookOpen01Icon } from "@hugeicons/core-free-icons";

const cardStyle = {
  background: "var(--color-surface-primary)",
  border: "var(--card-border-width) solid var(--color-border-default)",
  borderRadius: "var(--radius-md-token)",
  boxShadow: "var(--shadow-card)",
};

export function ParentDashboard({ user }: { user: any }) {
  return (
    <div
      className="flex flex-col"
      style={{ gap: "var(--space-lg)", paddingTop: "var(--space-lg)" }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        {/* Linked Students */}
        <Card style={cardStyle}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle
              style={{
                fontFamily: "var(--font-family-body)",
                fontSize: "var(--font-size-tag)",
                fontWeight: "var(--font-weight-medium)",
                letterSpacing: "var(--letter-spacing-uppercase)",
                textTransform: "uppercase",
                color: "var(--color-text-secondary)",
              }}
            >
              Linked Students
            </CardTitle>
            <div
              className="rounded-full"
              style={{
                padding: "var(--space-sm)",
                background: "rgba(22, 78, 99, 0.08)",
              }}
            >
              <HugeiconsIcon
                icon={UserMultiple02Icon}
                style={{ color: "var(--color-category-teal)" }}
                size={18}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div
              style={{
                fontFamily: "var(--font-family-heading)",
                fontSize: "var(--font-size-hero)",
                fontWeight: "var(--font-weight-bold)",
                color: "var(--color-text-heading)",
              }}
            >
              0
            </div>
            <p
              style={{
                fontFamily: "var(--font-family-body)",
                fontSize: "var(--font-size-tag)",
                color: "var(--color-text-secondary)",
                marginTop: "var(--space-xs)",
              }}
            >
              Contact school admin to link your children.
            </p>
          </CardContent>
        </Card>

        {/* Pending Invoices */}
        <Card style={cardStyle}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle
              style={{
                fontFamily: "var(--font-family-body)",
                fontSize: "var(--font-size-tag)",
                fontWeight: "var(--font-weight-medium)",
                letterSpacing: "var(--letter-spacing-uppercase)",
                textTransform: "uppercase",
                color: "var(--color-text-secondary)",
              }}
            >
              Pending Invoices
            </CardTitle>
            <div
              className="rounded-full"
              style={{
                padding: "var(--space-sm)",
                background: "rgba(201, 162, 39, 0.08)",
              }}
            >
              <HugeiconsIcon
                icon={BookOpen01Icon}
                style={{ color: "var(--color-warning)" }}
                size={18}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div
              style={{
                fontFamily: "var(--font-family-heading)",
                fontSize: "var(--font-size-hero)",
                fontWeight: "var(--font-weight-bold)",
                color: "var(--color-text-heading)",
              }}
            >
              ZMW 0.00
            </div>
            <p
              style={{
                fontFamily: "var(--font-family-body)",
                fontSize: "var(--font-size-tag)",
                color: "var(--color-text-secondary)",
                marginTop: "var(--space-xs)",
              }}
            >
              All fees are up to date.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="min-h-[300px]" style={cardStyle}>
        <CardHeader>
          <CardTitle
            style={{
              fontFamily: "var(--font-family-heading)",
              fontSize: "var(--font-size-section-heading)",
              color: "var(--color-text-heading)",
            }}
          >
            Recent Activity
          </CardTitle>
          <CardDescription
            style={{
              fontFamily: "var(--font-family-body)",
              fontSize: "var(--font-size-caption)",
              color: "var(--color-text-secondary)",
            }}
          >
            Updates regarding your children.
          </CardDescription>
        </CardHeader>
        <CardContent
          className="flex items-center justify-center min-h-[200px]"
          style={{
            fontFamily: "var(--font-family-body)",
            fontSize: "var(--font-size-body)",
            color: "var(--color-text-secondary)",
          }}
        >
          No recent activity to display. Please ensure your account is linked to
          your child&apos;s profile.
        </CardContent>
      </Card>
    </div>
  );
}
