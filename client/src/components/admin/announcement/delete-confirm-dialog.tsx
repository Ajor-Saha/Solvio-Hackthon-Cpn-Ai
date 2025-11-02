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
import type { Showcase } from "./types";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showcase?: Showcase;
  onSuccess?: () => void;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  showcase,
  onSuccess,
}: DeleteConfirmDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!showcase?.showcaseId) {
      toast.error("Showcase ID is missing");
      return;
    }

    setIsDeleting(true);
    try {
      const response = await Axios.delete(
        `${env.BACKEND_BASE_URL}/api/showcases/${showcase.showcaseId}`
      );

      if (response.data.success) {
        toast.success("Showcase deleted successfully");
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(response.data.message || "Failed to delete showcase");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete showcase");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Showcase</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this showcase? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4 py-4">
          <div className="p-3 bg-muted rounded-md">
            <p className="font-semibold text-sm">{showcase?.title}</p>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {showcase?.description}
            </p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
