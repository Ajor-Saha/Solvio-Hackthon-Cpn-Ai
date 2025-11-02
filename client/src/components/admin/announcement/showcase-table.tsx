"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Pencil, Trash2 } from "lucide-react";
import type { Showcase } from "./types";

interface ShowcaseTableProps {
  showcases: Showcase[];
  isLoading: boolean;
  onView: (showcase: Showcase) => void;
  onEdit: (showcase: Showcase) => void;
  onDelete: (showcase: Showcase) => void;
}

export function ShowcaseTable({
  showcases,
  isLoading,
  onView,
  onEdit,
  onDelete,
}: ShowcaseTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Loading showcases...</p>
      </div>
    );
  }

  if (!showcases.length) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">No showcases found</p>
      </div>
    );
  }

  const formatDate = (date?: string) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Featured</TableHead>
            <TableHead>Published</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead className="w-32 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {showcases.map((showcase) => (
            <TableRow key={showcase.showcaseId}>
              <TableCell className="font-medium max-w-xs truncate">
                {showcase.title}
              </TableCell>
              <TableCell>
                {showcase.featured ? (
                  <Badge variant="default">Featured</Badge>
                ) : (
                  <Badge variant="outline">Regular</Badge>
                )}
              </TableCell>
              <TableCell>{formatDate(showcase.publishedAt)}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {showcase.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {showcase.tags.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{showcase.tags.length - 2}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onView(showcase)}
                  title="View"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit(showcase)}
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(showcase)}
                  title="Delete"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
