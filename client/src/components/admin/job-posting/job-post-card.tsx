"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, ExternalLink, MapPin, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Job } from "./types";
import { JOB_TYPE_COLORS, JOB_TYPE_LABELS, STATUS_COLORS, STATUS_LABELS } from "./types";

interface JobPostCardProps {
  job: Job;
  onEdit?: (job: Job) => void;
  onDelete?: (job: Job) => void;
}

export function JobPostCard({ job, onEdit, onDelete }: JobPostCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/announcement/job-posting/${job.jobId}`);
  };

  const formatDate = (date?: string) => {
    if (!date) return "Not specified";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(job);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(job);
  };

  return (
    <Card
      className="overflow-hidden min-w-full max-w-2xl mx-auto hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="p-6 space-y-4">
        {/* Header with Badges */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            <Badge className={JOB_TYPE_COLORS[job.jobType]}>
              {JOB_TYPE_LABELS[job.jobType]}
            </Badge>
            <Badge className={STATUS_COLORS[job.status]}>
              {STATUS_LABELS[job.status]}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleEditClick}
              className="h-8 w-8"
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDeleteClick}
              className="h-8 w-8 hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Title */}
        <div>
          <h3 className="text-xl font-semibold line-clamp-2">{job.title}</h3>
          {job.companyName && (
            <p className="text-sm text-muted-foreground mt-1">{job.companyName}</p>
          )}
        </div>

        {/* Description Preview */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {job.description}
        </p>

        {/* Location and Deadline */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {job.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{job.location}</span>
            </div>
          )}
          {job.applicationDeadline && (
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Deadline: {formatDate(job.applicationDeadline)}</span>
            </div>
          )}
        </div>

        {/* External Link */}
        {job.externalUrl && (
          <div className="pt-2">
            <a
              href={job.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 text-sm flex items-center gap-1 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              View Full Job Posting
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Posted Date */}
        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Posted on {formatDate(job.postedAt)}
          </p>
        </div>
      </div>
    </Card>
  );
}
