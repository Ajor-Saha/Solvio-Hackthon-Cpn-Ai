"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Showcase } from "./types";

interface ShowcasePostCardProps {
  showcase: Showcase;
  onEdit: (showcase: Showcase) => void;
  onDelete: (showcase: Showcase) => void;
}

export function ShowcasePostCard({
  showcase,
  onEdit,
  onDelete,
}: ShowcasePostCardProps) {
  const router = useRouter();

  const formatDate = (date?: string) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleCardClick = () => {
    router.push(`/announcement/${showcase.showcaseId}`);
  };

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/announcement/${showcase.showcaseId}`);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(showcase);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(showcase);
  };

  return (
    <Card
      className="overflow-hidden w-full max-w-2xl mx-auto hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Thumbnail */}
      {showcase.thumbnailUrl && (
        <div className="relative w-full h-64 overflow-hidden bg-muted">
          <img
            src={showcase.thumbnailUrl}
            alt={showcase.title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Header with badges */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold line-clamp-2 hover:underline">
                {showcase.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {formatDate(showcase.publishedAt)}
              </p>
            </div>
            {showcase.featured && (
              <Badge variant="default" className="bg-blue-600 flex-shrink-0">
                Featured
              </Badge>
            )}
          </div>

          {/* Tags */}
          {showcase.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {showcase.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-3">
          {showcase.description}
        </p>

        {/* Achievements Preview */}
        {showcase.achievements && showcase.achievements.length > 0 && (
          <div className="space-y-2 pt-2">
            <p className="text-xs font-semibold text-muted-foreground">
              Key Achievements:
            </p>
            <ul className="space-y-1">
                <li className="text-xs text-muted-foreground">
                  <span className="text-green-600 mr-2">✓</span>
                  {showcase.achievements}
                </li>
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleViewClick}
            className="flex-1 gap-2"
          >
            <Eye className="w-4 h-4" />
            View
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleEditClick}
            className="flex-1 gap-2"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDeleteClick}
            className="flex-1 gap-2 text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
}
