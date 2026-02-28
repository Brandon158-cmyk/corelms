"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function UsersPage() {
  const users = useQuery(api.users.listTenantUsers);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-brand-navy">
            Users
          </h2>
          <p className="text-muted-foreground">
            Manage administration, teachers, and students.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-gray-200">
            Import CSV
          </Button>
          <Button className="bg-[#2845D6] hover:bg-[#1A2CA3] text-white">
            Invite User
          </Button>
        </div>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden min-h-[400px]">
        {users === undefined ? (
          <div className="flex justify-center p-12">
            <Spinner className="w-8 h-8 text-brand-blue" />
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center h-full flex flex-col items-center justify-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-blue font-bold">
              👥
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No users found
            </h3>
            <p className="text-gray-500 mb-4 max-w-sm mx-auto">
              Invite teachers, staff, and students to join your school.
            </p>
            <Button
              variant="outline"
              className="border-brand-blue/20 text-brand-blue"
            >
              Invite First User
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-brand-navy">
                        {user.name || "Pending user"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-blue-50 text-brand-blue border border-brand-blue/10">
                      {(user.role as string) || "Not assigned"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-green-100 text-green-800">
                      Active
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-brand-blue hover:text-brand-navy"
                    >
                      Manage
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
