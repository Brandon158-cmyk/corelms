"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Message01Icon,
  Mail01Icon,
  UserGroupIcon,
  CheckmarkCircle01Icon,
  ArrowLeft02Icon,
  Search01Icon,
  Note01Icon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";

export default function BulkMessagingHub() {
  const router = useRouter();
  const students = useQuery(api.users.listTenantUsers, { role: "student" });
  const staff = useQuery(api.users.listTenantUsers, { role: "teacher" });
  const templates = useQuery(api.comm.listTemplates, {});
  const classes = useQuery(api.classes.list, {});
  const sendBulk = useMutation(api.comm.sendBulkMessages);

  const [step, setStep] = useState(1);
  const [channel, setChannel] = useState<"sms" | "email">("sms");
  const [audienceType, setAudienceType] = useState<
    "all_students" | "all_staff" | "class" | "individual"
  >("all_students");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Filter logic
  const possibleRecipients = useMemo(() => {
    if (audienceType === "all_students") return students || [];
    if (audienceType === "all_staff") return staff || [];
    if (audienceType === "class") {
      return students?.filter((s) => s.classId === selectedClassId) || [];
    }
    if (audienceType === "individual")
      return [...(students || []), ...(staff || [])];
    return [];
  }, [audienceType, students, staff, selectedClassId]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUserIds(possibleRecipients.map((r) => r._id));
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleToggleUser = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleSend = async () => {
    if (selectedUserIds.length === 0) {
      toast.error("Please select at least one recipient");
      return;
    }
    if (!content) {
      toast.error("Message content is required");
      return;
    }
    if (channel === "email" && !subject) {
      toast.error("Subject is required for emails");
      return;
    }

    setIsSending(true);
    try {
      const res = await sendBulk({
        recipientIds: selectedUserIds as any[],
        type: channel,
        subject: channel === "email" ? subject : undefined,
        bodyTemplate: content,
      });
      toast.success(`Successfully queued ${res.count} messages`);
      router.push("/dashboard/communication");
    } catch (err: any) {
      toast.error(err.message || "Failed to send messages");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 max-w-5xl mx-auto">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <HugeiconsIcon icon={ArrowLeft02Icon} className="size-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Bulk Messaging Hub
          </h2>
          <p className="text-muted-foreground">
            Send mass SMS or Email alerts to the school community.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_350px] gap-8">
        <div className="space-y-6">
          {/* Step 1: Channel & Audience */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="flex items-center justify-center size-6 rounded-full bg-primary text-primary-foreground text-xs mr-2">
                  1
                </span>
                Channel & Audience
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="flex gap-4">
                <Button
                  variant={channel === "sms" ? "default" : "outline"}
                  className="flex-1 h-20 flex-col"
                  onClick={() => setChannel("sms")}
                >
                  <HugeiconsIcon icon={Message01Icon} className="mb-2 size-6" />
                  SMS Gateway
                </Button>
                <Button
                  variant={channel === "email" ? "default" : "outline"}
                  className="flex-1 h-20 flex-col"
                  onClick={() => setChannel("email")}
                >
                  <HugeiconsIcon icon={Mail01Icon} className="mb-2 size-6" />
                  Email (SMTP)
                </Button>
              </div>

              <div className="grid gap-2">
                <Label>Select Audience Profile</Label>
                <Select
                  value={audienceType}
                  onValueChange={(v: any) => setAudienceType(v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Audience..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_students">
                      All Active Students
                    </SelectItem>
                    <SelectItem value="all_staff">
                      All Teaching Staff
                    </SelectItem>
                    <SelectItem value="class">Specific Class Cohort</SelectItem>
                    <SelectItem value="individual">
                      Select Individuals
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {audienceType === "class" && (
                <div className="grid gap-2 animate-in fade-in slide-in-from-top-1">
                  <Label>Select Class</Label>
                  <Select
                    value={selectedClassId}
                    onValueChange={(v) => setSelectedClassId(v as string)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose class..." />
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
              )}
            </CardContent>
          </Card>

          {/* Step 2: Compose */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="flex items-center justify-center size-6 rounded-full bg-primary text-primary-foreground text-xs mr-2">
                  2
                </span>
                Compose Message
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label>Message Template (Optional)</Label>
                <Select
                  onValueChange={(v) => {
                    const t = templates?.find((tmp) => tmp._id === v);
                    if (t) setContent(t.content);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {templates
                      ?.filter((t) => t.type === channel)
                      .map((t) => (
                        <SelectItem key={t._id} value={t._id}>
                          {t.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {channel === "email" && (
                <div className="grid gap-2">
                  <Label>Email Subject</Label>
                  <Input
                    placeholder="e.g. Term 2 Examination Results"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
              )}

              <div className="grid gap-2">
                <Label>Message Body</Label>
                <Textarea
                  placeholder="Hello {{name}}, this is an update regarding..."
                  className="min-h-[200px]"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
                <p className="text-[10px] text-muted-foreground italic">
                  Use {"{{name}}"} to automatically insert recipient names.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Recipient Selection */}
        <div className="space-y-6">
          <Card className="h-full max-h-[850px] flex flex-col">
            <CardHeader className="shrink-0 border-b">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                Recipients
                <Badge variant="secondary" className="tabular-nums">
                  {selectedUserIds.length} / {possibleRecipients.length}
                </Badge>
              </CardTitle>
              <div className="mt-4 flex items-center space-x-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all"
                    checked={
                      selectedUserIds.length === possibleRecipients.length &&
                      possibleRecipients.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                  <label
                    htmlFor="select-all"
                    className="text-xs text-muted-foreground cursor-pointer"
                  >
                    Select All
                  </label>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-auto">
              <div className="divide-y">
                {possibleRecipients.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center space-x-3 p-3 hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      checked={selectedUserIds.includes(user._id)}
                      onCheckedChange={() => handleToggleUser(user._id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">
                        {user.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {channel === "sms"
                          ? user.phone || "No phone"
                          : user.email || "No email"}
                      </p>
                    </div>
                  </div>
                ))}
                {possibleRecipients.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground text-xs">
                    No recipients found for this profile.
                  </div>
                )}
              </div>
            </CardContent>
            <div className="p-4 border-t bg-muted/20">
              <Button
                className="w-full"
                disabled={isSending || selectedUserIds.length === 0}
                onClick={handleSend}
              >
                {isSending ? (
                  <Spinner className="mr-2" />
                ) : (
                  <HugeiconsIcon
                    icon={CheckmarkCircle01Icon}
                    className="mr-2 size-4"
                  />
                )}
                {isSending
                  ? "Processing..."
                  : `Send ${channel.toUpperCase()} Blast`}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
