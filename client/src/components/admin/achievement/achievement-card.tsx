"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Award, Calendar, ExternalLink, Pencil, Star, Trash2, User } from "lucide-react";
import {
  ACHIEVEMENT_TYPE_COLORS,
  ACHIEVEMENT_TYPE_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  type Achievement,
} from "./types";

interface AchievementCardProps {
  achievement: Achievement;
  onEdit?: (achievement: Achievement) => void;
  onDelete?: (achievement: Achievement) => void;
}

export function AchievementCard({ achievement, onEdit, onDelete }: AchievementCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold line-clamp-2">{achievement.title}</h3>
              {achievement.featured && (
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
              )}
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge className={STATUS_COLORS[achievement.status]}>
                {STATUS_LABELS[achievement.status]}
              </Badge>
              <Badge className={ACHIEVEMENT_TYPE_COLORS[achievement.achievementType]}>
                {ACHIEVEMENT_TYPE_LABELS[achievement.achievementType]}
              </Badge>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 ml-4">
            {achievement.certificateUrl && (
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-blue-600 hover:text-blue-700"
              >
                <a
                  href={achievement.certificateUrl}
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
                onClick={() => onEdit(achievement)}
                className="text-gray-600 hover:text-gray-700"
              >
                <Pencil className="w-4 h-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(achievement)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
          {achievement.description}
        </p>

        {/* Details */}
        <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
          {achievement.awardedTo && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span><strong>Awarded to:</strong> {achievement.awardedTo}</span>
            </div>
          )}

          {achievement.awardingOrganization && (
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span><strong>Organization:</strong> {achievement.awardingOrganization}</span>
            </div>
          )}

          {achievement.achievementDate && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span><strong>Date:</strong> {new Date(achievement.achievementDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Image */}
        {achievement.imageUrl && (
          <div className="mt-4">
            <img
              src={achievement.imageUrl}
              alt={achievement.title}
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Footer */}
        {achievement.postedAt && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-400">
              Posted on {new Date(achievement.postedAt).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
