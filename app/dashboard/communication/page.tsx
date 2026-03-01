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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Megaphone01Icon,
  Message01Icon,
  Note01Icon,
  Add01Icon,
  Mail01Icon,
  Search01Icon,
  Calendar01Icon,
  UserIcon,
  Delete02Icon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { format } from "date-fns";
import Link from "next/link";

export default function CommunicationDashboard() {
  const announcements = useQuery(api.comm.listAnnouncements, {});
  const logs = useQuery(api.comm.listLogs, { limit: 50 });
  const templates = useQuery(api.comm.listTemplates, {});
  const user = useQuery(api.users.currentUser, {});

  const createAnnouncement = useMutation(api.comm.createAnnouncement);
  const deleteAnnouncement = useMutation(api.comm.deleteAnnouncement);

  const [isAnOpen, setIsAnOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState("");

  const [anData, setAnData] = useState<{
    title: string;
    content: string;
    audience: "all" | "staff" | "parents" | "students";
    priority: "normal" | "urgent";
  }>({
    title: "",
    content: "",
    audience: "all",
    priority: "normal",
  });

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!anData.title || !anData.content) {
      toast.error("Please fill in all required fields");
      return;
    }
    setIsSubmitting(true);
    try {
      await createAnnouncement({
        ...anData,
      });
      toast.success("Announcement posted successfully");
      setIsAnOpen(false);
      setAnData({
        title: "",
        content: "",
        audience: "all",
        priority: "normal",
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to post announcement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: any) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    try {
      await deleteAnnouncement({ id });
      toast.success("Announcement deleted");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  };

  const filteredLogs = logs?.filter(
    (log) =>
      log.recipientInfo.toLowerCase().includes(search.toLowerCase()) ||
      log.body.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Communication Hub
          </h2>
          <p className="text-muted-foreground tabular-nums">
            Manage school-wide notices, bulk messaging, and templates.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            render={<Link href="/dashboard/communication/send" />}
          >
            <HugeiconsIcon icon={Message01Icon} className="mr-2 size-4" />
            Bulk Messaging
          </Button>
          <Button onClick={() => setIsAnOpen(true)}>
            <HugeiconsIcon icon={Add01Icon} className="mr-2 size-4" />
            New Announcement
          </Button>
        </div>
      </div>

      <Tabs defaultValue="announcements" className="space-y-4">
        <TabsList>
          <TabsTrigger value="announcements">
            <HugeiconsIcon icon={Megaphone01Icon} className="mr-2 size-4" />
            Notice Board
          </TabsTrigger>
          <TabsTrigger value="logs">
            <HugeiconsIcon icon={Message01Icon} className="mr-2 size-4" />
            Message Logs
          </TabsTrigger>
          <TabsTrigger value="templates">
            <HugeiconsIcon icon={Note01Icon} className="mr-2 size-4" />
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="announcements" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {announcements?.map((an) => (
              <Card key={an._id} className="relative overflow-hidden">
                {an.priority === "urgent" && (
                  <div className="absolute top-0 right-0 left-0 h-1 bg-destructive" />
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{an.title}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <Badge variant="outline" className="mr-2 capitalize">
                          {an.audience}
                        </Badge>
                        <span className="text-xs">
                          {format(an.createdAt, "MMM d, h:mm a")}
                        </span>
                      </CardDescription>
                    </div>
                    {user?.role === "superAdmin" ||
                    user?.role === "headteacher" ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive"
                        onClick={() => handleDelete(an._id)}
                      >
                        <HugeiconsIcon icon={Delete02Icon} className="size-4" />
                      </Button>
                    ) : null}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm line-clamp-4 whitespace-pre-wrap">
                    {an.content}
                  </p>
                  <div className="mt-4 flex items-center text-xs text-muted-foreground">
                    <HugeiconsIcon icon={UserIcon} className="mr-1 size-3" />
                    Posted by {an.authorName}
                  </div>
                </CardContent>
              </Card>
            ))}
            {announcements?.length === 0 && (
              <div className="col-span-full py-20 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                No active announcements.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between shrink-0">
                <div>
                  <CardTitle>Recent Messages</CardTitle>
                  <CardDescription>
                    Audit log of the last 50 messages sent from the system.
                  </CardDescription>
                </div>
                <div className="relative w-72">
                  <HugeiconsIcon
                    icon={Search01Icon}
                    className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                  />
                  <Input
                    placeholder="Search logs..."
                    className="pl-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Channel</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent At</TableHead>
                    <TableHead>By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs?.map((log) => (
                    <TableRow key={log._id}>
                      <TableCell>
                        <HugeiconsIcon
                          icon={log.type === "sms" ? Message01Icon : Mail01Icon}
                          className="size-4"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {log.recipientInfo}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {log.body}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            log.status === "sent" ? "default" : "destructive"
                          }
                        >
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {format(log.sentAt, "MMM d, HH:mm")}
                      </TableCell>
                      <TableCell>{log.senderName}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates?.map((t) => (
              <Card key={t._id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">
                      {t.name}
                    </CardTitle>
                    <Badge variant="outline">{t.type}</Badge>
                  </div>
                  {t.category && (
                    <CardDescription>{t.category}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground bg-muted p-2 rounded line-clamp-3 italic">
                    "{t.content}"
                  </p>
                </CardContent>
              </Card>
            ))}
            <Card className="border-dashed flex items-center justify-center p-6 text-center">
              <div className="space-y-2">
                <HugeiconsIcon
                  icon={Note01Icon}
                  className="mx-auto size-8 text-muted-foreground"
                />
                <p className="text-sm text-muted-foreground">
                  Add predefined common messages.
                </p>
                <Button variant="outline" size="sm">
                  Create Template
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Post Announcement Dialog */}
      <Dialog open={isAnOpen} onOpenChange={setIsAnOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handlePostAnnouncement}>
            <DialogHeader>
              <DialogTitle>Post New Announcement</DialogTitle>
              <DialogDescription>
                This will be visible on the school Notice Board for selected
                audience.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Important Notice: Parent Teacher Meeting"
                  value={anData.title}
                  onChange={(e) =>
                    setAnData({ ...anData, title: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Type your announcement content here..."
                  className="min-h-[150px]"
                  value={anData.content}
                  onChange={(e) =>
                    setAnData({ ...anData, content: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Target Audience</Label>
                  <Select
                    value={anData.audience}
                    onValueChange={(v: any) =>
                      setAnData({ ...anData, audience: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All School</SelectItem>
                      <SelectItem value="staff">Staff Only</SelectItem>
                      <SelectItem value="parents">Parents Only</SelectItem>
                      <SelectItem value="students">Students Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Priority</Label>
                  <Select
                    value={anData.priority}
                    onValueChange={(v: any) =>
                      setAnData({ ...anData, priority: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAnOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Posting..." : "Post Announcement"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
