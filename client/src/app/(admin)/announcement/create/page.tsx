"use client";

import { TagInput } from "@/components/admin/announcement/tag-input";
import type { CreateShowcasePayload } from "@/components/admin/announcement/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Axios } from "@/config/axios";
import { env } from "@/config/env";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function CreateShowcasePage() {
  const router = useRouter();
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
        router.push("/announcement");
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/announcement">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Create Showcase</h1>
              <p className="text-sm text-muted-foreground">
                Share your department's achievements
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info Card */}
          <div className="bg-card border rounded-lg p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
              <div className="space-y-4">
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
                    placeholder="Enter an engaging title for your showcase"
                    className="text-lg"
                  />
                  <p className="text-xs text-muted-foreground">
                    Make it descriptive and catchy
                  </p>
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
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                    placeholder="Provide a detailed description of your showcase..."
                    rows={6}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Be specific and include relevant details
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Achievements Card */}
          <div className="bg-card border rounded-lg p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-4">Key Achievements</h2>
              <div className="space-y-2">
                <Label htmlFor="achievements">Achievements (Optional)</Label>
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
                  placeholder="Enter each achievement on a new line..."
                  rows={4}
                  className="resize-none font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  One achievement per line (e.g., Award won, Records broken, etc.)
                </p>
              </div>
            </div>
          </div>

          {/* Media & Tags Card */}
          <div className="bg-card border rounded-lg p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Media & Tags</h2>
              <div className="space-y-4">
                {/* Thumbnail URL */}
                <div className="space-y-2">
                  <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
                  <Input
                    id="thumbnailUrl"
                    type="url"
                    value={formData.thumbnailUrl || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        thumbnailUrl: e.target.value,
                      })
                    }
                    placeholder="https://example.com/image.jpg"
                  />
                  {formData.thumbnailUrl && (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted border">
                      <img
                        src={formData.thumbnailUrl}
                        alt="Thumbnail preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Add a visual representation of your showcase
                  </p>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <TagInput
                    tags={formData.tags}
                    onChange={(tags) => setFormData({ ...formData, tags })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Press Enter to add a tag, click X to remove
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Featured & Metadata Card */}
          <div className="bg-card border rounded-lg p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Additional Options</h2>
              <div className="space-y-4">
                {/* Featured Checkbox */}
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <input
                    id="featured"
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        featured: e.target.checked,
                      })
                    }
                    className="w-5 h-5 cursor-pointer accent-blue-600"
                  />
                  <div>
                    <Label
                      htmlFor="featured"
                      className="cursor-pointer font-medium"
                    >
                      Mark as Featured
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Featured showcases appear at the top
                    </p>
                  </div>
                </div>

                {/* Additional Links */}
                <div className="space-y-2">
                  <Label htmlFor="metadata">Additional Links</Label>
                   <Input
                    id="github"
                    type="url"
                    value={formData.metadata?.links || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        metadata: {
                          ...formData.metadata,
                          links: e.target.value,
                        },
                      })
                    }
                    placeholder="https://github.com/..."
                  />
                  <Input
                    id="liveDemo"
                    type="url"
                    value={formData.metadata?.liveDemo || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        metadata: {
                          ...formData.metadata,
                          liveDemo: e.target.value,
                        },
                      })
                    }
                    placeholder="https://live-demo.com/..."
                  />
                  <Input
                    id="video"
                    type="url"
                    value={formData.metadata?.video || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        metadata: {
                          ...formData.metadata,
                          video: e.target.value,
                        },
                      })
                    }
                    placeholder="https://youtube.com/..."
                  />
                  <Input
                    id="other"
                    type="url"
                    value={formData.metadata?.other || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        metadata: {
                          ...formData.metadata,
                          other: e.target.value,
                        },
                      })
                    }
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 rounded-lg border">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                router.push("/announcement");
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? "Creating..." : "Create Showcase"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
