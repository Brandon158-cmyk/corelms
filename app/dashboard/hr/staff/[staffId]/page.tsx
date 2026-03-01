"use client";

import { use, useState, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  UserIcon,
  JobSearchIcon,
  LicenseIcon,
  BankIcon,
  Money01Icon,
  Tick02Icon,
  ArrowLeft02Icon,
} from "@hugeicons/core-free-icons";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import Link from "next/link";

export default function StaffDetailPage(props: {
  params: Promise<{ staffId: Id<"users"> }>;
}) {
  const params = use(props.params);
  const data = useQuery(api.staff.getStaffProfile, { userId: params.staffId });
  const saveProfile = useMutation(api.staff.saveStaffProfile);

  const [formData, setFormData] = useState({
    designation: "",
    idNumber: "",
    tczNumber: "",
    tczExpiry: "",
    contractType: "permanent" as any,
    dateJoined: new Date().toISOString().split("T")[0],
    qualifications: "",
    bankName: "",
    accountNumber: "",
    basicSalary: "0",
    allowanceHousing: "0",
    allowanceTransport: "0",
    allowanceOther: "0",
  });

  useEffect(() => {
    if (data?.profile) {
      const p = data.profile;
      setFormData({
        designation: p.designation || "",
        idNumber: p.idNumber || "",
        tczNumber: p.tczNumber || "",
        tczExpiry: p.tczExpiry
          ? new Date(p.tczExpiry).toISOString().split("T")[0]
          : "",
        contractType: p.contractType || "permanent",
        dateJoined: p.dateJoined
          ? new Date(p.dateJoined).toISOString().split("T")[0]
          : "",
        qualifications: p.qualifications?.join(", ") || "",
        bankName: p.bankName || "",
        accountNumber: p.accountNumber || "",
        basicSalary: (p.basicSalary || 0).toString(),
        allowanceHousing: (p.allowanceHousing || 0).toString(),
        allowanceTransport: (p.allowanceTransport || 0).toString(),
        allowanceOther: (p.allowanceOther || 0).toString(),
      });
    }
  }, [data]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveProfile({
        userId: params.staffId,
        designation: formData.designation,
        idNumber: formData.idNumber,
        tczNumber: formData.tczNumber || undefined,
        tczExpiry: formData.tczExpiry || undefined,
        contractType: formData.contractType,
        dateJoined: formData.dateJoined,
        qualifications: formData.qualifications
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        bankName: formData.bankName || undefined,
        accountNumber: formData.accountNumber || undefined,
        basicSalary: parseFloat(formData.basicSalary),
        allowanceHousing: parseFloat(formData.allowanceHousing),
        allowanceTransport: parseFloat(formData.allowanceTransport),
        allowanceOther: parseFloat(formData.allowanceOther),
      });
      toast.success("Staff profile and payroll config saved");
    } catch (err: any) {
      toast.error(err.message || "Failed to save file");
    }
  };

  if (data === undefined) return <Spinner className="m-auto size-8" />;
  if (data === null) return <div>Staff member not found.</div>;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/hr/staff">
          <Button variant="outline" size="sm">
            <HugeiconsIcon icon={ArrowLeft02Icon} className="size-4 mr-1.5" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-brand-accent">
            {data.name}&apos;s HR Record
          </h1>
          <p className="text-sm text-muted-foreground uppercase">{data.role}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid gap-6 lg:grid-cols-2">
        {/* Employment Card */}
        <Card className="shadow-sm border-t-4 border-t-brand-primary">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <HugeiconsIcon
                icon={JobSearchIcon}
                className="size-5 text-brand-primary"
              />
              Employment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Designation</Label>
                <Input
                  required
                  placeholder="e.g. Senior Teacher"
                  value={formData.designation}
                  onChange={(e) =>
                    setFormData({ ...formData, designation: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Contract Type</Label>
                <Select
                  value={formData.contractType}
                  onValueChange={(v) =>
                    setFormData({ ...formData, contractType: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="permanent">
                      Permanent & Pensionable
                    </SelectItem>
                    <SelectItem value="contract">
                      Fixed Term Contract
                    </SelectItem>
                    <SelectItem value="part-time">Part-time / Locum</SelectItem>
                    <SelectItem value="probation">Probationary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>NRC / Passport Number</Label>
                <Input
                  required
                  value={formData.idNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, idNumber: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Date Joined</Label>
                <Input
                  type="date"
                  value={formData.dateJoined}
                  onChange={(e) =>
                    setFormData({ ...formData, dateJoined: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Qualifications (Comma separated)</Label>
              <Input
                placeholder="e.g. B.Ed, Post-Grad Diploma"
                value={formData.qualifications}
                onChange={(e) =>
                  setFormData({ ...formData, qualifications: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* TCZ & Compliance */}
        <Card className="shadow-sm border-t-4 border-t-brand-accent">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <HugeiconsIcon
                icon={LicenseIcon}
                className="size-5 text-brand-accent"
              />
              Professional Compliance (TCZ)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-pretty">
            <div className="space-y-2">
              <Label>Teaching Council of Zambia #</Label>
              <Input
                placeholder="TCZ/xxxx/xxxx"
                value={formData.tczNumber}
                onChange={(e) =>
                  setFormData({ ...formData, tczNumber: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>License Expiry Date</Label>
              <Input
                type="date"
                value={formData.tczExpiry}
                onChange={(e) =>
                  setFormData({ ...formData, tczExpiry: e.target.value })
                }
              />
              <p className="text-[10px] text-muted-foreground">
                Alerts will trigger 30 days before this date.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Payroll Setup */}
        <Card className="shadow-sm border-t-4 border-t-green-500 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <HugeiconsIcon
                icon={Money01Icon}
                className="size-5 text-green-600"
              />
              Salary & Compensation (ZMW)
            </CardTitle>
            <CardDescription>
              Configure basic pay and monthly allowances for payroll generation.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label className="text-green-800 font-semibold">
                  Basic Salary
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.basicSalary}
                    onChange={(e) =>
                      setFormData({ ...formData, basicSalary: e.target.value })
                    }
                    className="pl-12 font-mono text-lg"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                    ZMW
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Allowances</Label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase">
                      Housing
                    </span>
                    <Input
                      type="number"
                      value={formData.allowanceHousing}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          allowanceHousing: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase">
                      Transport
                    </span>
                    <Input
                      type="number"
                      value={formData.allowanceTransport}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          allowanceTransport: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase">
                      Other
                    </span>
                    <Input
                      type="number"
                      value={formData.allowanceOther}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          allowanceOther: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-muted/30 p-5 rounded-lg border flex flex-col justify-center">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <HugeiconsIcon
                  icon={BankIcon}
                  className="size-4 text-muted-foreground"
                />
                Bank Disbursement
              </h4>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">Bank Name</Label>
                  <Input
                    placeholder="e.g. Zanaco, Atlas Mara"
                    value={formData.bankName}
                    onChange={(e) =>
                      setFormData({ ...formData, bankName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Account Number</Label>
                  <Input
                    placeholder="xxxxxxxxx"
                    value={formData.accountNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        accountNumber: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <div className="p-6 border-t bg-muted/20 flex justify-end">
            <Button
              type="submit"
              className="bg-brand-primary hover:bg-brand-primary-deep text-white px-8"
            >
              <HugeiconsIcon icon={Tick02Icon} className="size-4 mr-2" />
              Save Record
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
