"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle
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
import type { Achievement, CreateAchievementPayload } from "./types";

const achievementSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  achievementType: z.enum(['award', 'certification', 'recognition', 'scholarship', 'publication', 'patent', 'other']),
  awardedTo: z.string().optional(),
  awardingOrganization: z.string().optional(),
  achievementDate: z.string().optional(),
  certificateUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  imageUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  featured: z.boolean().default(false),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
});

type AchievementFormData = z.infer<typeof achievementSchema>;

interface CreateEditAchievementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  achievement?: Achievement | null;
  onSuccess: () => void;
}

export function CreateEditAchievementDialog({
  open,
  onOpenChange,
  achievement,
  onSuccess,
}: CreateEditAchievementDialogProps) {
  const isEditing = !!achievement;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AchievementFormData>({
    resolver: zodResolver(achievementSchema),
    defaultValues: {
      achievementType: 'award',
      featured: false,
      status: 'draft',
    },
  });

  // Reset form when dialog opens/closes or achievement changes
  useEffect(() => {
    if (open) {
      if (achievement) {
        // Populate form with achievement data for editing
        setValue('title', achievement.title);
        setValue('description', achievement.description);
        setValue('achievementType', achievement.achievementType);
        setValue('awardedTo', achievement.awardedTo || '');
        setValue('awardingOrganization', achievement.awardingOrganization || '');
        setValue('achievementDate', achievement.achievementDate || '');
        setValue('certificateUrl', achievement.certificateUrl || '');
        setValue('imageUrl', achievement.imageUrl || '');
        setValue('featured', achievement.featured);
        setValue('status', achievement.status);
      } else {
        // Reset form for creating new achievement
        reset({
          achievementType: 'award',
          featured: false,
          status: 'draft',
        });
      }
    }
  }, [open, achievement, setValue, reset]);

  const onSubmit = async (data: AchievementFormData) => {
    try {
      const payload: CreateAchievementPayload = {
        title: data.title,
        description: data.description,
        achievementType: data.achievementType,
        awardedTo: data.awardedTo || undefined,
        awardingOrganization: data.awardingOrganization || undefined,
        achievementDate: data.achievementDate || undefined,
        certificateUrl: data.certificateUrl || undefined,
        imageUrl: data.imageUrl || undefined,
        featured: data.featured,
        status: data.status,
      };

      let response;
      if (isEditing) {
        response = await Axios.put(
          `${env.BACKEND_BASE_URL}/api/achievements/${achievement.achievementId}`,
          payload
        );
      } else {
        response = await Axios.post(
          `${env.BACKEND_BASE_URL}/api/achievements`,
          payload
        );
      }

      if (response.data.success) {
        toast.success(
          isEditing
            ? 'Achievement updated successfully!'
            : 'Achievement created successfully!'
        );
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error(response.data.message || 'Failed to save achievement');
      }
    } catch (error: any) {
      console.error('Error saving achievement:', error);
      toast.error(error.response?.data?.message || 'Failed to save achievement');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-neutral-900 text-neutral-200">
        <DialogTitle>
          {isEditing ? 'Edit Achievement' : 'Create New Achievement'}
        </DialogTitle>
        <DialogDescription>
          {isEditing
            ? 'Update the achievement details below.'
            : 'Fill in the details to create a new achievement announcement.'
          }
        </DialogDescription>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Achievement Title *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="e.g., Best Research Paper Award 2024"
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Detailed description of the achievement..."
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Achievement Type & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="achievementType">Achievement Type *</Label>
              <Select
                value={watch('achievementType')}
                onValueChange={(value) => setValue('achievementType', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select achievement type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="award">Award</SelectItem>
                  <SelectItem value="certification">Certification</SelectItem>
                  <SelectItem value="recognition">Recognition</SelectItem>
                  <SelectItem value="scholarship">Scholarship</SelectItem>
                  <SelectItem value="publication">Publication</SelectItem>
                  <SelectItem value="patent">Patent</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={watch('status')}
                onValueChange={(value) => setValue('status', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Awarded To & Awarding Organization */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="awardedTo">Awarded To</Label>
              <Input
                id="awardedTo"
                {...register('awardedTo')}
                placeholder="e.g., John Doe, Team Alpha"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="awardingOrganization">Awarding Organization</Label>
              <Input
                id="awardingOrganization"
                {...register('awardingOrganization')}
                placeholder="e.g., IEEE, ACM, University"
              />
            </div>
          </div>

          {/* Achievement Date */}
          <div className="space-y-2">
            <Label htmlFor="achievementDate">Achievement Date</Label>
            <Input
              id="achievementDate"
              {...register('achievementDate')}
              type="date"
            />
          </div>

          {/* Certificate URL */}
          <div className="space-y-2">
            <Label htmlFor="certificateUrl">Certificate URL</Label>
            <Input
              id="certificateUrl"
              {...register('certificateUrl')}
              placeholder="https://example.com/certificate.pdf"
              type="url"
            />
            {errors.certificateUrl && (
              <p className="text-sm text-red-600">{errors.certificateUrl.message}</p>
            )}
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              {...register('imageUrl')}
              placeholder="https://example.com/achievement-image.jpg"
              type="url"
            />
            {errors.imageUrl && (
              <p className="text-sm text-red-600">{errors.imageUrl.message}</p>
            )}
          </div>

          {/* Featured Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="featured"
              checked={watch('featured')}
              onCheckedChange={(checked) => setValue('featured', !!checked)}
            />
            <Label htmlFor="featured" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Feature this achievement (will be highlighted on homepage)
            </Label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
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
                  {isEditing ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {isEditing ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {isEditing ? 'Update Achievement' : 'Create Achievement'}
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
