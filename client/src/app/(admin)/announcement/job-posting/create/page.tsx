"use client";

import type { CreateJobPayload } from "@/components/admin/job-posting";
import { JOB_TYPE_COLORS, JOB_TYPE_LABELS, STATUS_COLORS, STATUS_LABELS } from "@/components/admin/job-posting";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { ArrowLeft, Calendar, Edit3, ExternalLink, Eye, MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function CreateJobPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const [formData, setFormData] = useState<CreateJobPayload>({
    title: "",
    description: "",
    companyName: "",
    location: "",
    jobType: "full_time",
    externalUrl: "",
    applicationDeadline: "",
    status: "active",
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
      const response = await Axios.post(
        `${env.BACKEND_BASE_URL}/api/jobs`,
        formData
      );

      if (response.data.success) {
        toast.success("Job posted successfully");

        setFormData({
          title: "",
          description: "",
          companyName: "",
          location: "",
          jobType: "full_time",
          externalUrl: "",
          applicationDeadline: "",
          status: "active",
        });

        setViewMode("edit");
      } else {
        toast.error(response.data.message || "Failed to create job");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 py-8">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link href="/announcement/job-posting">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">
                {viewMode === "edit" ? "Post a New Job" : "Posted Jobs"}
              </h1>
              <p className="text-muted-foreground mt-1">
                {viewMode === "edit"
                  ? "Fill in the details to post a new job opportunity"
                  : "View all posted job opportunities"}
              </p>
            </div>
          </div>
          <Button
            variant={viewMode === "edit" ? "outline" : "default"}
            size="lg"
            onClick={() => setViewMode(viewMode === "edit" ? "preview" : "edit")}
            className="gap-2 flex-shrink-0"
          >
            {viewMode === "edit" ? (
              <>
                <Eye className="w-5 h-5" />
                View Posts
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
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Senior Software Engineer"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    placeholder="e.g., TechCorp Inc."
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="e.g., San Francisco, CA"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jobType">Job Type</Label>
                    <Select
                      value={formData.jobType}
                      onValueChange={(value: any) => setFormData({ ...formData, jobType: value })}
                    >
                      <SelectTrigger id="jobType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(JOB_TYPE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>

              <Card className="p-6 space-y-4">
                <h2 className="text-xl font-semibold">Job Details</h2>

                <div className="space-y-2">
                  <Label htmlFor="description">Job Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Detailed job description, responsibilities, and requirements."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={8}
                    required
                  />
                </div>
              </Card>

              <Card className="p-6 space-y-4">
                <h2 className="text-xl font-semibold">Application & Status</h2>

                <div className="space-y-2">
                  <Label htmlFor="externalUrl">External Job URL *</Label>
                  <Input
                    id="externalUrl"
                    type="url"
                    placeholder="https://careers.example.com/jobs/123"
                    value={formData.externalUrl}
                    onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Link where candidates can apply or find more details
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="applicationDeadline">Application Deadline</Label>
                    <Input
                      id="applicationDeadline"
                      type="date"
                      value={formData.applicationDeadline}
                      onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>

              <div className="flex gap-3 justify-between pt-4">
                <Link href="/announcement/job-posting">
                  <Button type="button" variant="outline" className="w-full">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={isLoading} size="lg" className="w-full">
                  {isLoading ? "Posting..." : "Post Job"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {viewMode === "preview" && (
          <div className="min-w-full max-w-2xl mx-auto">
            {!formData.title ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg">No job data to preview</p>
                <p className="text-sm mt-2">Fill in the job details to see the preview</p>
              </div>
            ) : (
              <div>
                <Card className="p-8 space-y-6">
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      {formData.jobType && (
                        <Badge className={`${JOB_TYPE_COLORS[formData.jobType]} text-sm`}>
                          {JOB_TYPE_LABELS[formData.jobType]}
                        </Badge>
                      )}
                      {formData.status && (
                        <Badge className={`${STATUS_COLORS[formData.status]} text-sm`}>
                          {STATUS_LABELS[formData.status]}
                        </Badge>
                      )}
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold">{formData.title}</h1>
                      {formData.companyName && (
                        <p className="text-lg text-muted-foreground mt-2">
                          {formData.companyName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="border-t pt-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {formData.location && (
                        <div>
                          <Label className="text-xs text-muted-foreground">Location</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm">{formData.location}</span>
                          </div>
                        </div>
                      )}
                      {formData.applicationDeadline && (
                        <div>
                          <Label className="text-xs text-muted-foreground">Application Deadline</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">{formatDate(formData.applicationDeadline)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t pt-6 space-y-3">
                    <h2 className="text-lg font-semibold">Job Description</h2>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {formData.description}
                    </p>
                  </div>

                  {formData.externalUrl && (
                    <div className="border-t pt-6">
                      <a
                        href={formData.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 text-sm flex items-center gap-2 hover:underline"
                      >
                        Apply on External Site
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
