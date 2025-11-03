"use client";

import {
  type ApiResponse,
  type CreateJobPayload,
  DeleteConfirmDialog,
  type Job,
  JOB_TYPE_COLORS,
  JOB_TYPE_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
} from "@/components/admin/job-posting";
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
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  Edit3,
  ExternalLink,
  Eye,
  MapPin,
  Pencil,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function JobPostingDetail() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const jobId = params.jobId as string;
    const isEditing = searchParams.get("edit") === "true";

    const [job, setJob] = useState<Job | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
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

    useEffect(() => {
        const fetchJob = async () => {
            try {
                setIsLoading(true);
                const response = await Axios.get<ApiResponse<Job>>(
                    `${env.BACKEND_BASE_URL}/api/jobs/${jobId}`
                );
                if (response.data.data) {
                    const fetchedJob = response.data.data;
                    setJob(fetchedJob);
                    // Pre-populate form with job data when editing
                    setFormData({
                        title: fetchedJob.title || "",
                        description: fetchedJob.description || "",
                        companyName: fetchedJob.companyName || "",
                        location: fetchedJob.location || "",
                        jobType: fetchedJob.jobType || "full_time",
                        externalUrl: fetchedJob.externalUrl || "",
                        applicationDeadline: fetchedJob.applicationDeadline || "",
                        status: fetchedJob.status || "active",
                    });
                }
            } catch (error) {
                console.error("Failed to fetch job:", error);
                toast.error("Failed to load job details");
            } finally {
                setIsLoading(false);
            }
        };

        fetchJob();
    }, [jobId]);

  const formatDate = (date?: string) => {
    if (!date) return "Not specified";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSaveEdit = async () => {
    try {
      setIsSaving(true);
      const response = await Axios.put<ApiResponse<{ jobId: string }>>(
        `${env.BACKEND_BASE_URL}/api/jobs/${jobId}`,
        formData
      );
      if (response.data.success) {
        toast.success("Job updated successfully");
        // Refetch job data
        const fetchedResponse = await Axios.get<ApiResponse<Job>>(
          `${env.BACKEND_BASE_URL}/api/jobs/${jobId}`
        );
        if (fetchedResponse.data.data) {
          setJob(fetchedResponse.data.data);
        }
        // Navigate back to view mode
        router.push(`/announcement/job-posting/${jobId}`);
      }
    } catch (error: any) {
      console.error("Failed to save job:", error);
      toast.error(error.response?.data?.message || "Failed to save job");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    router.push(`/announcement/job-posting/${jobId}`);
  };

  const handleDeleteSuccess = () => {
    toast.success("Job deleted successfully");
    router.push("/announcement/job-posting");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-muted rounded w-24"></div>
            <div className="h-64 bg-muted rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return null;
  }

  // EDIT MODE - Full page edit form
  if (isEditing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 py-8 pb-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancelEdit}
              className="gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-3xl font-bold">Edit Job Posting</h1>
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                router.push(`/announcement/job-posting/${jobId}`)
              }
              title="Switch to view mode"
            >
              <Eye className="w-5 h-5" />
            </Button>
          </div>

          {/* Form Sections */}
          <div className="space-y-6">
            {/* Basic Information */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                Basic Information
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="mb-2 block">
                    Job Title *
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g., Senior React Developer"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="company" className="mb-2 block">
                    Company Name
                  </Label>
                  <Input
                    id="company"
                    placeholder="e.g., Acme Corp"
                    value={formData.companyName}
                    onChange={(e) =>
                      setFormData({ ...formData, companyName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="description" className="mb-2 block">
                    Job Description *
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the job role, responsibilities, and requirements..."
                    rows={6}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
              </div>
            </Card>

            {/* Job Details */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Job Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location" className="mb-2 block">
                    Location
                  </Label>
                  <Input
                    id="location"
                    placeholder="e.g., Remote, New York"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="jobType" className="mb-2 block">
                    Job Type
                  </Label>
                  <Select
                    value={formData.jobType}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        jobType: value as CreateJobPayload["jobType"],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_time">Full-Time</SelectItem>
                      <SelectItem value="part_time">Part-Time</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Application & Status */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                Application & Status
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="externalUrl" className="mb-2 block">
                    External URL / Application Link *
                  </Label>
                  <Input
                    id="externalUrl"
                    type="url"
                    placeholder="https://example.com/apply"
                    value={formData.externalUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, externalUrl: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="deadline" className="mb-2 block">
                      Application Deadline
                    </Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={
                        formData.applicationDeadline
                          ? new Date(formData.applicationDeadline)
                              .toISOString()
                              .split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          applicationDeadline: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="status" className="mb-2 block">
                      Status
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          status: value as CreateJobPayload["status"],
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Sticky Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t py-4 px-4">
          <div className="max-w-4xl mx-auto flex gap-3">
            <Button
              variant="outline"
              onClick={handleCancelEdit}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={isSaving}
              className="flex-1"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // VIEW MODE - Display job details
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/announcement/job-posting">
            <Button variant="ghost" size="icon" className="gap-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                router.push(`/announcement/job-posting/${jobId}?edit=true`)
              }
              title="Switch to edit mode"
            >
              <Edit3 className="w-5 h-5" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-card rounded-lg border overflow-hidden space-y-6">
          <div className="px-6 sm:px-8 py-8 space-y-6">
            {/* Title and Badges */}
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <h1 className="text-4xl font-bold break-words">
                    {job.title}
                  </h1>
                  {job.companyName && (
                    <p className="text-lg text-muted-foreground mt-2">
                      {job.companyName}
                    </p>
                  )}
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge className={JOB_TYPE_COLORS[job.jobType]}>
                  {JOB_TYPE_LABELS[job.jobType]}
                </Badge>
                <Badge className={STATUS_COLORS[job.status]}>
                  {STATUS_LABELS[job.status]}
                </Badge>
              </div>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              {job.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{job.location}</p>
                  </div>
                </div>
              )}

              {job.applicationDeadline && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Application Deadline
                    </p>
                    <p className="font-medium">
                      {formatDate(job.applicationDeadline)}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Briefcase className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Job Type</p>
                  <p className="font-medium">{JOB_TYPE_LABELS[job.jobType]}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Posted On</p>
                  <p className="font-medium">{formatDate(job.postedAt)}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold">Job Description</h2>
              <p className="text-base text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {job.description}
              </p>
            </div>

            {/* External Link */}
            {job.externalUrl && (
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold">Apply Now</h2>
                <a
                  href={job.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2"
                >
                  <Button className="gap-2">
                    <ExternalLink className="w-4 h-4" />
                    View Full Job Posting
                  </Button>
                </a>
              </div>
            )}

            {/* Timestamps */}
            <div className="pt-6 border-t space-y-2 text-sm text-muted-foreground">
              <p>Created: {formatDate(job.createdAt)}</p>
              <p>Last Updated: {formatDate(job.updatedAt)}</p>
            </div>
          </div>
        </div>

        {/* Sticky Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t py-4 px-4">
          <div className="max-w-4xl mx-auto flex gap-3">
            <Link href="/announcement/job-posting" className="flex-1">
              <Button variant="outline" className="w-full">
                Back to Job Postings
              </Button>
            </Link>
            <Button
              onClick={() =>
                router.push(`/announcement/job-posting/${jobId}?edit=true`)
              }
              className="flex-1 gap-2"
            >
              <Pencil className="w-4 h-4" />
              Edit Job
            </Button>
          </div>
        </div>

        {/* Extra spacing for sticky bar */}
        <div className="h-28"></div>
      </div>

      {/* Delete Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        job={job}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
