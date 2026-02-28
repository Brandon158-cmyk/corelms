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

export default function ClassesPage() {
  const classes = useQuery(api.classes.list);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-brand-navy">
            Classes
          </h2>
          <p className="text-muted-foreground">
            Manage your school's classes and schedules.
          </p>
        </div>
        <Button className="bg-[#2845D6] hover:bg-[#1A2CA3] text-white">
          Add Class
        </Button>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden min-h-[400px]">
        {classes === undefined ? (
          <div className="flex justify-center p-12">
            <Spinner className="w-8 h-8 text-brand-blue" />
          </div>
        ) : classes.length === 0 ? (
          <div className="p-12 text-center h-full flex flex-col items-center justify-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-blue font-bold">
              📚
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No classes found
            </h3>
            <p className="text-gray-500 mb-4 max-w-sm mx-auto">
              Get started by creating a new class for this term.
            </p>
            <Button
              variant="outline"
              className="border-brand-blue/20 text-brand-blue"
            >
              Create Initial Class
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead>Class Name</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((cls) => (
                <TableRow key={cls._id}>
                  <TableCell className="font-medium text-brand-navy">
                    {cls.name}
                  </TableCell>
                  <TableCell>{cls.room || "TBA"}</TableCell>
                  <TableCell>{cls.schedule || "Not set"}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        cls.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {cls.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-brand-blue hover:text-brand-navy"
                    >
                      Edit
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
