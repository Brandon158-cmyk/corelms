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
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserGroupIcon,
  JobSearchIcon,
  Add01Icon,
  InformationCircleIcon,
  LicenseIcon,
} from "@hugeicons/core-free-icons";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";

export default function StaffDirectoryPage() {
  const staff = useQuery(api.staff.listStaff);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600 border-green-200 bg-green-50";
      case "pending":
        return "text-yellow-600 border-yellow-200 bg-yellow-50";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-accent">
            Staff Directory
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage employee profiles, qualifications, and TCZ compliance.
          </p>
        </div>
        <Link href="/dashboard/users">
          <Button className="bg-brand-primary hover:bg-brand-primary-deep text-white">
            <HugeiconsIcon icon={Add01Icon} className="size-4 mr-2" />
            Invite New Staff
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm border-t-4 border-t-brand-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">
              Total WorkForce
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staff?.length ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1 text-pretty">
              Instructors and support staff.
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-t-4 border-t-brand-accent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">
              TCZ Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {staff?.filter((s) => s.profile?.tczNumber).length ?? 0} /{" "}
              {staff?.length ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Registered with Teaching Council.
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-t-4 border-t-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">
              Upcoming Expiries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">0</div>
            <p className="text-xs text-muted-foreground mt-1">
              Licenses expiring within 30 days.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-t-4 border-t-brand-primary overflow-hidden">
        <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <HugeiconsIcon
                icon={UserGroupIcon}
                className="size-5 text-brand-primary"
              />
              Employee Records
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-semibold text-brand-accent">
                  Name
                </TableHead>
                <TableHead className="font-semibold text-brand-accent">
                  Designation
                </TableHead>
                <TableHead className="font-semibold text-brand-accent">
                  Contract
                </TableHead>
                <TableHead className="font-semibold text-brand-accent">
                  TCZ #
                </TableHead>
                <TableHead className="font-semibold text-brand-accent text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff === undefined ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <Spinner className="mx-auto" />
                  </TableCell>
                </TableRow>
              ) : staff.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-32 text-center text-muted-foreground font-medium"
                  >
                    No staff records found.
                  </TableCell>
                </TableRow>
              ) : (
                staff.map((s) => (
                  <TableRow
                    key={s._id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-brand-accent">
                          {s.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase">
                          {s.role}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {s.profile?.designation || (
                        <span className="text-muted-foreground italic text-xs">
                          Not set
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {s.profile?.contractType ? (
                        <Badge
                          variant="outline"
                          className="capitalize text-[10px]"
                        >
                          {s.profile.contractType}
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      {s.profile?.tczNumber ? (
                        <div className="flex items-center gap-1.5">
                          <HugeiconsIcon
                            icon={LicenseIcon}
                            className="size-3 text-brand-primary"
                          />
                          <span className="font-mono text-xs">
                            {s.profile.tczNumber}
                          </span>
                        </div>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="bg-orange-50 text-orange-700 border-orange-100 text-[10px]"
                        >
                          Missing TCZ
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/dashboard/hr/staff/${s._id}`}>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-brand-primary"
                        >
                          <HugeiconsIcon
                            icon={InformationCircleIcon}
                            className="size-4 mr-1.5"
                          />
                          View File
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
    </div>
  );
}
