"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eye, Pencil, Trash2 } from "lucide-react";
import type { Showcase } from "./types";

interface ShowcasePostCardProps {
  showcase: Showcase;
  onView: (showcase: Showcase) => void;
  onEdit: (showcase: Showcase) => void;
  onDelete: (showcase: Showcase) => void;
}

export function ShowcasePostCard({
  showcase,
  onView,
  onEdit,
  onDelete,
}: ShowcasePostCardProps) {
  const formatDate = (date?: string) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card className="overflow-hidden w-6xl mx-auto hover:shadow-lg transition-shadow">
      {/* Thumbnail */}
      {showcase.thumbnailUrl && (
        <div className="relative w-full h-64 overflow-hidden bg-muted">
          {/* <Image
            src={showcase.thumbnailUrl}
            alt={showcase.title}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
          /> */}
        </div>
      )}

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Header with badges */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold line-clamp-2">
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
              {/* {showcase.achievements.slice(0, 2).map((achievement, idx) => (
                <li key={idx} className="text-xs text-muted-foreground">
                  <span className="text-green-600 mr-2">✓</span>
                  {achievement}
                </li>
              ))}
              {showcase.achievements.length > 2 && (
                <li className="text-xs text-muted-foreground">
                  <span className="text-blue-600 mr-2">+</span>
                  {showcase.achievements.length - 2} more achievements
                </li>
              )} */}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onView(showcase)}
            className="flex-1 gap-2"
          >
            <Eye className="w-4 h-4" />
            View
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(showcase)}
            className="flex-1 gap-2"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(showcase)}
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
