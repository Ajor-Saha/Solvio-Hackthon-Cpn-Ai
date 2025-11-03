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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Axios } from "@/config/axios";
import useAuthStore from "@/store/store";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface CourseResource {
  resourceId: string;
  courseId: string;
  title: string;
  description: string | null;
  resourceType: "pdf" | "ppt" | "image" | "link";
  fileUrl: string;
  fileSize: string | null;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string | null;
  uploaderFirstName: string;
  uploaderLastName: string;
  uploaderEmail: string;
}

interface EditResourceDialogProps {
  resource: CourseResource | null;
  open: boolean;
  onClose: () => void;
  onResourceUpdated: () => void;
}

const EditResourceDialog = ({
  resource,
  open,
  onClose,
  onResourceUpdated,
}: EditResourceDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const { accessToken } = useAuthStore();

  useEffect(() => {
    if (resource) {
      setTitle(resource.title);
      setDescription(resource.description || "");
    }
  }, [resource]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resource) return;

    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await Axios.put(
        `/api/course-resource/update/${resource.resourceId}`,
        {
          title: title.trim(),
          description: description.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Resource updated successfully");
        onClose();
        onResourceUpdated();
      }
    } catch (error: any) {
      console.error("Error updating resource:", error);
      toast.error(
        error.response?.data?.message || "Failed to update resource"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!resource) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md dark:bg-gray-950 bg-slate-200">
        <DialogHeader>
          <DialogTitle>Edit Resource</DialogTitle>
          <DialogDescription>
            Update the title and description of this resource
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title *</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter resource title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter resource description (optional)"
              rows={4}
            />
          </div>

          <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Type:</span>{" "}
              <span className="uppercase">{resource.resourceType}</span>
            </p>
            {resource.fileSize && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Size:</span> {resource.fileSize}
              </p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Note: File cannot be changed. To replace the file, delete this
              resource and upload a new one.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Resource"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditResourceDialog;
