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
import { Award, Plus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

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

export default function AchievementsPage() {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AchievementFormData>({
    resolver: zodResolver(achievementSchema),
    defaultValues: {
      achievementType: 'award',
      featured: false,
      status: 'draft',
    },
  });

  const onSubmit = async (data: AchievementFormData) => {
    setIsLoading(true);
    try {
      const response = await Axios.post(`${env.BACKEND_BASE_URL}/api/achievements`, data);

      if (response.data.success) {
        toast.success('Achievement created successfully!');
        reset();
      } else {
        toast.error(response.data.message || 'Failed to create achievement');
      }
    } catch (error: any) {
      console.error('Error creating achievement:', error);
      toast.error(error.response?.data?.message || 'Failed to create achievement');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Award className="w-8 h-8 text-purple-600" />
          <h1 className="text-3xl font-bold">Achievements</h1>
        </div>
        <p className="text-gray-600">Create and manage student and faculty achievements</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create New Achievement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <fieldset disabled={isLoading}>
              {/* Title */}
              <div className="space-y-3">
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

              &nbsp;&nbsp;

              {/* Description */}
              <div className="space-y-3">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Detailed description of the achievement..."
                  rows={5}
                />
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              &nbsp;&nbsp;

              {/* Achievement Type & Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
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
                <div className="space-y-3">
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

              &nbsp;&nbsp;

              {/* Awarded To & Awarding Organization */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="awardedTo">Awarded To</Label>
                  <Input
                    id="awardedTo"
                    {...register('awardedTo')}
                    placeholder="e.g., John Doe, Team Alpha"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="awardingOrganization">Awarding Organization</Label>
                  <Input
                    id="awardingOrganization"
                    {...register('awardingOrganization')}
                    placeholder="e.g., IEEE, ACM, University"
                  />
                </div>
              </div>

              &nbsp;&nbsp;

              {/* Achievement Date */}
              <div className="space-y-3">
                <Label htmlFor="achievementDate">Achievement Date</Label>
                <Input
                  id="achievementDate"
                  {...register('achievementDate')}
                  type="date"
                />
              </div>

              &nbsp;&nbsp;

              {/* Certificate URL */}
              <div className="space-y-3">
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

              &nbsp;&nbsp;

              {/* Image URL */}
              <div className="space-y-3">
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

              &nbsp;&nbsp;

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

              &nbsp;&nbsp;

              {/* Submit Button */}
              <div className="flex justify-center pt-4">
                <Button type="submit" disabled={isLoading} className="px-8">
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating Achievement...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Create Achievement
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
