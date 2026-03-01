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

export function ParentDashboard({ user }: { user: any }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Linked Students
            </CardTitle>
            <div className="rounded-full bg-brand-primary/10 p-2">
              <HugeiconsIcon
                icon={UserMultiple02Icon}
                className="text-brand-primary"
                size={16}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-brand-accent">0</div>
            <p className="text-xs text-muted-foreground mt-1">
              Contact school admin to link your children.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Invoices
            </CardTitle>
            <div className="rounded-full bg-blue-500/10 p-2">
              <HugeiconsIcon
                icon={BookOpen01Icon}
                className="text-blue-500"
                size={16}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-brand-accent">ZMW 0.00</div>
            <p className="text-xs text-muted-foreground mt-1">
              All fees are up to date.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm min-h-[300px]">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Updates regarding your children.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center min-h-[200px] text-muted-foreground text-sm">
          No recent activity to display. Please ensure your account is linked to
          your child's profile.
        </CardContent>
      </Card>
    </div>
  );
}
