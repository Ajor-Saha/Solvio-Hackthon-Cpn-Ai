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
import { Briefcase, Plus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const jobSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  companyName: z.string().optional(),
  location: z.string().optional(),
  jobType: z.enum(['full_time', 'part_time', 'internship', 'contract', 'remote']),
  externalUrl: z.string().url('Must be a valid URL'),
  applicationDeadline: z.string().optional(),
  status: z.enum(['draft', 'active', 'closed', 'archived']).default('draft'),
});

type JobFormData = z.infer<typeof jobSchema>;

export default function JobsPage() {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      jobType: 'full_time',
      status: 'draft',
    },
  });

  const onSubmit = async (data: JobFormData) => {
    setIsLoading(true);
    try {
      const response = await Axios.post(`${env.BACKEND_BASE_URL}/api/jobs`, data);

      if (response.data.success) {
        toast.success('Job posting created successfully!');
        reset();
      } else {
        toast.error(response.data.message || 'Failed to create job posting');
      }
    } catch (error: any) {
      console.error('Error creating job:', error);
      toast.error(error.response?.data?.message || 'Failed to create job posting');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Briefcase className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Job Postings</h1>
        </div>
        <p className="text-gray-600">Create and manage job opportunities for students</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create New Job Posting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <fieldset disabled={isLoading}>
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="e.g., Software Engineer Intern"
                />
                {errors.title && (
                  <p className="text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              &nbsp;&nbsp;

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Job Description *</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Detailed job description, requirements, and responsibilities..."
                  rows={6}
                />
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              &nbsp;&nbsp;

              {/* Company Name & Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    {...register('companyName')}
                    placeholder="e.g., Google, Microsoft"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    {...register('location')}
                    placeholder="e.g., San Francisco, Remote"
                  />
                </div>
              </div>

              &nbsp;&nbsp;

              {/* Job Type & Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="jobType">Job Type *</Label>
                  <Select
                    value={watch('jobType')}
                    onValueChange={(value) => setValue('jobType', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_time">Full Time</SelectItem>
                      <SelectItem value="part_time">Part Time</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="remote">Remote</SelectItem>
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
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              &nbsp;&nbsp;

              {/* External URL */}
              <div className="space-y-2">
                <Label htmlFor="externalUrl">Application URL *</Label>
                <Input
                  id="externalUrl"
                  {...register('externalUrl')}
                  placeholder="https://company.com/careers/job-id"
                  type="url"
                />
                {errors.externalUrl && (
                  <p className="text-sm text-red-600">{errors.externalUrl.message}</p>
                )}
              </div>

              &nbsp;&nbsp;

              {/* Application Deadline */}
              <div className="space-y-2">
                <Label htmlFor="applicationDeadline">Application Deadline</Label>
                <Input
                  id="applicationDeadline"
                  {...register('applicationDeadline')}
                  type="date"
                />
              </div>

              &nbsp;&nbsp;

              {/* Submit Button */}
              <div className="flex justify-center pt-4">
                <Button type="submit" disabled={isLoading} className="px-8">
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating Job...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Create Job Posting
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
