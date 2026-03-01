"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  InvoiceIcon,
  CalculatorIcon,
  Tick02Icon,
  Add01Icon,
  DocumentValidationIcon,
  Money01Icon,
  Files01Icon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const YEARS = Array.from({ length: 11 }, (_, i) => 2024 + i);

export default function PayrollPage() {
  const payruns = useQuery(api.payroll.listPayruns);
  const generatePayrun = useMutation(api.payroll.generatePayrun);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await generatePayrun({ month, year });
      toast.success("Payroll generated successfully for " + MONTHS[month - 1]);
      setIsDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate payroll");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-accent">
            Institution Payroll
          </h1>
          <p className="text-sm text-muted-foreground mt-1 text-pretty">
            Automated statutory compliance: PAYE, NAPSA, NHIMA, and Skills Levy.
          </p>
        </div>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="bg-brand-primary hover:bg-brand-primary-deep text-white"
        >
          <HugeiconsIcon icon={Add01Icon} className="size-4 mr-2" />
          Run Monthly Payroll
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm border-t-4 border-t-brand-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">
              Current Month Net
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ZMW{" "}
              {(payruns && payruns[0]?.totalNet?.toLocaleString()) || "0.00"}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 text-pretty">
              Disbursement total for {MONTHS[new Date().getMonth()]}.
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-t-4 border-t-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">
              Total PAYE (ZRA)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ZMW{" "}
              {(payruns && payruns[0]?.totalTax?.toLocaleString()) || "0.00"}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Payable to ZRA by the 10th.
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-t-4 border-t-brand-accent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">
              Pension (NAPSA)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-accent">
              ZMW{" "}
              {(payruns && (payruns[0]?.totalNAPSA * 2)?.toLocaleString()) ||
                "0.00"}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Combined 5% + 5% employee/employer.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-t-4 border-t-brand-primary overflow-hidden">
        <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <HugeiconsIcon
                icon={InvoiceIcon}
                className="size-5 text-brand-primary"
              />
              Payrun History
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-semibold text-brand-accent">
                  Payroll Period
                </TableHead>
                <TableHead className="font-semibold text-brand-accent">
                  Status
                </TableHead>
                <TableHead className="font-semibold text-brand-accent text-right">
                  Gross (ZMW)
                </TableHead>
                <TableHead className="font-semibold text-brand-accent text-right">
                  Net (ZMW)
                </TableHead>
                <TableHead className="text-right sr-only">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payruns === undefined ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-32 text-center text-muted-foreground"
                  >
                    <Spinner className="mx-auto" />
                  </TableCell>
                </TableRow>
              ) : payruns.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-48 text-center text-muted-foreground font-medium"
                  >
                    <div className="flex flex-col items-center gap-2 text-pretty">
                      <HugeiconsIcon
                        icon={Files01Icon}
                        className="size-10 opacity-20"
                      />
                      No payroll history found. Click &quot;Run Monthly
                      Payroll&quot; to begin.
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                payruns.map((pr) => (
                  <TableRow
                    key={pr._id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="font-medium text-brand-accent">
                      {MONTHS[pr.month - 1]} {pr.year}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={pr.status === "paid" ? "outline" : "secondary"}
                        className="capitalize text-[10px]"
                      >
                        {pr.status.replace("-", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {pr.totalGross.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-bold">
                      {pr.totalNet.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/dashboard/hr/payroll/${pr._id}`}>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-brand-primary"
                        >
                          <HugeiconsIcon
                            icon={CalculatorIcon}
                            className="size-4 mr-1.5"
                          />
                          View Payslips
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Generate Payrun Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Run Monthly Payroll</DialogTitle>
            <DialogDescription>
              This will calculate deductions for all staff with active profiles
              for the selected month.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-1.5">
              <label className="text-sm font-medium">Month</label>
              <Select
                value={month.toString()}
                onValueChange={(v) => setMonth(parseInt(v || "1"))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m, i) => (
                    <SelectItem key={i} value={(i + 1).toString()}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <label className="text-sm font-medium">Year</label>
              <Select
                value={year.toString()}
                onValueChange={(v) => setYear(parseInt(v || "2025"))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bg-brand-primary hover:bg-brand-primary-deep text-white"
            >
              {isGenerating ? (
                <Spinner className="size-4 mr-2" />
              ) : (
                <HugeiconsIcon
                  icon={DocumentValidationIcon}
                  className="size-4 mr-2"
                />
              )}
              Generate Draft Payroll
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
