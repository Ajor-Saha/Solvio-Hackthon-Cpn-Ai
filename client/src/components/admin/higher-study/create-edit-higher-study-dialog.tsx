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
import type { CreateHigherStudyPayload, HigherStudy } from "./types";

const higherStudySchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or fewer"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters"),
  studyType: z.enum([
    "masters",
    "phd",
    "postdoc",
    "fellowship",
    "exchange_program",
    "research_opportunity",
    "scholarship",
  ]),
  institution: z.string().min(1, "Institution is required"),
  location: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  applicationDeadline: z.string().optional(),
  startDate: z.string().optional(),
  duration: z.string().optional(),
  tuitionFee: z.string().optional(),
  scholarshipAvailable: z.boolean().default(false),
  eligibilityCriteria: z.string().optional(),
  applicationUrl: z.string().url("Must be a valid URL"),
  contactEmail: z
    .string()
    .email("Must be a valid email")
    .optional()
    .or(z.literal("")),
  imageUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  status: z.enum(["draft", "active", "closed", "archived"]).default("draft"),
});

type HigherStudyFormData = z.infer<typeof higherStudySchema>;

interface CreateEditHigherStudyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  higherStudy?: HigherStudy | null;
  onSuccess: () => void;
}

export function CreateEditHigherStudyDialog({
  open,
  onOpenChange,
  higherStudy,
  onSuccess,
}: CreateEditHigherStudyDialogProps) {
  const isEditing = Boolean(higherStudy);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<HigherStudyFormData>({
    resolver: zodResolver(higherStudySchema),
    defaultValues: {
      studyType: "masters",
      scholarshipAvailable: false,
      status: "draft",
    },
  });

  useEffect(() => {
    if (!open) {
      reset({
        studyType: "masters",
        scholarshipAvailable: false,
        status: "draft",
      });
      return;
    }

    if (higherStudy) {
      setValue("title", higherStudy.title);
      setValue("description", higherStudy.description);
      setValue("studyType", higherStudy.studyType);
      setValue("institution", higherStudy.institution);
      setValue("location", higherStudy.location || "");
      setValue("fieldOfStudy", higherStudy.fieldOfStudy || "");
      setValue("applicationDeadline", higherStudy.applicationDeadline || "");
      setValue("startDate", higherStudy.startDate || "");
      setValue("duration", higherStudy.duration || "");
      setValue("tuitionFee", higherStudy.tuitionFee || "");
      setValue("scholarshipAvailable", higherStudy.scholarshipAvailable);
      setValue("eligibilityCriteria", higherStudy.eligibilityCriteria || "");
      setValue("applicationUrl", higherStudy.applicationUrl);
      setValue("contactEmail", higherStudy.contactEmail || "");
      setValue("imageUrl", higherStudy.imageUrl || "");
      setValue("status", higherStudy.status);
    } else {
      reset({
        studyType: "masters",
        scholarshipAvailable: false,
        status: "draft",
      });
    }
  }, [open, higherStudy, reset, setValue]);

  const onSubmit = async (data: HigherStudyFormData) => {
    const payload: CreateHigherStudyPayload = {
      title: data.title,
      description: data.description,
      studyType: data.studyType,
      institution: data.institution,
      location: data.location || undefined,
      fieldOfStudy: data.fieldOfStudy || undefined,
      applicationDeadline: data.applicationDeadline || undefined,
      startDate: data.startDate || undefined,
      duration: data.duration || undefined,
      tuitionFee: data.tuitionFee || undefined,
      scholarshipAvailable: data.scholarshipAvailable,
      eligibilityCriteria: data.eligibilityCriteria || undefined,
      applicationUrl: data.applicationUrl,
      contactEmail: data.contactEmail || undefined,
      imageUrl: data.imageUrl || undefined,
      status: data.status,
    };

    try {
      const response = isEditing
        ? await Axios.put(
            `${env.BACKEND_BASE_URL}/api/higher-studies/${higherStudy?.higherStudyId}`,
            payload
          )
        : await Axios.post(
            `${env.BACKEND_BASE_URL}/api/higher-studies`,
            payload
          );

      if (response.data.success) {
        toast.success(
          isEditing
            ? "Higher study updated successfully"
            : "Higher study created successfully"
        );
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error(response.data.message || "Failed to save higher study");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to save higher study"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-neutral-900 text-neutral-200">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Higher Study" : "Create Higher Study"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the higher study opportunity details below."
              : "Fill in the details to create a new higher study opportunity."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Program Title *</Label>
            <Input
              id="title"
              placeholder="e.g., MSc in Data Science 2025"
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
              placeholder="Detailed description about the program, eligibility, benefits, etc."
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
              <Label htmlFor="studyType">Study Type *</Label>
              <Select
                value={watch("studyType")}
                onValueChange={(value) =>
                  setValue("studyType", value as HigherStudyFormData["studyType"])
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select study type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="masters">Masters</SelectItem>
                  <SelectItem value="phd">PhD</SelectItem>
                  <SelectItem value="postdoc">Postdoc</SelectItem>
                  <SelectItem value="fellowship">Fellowship</SelectItem>
                  <SelectItem value="exchange_program">Exchange Program</SelectItem>
                  <SelectItem value="research_opportunity">
                    Research Opportunity
                  </SelectItem>
                  <SelectItem value="scholarship">Scholarship</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={watch("status")}
                onValueChange={(value) =>
                  setValue("status", value as HigherStudyFormData["status"])
                }
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
              <Label htmlFor="institution">Institution *</Label>
              <Input
                id="institution"
                placeholder="e.g., University of Cambridge"
                {...register("institution")}
              />
              {errors.institution && (
                <p className="text-sm text-destructive">
                  {errors.institution.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., Cambridge, UK or Remote"
                {...register("location")}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fieldOfStudy">Field of Study</Label>
              <Input
                id="fieldOfStudy"
                placeholder="e.g., Computer Science"
                {...register("fieldOfStudy")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Program Duration</Label>
              <Input
                id="duration"
                placeholder="e.g., 2 Years"
                {...register("duration")}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="applicationDeadline">Application Deadline</Label>
              <Input
                id="applicationDeadline"
                type="date"
                {...register("applicationDeadline")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" type="date" {...register("startDate")} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tuitionFee">Tuition Fee</Label>
              <Input
                id="tuitionFee"
                placeholder="e.g., $25,000 per year"
                {...register("tuitionFee")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scholarshipAvailable">Scholarship Available</Label>
              <Select
                value={watch("scholarshipAvailable") ? "yes" : "no"}
                onValueChange={(value) =>
                  setValue("scholarshipAvailable", value === "yes")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="eligibilityCriteria">Eligibility Criteria</Label>
            <Textarea
              id="eligibilityCriteria"
              rows={3}
              placeholder="Summarize key eligibility criteria"
              {...register("eligibilityCriteria")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="applicationUrl">Application URL *</Label>
            <Input
              id="applicationUrl"
              placeholder="https://example.com/apply"
              type="url"
              {...register("applicationUrl")}
            />
            {errors.applicationUrl && (
              <p className="text-sm text-destructive">
                {errors.applicationUrl.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                placeholder="e.g., admissions@example.com"
                type="email"
                {...register("contactEmail")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                placeholder="https://example.com/cover.jpg"
                type="url"
                {...register("imageUrl")}
              />
            </div>
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
                  {isEditing ? "Update Higher Study" : "Create Higher Study"}
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
