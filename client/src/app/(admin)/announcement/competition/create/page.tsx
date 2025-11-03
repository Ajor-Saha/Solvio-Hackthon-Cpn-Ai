"use client";

import type { CreateCompetitionPayload } from "@/components/admin/competition";
import {
    COMPETITION_TYPE_COLORS,
    COMPETITION_TYPE_LABELS,
    STATUS_COLORS,
    STATUS_LABELS,
} from "@/components/admin/competition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Axios } from "@/config/axios";
import { env } from "@/config/env";
import { cn } from "@/lib/utils";
import {
    ArrowLeft,
    Calendar as CalendarIcon,
    Edit3,
    Eye,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function CreateCompetitionPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const [eventDate, setEventDate] = useState<Date | undefined>();
  const [registrationDeadline, setRegistrationDeadline] = useState<Date | undefined>();
  const [formData, setFormData] = useState<CreateCompetitionPayload>({
    title: "",
    description: "",
    type: "hackathon",
    organizerName: "",
    location: "",
    eventDate: "",
    registrationDeadline: "",
    externalUrl: "",
    bannerUrl: "",
    status: "draft",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error("Title and description are required");
      return;
    }

    if (!formData.externalUrl.trim()) {
      toast.error("External URL is required");
      return;
    }

    setIsLoading(true);
    try {
      const submitData = {
        ...formData,
        eventDate: eventDate?.toISOString() || "",
        registrationDeadline: registrationDeadline
          ? registrationDeadline.toISOString().split("T")[0]
          : "",
      };

      const response = await Axios.post(
        `${env.BACKEND_BASE_URL}/api/competitions`,
        submitData
      );

      if (response.data.success) {
        toast.success("Competition created successfully");

        setFormData({
          title: "",
          description: "",
          type: "hackathon",
          organizerName: "",
          location: "",
          eventDate: "",
          registrationDeadline: "",
          externalUrl: "",
          bannerUrl: "",
          status: "draft",
        });
        setEventDate(undefined);
        setRegistrationDeadline(undefined);

        setViewMode("edit");
      } else {
        toast.error(response.data.message || "Failed to create competition");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return "Not specified";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTypeColor = (type: string) => {
    return COMPETITION_TYPE_COLORS[type as keyof typeof COMPETITION_TYPE_COLORS] || "bg-gray-100";
  };

  const getStatusColor = (status?: string) => {
    if (!status) return "bg-gray-100";
    return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || "bg-gray-100";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 py-8">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link href="/announcement/competition">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">
                {viewMode === "edit" ? "Create Competition" : "Preview Competition"}
              </h1>
              <p className="text-muted-foreground mt-1">
                {viewMode === "edit"
                  ? "Fill in the details to create a new competition"
                  : "Review your competition details before publishing"}
              </p>
            </div>
          </div>
          <Button
            variant={viewMode === "edit" ? "outline" : "default"}
            size="lg"
            onClick={() =>
              setViewMode(viewMode === "edit" ? "preview" : "edit")
            }
            className="gap-2 flex-shrink-0"
          >
            {viewMode === "edit" ? (
              <>
                <Eye className="w-5 h-5" />
                Preview
              </>
            ) : (
              <>
                <Edit3 className="w-5 h-5" />
                Edit
              </>
            )}
          </Button>
        </div>

        {viewMode === "edit" && (
          <div className="min-w-full max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card className="p-6 space-y-4">
                <h2 className="text-xl font-semibold">Basic Information</h2>

                <div className="space-y-2">
                  <Label htmlFor="title">Competition Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., National Hackathon 2025"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organizerName">Organizer Name</Label>
                  <Input
                    id="organizerName"
                    placeholder="e.g., Tech Institute"
                    value={formData.organizerName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        organizerName: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="e.g., New Delhi"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Competition Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: any) =>
                        setFormData({ ...formData, type: value })
                      }
                    >
                      <SelectTrigger id="type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(COMPETITION_TYPE_LABELS).map(
                          ([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>

              <Card className="p-6 space-y-4">
                <h2 className="text-xl font-semibold">Competition Details</h2>

                <div className="space-y-2">
                  <Label htmlFor="description">
                    Competition Description *
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the competition, objectives, rules, and eligibility criteria..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                    rows={6}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Event Date & Time</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !eventDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {eventDate
                            ? eventDate.toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={eventDate}
                          onSelect={setEventDate}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Registration Deadline</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !registrationDeadline && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {registrationDeadline
                            ? registrationDeadline.toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={registrationDeadline}
                          onSelect={setRegistrationDeadline}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </Card>

              <Card className="p-6 space-y-4">
                <h2 className="text-xl font-semibold">Links & Media</h2>

                <div className="space-y-2">
                  <Label htmlFor="externalUrl">
                    External URL (Registration/Details) *
                  </Label>
                  <Input
                    id="externalUrl"
                    type="url"
                    placeholder="https://example.com/competition"
                    value={formData.externalUrl}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        externalUrl: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bannerUrl">Banner Image URL</Label>
                  <Input
                    id="bannerUrl"
                    type="url"
                    placeholder="https://example.com/banner.jpg"
                    value={formData.bannerUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, bannerUrl: e.target.value })
                    }
                  />
                </div>
              </Card>

              <Card className="p-6 space-y-4">
                <h2 className="text-xl font-semibold">Settings</h2>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </Card>

              <Button
                type="submit"
                size="lg"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Creating..." : "Create Competition"}
              </Button>
            </form>
          </div>
        )}

        {viewMode === "preview" && (
          <div className="max-w-2xl mx-auto">
            <Card className="overflow-hidden">
              {formData.bannerUrl && (
                <div className="w-full h-64 bg-muted overflow-hidden">
                  <img
                    src={formData.bannerUrl}
                    alt={formData.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}

              <div className="p-6 space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={getTypeColor(formData.type)}>
                    {
                      COMPETITION_TYPE_LABELS[
                        formData.type as keyof typeof COMPETITION_TYPE_LABELS
                      ]
                    }
                  </Badge>
                  <Badge className={getStatusColor(formData.status)}>
                    {STATUS_LABELS[formData.status as keyof typeof STATUS_LABELS]}
                  </Badge>
                </div>

                <div>
                  <h2 className="text-2xl font-bold">{formData.title}</h2>
                  {formData.organizerName && (
                    <p className="text-muted-foreground">
                      Organized by {formData.organizerName}
                    </p>
                  )}
                </div>

                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {formData.description}
                </p>

                <div className="space-y-2 border-t pt-4">
                  {formData.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold text-muted-foreground">
                        Location:
                      </span>
                      <span>{formData.location}</span>
                    </div>
                  )}

                  {eventDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="font-semibold text-muted-foreground">
                        Event Date:
                      </span>
                      <span>{formatDate(eventDate.toISOString())}</span>
                    </div>
                  )}

                  {registrationDeadline && (
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="font-semibold text-muted-foreground">
                        Registration Deadline:
                      </span>
                      <span>{formatDate(registrationDeadline.toISOString())}</span>
                    </div>
                  )}
                </div>

                {formData.externalUrl && (
                  <div className="border-t pt-4">
                    <a
                      href={formData.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm font-medium"
                    >
                      Learn More & Register →
                    </a>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
