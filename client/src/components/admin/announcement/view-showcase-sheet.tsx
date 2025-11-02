"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { X } from "lucide-react";
import Image from "next/image";
import type { Showcase } from "./types";

interface ViewShowcaseSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showcase?: Showcase;
}

export function ViewShowcaseSheet({
  open,
  onOpenChange,
  showcase,
}: ViewShowcaseSheetProps) {
  if (!showcase) return null;

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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full md:w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{showcase.title}</SheetTitle>
          <SheetDescription>
            Published on {formatDate(showcase.publishedAt)}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Thumbnail */}
          {showcase.thumbnailUrl && (
            <div className="relative w-full h-64 rounded-lg overflow-hidden bg-muted">
              <Image
                src={showcase.thumbnailUrl}
                alt={showcase.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Status Badges */}
          <div className="flex flex-wrap gap-2">
            {showcase.featured && (
              <Badge variant="default" className="bg-blue-600">
                Featured
              </Badge>
            )}
            <Badge variant="secondary">
              {new Date(showcase.publishedAt || new Date()).toLocaleDateString()}
            </Badge>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Description</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {showcase.description}
            </p>
          </div>

          {/* Achievements */}
          {showcase.achievements && showcase.achievements.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Achievements</h3>
              <ul className="space-y-2">
                {showcase.achievements.map((achievement, idx) => (
                  <li
                    key={idx}
                    className="text-sm text-muted-foreground flex gap-2"
                  >
                    <span className="text-green-600">✓</span>
                    {achievement}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tags */}
          {showcase.tags.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {showcase.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          {showcase.metadata && Object.keys(showcase.metadata).length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Metadata</h3>
              <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(showcase.metadata, null, 2)}
              </pre>
            </div>
          )}

          {/* Timestamps */}
          <div className="pt-4 border-t space-y-2 text-xs text-muted-foreground">
            <p>Created: {formatDate(showcase.createdAt)}</p>
            <p>Last Updated: {formatDate(showcase.updatedAt)}</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
