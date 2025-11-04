"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, ExternalLink, GraduationCap, MapPin, Pencil, Star, Trash2, University } from "lucide-react";
import {
  HIGHER_STUDY_TYPE_COLORS,
  HIGHER_STUDY_TYPE_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  type HigherStudy,
} from "./types";

interface HigherStudyCardProps {
  higherStudy: HigherStudy;
  onEdit?: (higherStudy: HigherStudy) => void;
  onDelete?: (higherStudy: HigherStudy) => void;
}

export function HigherStudyCard({ higherStudy, onEdit, onDelete }: HigherStudyCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold line-clamp-2">{higherStudy.title}</h3>
              {higherStudy.scholarshipAvailable && (
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
              )}
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge className={STATUS_COLORS[higherStudy.status]}>
                {STATUS_LABELS[higherStudy.status]}
              </Badge>
              <Badge className={HIGHER_STUDY_TYPE_COLORS[higherStudy.studyType]}>
                {HIGHER_STUDY_TYPE_LABELS[higherStudy.studyType]}
              </Badge>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 ml-4">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-blue-600 hover:text-blue-700"
            >
              <a
                href={higherStudy.applicationUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(higherStudy)}
                className="text-gray-600 hover:text-gray-700"
              >
                <Pencil className="w-4 h-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(higherStudy)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
          {higherStudy.description}
        </p>

        {/* Details */}
        <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <University className="w-4 h-4" />
            <span><strong>Institution:</strong> {higherStudy.institution}</span>
          </div>

          {higherStudy.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span><strong>Location:</strong> {higherStudy.location}</span>
            </div>
          )}

          {higherStudy.fieldOfStudy && (
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              <span><strong>Field:</strong> {higherStudy.fieldOfStudy}</span>
            </div>
          )}

          {higherStudy.applicationDeadline && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span><strong>Deadline:</strong> {new Date(higherStudy.applicationDeadline).toLocaleDateString()}</span>
            </div>
          )}

          {higherStudy.duration && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span><strong>Duration:</strong> {higherStudy.duration}</span>
            </div>
          )}

          {higherStudy.tuitionFee && (
            <div className="flex items-center gap-2">
              <span><strong>Tuition:</strong> {higherStudy.tuitionFee}</span>
            </div>
          )}
        </div>

        {/* Image */}
        {higherStudy.imageUrl && (
          <div className="mt-4">
            <img
              src={higherStudy.imageUrl}
              alt={higherStudy.title}
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Footer */}
        {higherStudy.postedAt && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-400">
              Posted on {new Date(higherStudy.postedAt).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
