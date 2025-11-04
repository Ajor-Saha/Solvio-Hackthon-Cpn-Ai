"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Axios } from "@/config/axios";
import { env } from "@/config/env";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Save } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import type { Competition, CreateCompetitionPayload } from "./types";

const competitionSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or fewer"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters"),
  type: z.enum([
    "hackathon",
    "debate",
    "datathon",
    "programming_contest",
    "math_competition",
    "quiz",
    "case_study",
    "design_challenge",
    "other",
  ]),
  organizerName: z.string().optional(),
  location: z.string().optional(),
  eventDate: z.string().optional(),
  registrationDeadline: z.string().optional(),
  externalUrl: z.string().url("Must be a valid URL"),
  bannerUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  status: z.enum(["draft", "active", "closed", "archived"]).default("draft"),
});

type CompetitionFormData = z.infer<typeof competitionSchema>;

interface CreateEditCompetitionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  competition?: Competition | null;
  onSuccess: () => void;
}

export function CreateEditCompetitionDialog({
  open,
  onOpenChange,
  competition,
  onSuccess,
}: CreateEditCompetitionDialogProps) {
  const isEditing = Boolean(competition);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CompetitionFormData>({
    resolver: zodResolver(competitionSchema),
    defaultValues: {
      type: "other",
      status: "draft",
    },
  });

  useEffect(() => {
    if (!open) {
      reset({
        type: "other",
        status: "draft",
      });
      return;
    }

    if (competition) {
      setValue("title", competition.title);
      setValue("description", competition.description);
      setValue("type", competition.type);
      setValue("organizerName", competition.organizerName || "");
      setValue("location", competition.location || "");
      setValue("eventDate", competition.eventDate || "");
      setValue(
        "registrationDeadline",
        competition.registrationDeadline || ""
      );
      setValue("externalUrl", competition.externalUrl);
      setValue("bannerUrl", competition.bannerUrl || "");
      setValue("status", competition.status);
    } else {
      reset({
        type: "other",
        status: "draft",
      });
    }
  }, [open, competition, reset, setValue]);

  const onSubmit = async (data: CompetitionFormData) => {
    const payload: CreateCompetitionPayload = {
      title: data.title,
      description: data.description,
      type: data.type,
      organizerName: data.organizerName || undefined,
      location: data.location || undefined,
      eventDate: data.eventDate || undefined,
      registrationDeadline: data.registrationDeadline || undefined,
      externalUrl: data.externalUrl,
      bannerUrl: data.bannerUrl || undefined,
      status: data.status,
    };

    try {
      const response = isEditing
        ? await Axios.put(
            `${env.BACKEND_BASE_URL}/api/competitions/${competition?.competitionId}`,
            payload
          )
        : await Axios.post(
            `${env.BACKEND_BASE_URL}/api/competitions`,
            payload
          );

      if (response.data.success) {
        toast.success(
          isEditing
            ? "Competition updated successfully"
            : "Competition created successfully"
        );
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error(response.data.message || "Failed to save competition");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to save competition"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-neutral-900 text-neutral-200">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Competition" : "Create New Competition"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the competition details below."
              : "Fill in the details to create a new competition announcement."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Annual Programming Contest 2024"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              rows={5}
              placeholder="Detailed description of the competition, rules, prizes, etc."
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Competition Type *</Label>
              <Select
                value={watch("type")}
                onValueChange={(value) => setValue("type", value as CompetitionFormData["type"])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select competition type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hackathon">Hackathon</SelectItem>
                  <SelectItem value="debate">Debate</SelectItem>
                  <SelectItem value="datathon">Datathon</SelectItem>
                  <SelectItem value="programming_contest">
                    Programming Contest
                  </SelectItem>
                  <SelectItem value="math_competition">Math Competition</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="case_study">Case Study</SelectItem>
                  <SelectItem value="design_challenge">
                    Design Challenge
                  </SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={watch("status")}
                onValueChange={(value) => setValue("status", value as CompetitionFormData["status"])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="organizerName">Organizer Name</Label>
              <Input
                id="organizerName"
                placeholder="e.g., IEEE Student Branch"
                {...register("organizerName")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., Main Auditorium, Online"
                {...register("location")}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eventDate">Event Date</Label>
              <Input id="eventDate" type="date" {...register("eventDate")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registrationDeadline">Registration Deadline</Label>
              <Input
                id="registrationDeadline"
                type="date"
                {...register("registrationDeadline")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="externalUrl">Registration / Info URL *</Label>
            <Input
              id="externalUrl"
              type="url"
              placeholder="https://example.com/competition"
              {...register("externalUrl")}
            />
            {errors.externalUrl && (
              <p className="text-sm text-destructive">
                {errors.externalUrl.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bannerUrl">Banner Image URL</Label>
            <Input
              id="bannerUrl"
              type="url"
              placeholder="https://example.com/banner.jpg"
              {...register("bannerUrl")}
            />
            {errors.bannerUrl && (
              <p className="text-sm text-destructive">
                {errors.bannerUrl.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {isEditing ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {isEditing ? "Update Competition" : "Create Competition"}
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
