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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Axios } from "@/config/axios";
import { env } from "@/config/env";
import { toast } from "sonner";
import { useState } from "react";
import { TagInput } from "./tag-input";
import type { CreateShowcasePayload } from "./types";

interface CreateShowcaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateShowcaseDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateShowcaseDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<CreateShowcasePayload>({
    title: "",
    description: "",
    achievements: [],
    tags: [],
    thumbnailUrl: "",
    featured: false,
    metadata: {},
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      achievements: [],
      tags: [],
      thumbnailUrl: "",
      featured: false,
      metadata: {},
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error("Title and description are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await Axios.post(
        `${env.BACKEND_BASE_URL}/api/showcases`,
        formData
      );

      if (response.data.success) {
        toast.success(response.data.message || "Showcase created successfully");
        resetForm();
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(response.data.message || "Failed to create showcase");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to create showcase"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Create Department Showcase</DialogTitle>
          <DialogDescription>
            Add a new showcase to highlight your department's achievements
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-120px)] pr-4">
          <form onSubmit={handleSubmit} className="space-y-6 px-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter showcase title"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter detailed description"
                rows={4}
              />
            </div>

            {/* Achievements */}
            <div className="space-y-2">
              <Label htmlFor="achievements">Achievements</Label>
              <Textarea
                id="achievements"
                value={formData.achievements?.join("\n") || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    achievements: e.target.value
                      .split("\n")
                      .filter((a) => a.trim()),
                  })
                }
                placeholder="Enter achievements (one per line)"
                rows={3}
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <TagInput
                tags={formData.tags}
                onChange={(tags) => setFormData({ ...formData, tags })}
              />
            </div>

            {/* Thumbnail URL */}
            <div className="space-y-2">
              <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
              <Input
                id="thumbnailUrl"
                type="url"
                value={formData.thumbnailUrl || ""}
                onChange={(e) =>
                  setFormData({ ...formData, thumbnailUrl: e.target.value })
                }
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* Featured Checkbox */}
            <div className="flex items-center gap-3">
              <input
                id="featured"
                type="checkbox"
                checked={formData.featured}
                onChange={(e) =>
                  setFormData({ ...formData, featured: e.target.checked })
                }
                className="w-4 h-4 cursor-pointer"
              />
              <Label htmlFor="featured" className="cursor-pointer">
                Featured
              </Label>
            </div>

            {/* Metadata (JSON) */}
            <div className="space-y-2">
              <Label htmlFor="metadata">Metadata (JSON)</Label>
              <Textarea
                id="metadata"
                value={JSON.stringify(formData.metadata || {}, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setFormData({ ...formData, metadata: parsed });
                  } catch {
                    // Invalid JSON, just update the string for now
                  }
                }}
                placeholder="{}"
                rows={4}
                className="font-mono text-xs"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  onOpenChange(false);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Showcase"}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
