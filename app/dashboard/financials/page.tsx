"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useTermFilter } from "@/components/providers/TermFilterProvider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Coins01Icon,
  MoneyReceiveCircleIcon,
  MoneySendCircleIcon,
  AnalyticsUpIcon,
  InvoiceIcon,
  CashierIcon,
} from "@hugeicons/core-free-icons";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";

export default function FinancialsDashboard() {
  const { selectedTermIds } = useTermFilter();
  const termId = selectedTermIds.length === 1 ? selectedTermIds[0] : undefined;

  const stats = useQuery(api.financials.getFinancialStats, {
    termId: termId as any,
  });

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-brand-accent">
          Finance Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Real-time overview of collections and outstanding fees.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-t-4 border-t-brand-primary">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Total Expected
            </CardTitle>
            <HugeiconsIcon
              icon={InvoiceIcon}
              className="size-4 text-brand-primary"
            />
          </CardHeader>
          <CardContent>
            {stats === undefined || stats === null ? (
              <Spinner className="size-4" />
            ) : (
              <div className="text-2xl font-bold text-brand-accent">
                ZMW {stats.totalExpected.toLocaleString()}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Based on generated invoices
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-t-4 border-t-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Total Collected
            </CardTitle>
            <HugeiconsIcon
              icon={MoneyReceiveCircleIcon}
              className="size-4 text-green-500"
            />
          </CardHeader>
          <CardContent>
            {stats === undefined || stats === null ? (
              <Spinner className="size-4" />
            ) : (
              <div className="text-2xl font-bold text-green-600">
                ZMW {stats.totalCollected.toLocaleString()}
              </div>
            )}
            {stats && stats.totalExpected > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {((stats.totalCollected / stats.totalExpected) * 100).toFixed(
                  1,
                )}
                % collection rate
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-t-4 border-t-red-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Outstanding
            </CardTitle>
            <HugeiconsIcon
              icon={MoneySendCircleIcon}
              className="size-4 text-red-500"
            />
          </CardHeader>
          <CardContent>
            {stats === undefined || stats === null ? (
              <Spinner className="size-4" />
            ) : (
              <div className="text-2xl font-bold text-red-600">
                ZMW {stats.totalOutstanding.toLocaleString()}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Unpaid or partially paid fees
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-t-4 border-t-brand-accent">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Collection Efficiency
            </CardTitle>
            <HugeiconsIcon
              icon={AnalyticsUpIcon}
              className="size-4 text-brand-accent"
            />
          </CardHeader>
          <CardContent>
            {stats === undefined || stats === null ? (
              <Spinner className="size-4" />
            ) : (
              <div className="text-2xl font-bold text-brand-accent">
                {stats.paidCount} / {stats.invoiceCount}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Students fully paid
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-4">
        <Link href="/dashboard/financials/fees">
          <Card className="hover:shadow-md transition-shadow cursor-pointer group h-full">
            <CardHeader>
              <div className="size-10 rounded-full bg-brand-primary/10 flex items-center justify-center mb-2 group-hover:bg-brand-primary group-hover:text-white transition-colors">
                <HugeiconsIcon icon={Coins01Icon} className="size-5" />
              </div>
              <CardTitle>Fee Structure</CardTitle>
              <CardDescription>
                Configure tuition, PTA, and other costs per grade/term.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/dashboard/financials/invoices">
          <Card className="hover:shadow-md transition-shadow cursor-pointer group h-full">
            <CardHeader>
              <div className="size-10 rounded-full bg-brand-primary/10 flex items-center justify-center mb-2 group-hover:bg-brand-primary group-hover:text-white transition-colors">
                <HugeiconsIcon icon={InvoiceIcon} className="size-5" />
              </div>
              <CardTitle>Billing & Invoices</CardTitle>
              <CardDescription>
                Generate bulk bills for classes and manage individual student
                ledgers.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Card className="hover:shadow-md transition-shadow cursor-pointer group">
          <CardHeader>
            <div className="size-10 rounded-full bg-brand-primary/10 flex items-center justify-center mb-2 group-hover:bg-brand-primary group-hover:text-white transition-colors">
              <HugeiconsIcon icon={CashierIcon} className="size-5" />
            </div>
            <CardTitle>Record Payments</CardTitle>
            <CardDescription>
              Quickly log cash, bank receipts, or mobile money transactions.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
