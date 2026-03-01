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
import { Input } from "@/components/ui/input";
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
  Add01Icon,
  Coins01Icon,
  PencilEdit01Icon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

export default function FeesPage() {
  const fees = useQuery(api.financials.listFeeTypes);
  const grades = useQuery(api.grades.list);
  const createFee = useMutation(api.financials.createFeeType);
  const updateFee = useMutation(api.financials.updateFeeType);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    description: "",
    gradeId: "all",
  });

  const handleOpenCreate = () => {
    setEditingFee(null);
    setFormData({ name: "", amount: "", description: "", gradeId: "all" });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (fee: any) => {
    setEditingFee(fee);
    setFormData({
      name: fee.name,
      amount: fee.amount.toString(),
      description: fee.description || "",
      gradeId: fee.gradeId || "all",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        amount: parseFloat(formData.amount),
        description: formData.description || undefined,
        gradeId:
          formData.gradeId === "all" ? undefined : (formData.gradeId as any),
      };

      if (editingFee) {
        await updateFee({ id: editingFee._id, ...payload });
        toast.success("Fee updated");
      } else {
        await createFee(payload);
        toast.success("Fee created");
      }
      setIsDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save fee");
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-accent">
            Fee Structure
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Define tuition, PTA, and other termly costs.
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-brand-primary hover:bg-brand-primary-deep"
        >
          <HugeiconsIcon icon={Add01Icon} className="size-4 mr-2" />
          Add Fee Type
        </Button>
      </div>

      <Card className="shadow-sm border-t-4 border-t-brand-primary">
        <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <HugeiconsIcon
                icon={Coins01Icon}
                className="size-5 text-brand-primary"
              />
              Standard Fees
            </CardTitle>
            <CardDescription>
              All amounts are in Zambian Kwacha (ZMW).
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-semibold text-brand-accent">
                  Fee Name
                </TableHead>
                <TableHead className="font-semibold text-brand-accent">
                  Applicable To
                </TableHead>
                <TableHead className="font-semibold text-brand-accent">
                  Description
                </TableHead>
                <TableHead className="font-semibold text-brand-accent text-right">
                  Amount (ZMW)
                </TableHead>
                <TableHead className="text-right sr-only">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fees === undefined ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-32 text-center text-muted-foreground"
                  >
                    <Spinner className="mx-auto" />
                  </TableCell>
                </TableRow>
              ) : fees.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-32 text-center text-muted-foreground font-medium"
                  >
                    No fee structures defined yet.
                  </TableCell>
                </TableRow>
              ) : (
                fees.map((fee) => (
                  <TableRow
                    key={fee._id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="font-medium text-brand-accent">
                      {fee.name}
                    </TableCell>
                    <TableCell>
                      {fee.gradeId
                        ? grades?.find((g) => g._id === fee.gradeId)?.name ||
                          "Specific Grade"
                        : "All Students"}
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate text-muted-foreground text-sm">
                      {fee.description || "—"}
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold">
                      {fee.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(fee)}
                      >
                        <HugeiconsIcon
                          icon={PencilEdit01Icon}
                          className="size-4"
                        />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingFee ? "Edit Fee Type" : "Add New Fee Type"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Fee Name</label>
                <Input
                  required
                  placeholder="e.g. Tuition Fee"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Amount (ZMW)</label>
                <Input
                  required
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Applicable To</label>
                <Select
                  value={formData.gradeId}
                  onValueChange={(v) =>
                    setFormData({ ...formData, gradeId: v as string })
                  }
                >
                  <SelectTrigger
                    drop-down-icon={
                      <HugeiconsIcon icon={Add01Icon} className="size-4" />
                    }
                  >
                    <SelectValue placeholder="Select grade..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Students</SelectItem>
                    {grades?.map((g) => (
                      <SelectItem key={g._id} value={g._id}>
                        {g.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Description</label>
                <Input
                  placeholder="Optional details"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-brand-primary hover:bg-brand-primary-deep"
              >
                {editingFee ? "Update Fee" : "Create Fee"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
