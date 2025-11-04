"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, ExternalLink, Pencil, Trash2, User, BookOpen } from "lucide-react";
import {
  RESEARCH_STATUS_COLORS,
  RESEARCH_STATUS_LABELS,
  type Research,
} from "./types";

interface ResearchCardProps {
  research: Research;
  onEdit?: (research: Research) => void;
  onDelete?: (research: Research) => void;
}

export function ResearchCard({ research, onEdit, onDelete }: ResearchCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold line-clamp-2">{research.title}</h3>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge className={RESEARCH_STATUS_COLORS[research.status]}>
                {RESEARCH_STATUS_LABELS[research.status]}
              </Badge>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 ml-4">
            {research.publicationUrl && (
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-blue-600 hover:text-blue-700"
              >
                <a
                  href={research.publicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            )}
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(research)}
                className="text-gray-600 hover:text-gray-700"
              >
                <Pencil className="w-4 h-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(research)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Description */}
        {research.description && (
          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
            {research.description}
          </p>
        )}

        {/* Details */}
        <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span><strong>Course ID:</strong> {research.courseId}</span>
          </div>

          {research.supervisorId && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span><strong>Supervisor:</strong> {research.supervisorId}</span>
            </div>
          )}

          {research.startDate && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span><strong>Start Date:</strong> {new Date(research.startDate).toLocaleDateString()}</span>
            </div>
          )}

          {research.endDate && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span><strong>End Date:</strong> {new Date(research.endDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        {research.createdAt && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-400">
              Created on {new Date(research.createdAt).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
