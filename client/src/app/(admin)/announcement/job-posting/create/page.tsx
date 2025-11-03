"use client";

import type { ApiResponse, CreateJobPayload, Job, ListJobResponse } from "@/components/admin/job-posting";
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
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function CreateJobPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [previewMode, setPreviewMode] = useState(true); // true = preview, false = edit
  const [selectedJobForEdit, setSelectedJobForEdit] = useState<Job | null>(null);
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

  // Fetch all jobs on page load
  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoadingJobs(true);
      try {
        const response = await Axios.get<ApiResponse<ListJobResponse>>(
          `${env.BACKEND_BASE_URL}/api/jobs`,
          { params: { limit: 1000 } }
        );

        if (response.data.success && response.data.data) {
          setJobs(response.data.data.data);
          toast.success("Jobs loaded successfully");
        } else {
          toast.error("Failed to load jobs");
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to load jobs");
      } finally {
        setIsLoadingJobs(false);
      }
    };

    fetchJobs();
  }, []);

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

        // Refresh jobs list
        const jobsResponse = await Axios.get<ApiResponse<ListJobResponse>>(
          `${env.BACKEND_BASE_URL}/api/jobs`,
          { params: { limit: 1000 } }
        );

        if (jobsResponse.data.success && jobsResponse.data.data) {
          setJobs(jobsResponse.data.data.data);
        }

        // Reset form
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/announcement/job-posting">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Post a New Job</h1>
            <p className="text-muted-foreground mt-1">
              Fill in the details to post a new job opportunity
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section - Left Column */}
          <div className="lg:col-span-1">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information Card */}
              <Card className="p-6 space-y-4">
                <h2 className="text-xl font-semibold">Basic Information</h2>

                <div className="space-y-2">
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Senior Software Engineer"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    placeholder="e.g., TechCorp Inc."
                    value={formData.companyName}
                    onChange={(e) =>
                      setFormData({ ...formData, companyName: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="e.g., San Francisco, CA"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jobType">Job Type</Label>
                    <Select
                      value={formData.jobType}
                      onValueChange={(value: any) =>
                        setFormData({ ...formData, jobType: value })
                      }
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

              {/* Job Description Card */}
              <Card className="p-6 space-y-4">
                <h2 className="text-xl font-semibold">Job Details</h2>

                <div className="space-y-2">
                  <Label htmlFor="description">Job Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Detailed job description, responsibilities, and requirements. Include what the role involves, who you're looking for, and why candidates should apply."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={8}
                    required
                  />
                </div>
              </Card>

              {/* Application & Status Card */}
              <Card className="p-6 space-y-4">
                <h2 className="text-xl font-semibold">Application & Status</h2>

                <div className="space-y-2">
                  <Label htmlFor="externalUrl">External Job URL *</Label>
                  <Input
                    id="externalUrl"
                    type="url"
                    placeholder="https://careers.example.com/jobs/123"
                    value={formData.externalUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, externalUrl: e.target.value })
                    }
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
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          applicationDeadline: e.target.value,
                        })
                      }
                    />
                  </div>

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
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>

              {/* Actions */}
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

          {/* Jobs List Section - Right Column */}
          <div className="lg:col-span-2">
            <Card className="p-6 space-y-4 sticky top-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Posted Jobs</h2>
                <div className="flex gap-2">
                  <Button
                    variant={previewMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setPreviewMode(true);
                      setSelectedJobForEdit(null);
                    }}
                    className="gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </Button>
                  <Button
                    variant={!previewMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPreviewMode(false)}
                    className="gap-1"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </Button>
                </div>
              </div>

              {previewMode ? (
                // Preview Mode
                <>
                  {isLoadingJobs ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div
                          key={i}
                          className="bg-muted rounded-lg h-32 animate-pulse"
                        />
                      ))}
                    </div>
                  ) : jobs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No jobs posted yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
                      {jobs.map((job) => (
                        <Card
                          key={job.jobId}
                          className="p-4 hover:shadow-md transition-shadow cursor-pointer border hover:border-primary/50"
                          onClick={() => {
                            setSelectedJobForEdit(job);
                            setPreviewMode(false);
                          }}
                        >
                          <div className="space-y-3">
                            {/* Header with Badges */}
                            <div className="flex items-start justify-between gap-2 flex-wrap">
                              <div className="flex gap-1 flex-wrap flex-1">
                                <Badge className={`${JOB_TYPE_COLORS[job.jobType]} text-xs`}>
                                  {JOB_TYPE_LABELS[job.jobType]}
                                </Badge>
                                <Badge className={`${STATUS_COLORS[job.status]} text-xs`}>
                                  {STATUS_LABELS[job.status]}
                                </Badge>
                              </div>
                            </div>

                            {/* Title */}
                            <div>
                              <h3 className="font-semibold line-clamp-1">
                                {job.title}
                              </h3>
                              {job.companyName && (
                                <p className="text-xs text-muted-foreground">
                                  {job.companyName}
                                </p>
                              )}
                            </div>

                            {/* Description Preview */}
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {job.description}
                            </p>

                            {/* Location and Deadline */}
                            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                              {job.location && (
                                <div className="flex items-center gap-0.5">
                                  <MapPin className="w-3 h-3" />
                                  <span>{job.location}</span>
                                </div>
                              )}
                              {job.applicationDeadline && (
                                <div className="flex items-center gap-0.5">
                                  <Calendar className="w-3 h-3" />
                                  <span>{formatDate(job.applicationDeadline)}</span>
                                </div>
                              )}
                            </div>

                            {/* External Link */}
                            {job.externalUrl && (
                              <a
                                href={job.externalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-blue-600 dark:text-blue-400 text-xs flex items-center gap-1 hover:underline"
                              >
                                View Job
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                // Edit Mode
                <>
                  {!selectedJobForEdit ? (
                    <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
                      {isLoadingJobs ? (
                        <div className="space-y-3">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <div
                              key={i}
                              className="bg-muted rounded-lg h-20 animate-pulse"
                            />
                          ))}
                        </div>
                      ) : jobs.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>No jobs to edit</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {jobs.map((job) => (
                            <div
                              key={job.jobId}
                              className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                              onClick={() => setSelectedJobForEdit(job)}
                            >
                              <h4 className="font-medium text-sm line-clamp-1">
                                {job.title}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {job.companyName || "No company"}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    // Edit Form for Selected Job
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-4 border-b">
                        <h3 className="font-semibold text-sm">
                          Editing: {selectedJobForEdit.title}
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedJobForEdit(null)}
                        >
                          ✕
                        </Button>
                      </div>

                      <div className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto">
                        <div className="space-y-2">
                          <Label className="text-xs">Title</Label>
                          <p className="text-sm p-2 bg-muted/50 rounded">
                            {selectedJobForEdit.title}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs">Company</Label>
                          <p className="text-sm p-2 bg-muted/50 rounded">
                            {selectedJobForEdit.companyName || "N/A"}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs">Location</Label>
                          <p className="text-sm p-2 bg-muted/50 rounded">
                            {selectedJobForEdit.location || "N/A"}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs">Job Type</Label>
                          <p className="text-sm p-2 bg-muted/50 rounded">
                            {JOB_TYPE_LABELS[selectedJobForEdit.jobType]}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs">Status</Label>
                          <p className="text-sm p-2 bg-muted/50 rounded">
                            {STATUS_LABELS[selectedJobForEdit.status]}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs">Description</Label>
                          <p className="text-xs p-2 bg-muted/50 rounded line-clamp-4">
                            {selectedJobForEdit.description}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs">Deadline</Label>
                          <p className="text-sm p-2 bg-muted/50 rounded">
                            {formatDate(selectedJobForEdit.applicationDeadline)}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs">External URL</Label>
                          <a
                            href={selectedJobForEdit.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline break-all"
                          >
                            {selectedJobForEdit.externalUrl}
                          </a>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-4 border-t">
                        <Link
                          href={`/announcement/job-posting/${selectedJobForEdit.jobId}`}
                          className="flex-1"
                        >
                          <Button size="sm" className="w-full">
                            Full Edit
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedJobForEdit(null)}
                        >
                          Back
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
