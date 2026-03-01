"use client";

import { use, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft02Icon,
  Ticket01Icon,
  CheckmarkCircle02Icon,
  PrinterIcon,
} from "@hugeicons/core-free-icons";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import Link from "next/link";

export default function PayrunDetailsPage(props: {
  params: Promise<{ payrunId: Id<"payruns"> }>;
}) {
  const params = use(props.params);
  const payslips = useQuery(api.payroll.getPayslips, {
    payrunId: params.payrunId,
  });
  const approve = useMutation(api.payroll.approvePayrun);

  const [isApproving, setIsApproving] = useState(false);

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await approve({ payrunId: params.payrunId });
      toast.success("Payrun approved and locked");
    } catch (err: any) {
      toast.error(err.message || "Failed to approve payroll");
    } finally {
      setIsApproving(false);
    }
  };

  if (payslips === undefined) return <Spinner className="m-auto size-8" />;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/hr/payroll">
            <Button variant="outline" size="sm">
              <HugeiconsIcon icon={ArrowLeft02Icon} className="size-4 mr-1.5" />
              Portal
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-brand-accent">
              Generated Payslips
            </h1>
            <p className="text-sm text-muted-foreground">
              Review individual tax breakdowns for this batch.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden md:flex">
            <HugeiconsIcon icon={PrinterIcon} className="size-4 mr-2" />
            Export Schedule 1 (NAPSA)
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleApprove}
            disabled={isApproving}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isApproving ? (
              <Spinner className="size-4 mr-2" />
            ) : (
              <HugeiconsIcon
                icon={CheckmarkCircle02Icon}
                className="size-4 mr-2"
              />
            )}
            Approve & Lock Batch
          </Button>
        </div>
      </div>

      <Card className="shadow-sm border-t-4 border-t-brand-primary overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-semibold text-brand-accent">
                  Employee
                </TableHead>
                <TableHead className="font-semibold text-brand-accent text-right">
                  Gross Pay
                </TableHead>
                <TableHead className="font-semibold text-brand-accent text-right text-red-600">
                  PAYE
                </TableHead>
                <TableHead className="font-semibold text-brand-accent text-right">
                  NAPSA (EE)
                </TableHead>
                <TableHead className="font-semibold text-brand-accent text-right">
                  NHIMA (EE)
                </TableHead>
                <TableHead className="font-semibold text-brand-accent text-right font-bold">
                  Net Pay
                </TableHead>
                <TableHead className="text-right sr-only">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payslips.map((ps) => (
                <TableRow
                  key={ps._id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="font-medium text-brand-accent">
                    {ps.staffName}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {ps.grossEarnings.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-red-600">
                    {ps.paye.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {ps.napsaEmployee.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {ps.nhimaEmployee.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm font-bold text-green-700">
                    {ps.netPay.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-brand-primary"
                    >
                      <HugeiconsIcon
                        icon={Ticket01Icon}
                        className="size-4 mr-1.5"
                      />
                      Slip
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
