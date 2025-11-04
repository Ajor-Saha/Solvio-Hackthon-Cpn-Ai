'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Briefcase, Plus, ArrowLeft } from 'lucide-react';
import { Axios } from '@/config/axios';
import { env } from '@/config/env';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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

export default function CreateJobPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

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
        router.push('/announcement/jobs');
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
        <div className="flex items-center gap-4 mb-4">
          <Link href="/announcement/jobs">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>
        </div>
        <div className="flex items-center gap-3 mb-2">
          <Briefcase className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Create Job Posting</h1>
        </div>
        <p className="text-gray-600">Add a new job opportunity for students</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Job Details
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

              {/* Application Deadline */}
              <div className="space-y-2">
                <Label htmlFor="applicationDeadline">Application Deadline</Label>
                <Input
                  id="applicationDeadline"
                  {...register('applicationDeadline')}
                  type="date"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-4 pt-4">
                <Link href="/announcement/jobs">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
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
