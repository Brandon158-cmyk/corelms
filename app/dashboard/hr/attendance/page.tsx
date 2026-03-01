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
import { Input } from "@/components/ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar03Icon,
  CheckmarkCircle02Icon,
  CancelCircleIcon,
  Time02Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

export default function StaffAttendancePage() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const attendance = useQuery(api.staff.listStaffAttendance, {
    date: selectedDate,
  });
  const recordAttendance = useMutation(api.staff.recordAttendance);

  const handleStatusChange = async (userId: any, status: string) => {
    try {
      await recordAttendance({
        userId,
        date: selectedDate,
        status: status as any,
      });
      toast.success("Attendance updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to update attendance");
    }
  };

  const statusOptions = [
    {
      label: "Present",
      value: "present",
      icon: CheckmarkCircle02Icon,
      color: "text-green-600 border-green-200 bg-green-50",
    },
    {
      label: "Absent",
      value: "absent",
      icon: CancelCircleIcon,
      color: "text-red-600 border-red-200 bg-red-50",
    },
    {
      label: "Sick",
      value: "sick",
      icon: Time02Icon,
      color: "text-orange-600 border-orange-200 bg-orange-50",
    },
    {
      label: "Late",
      value: "late",
      icon: Time02Icon,
      color: "text-yellow-600 border-yellow-200 bg-yellow-50",
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-accent">
            Staff Attendance
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Daily register for teachers and administration staff.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white p-2 rounded-lg border shadow-sm">
          <HugeiconsIcon
            icon={Calendar03Icon}
            className="size-4 text-brand-primary ml-2"
          />
          <Input
            type="date"
            className="border-none shadow-none focus-visible:ring-0 w-[160px]"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      <Card className="shadow-sm border-t-4 border-t-brand-primary overflow-hidden">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <HugeiconsIcon
              icon={UserGroupIcon}
              className="size-5 text-brand-primary"
            />
            Daily Register (
            {new Date(selectedDate).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            )
          </CardTitle>
          <CardDescription>
            Click a status to update the record for that employee.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-semibold text-brand-accent">
                  Employee Name
                </TableHead>
                <TableHead className="font-semibold text-brand-accent">
                  Role
                </TableHead>
                <TableHead className="font-semibold text-brand-accent text-center">
                  Current Status
                </TableHead>
                <TableHead className="font-semibold text-brand-accent text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendance === undefined ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-48 text-center">
                    <Spinner className="mx-auto" />
                  </TableCell>
                </TableRow>
              ) : attendance.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-48 text-center text-muted-foreground"
                  >
                    No staff members found.
                  </TableCell>
                </TableRow>
              ) : (
                attendance.map((record) => (
                  <TableRow
                    key={record.userId}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="font-medium text-brand-accent">
                      {record.name}
                    </TableCell>
                    <TableCell className="capitalize text-xs text-muted-foreground">
                      {record.role}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={`capitalize ${statusOptions.find((o) => o.value === record.status)?.color}`}
                      >
                        {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {statusOptions.map((opt) => (
                          <Button
                            key={opt.value}
                            variant="ghost"
                            size="sm"
                            title={opt.label}
                            onClick={() =>
                              handleStatusChange(record.userId, opt.value)
                            }
                            className={
                              record.status === opt.value
                                ? "bg-muted"
                                : "opacity-30 hover:opacity-100"
                            }
                          >
                            <HugeiconsIcon icon={opt.icon} className="size-4" />
                          </Button>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
