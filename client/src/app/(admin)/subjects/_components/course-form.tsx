"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Axios } from "@/config/axios";
import useAuthStore from "@/store/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, BookOpen, GraduationCap } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Schema for course form
const courseSchema = z.object({
  courseCode: z.string()
    .min(1, "Course code is required")
    .max(10, "Course code must be 10 characters or less")
    .regex(/^[A-Z0-9]+$/, "Course code must contain only uppercase letters and numbers"),
  title: z.string()
    .min(1, "Course title is required")
    .max(100, "Course title must be 100 characters or less"),
  semester: z.string()
    .min(1, "Semester is required")
    .regex(/^[1-4]\/[1-2]$/, "Semester must be in format like '1/1' or '4/2'"),
  credits: z.number()
    .min(1, "Credits must be at least 1")
    .max(6, "Credits cannot exceed 6"),
  capacity: z.number()
    .min(1, "Capacity must be at least 1")
    .max(200, "Capacity cannot exceed 200")
    .optional(),
});

type CourseFormData = z.infer<typeof courseSchema>;

interface CourseFormProps {
  onSuccess?: () => void;
}

// Predefined semester options
const semesterOptions = [
  { value: "1/1", label: "Year 1 - Semester 1" },
  { value: "1/2", label: "Year 1 - Semester 2" },
  { value: "2/1", label: "Year 2 - Semester 1" },
  { value: "2/2", label: "Year 2 - Semester 2" },
  { value: "3/1", label: "Year 3 - Semester 1" },
  { value: "3/2", label: "Year 3 - Semester 2" },
  { value: "4/1", label: "Year 4 - Semester 1" },
  { value: "4/2", label: "Year 4 - Semester 2" },
];

export function CourseForm({ onSuccess }: CourseFormProps) {
  const { user, accessToken } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      capacity: 30,
      semester: "",
      courseCode: "",
      title: "",
      credits: 3,
    },
  });

  const selectedSemester = watch("semester");

  const handleCourseCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Auto-convert to uppercase
    const upperValue = e.target.value.toUpperCase();
    setValue("courseCode", upperValue);
  };

  const onSubmit = async (data: CourseFormData) => {
    try {
      setIsLoading(true);

      const payload = {
        ...data,
        departmentId: user?.departmentId, // Automatically use admin's department
      };

      console.log("Creating course with payload:", payload);
      console.log("User department:", user?.departmentId);

      const response = await Axios.post("/api/course/create", payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.data.success) {
        toast.success("Course created successfully! 🎉", {
          description: `${data.courseCode} - ${data.title} has been added to the department.`,
        });

        reset(); // Clear the form
        onSuccess?.(); // Call success callback
      }
    } catch (error: any) {
      console.error("Error creating course:", error);

      if (error.response?.status === 409) {
        toast.error("Course already exists", {
          description: "A course with this code already exists in your department.",
        });
      } else if (error.response?.status === 403) {
        toast.error("Permission denied", {
          description: "You don't have permission to create courses.",
        });
      } else {
        toast.error("Failed to create course", {
          description: error.response?.data?.message || "Please try again later.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <CardHeader className="text-center pb-6">
        <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
          <GraduationCap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Create New Course
        </CardTitle>
        <CardDescription>
          Add a new course to your department curriculum
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <fieldset disabled={isLoading}>
          {/* Course Code and Title Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="courseCode">
                Course Code <span className="text-red-500">*</span>
              </Label>
              <Input
                id="courseCode"
                placeholder="e.g., CSE101"
                {...register("courseCode")}
                onChange={handleCourseCodeChange}
                className="uppercase"
              />
              {errors.courseCode && (
                <p className="text-sm text-red-500">{errors.courseCode.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">
                Course Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g., Introduction to Programming"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>
          </div>

          {/* Semester */}
          <div className="space-y-2">
            <Label>
              Semester <span className="text-red-500">*</span>
            </Label>
            <Select
              value={selectedSemester}
              onValueChange={(value) => setValue("semester", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select semester" />
              </SelectTrigger>
              <SelectContent>
                {semesterOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.semester && (
              <p className="text-sm text-red-500">{errors.semester.message}</p>
            )}
          </div>

          {/* Credits and Capacity Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="credits">
                Credits <span className="text-red-500">*</span>
              </Label>
              <Input
                id="credits"
                type="number"
                min="1"
                max="6"
                placeholder="3"
                {...register("credits", { valueAsNumber: true })}
              />
              {errors.credits && (
                <p className="text-sm text-red-500">{errors.credits.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">
                Student Capacity
              </Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                max="200"
                placeholder="30"
                {...register("capacity", { valueAsNumber: true })}
              />
              {errors.capacity && (
                <p className="text-sm text-red-500">{errors.capacity.message}</p>
              )}
              <p className="text-xs text-gray-500">Default: 30 students</p>
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              The course will be created in your department: <strong>{user?.departmentId}</strong>
            </AlertDescription>
          </Alert>

          <div className="flex justify-center">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating Course...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Create Course
                </div>
              )}
             </Button>
           </div>
         </fieldset>
         </form>
      </CardContent>
    </Card>
  );
}
