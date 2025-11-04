'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Axios } from '@/config/axios';
import { env } from '@/config/env';
import { zodResolver } from '@hookform/resolvers/zod';
import { Microscope, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

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

interface Course {
  courseId: string;
  courseCode: string;
  title: string;
}

export default function ResearchPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
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

    fetchCourses();
  }, []);

  const onSubmit = async (data: ResearchFormData) => {
    setIsLoading(true);
    try {
      const response = await Axios.post(`${env.BACKEND_BASE_URL}/api/research`, data);

      if (response.data.success) {
        toast.success('Research project created successfully!');
        reset();
      } else {
        toast.error(response.data.message || 'Failed to create research project');
      }
    } catch (error: any) {
      console.error('Error creating research:', error);
      toast.error(error.response?.data?.message || 'Failed to create research project');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Microscope className="w-8 h-8 text-green-600" />
          <h1 className="text-3xl font-bold">Research Projects</h1>
        </div>
        <p className="text-gray-600">Create and manage research projects and publications</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create New Research Project
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <fieldset disabled={isLoading}>
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

              &nbsp;&nbsp;

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Detailed description of the research project, objectives, methodology..."
                  rows={5}
                />
              </div>

              &nbsp;&nbsp;

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

              &nbsp;&nbsp;

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

              &nbsp;&nbsp;

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

              &nbsp;&nbsp;

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

              &nbsp;&nbsp;

              {/* Submit Button */}
              <div className="flex justify-center pt-4">
                <Button type="submit" disabled={isLoading} className="px-8">
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating Research...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Create Research Project
                    </div>
                  )}
                </Button>
              </div>
            </fieldset>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
