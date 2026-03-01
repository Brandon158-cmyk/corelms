"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { useTermFilter } from "@/components/providers/TermFilterProvider";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  InvoiceIcon,
  Tick02Icon,
  CashierIcon,
  Package01Icon,
  Calendar03Icon,
  LegalDocumentIcon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function InvoicesPage() {
  const { mode, selectedTermIds } = useTermFilter();
  const terms = useQuery(api.terms.list, {});
  const classes = useQuery(api.classes.list, {});

  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedTermId, setSelectedTermId] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  const effectiveTermId =
    selectedTermId || (selectedTermIds.length === 1 ? selectedTermIds[0] : "");

  const invoices = useQuery(
    api.financials.listInvoices,
    selectedClassId && effectiveTermId
      ? {
          classId: selectedClassId as Id<"classes">,
          termId: effectiveTermId as Id<"terms">,
        }
      : "skip",
  );

  const generateInvoices = useMutation(api.financials.generateInvoicesBulk);
  const recordPayment = useMutation(api.financials.recordPayment);

  // Payment Form State
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [paymentData, setPaymentData] = useState({
    amount: "",
    method: "cash",
    ref: "",
    date: new Date().toISOString().split("T")[0],
  });

  const handleBulkGenerate = async () => {
    if (!selectedClassId || !effectiveTermId) return;
    setIsGenerating(true);
    try {
      const result = await generateInvoices({
        classId: selectedClassId as Id<"classes">,
        termId: effectiveTermId as Id<"terms">,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      });
      toast.success(`Generated ${result.count} new invoices`);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate invoices");
    } finally {
      setIsGenerating(false);
    }
  };

  const openPayment = (invoice: any) => {
    setSelectedInvoice(invoice);
    setPaymentData({
      ...paymentData,
      amount: invoice.balance.toString(),
    });
    setIsPaymentOpen(true);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    try {
      await recordPayment({
        studentId: selectedInvoice.studentId,
        invoiceId: selectedInvoice._id,
        amount: parseFloat(paymentData.amount),
        method: paymentData.method as any,
        transactionRef: paymentData.ref || undefined,
        date: paymentData.date,
      });
      toast.success("Payment recorded successfully");
      setIsPaymentOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to record payment");
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-brand-accent">
          Invoices & Billing
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage student fees, generate termly bills, and track payments.
        </p>
      </div>

      <Card className="shadow-sm border-t-4 border-t-brand-primary">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <HugeiconsIcon
              icon={Calendar03Icon}
              className="size-5 text-brand-primary"
            />
            Billing Filter & Bulk Actions
          </CardTitle>
          <CardDescription>
            Select a class and term to view or generate invoices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-1.5 min-w-[200px]">
              <label className="text-sm font-medium text-muted-foreground">
                Class
              </label>
              <Select
                value={selectedClassId}
                onValueChange={(v) => setSelectedClassId(v ?? "")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select class..." />
                </SelectTrigger>
                <SelectContent>
                  {classes?.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5 min-w-[200px]">
              <label className="text-sm font-medium text-muted-foreground">
                Term
              </label>
              <Select
                value={effectiveTermId}
                onValueChange={(v) => setSelectedTermId(v ?? "")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select term..." />
                </SelectTrigger>
                <SelectContent>
                  {terms?.map((t) => (
                    <SelectItem key={t._id} value={t._id}>
                      {t.yearName} — {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedClassId && effectiveTermId && (
              <Button
                onClick={handleBulkGenerate}
                disabled={isGenerating}
                className="bg-brand-primary hover:bg-brand-primary-deep"
              >
                {isGenerating ? (
                  <Spinner className="size-4 mr-2" />
                ) : (
                  <HugeiconsIcon icon={InvoiceIcon} className="size-4 mr-2" />
                )}
                Bulk Generate Bills
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedClassId && effectiveTermId ? (
        <Card className="shadow-sm border-t-4 border-t-brand-primary">
          <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <HugeiconsIcon
                  icon={LegalDocumentIcon}
                  className="size-5 text-brand-primary"
                />
                Invoices for{" "}
                {classes?.find((c) => c._id === selectedClassId)?.name}
              </CardTitle>
              <CardDescription>
                {invoices?.length ?? 0} invoices found.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-semibold text-brand-accent">
                    Student
                  </TableHead>
                  <TableHead className="font-semibold text-brand-accent">
                    Due Date
                  </TableHead>
                  <TableHead className="font-semibold text-brand-accent text-right">
                    Total (ZMW)
                  </TableHead>
                  <TableHead className="font-semibold text-brand-accent text-right">
                    Balance
                  </TableHead>
                  <TableHead className="text-center font-semibold text-brand-accent">
                    Status
                  </TableHead>
                  <TableHead className="text-right sr-only">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices === undefined ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      <Spinner className="mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : invoices.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-32 text-center text-muted-foreground font-medium"
                    >
                      No invoices generated for this class yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices.map((inv: any) => (
                    <TableRow
                      key={inv._id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="font-medium text-brand-accent">
                        {inv.studentName}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {typeof inv.dueDate === "string"
                          ? inv.dueDate
                          : new Date(inv.dueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {inv.totalAmount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold">
                        {inv.balance > 0 ? (
                          <span className="text-red-600">
                            {inv.balance.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-green-600">0.00</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            inv.status === "paid"
                              ? "outline"
                              : inv.status === "pending"
                                ? "destructive"
                                : "secondary"
                          }
                          className={
                            inv.status === "paid"
                              ? "text-green-600 border-green-200 bg-green-50"
                              : ""
                          }
                        >
                          {inv.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {inv.status !== "paid" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openPayment(inv)}
                            className="text-brand-primary"
                          >
                            <HugeiconsIcon
                              icon={CashierIcon}
                              className="size-4 mr-1.5"
                            />
                            Pay
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <HugeiconsIcon
              icon={Package01Icon}
              className="size-12 text-muted-foreground/40 mb-4"
            />
            <p className="text-muted-foreground font-medium">
              Select a class and term above to view billing data.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Payment Dialog */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handlePaymentSubmit}>
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-1.5">
                <label className="text-sm font-medium">
                  Amount to Pay (ZMW)
                </label>
                <div className="relative">
                  <Input
                    required
                    type="number"
                    step="0.1"
                    max={selectedInvoice?.balance}
                    value={paymentData.amount}
                    onChange={(e) =>
                      setPaymentData({ ...paymentData, amount: e.target.value })
                    }
                    className="pl-12"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                    ZMW
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Remaining balance:{" "}
                  {selectedInvoice?.balance?.toLocaleString()}
                </p>
              </div>

              <div className="grid gap-1.5">
                <label className="text-sm font-medium">Payment Method</label>
                <Select
                  value={paymentData.method}
                  onValueChange={(v) =>
                    setPaymentData({ ...paymentData, method: v as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="momo">
                      Mobile Money (Airtel/MTN/Zamtel)
                    </SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank">
                      Bank Transfer / Deposit
                    </SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1.5">
                <label className="text-sm font-medium">Reference #</label>
                <Input
                  placeholder="MoMo Transaction ID or Slip #"
                  value={paymentData.ref}
                  onChange={(e) =>
                    setPaymentData({ ...paymentData, ref: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-1.5">
                <label className="text-sm font-medium">Payment Date</label>
                <Input
                  required
                  type="date"
                  value={paymentData.date}
                  onChange={(e) =>
                    setPaymentData({ ...paymentData, date: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPaymentOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-brand-primary hover:bg-brand-primary-deep"
              >
                Record Payment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
