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
import type { HigherStudy } from "./types";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  higherStudy: HigherStudy | null;
  onSuccess: () => void;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  higherStudy,
  onSuccess,
}: DeleteConfirmDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!higherStudy) return;

    setIsDeleting(true);
    try {
      const response = await Axios.delete(
        `${env.BACKEND_BASE_URL}/api/higher-studies/${higherStudy.higherStudyId}`
      );

      if (response.data.success) {
        toast.success("Higher study deleted successfully");
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error(response.data.message || "Failed to delete higher study");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to delete higher study"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="w-5 h-5" /> Delete Higher Study
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this higher study opportunity? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {higherStudy && (
          <div className="bg-muted/50 rounded-md p-4 space-y-1">
            <p className="font-medium">{higherStudy.title}</p>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {higherStudy.description}
            </p>
            <p className="text-xs text-muted-foreground">
              Institution: {higherStudy.institution}
            </p>
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
                Delete
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
