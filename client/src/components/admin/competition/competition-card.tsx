"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, MapPin, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import {
  COMPETITION_TYPE_COLORS,
  COMPETITION_TYPE_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  type Competition,
} from "./types";

interface CompetitionCardProps {
  competition: Competition;
  onEdit?: (competition: Competition) => void;
  onDelete?: (competitionId: string) => void;
}

export function CompetitionCard({
  competition,
  onEdit,
  onDelete,
}: CompetitionCardProps) {
  const formatDate = (date?: string) => {
    if (!date) return "Not specified";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card className="overflow-hidden w-full hover:shadow-lg transition-shadow flex flex-col h-full">
      {/* Banner Image */}
      {competition.bannerUrl && (
        <div className="w-full h-40 bg-muted overflow-hidden flex-shrink-0">
          <img
            src={competition.bannerUrl}
            alt={competition.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      )}

      <div className="p-4 space-y-4 flex-1 flex flex-col">
        {/* Badges - Type and Status */}
        <div className="flex flex-wrap gap-2 flex-shrink-0">
          <Badge className={`${COMPETITION_TYPE_COLORS[competition.type]} text-xs font-medium`}>
            {COMPETITION_TYPE_LABELS[competition.type]}
          </Badge>
          <Badge className={`${STATUS_COLORS[competition.status]} text-xs font-medium`}>
            {STATUS_LABELS[competition.status]}
          </Badge>
        </div>

        {/* Title */}
        <div className="flex-shrink-0">
          <h3 className="font-bold text-base line-clamp-2 leading-snug">
            {competition.title}
          </h3>
        </div>

        {/* Organizer */}
        {competition.organizerName && (
          <p className="text-xs text-muted-foreground flex-shrink-0">
            By {competition.organizerName}
          </p>
        )}

        {/* Description - Limited Lines */}
        <p className="text-xs text-muted-foreground line-clamp-2 flex-1 leading-relaxed">
          {competition.description}
        </p>

        {/* Location and Dates - Condensed */}
        <div className="space-y-2 flex-shrink-0 text-xs border-t pt-2">
          {competition.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate flex-1">{competition.location}</span>
            </div>
          )}
          {competition.registrationDeadline && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate flex-1">Reg: {formatDate(competition.registrationDeadline)}</span>
            </div>
          )}
          {competition.eventDate && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate flex-1">Event: {formatDate(competition.eventDate)}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t mt-auto flex-shrink-0">
          <Link
            href={`/announcement/competition/${competition.competitionId}`}
            className="flex-1"
          >
            <Button variant="outline" size="sm" className="w-full text-xs">
              <Pencil className="w-3.5 h-3.5 mr-1.5" />
              View
            </Button>
          </Link>
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(competition.competitionId)}
              className="text-xs"
            >
              <Trash2 className="w-3.5 h-3.5 text-destructive" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
