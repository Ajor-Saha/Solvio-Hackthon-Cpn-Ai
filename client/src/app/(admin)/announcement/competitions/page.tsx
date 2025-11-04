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
import { Plus, Trophy } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const competitionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  type: z.enum(['hackathon', 'debate', 'datathon', 'programming_contest', 'math_competition', 'quiz', 'case_study', 'design_challenge', 'other']),
  organizerName: z.string().optional(),
  location: z.string().optional(),
  eventDate: z.string().optional(),
  registrationDeadline: z.string().optional(),
  externalUrl: z.string().url('Must be a valid URL'),
  bannerUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  status: z.enum(['draft', 'active', 'closed', 'archived']).default('draft'),
});

type CompetitionFormData = z.infer<typeof competitionSchema>;

export default function CompetitionsPage() {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CompetitionFormData>({
    resolver: zodResolver(competitionSchema),
    defaultValues: {
      type: 'other',
      status: 'draft',
    },
  });

  const onSubmit = async (data: CompetitionFormData) => {
    setIsLoading(true);
    try {
      const response = await Axios.post(`${env.BACKEND_BASE_URL}/api/competitions`, data);

      if (response.data.success) {
        toast.success('Competition created successfully!');
        reset();
      } else {
        toast.error(response.data.message || 'Failed to create competition');
      }
    } catch (error: any) {
      console.error('Error creating competition:', error);
      toast.error(error.response?.data?.message || 'Failed to create competition');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="w-8 h-8 text-yellow-600" />
          <h1 className="text-3xl font-bold">Competitions</h1>
        </div>
        <p className="text-gray-600">Create and manage competitions and contests</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create New Competition
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <fieldset disabled={isLoading}>
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Competition Title *</Label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="e.g., Annual Programming Contest 2024"
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
                  placeholder="Detailed description of the competition, rules, prizes, etc..."
                  rows={6}
                />
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              &nbsp;&nbsp;

              {/* Type & Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Competition Type *</Label>
                  <Select
                    value={watch('type')}
                    onValueChange={(value) => setValue('type', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select competition type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hackathon">Hackathon</SelectItem>
                      <SelectItem value="debate">Debate</SelectItem>
                      <SelectItem value="datathon">Datathon</SelectItem>
                      <SelectItem value="programming_contest">Programming Contest</SelectItem>
                      <SelectItem value="math_competition">Math Competition</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                      <SelectItem value="case_study">Case Study</SelectItem>
                      <SelectItem value="design_challenge">Design Challenge</SelectItem>
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
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              &nbsp;&nbsp;

              {/* Organizer & Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="organizerName">Organizer Name</Label>
                  <Input
                    id="organizerName"
                    {...register('organizerName')}
                    placeholder="e.g., IEEE Student Branch"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    {...register('location')}
                    placeholder="e.g., Main Auditorium, Online"
                  />
                </div>
              </div>

              &nbsp;&nbsp;

              {/* Event Date & Registration Deadline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="eventDate">Event Date</Label>
                  <Input
                    id="eventDate"
                    {...register('eventDate')}
                    type="date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registrationDeadline">Registration Deadline</Label>
                  <Input
                    id="registrationDeadline"
                    {...register('registrationDeadline')}
                    type="date"
                  />
                </div>
              </div>

              &nbsp;&nbsp;

              {/* External URL */}
              <div className="space-y-2">
                <Label htmlFor="externalUrl">Registration/Info URL *</Label>
                <Input
                  id="externalUrl"
                  {...register('externalUrl')}
                  placeholder="https://example.com/competition-registration"
                  type="url"
                />
                {errors.externalUrl && (
                  <p className="text-sm text-red-600">{errors.externalUrl.message}</p>
                )}
              </div>

              &nbsp;&nbsp;

              {/* Banner URL */}
              <div className="space-y-2">
                <Label htmlFor="bannerUrl">Banner Image URL</Label>
                <Input
                  id="bannerUrl"
                  {...register('bannerUrl')}
                  placeholder="https://example.com/banner-image.jpg"
                  type="url"
                />
                {errors.bannerUrl && (
                  <p className="text-sm text-red-600">{errors.bannerUrl.message}</p>
                )}
              </div>

              &nbsp;&nbsp;

              {/* Submit Button */}
              <div className="flex justify-center pt-4">
                <Button type="submit" disabled={isLoading} className="px-8">
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating Competition...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Create Competition
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
