"use client";

import {
    type ApiResponse,
    CreateEditJobDialog,
    DeleteConfirmDialog,
    type Job,
    JOB_TYPE_COLORS,
    JOB_TYPE_LABELS,
    STATUS_COLORS,
    STATUS_LABELS,
} from "@/components/admin/job-posting";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Axios } from "@/config/axios";
import { env } from "@/config/env";
import {
    ArrowLeft,
    Briefcase,
    Calendar,
    ExternalLink,
    MapPin,
    Pencil,
    Trash2,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId as string;

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      setIsLoading(true);
      try {
        const response = await Axios.get<ApiResponse<Job>>(
          `${env.BACKEND_BASE_URL}/api/jobs/${jobId}`
        );

        if (response.data.success && response.data.data) {
          setJob(response.data.data);
        } else {
          toast.error("Job not found");
          router.push("/announcement/job-posting");
        }
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || "Failed to load job details"
        );
        router.push("/announcement/job-posting");
      } finally {
        setIsLoading(false);
      }
    };

    if (jobId) {
      fetchJob();
    }
  }, [jobId, router]);

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

  const handleEditSuccess = () => {
    // Refetch the job after edit
    const fetchJob = async () => {
      try {
        const response = await Axios.get<ApiResponse<Job>>(
          `${env.BACKEND_BASE_URL}/api/jobs/${jobId}`
        );

        if (response.data.success && response.data.data) {
          setJob(response.data.data);
        }
      } catch (error: any) {
        toast.error("Failed to reload job");
      }
    };
    fetchJob();
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
              onClick={() => setEditDialogOpen(true)}
            >
              <Pencil className="w-5 h-5" />
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
              onClick={() => setEditDialogOpen(true)}
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

      {/* Dialogs */}
      <CreateEditJobDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        job={job}
        onSuccess={handleEditSuccess}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        job={job}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
