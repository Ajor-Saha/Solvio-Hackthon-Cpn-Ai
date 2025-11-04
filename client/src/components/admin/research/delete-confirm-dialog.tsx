"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Axios } from "@/config/axios";
import { env } from "@/config/env";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Research } from "./types";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  research: Research | null;
  onSuccess: () => void;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  research,
  onSuccess,
}: DeleteConfirmDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!research) return;

    setIsDeleting(true);
    try {
      const response = await Axios.delete(
        `${env.BACKEND_BASE_URL}/api/research/${research.researchId}`
      );

      if (response.data.success) {
        toast.success("Research project deleted successfully");
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error(response.data.message || "Failed to delete research project");
      }
    } catch (error: any) {
      console.error("Error deleting research:", error);
      toast.error(error.response?.data?.message || "Failed to delete research project");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="w-5 h-5" />
            Delete Research Project
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this research project? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {research && (
          <div className="py-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                {research.title}
              </h4>
              {research.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                  {research.description}
                </p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                <strong>Course ID:</strong> {research.courseId}
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Deleting...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Delete Research
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
