"use client";

import { Button } from "@/components/ui/button";
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
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import type { Course, CreateResearchPayload, Research } from "./types";

const researchSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().optional(),
  courseId: z.string().min(1, 'Course ID is required'),
  supervisorId: z.string().optional(),
  status: z.enum(['proposed', 'ongoing', 'completed', 'published', 'archived']).default('proposed'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  publicationUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type ResearchFormData = z.infer<typeof researchSchema>;

interface CreateEditResearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  research?: Research | null;
  onSuccess: () => void;
}

export function CreateEditResearchDialog({
  open,
  onOpenChange,
  research,
  onSuccess,
}: CreateEditResearchDialogProps) {
  const isEditing = !!research;
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ResearchFormData>({
    resolver: zodResolver(researchSchema),
    defaultValues: {
      status: 'proposed',
    },
  });

  // Fetch courses for the dropdown
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await Axios.get(`${env.BACKEND_BASE_URL}/api/course/department-courses`);
        if (response.data.success) {
          setCourses(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        toast.error('Failed to load courses');
      } finally {
        setLoadingCourses(false);
      }
    };

    if (open) {
      fetchCourses();
    }
  }, [open]);

  // Reset form when dialog opens/closes or research changes
  useEffect(() => {
    if (open) {
      if (research) {
        // Populate form with research data for editing
        setValue('title', research.title);
        setValue('description', research.description || '');
        setValue('courseId', research.courseId);
        setValue('supervisorId', research.supervisorId || '');
        setValue('status', research.status);
        setValue('startDate', research.startDate || '');
        setValue('endDate', research.endDate || '');
        setValue('publicationUrl', research.publicationUrl || '');
      } else {
        // Reset form for creating new research
        reset({
          status: 'proposed',
        });
      }
    }
  }, [open, research, setValue, reset]);

  const onSubmit = async (data: ResearchFormData) => {
    try {
      const payload: CreateResearchPayload = {
        title: data.title,
        description: data.description || undefined,
        courseId: data.courseId,
        supervisorId: data.supervisorId || undefined,
        status: data.status,
        startDate: data.startDate || undefined,
        endDate: data.endDate || undefined,
        publicationUrl: data.publicationUrl || undefined,
      };

      let response;
      if (isEditing) {
        response = await Axios.put(
          `${env.BACKEND_BASE_URL}/api/research/${research.researchId}`,
          payload
        );
      } else {
        response = await Axios.post(
          `${env.BACKEND_BASE_URL}/api/research`,
          payload
        );
      }

      if (response.data.success) {
        toast.success(
          isEditing
            ? 'Research project updated successfully!'
            : 'Research project created successfully!'
        );
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error(response.data.message || 'Failed to save research project');
      }
    } catch (error: any) {
      console.error('Error saving research:', error);
      toast.error(error.response?.data?.message || 'Failed to save research project');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-neutral-900 text-neutral-200">
        <DialogTitle>
          {isEditing ? 'Edit Research Project' : 'Create New Research Project'}
        </DialogTitle>
        <DialogDescription>
          {isEditing
            ? 'Update the research project details below.'
            : 'Fill in the details to create a new research project.'
          }
        </DialogDescription>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Research Title *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="e.g., Machine Learning Applications in Healthcare"
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Detailed description of the research project, objectives, methodology..."
              rows={4}
            />
          </div>

          {/* Course ID & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="courseId">Associated Course *</Label>
              {loadingCourses ? (
                <div className="flex items-center justify-center p-4 border rounded">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                  <span className="ml-2 text-gray-600">Loading courses...</span>
                </div>
              ) : (
                <Select
                  value={watch('courseId')}
                  onValueChange={(value) => setValue('courseId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.courseId} value={course.courseId}>
                        {course.courseCode} - {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {errors.courseId && (
                <p className="text-sm text-red-600">{errors.courseId.message}</p>
              )}
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
                  <SelectItem value="proposed">Proposed</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Supervisor ID */}
          <div className="space-y-2">
            <Label htmlFor="supervisorId">Supervisor ID</Label>
            <Input
              id="supervisorId"
              {...register('supervisorId')}
              placeholder="Leave empty to assign to yourself"
            />
            <p className="text-sm text-gray-500">
              Optional: Enter the supervisor's user ID. If left empty, you will be assigned as the supervisor.
            </p>
          </div>

          {/* Start Date & End Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                {...register('startDate')}
                type="date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                {...register('endDate')}
                type="date"
              />
            </div>
          </div>

          {/* Publication URL */}
          <div className="space-y-2">
            <Label htmlFor="publicationUrl">Publication URL</Label>
            <Input
              id="publicationUrl"
              {...register('publicationUrl')}
              placeholder="https://example.com/research-paper.pdf"
              type="url"
            />
            {errors.publicationUrl && (
              <p className="text-sm text-red-600">{errors.publicationUrl.message}</p>
            )}
            <p className="text-sm text-gray-500">
              Link to published paper, preprint, or research repository
            </p>
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
                  {isEditing ? 'Update Research' : 'Create Research'}
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
