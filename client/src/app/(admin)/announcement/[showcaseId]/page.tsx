"use client";

import { DeleteConfirmDialog } from "@/components/admin/announcement/delete-confirm-dialog";
import { EditShowcaseDialog } from "@/components/admin/announcement/edit-showcase-dialog";
import type { ApiResponse, Showcase } from "@/components/admin/announcement/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Axios } from "@/config/axios";
import { env } from "@/config/env";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ShowcaseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const showcaseId = params.showcaseId as string;

  const [showcase, setShowcase] = useState<Showcase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchShowcase = async () => {
      setIsLoading(true);
      try {
        const response = await Axios.get<ApiResponse<Showcase>>(
          `${env.BACKEND_BASE_URL}/api/showcases/${showcaseId}`
        );

        if (response.data.success && response.data.data) {
          setShowcase(response.data.data);
        } else {
          toast.error("Showcase not found");
          router.push("/announcement");
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to load showcase");
        router.push("/announcement");
      } finally {
        setIsLoading(false);
      }
    };

    if (showcaseId) {
      fetchShowcase();
    }
  }, [showcaseId, router]);

  const formatDate = (date?: string) => {
    if (!date) return "Not published";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleEditSuccess = () => {
    // Refetch the showcase after edit
    const fetchShowcase = async () => {
      try {
        const response = await Axios.get<ApiResponse<Showcase>>(
          `${env.BACKEND_BASE_URL}/api/showcases/${showcaseId}`
        );

        if (response.data.success && response.data.data) {
          setShowcase(response.data.data);
        }
      } catch (error: any) {
        toast.error("Failed to reload showcase");
      }
    };
    fetchShowcase();
  };

  const handleDeleteSuccess = () => {
    toast.success("Showcase deleted successfully");
    router.push("/announcement");
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

  if (!showcase) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/announcement">
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
          {/* Thumbnail */}
          {showcase.thumbnailUrl && (
            <div className="relative w-full h-96 overflow-hidden bg-muted">
              <img
                src={showcase.thumbnailUrl}
                alt={showcase.title}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="px-6 sm:px-8 space-y-6">
            {/* Title and Badges */}
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <h1 className="text-4xl font-bold break-words">
                    {showcase.title}
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    Published on {formatDate(showcase.publishedAt)}
                  </p>
                </div>
                {showcase.featured && (
                  <Badge variant="default" className="bg-blue-600 text-lg px-4">
                    Featured
                  </Badge>
                )}
              </div>

              {/* Tags */}
              {showcase.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {showcase.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold">Description</h2>
              <p className="text-base text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {showcase.description}
              </p>
            </div>

            {/* Achievements */}
            {showcase.achievements && (
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold">Key Achievements</h2>
                <ul className="space-y-3">
                    <li className="flex gap-3 text-base">
                      <span className="text-green-600 font-bold flex-shrink-0">
                        ✓
                      </span>
                      <span className="text-muted-foreground">{showcase.achievements}</span>
                    </li>
                </ul>
              </div>
            )}

            {/* Metadata */}
            {showcase.metadata && Object.keys(showcase.metadata).length > 0 && (
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold">Additional Information</h2>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto max-h-80 border">
                  {JSON.stringify(showcase.metadata, null, 2)}
                </pre>
              </div>
            )}

            {/* Timestamps */}
            <div className="pt-6 border-t space-y-2 text-sm text-muted-foreground">
              <p>Created: {formatDate(showcase.createdAt)}</p>
              <p>Last Updated: {formatDate(showcase.updatedAt)}</p>
            </div>
          </div>
        </div>

        {/* Sticky Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t py-4 px-4">
          <div className="max-w-4xl mx-auto flex gap-3">
            <Link href="/announcement" className="flex-1">
              <Button variant="outline" className="w-full">
                Back to Announcements
              </Button>
            </Link>
            <Button
              onClick={() => setEditDialogOpen(true)}
              className="flex-1 gap-2"
            >
              <Pencil className="w-4 h-4" />
              Edit Showcase
            </Button>
          </div>
        </div>

        {/* Extra spacing for sticky bar */}
        <div className="h-28"></div>
      </div>

      {/* Dialogs */}
      <EditShowcaseDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        showcase={showcase}
        onSuccess={handleEditSuccess}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        showcase={showcase}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
