"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { CreateJobPayload, Job } from "./types";
import { JOB_TYPE_LABELS } from "./types";

interface CreateEditJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job?: Job | null;
  onSuccess: () => void;
}

export function CreateEditJobDialog({
  open,
  onOpenChange,
  job,
  onSuccess,
}: CreateEditJobDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
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
    if (job) {
      setFormData({
        title: job.title,
        description: job.description,
        companyName: job.companyName || "",
        location: job.location || "",
        jobType: job.jobType,
        externalUrl: job.externalUrl,
        applicationDeadline: job.applicationDeadline || "",
        status: job.status,
      });
    } else {
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
    }
  }, [job, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error("Title and description are required");
      return;
    }

    setIsLoading(true);
    try {
      if (job) {
        // Update existing job
        const response = await Axios.put(
          `${env.BACKEND_BASE_URL}/api/jobs/${job.jobId}`,
          formData
        );

        if (response.data.success) {
          toast.success("Job updated successfully");
          onOpenChange(false);
          onSuccess();
        } else {
          toast.error(response.data.message || "Failed to update job");
        }
      } else {
        // Create new job
        const response = await Axios.post(
          `${env.BACKEND_BASE_URL}/api/jobs`,
          formData
        );

        if (response.data.success) {
          toast.success("Job posted successfully");
          onOpenChange(false);
          onSuccess();
        } else {
          toast.error(response.data.message || "Failed to create job");
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{job ? "Edit Job Posting" : "Create New Job Posting"}</DialogTitle>
          <DialogDescription>
            {job
              ? "Update the job posting details"
              : "Fill in the details to post a new job opportunity"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
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

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Job Description *</Label>
            <Textarea
              id="description"
              placeholder="Detailed job description, responsibilities, and requirements"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={6}
              required
            />
          </div>

          {/* Company Name */}
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

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="e.g., San Francisco, CA or Remote"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
            />
          </div>

          {/* Job Type and Status Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="jobType">Job Type</Label>
              <Select value={formData.jobType} onValueChange={(value: any) =>
                setFormData({ ...formData, jobType: value })
              }>
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

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: any) =>
                setFormData({ ...formData, status: value })
              }>
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

          {/* External URL */}
          <div className="space-y-2">
            <Label htmlFor="externalUrl">External URL *</Label>
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
          </div>

          {/* Application Deadline */}
          <div className="space-y-2">
            <Label htmlFor="applicationDeadline">Application Deadline</Label>
            <Input
              id="applicationDeadline"
              type="date"
              value={formData.applicationDeadline}
              onChange={(e) =>
                setFormData({ ...formData, applicationDeadline: e.target.value })
              }
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : job ? "Update Job" : "Post Job"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
