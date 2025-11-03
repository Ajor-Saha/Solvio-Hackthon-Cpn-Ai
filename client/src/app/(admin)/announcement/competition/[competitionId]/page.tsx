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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { format } from "date-fns";
import {
  ArrowLeft,
  CalendarIcon,
  Edit3,
  Eye,
  MapPin
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function CompetitionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const competitionId = params.competitionId as string;
  const isEditMode = searchParams.get("edit") === "true";

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [pageMode, setPageMode] = useState<"view" | "edit">(isEditMode ? "edit" : "view");
  const [editViewMode, setEditViewMode] = useState<"edit" | "preview">("edit");
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

  // Update page mode when URL query parameter changes
  useEffect(() => {
    setPageMode(isEditMode ? "edit" : "view");
  }, [isEditMode]);

  // Fetch competition details
  useEffect(() => {
    const fetchCompetition = async () => {
      try {
        setIsLoadingData(true);
        const response = await Axios.get(
          `${env.BACKEND_BASE_URL}/api/competitions/admin/${competitionId}`
        );

        if (response.data.data) {
          const competition = response.data.data;
          setFormData({
            title: competition.title || "",
            description: competition.description || "",
            type: competition.type || "hackathon",
            organizerName: competition.organizerName || "",
            location: competition.location || "",
            eventDate: competition.eventDate || "",
            registrationDeadline: competition.registrationDeadline || "",
            externalUrl: competition.externalUrl || "",
            bannerUrl: competition.bannerUrl || "",
            status: competition.status || "draft",
          });

          if (competition.eventDate) {
            setEventDate(new Date(competition.eventDate));
          }
          if (competition.registrationDeadline) {
            setRegistrationDeadline(new Date(competition.registrationDeadline));
          }
        }
      } catch (error: any) {
        toast.error("Failed to load competition details");
        router.push("/announcement/competition");
      } finally {
        setIsLoadingData(false);
      }
    };

    if (competitionId) {
      fetchCompetition();
    }
  }, [competitionId, router]);

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
      let eventDateValue = "";
      if (eventDate) {
        const year = eventDate.getFullYear();
        const month = String(eventDate.getMonth() + 1).padStart(2, "0");
        const day = String(eventDate.getDate()).padStart(2, "0");
        const hours = String(eventDate.getHours()).padStart(2, "0");
        const minutes = String(eventDate.getMinutes()).padStart(2, "0");
        eventDateValue = `${year}-${month}-${day}T${hours}:${minutes}:00`;
      }

      let registrationDateValue = "";
      if (registrationDeadline) {
        const year = registrationDeadline.getFullYear();
        const month = String(registrationDeadline.getMonth() + 1).padStart(2, "0");
        const day = String(registrationDeadline.getDate()).padStart(2, "0");
        registrationDateValue = `${year}-${month}-${day}`;
      }

      const submitData = {
        ...formData,
        eventDate: eventDateValue,
        registrationDeadline: registrationDateValue,
      };

      const response = await Axios.put(
        `${env.BACKEND_BASE_URL}/api/competitions/${competitionId}`,
        submitData
      );

      if (response.data.success) {
        toast.success("Competition updated successfully");
        setPageMode("view");
      } else {
        toast.error(response.data.message || "Failed to update competition");
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

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 py-8">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-muted rounded w-1/4"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <Link href="/announcement/competition">
              <Button variant="ghost" size="icon" className="flex-shrink-0">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">
                {pageMode === "view" ? "View Competition" : "Edit Competition"}
              </h1>
              <p className="text-muted-foreground mt-1">
                {pageMode === "view"
                  ? "Competition details"
                  : "Update the competition details"}
              </p>
            </div>
          </div>
          {pageMode === "view" && (
            <Link href={`/announcement/competition/${competitionId}?edit=true`}>
              <Button className="gap-2 flex-shrink-0">
                <Edit3 className="w-5 h-5" />
                Edit
              </Button>
            </Link>
          )}
        </div>

        {/* Edit Mode */}
        {pageMode === "edit" && (
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-2 mb-6">
              <Button
                type="button"
                variant={editViewMode === "edit" ? "default" : "outline"}
                size="sm"
                onClick={() => setEditViewMode("edit")}
                className="gap-2"
              >
                <Edit3 className="w-4 h-4" />
                Edit
              </Button>
              <Button
                type="button"
                variant={editViewMode === "preview" ? "default" : "outline"}
                size="sm"
                onClick={() => setEditViewMode("preview")}
                className="gap-2"
              >
                <Eye className="w-4 h-4" />
                Preview
              </Button>
            </div>

            {editViewMode === "edit" && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="p-6 space-y-5">
                  <h2 className="text-xl font-semibold">Basic Information</h2>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="title">Competition Title *</Label>
                      <Input
                        id="title"
                        placeholder="e.g., National Hackathon 2025"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label>Type *</Label>
                      <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(COMPETITION_TYPE_LABELS).map(([v, l]) => (
                            <SelectItem key={v} value={v}>{l}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 space-y-5">
                  <h2 className="text-xl font-semibold">Details</h2>
                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={6}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="organizerName">Organizer Name</Label>
                      <Input
                        id="organizerName"
                        placeholder="e.g., DataSci Society & Kaggle"
                        value={formData.organizerName}
                        onChange={(e) => setFormData({ ...formData, organizerName: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        placeholder="e.g., Sylhet"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Event Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {eventDate ? format(eventDate, "MMM dd, yyyy") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" selected={eventDate} onSelect={setEventDate} />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label>Registration Deadline</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {registrationDeadline ? format(registrationDeadline, "MMM dd, yyyy") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" selected={registrationDeadline} onSelect={setRegistrationDeadline} />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="bannerUrl">Banner URL</Label>
                      <Input
                        id="bannerUrl"
                        placeholder="https://example.com/banner.png"
                        value={formData.bannerUrl}
                        onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="externalUrl">External URL *</Label>
                      <Input
                        id="externalUrl"
                        placeholder="https://example.com"
                        value={formData.externalUrl}
                        onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(STATUS_LABELS).map(([v, l]) => (
                            <SelectItem key={v} value={v}>{l}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>

                <Button type="submit" size="lg" disabled={isLoading} className="w-full">
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            )}

            {editViewMode === "preview" && (
              <Card className="overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                  {/* Banner Image */}
                  {formData.bannerUrl ? (
                    <div className="md:col-span-1 h-64 md:h-auto bg-muted overflow-hidden">
                      <img
                        src={formData.bannerUrl}
                        alt={formData.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="md:col-span-1 h-64 md:h-auto bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <CalendarIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No banner image</p>
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="md:col-span-2 p-8 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-3">
                        <Badge className={getTypeColor(formData.type)}>
                          {COMPETITION_TYPE_LABELS[formData.type as keyof typeof COMPETITION_TYPE_LABELS]}
                        </Badge>
                        <Badge className={getStatusColor(formData.status)}>
                          {STATUS_LABELS[formData.status as keyof typeof STATUS_LABELS]}
                        </Badge>
                      </div>
                      <h1 className="text-3xl font-bold">{formData.title}</h1>
                      <p className="text-muted-foreground line-clamp-3">{formData.description}</p>
                    </div>

                    <div className="space-y-3 border-t pt-6 mt-6">
                      {formData.organizerName && (
                        <div className="flex items-start gap-3">
                          <span className="font-semibold text-sm min-w-32">Organizer:</span>
                          <span className="text-sm text-muted-foreground">{formData.organizerName}</span>
                        </div>
                      )}
                      {formData.location && (
                        <div className="flex items-start gap-3">
                          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{formData.location}</span>
                        </div>
                      )}
                      {formData.eventDate && (
                        <div className="flex items-start gap-3">
                          <span className="font-semibold text-sm min-w-32">Event Date:</span>
                          <span className="text-sm text-muted-foreground">{formatDate(formData.eventDate)}</span>
                        </div>
                      )}
                      {formData.registrationDeadline && (
                        <div className="flex items-start gap-3">
                          <span className="font-semibold text-sm min-w-32">Registration:</span>
                          <span className="text-sm text-muted-foreground">{formatDate(formData.registrationDeadline)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* View Mode */}
        {pageMode === "view" && (
          <div className="space-y-6">
            <Card className="overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                {/* Banner Image */}
                {formData.bannerUrl ? (
                  <div className="md:col-span-1 h-64 md:h-auto bg-muted overflow-hidden">
                    <img
                      src={formData.bannerUrl}
                      alt={formData.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="md:col-span-1 h-64 md:h-auto bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <CalendarIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No banner image</p>
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="md:col-span-2 p-8 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-3">
                      <Badge className={getTypeColor(formData.type)}>
                        {COMPETITION_TYPE_LABELS[formData.type as keyof typeof COMPETITION_TYPE_LABELS]}
                      </Badge>
                      <Badge className={getStatusColor(formData.status)}>
                        {STATUS_LABELS[formData.status as keyof typeof STATUS_LABELS]}
                      </Badge>
                    </div>
                    <h1 className="text-3xl font-bold">{formData.title}</h1>
                    <p className="text-muted-foreground line-clamp-3">{formData.description}</p>
                  </div>

                  <div className="space-y-3 border-t pt-6 mt-6">
                    {formData.organizerName && (
                      <div className="flex items-start gap-3">
                        <span className="font-semibold text-sm min-w-32">Organizer:</span>
                        <span className="text-sm text-muted-foreground">{formData.organizerName}</span>
                      </div>
                    )}
                    {formData.location && (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{formData.location}</span>
                      </div>
                    )}
                    {formData.eventDate && (
                      <div className="flex items-start gap-3">
                        <span className="font-semibold text-sm min-w-32">Event Date:</span>
                        <span className="text-sm text-muted-foreground">{formatDate(formData.eventDate)}</span>
                      </div>
                    )}
                    {formData.registrationDeadline && (
                      <div className="flex items-start gap-3">
                        <span className="font-semibold text-sm min-w-32">Registration:</span>
                        <span className="text-sm text-muted-foreground">{formatDate(formData.registrationDeadline)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Full Details Section */}
            <Card className="p-8 space-y-6">
              <h2 className="text-2xl font-bold">Full Details</h2>

              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="whitespace-pre-wrap text-muted-foreground">{formData.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
                <div>
                  <h3 className="font-semibold mb-3">Competition Info</h3>
                  <div className="space-y-2 text-sm">
                    {formData.organizerName && (
                      <p><span className="font-medium">Organizer:</span> {formData.organizerName}</p>
                    )}
                    {formData.location && (
                      <p><span className="font-medium">Location:</span> {formData.location}</p>
                    )}
                    {formData.type && (
                      <p><span className="font-medium">Type:</span> {COMPETITION_TYPE_LABELS[formData.type as keyof typeof COMPETITION_TYPE_LABELS]}</p>
                    )}
                    {formData.status && (
                      <p><span className="font-medium">Status:</span> {STATUS_LABELS[formData.status as keyof typeof STATUS_LABELS]}</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Timeline</h3>
                  <div className="space-y-2 text-sm">
                    {formData.eventDate && (
                      <p><span className="font-medium">Event Date:</span> {formatDate(formData.eventDate)}</p>
                    )}
                    {formData.registrationDeadline && (
                      <p><span className="font-medium">Registration Deadline:</span> {formatDate(formData.registrationDeadline)}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-3">External Links</h3>
                <div className="space-y-2 text-sm">
                  {formData.externalUrl && (
                    <p>
                      <span className="font-medium">Website:</span>{" "}
                      <a href={formData.externalUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                        {formData.externalUrl}
                      </a>
                    </p>
                  )}
                  {formData.bannerUrl && (
                    <p>
                      <span className="font-medium">Banner:</span>{" "}
                      <a href={formData.bannerUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                        {formData.bannerUrl}
                      </a>
                    </p>
                  )}
                </div>
              </div>
            </Card>

            {/* CTA Button */}
            {formData.externalUrl && (
              <div className="flex gap-3">
                <a href={formData.externalUrl} target="_blank" rel="noopener noreferrer" className="flex-1 inline-block px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 text-center transition-colors">
                  Learn More & Register →
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
