"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Axios } from "@/config/axios";
import { env } from "@/config/env";
import { useState } from "react";
import { toast } from "sonner";
import type { Job } from "./types";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: Job | null;
  onSuccess: () => void;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  job,
  onSuccess,
}: DeleteConfirmDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!job) return;

    setIsLoading(true);
    try {
      const response = await Axios.delete(
        `${env.BACKEND_BASE_URL}/api/jobs/${job.jobId}`
      );

      if (response.data.success) {
        toast.success("Job posting deleted successfully");
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(response.data.message || "Failed to delete job");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Job Posting?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <div>
              <p className="text-sm font-medium">{job?.title}</p>
              <p className="text-xs text-muted-foreground">{job?.companyName}</p>
            </div>
            <p>
              Are you sure you want to delete this job posting? This action cannot be
              undone.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex gap-3 justify-end pt-4">
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isLoading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
