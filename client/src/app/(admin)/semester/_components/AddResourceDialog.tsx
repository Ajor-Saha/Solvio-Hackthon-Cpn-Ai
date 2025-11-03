"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import useAuthStore from "@/store/store";
import { Plus, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface AddResourceDialogProps {
  courseId: string;
  onResourceAdded: () => void;
}

const AddResourceDialog = ({
  courseId,
  onResourceAdded,
}: AddResourceDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resourceType, setResourceType] = useState<string>("pdf");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const { accessToken } = useAuthStore();

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setLinkUrl("");
    setFile(null);
    setResourceType("pdf");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    if (resourceType === "link" && !linkUrl.trim()) {
      toast.error("Please enter a URL for the link");
      return;
    }

    if (resourceType !== "link" && !file) {
      toast.error("Please select a file to upload");
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("courseId", courseId);
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("resourceType", resourceType);

      if (resourceType === "link") {
        formData.append("fileUrl", linkUrl.trim());
      } else if (file) {
        formData.append("files", file);
      }

      const response = await Axios.post(
        "/api/course-resource/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.success("Resource added successfully");
        resetForm();
        setOpen(false);
        onResourceAdded();
      }
    } catch (error: any) {
      console.error("Error adding resource:", error);
      toast.error(
        error.response?.data?.message || "Failed to add resource"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type based on resourceType
      const validTypes: Record<string, string[]> = {
        pdf: ["application/pdf"],
        ppt: [
          "application/vnd.ms-powerpoint",
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        ],
        image: ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"],
      };

      if (!validTypes[resourceType]?.includes(selectedFile.type)) {
        toast.error(`Please select a valid ${resourceType.toUpperCase()} file`);
        e.target.value = "";
        return;
      }

      // Check file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        e.target.value = "";
        return;
      }

      setFile(selectedFile);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Resource
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md dark:bg-gray-950 bg-slate-200">
        <DialogHeader>
          <DialogTitle>Add Course Resource</DialogTitle>
          <DialogDescription>
            Upload files or add links to course materials
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="resourceType">Resource Type</Label>
            <Select value={resourceType} onValueChange={setResourceType}>
              <SelectTrigger>
                <SelectValue placeholder="Select resource type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF Document</SelectItem>
                <SelectItem value="ppt">PowerPoint Presentation</SelectItem>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="link">External Link</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter resource title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter resource description (optional)"
              rows={3}
            />
          </div>

          {resourceType === "link" ? (
            <div className="space-y-2">
              <Label htmlFor="linkUrl">URL *</Label>
              <Input
                id="linkUrl"
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                required
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="file">File *</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  accept={
                    resourceType === "pdf"
                      ? ".pdf"
                      : resourceType === "ppt"
                      ? ".ppt,.pptx"
                      : ".jpg,.jpeg,.png,.gif,.webp"
                  }
                  required
                />
                {file && (
                  <Upload className="w-5 h-5 text-green-600 dark:text-green-400" />
                )}
              </div>
              {file && (
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Max file size: 10MB
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                setOpen(false);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Resource"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddResourceDialog;
