'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Axios } from '@/config/axios';
import { env } from '@/config/env';
import { zodResolver } from '@hookform/resolvers/zod';
import { GraduationCap, Plus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const higherStudySchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  studyType: z.enum(['masters', 'phd', 'postdoc', 'fellowship', 'exchange_program', 'research_opportunity', 'scholarship']),
  institution: z.string().min(1, 'Institution is required'),
  location: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  applicationDeadline: z.string().optional(),
  startDate: z.string().optional(),
  duration: z.string().optional(),
  tuitionFee: z.string().optional(),
  scholarshipAvailable: z.boolean().default(false),
  eligibilityCriteria: z.string().optional(),
  applicationUrl: z.string().url('Must be a valid URL'),
  contactEmail: z.string().email('Must be a valid email').optional().or(z.literal('')),
  imageUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  status: z.enum(['draft', 'active', 'closed', 'archived']).default('draft'),
});

type HigherStudyFormData = z.infer<typeof higherStudySchema>;

export default function HigherStudiesPage() {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<HigherStudyFormData>({
    resolver: zodResolver(higherStudySchema),
    defaultValues: {
      studyType: 'masters',
      scholarshipAvailable: false,
      status: 'draft',
    },
  });

  const onSubmit = async (data: HigherStudyFormData) => {
    setIsLoading(true);
    try {
      const response = await Axios.post(`${env.BACKEND_BASE_URL}/api/higher-studies`, data);

      if (response.data.success) {
        toast.success('Higher study opportunity created successfully!');
        reset();
      } else {
        toast.error(response.data.message || 'Failed to create higher study opportunity');
      }
    } catch (error: any) {
      console.error('Error creating higher study:', error);
      toast.error(error.response?.data?.message || 'Failed to create higher study opportunity');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <GraduationCap className="w-8 h-8 text-indigo-600" />
          <h1 className="text-3xl font-bold">Higher Studies</h1>
        </div>
        <p className="text-gray-600">Create and manage higher education opportunities</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create New Higher Study Opportunity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <fieldset disabled={isLoading}>
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Program Title *</Label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="e.g., PhD in Computer Science - Stanford University"
                />
                {errors.title && (
                  <p className="text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              &nbsp;&nbsp;

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Detailed description of the program, requirements, benefits..."
                  rows={5}
                />
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              &nbsp;&nbsp;

              {/* Study Type & Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="studyType">Study Type *</Label>
                  <Select
                    value={watch('studyType')}
                    onValueChange={(value) => setValue('studyType', value as any)}
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
                      <SelectItem value="research_opportunity">Research Opportunity</SelectItem>
                      <SelectItem value="scholarship">Scholarship</SelectItem>
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

              {/* Institution & Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="institution">Institution *</Label>
                  <Input
                    id="institution"
                    {...register('institution')}
                    placeholder="e.g., Stanford University"
                  />
                  {errors.institution && (
                    <p className="text-sm text-red-600">{errors.institution.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    {...register('location')}
                    placeholder="e.g., Stanford, CA, USA"
                  />
                </div>
              </div>

              &nbsp;&nbsp;

              {/* Field of Study */}
              <div className="space-y-2">
                <Label htmlFor="fieldOfStudy">Field of Study</Label>
                <Input
                  id="fieldOfStudy"
                  {...register('fieldOfStudy')}
                  placeholder="e.g., Computer Science, Artificial Intelligence"
                />
              </div>

              &nbsp;&nbsp;

              {/* Application Deadline & Start Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="applicationDeadline">Application Deadline</Label>
                  <Input
                    id="applicationDeadline"
                    {...register('applicationDeadline')}
                    type="date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Program Start Date</Label>
                  <Input
                    id="startDate"
                    {...register('startDate')}
                    type="date"
                  />
                </div>
              </div>

              &nbsp;&nbsp;

              {/* Duration & Tuition Fee */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    {...register('duration')}
                    placeholder="e.g., 2 years, 4 years"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tuitionFee">Tuition Fee</Label>
                  <Input
                    id="tuitionFee"
                    {...register('tuitionFee')}
                    placeholder="e.g., $50,000/year, Free"
                  />
                </div>
              </div>

              &nbsp;&nbsp;

              {/* Scholarship Available */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="scholarshipAvailable"
                  checked={watch('scholarshipAvailable')}
                  onCheckedChange={(checked) => setValue('scholarshipAvailable', !!checked)}
                />
                <Label htmlFor="scholarshipAvailable" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Scholarship/Financial Aid Available
                </Label>
              </div>

              &nbsp;&nbsp;

              {/* Eligibility Criteria */}
              <div className="space-y-2">
                <Label htmlFor="eligibilityCriteria">Eligibility Criteria</Label>
                <Textarea
                  id="eligibilityCriteria"
                  {...register('eligibilityCriteria')}
                  placeholder="Academic requirements, GPA, test scores, experience..."
                  rows={3}
                />
              </div>

              &nbsp;&nbsp;

              {/* Application URL */}
              <div className="space-y-2">
                <Label htmlFor="applicationUrl">Application URL *</Label>
                <Input
                  id="applicationUrl"
                  {...register('applicationUrl')}
                  placeholder="https://university.edu/apply"
                  type="url"
                />
                {errors.applicationUrl && (
                  <p className="text-sm text-red-600">{errors.applicationUrl.message}</p>
                )}
              </div>

              &nbsp;&nbsp;

              {/* Contact Email */}
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  {...register('contactEmail')}
                  placeholder="admissions@university.edu"
                  type="email"
                />
                {errors.contactEmail && (
                  <p className="text-sm text-red-600">{errors.contactEmail.message}</p>
                )}
              </div>

              &nbsp;&nbsp;

              {/* Image URL */}
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Program Image URL</Label>
                <Input
                  id="imageUrl"
                  {...register('imageUrl')}
                  placeholder="https://example.com/program-image.jpg"
                  type="url"
                />
                {errors.imageUrl && (
                  <p className="text-sm text-red-600">{errors.imageUrl.message}</p>
                )}
              </div>

              &nbsp;&nbsp;

              {/* Submit Button */}
              <div className="flex justify-center pt-4">
                <Button type="submit" disabled={isLoading} className="px-8">
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating Opportunity...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Create Higher Study Opportunity
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
