"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Axios } from "@/config/axios";
import useAuthStore from "@/store/store";
import { Loader2, Plus, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Student {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string | null;
}

interface CreateProjectFormProps {
  courseId: string;
  onProjectCreated: () => void;
  onCancel: () => void;
}

export default function CreateProjectForm({
  courseId,
  onProjectCreated,
  onCancel,
}: CreateProjectFormProps) {
  const { accessToken } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "proposed" as "proposed" | "ongoing" | "completed" | "archived",
    startDate: "",
    endDate: "",
    projectUrl: "",
  });

  useEffect(() => {
    fetchEnrolledStudents();
  }, [courseId]);

  const fetchEnrolledStudents = async () => {
    setLoadingStudents(true);
    try {
      const response = await Axios.get(
        `/api/course/enrollments/${courseId}?roleInCourse=student`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data.success) {
        setStudents(response.data.data);
      }
    } catch (error: any) {
      console.error("Error fetching students:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch enrolled students"
      );
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Project title is required");
      return;
    }

    if (selectedStudents.length === 0) {
      toast.error("Please select at least one student");
      return;
    }

    setIsLoading(true);
    try {
      const response = await Axios.post(
        "/api/project/create",
        {
          courseId,
          title: formData.title,
          description: formData.description,
          status: formData.status,
          startDate: formData.startDate || null,
          endDate: formData.endDate || null,
          projectUrl: formData.projectUrl || null,
          studentIds: selectedStudents,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Project created successfully");
        onProjectCreated();
        // Reset form
        setFormData({
          title: "",
          description: "",
          status: "proposed",
          startDate: "",
          endDate: "",
          projectUrl: "",
        });
        setSelectedStudents([]);
      }
    } catch (error: any) {
      console.error("Error creating project:", error);
      toast.error(error.response?.data?.message || "Failed to create project");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Plus className="w-6 h-6" />
            Create New Project
          </CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Fill in project details and assign team members
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Basic Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-semibold">
                  Project Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Enter project title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-base font-semibold">
                  Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="proposed">📋 Proposed</SelectItem>
                    <SelectItem value="ongoing">🚀 Ongoing</SelectItem>
                    <SelectItem value="completed">✅ Completed</SelectItem>
                    <SelectItem value="archived">📦 Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-base font-semibold">
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-base font-semibold">
                  End Date
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectUrl" className="text-base font-semibold">
                  Project URL
                </Label>
                <Input
                  id="projectUrl"
                  type="url"
                  placeholder="https://github.com/..."
                  value={formData.projectUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, projectUrl: e.target.value })
                  }
                  className="h-11"
                />
              </div>
            </div>

            {/* Middle Column - Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-base font-semibold">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Enter project description, objectives, and requirements..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="min-h-[400px] resize-none"
              />
            </div>

            {/* Right Column - Student Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">
                  Assign Students <span className="text-red-500">*</span>
                </Label>
                {selectedStudents.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  >
                    {selectedStudents.length} selected
                  </Badge>
                )}
              </div>

              {loadingStudents ? (
                <div className="flex items-center justify-center py-12 border rounded-lg">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : students.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-card">
                  <Users className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No students enrolled
                  </p>
                </div>
              ) : (
                <div className="border rounded-lg bg-card">
                  <ScrollArea className="h-[350px]">
                    <div className="p-3 space-y-2">
                      {students.map((student) => (
                        <div
                          key={student.userId}
                          className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${
                            selectedStudents.includes(student.userId)
                              ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 shadow-sm"
                              : "hover:bg-accent border-transparent"
                          }`}
                        >
                          <Checkbox
                            id={`student-${student.userId}`}
                            checked={selectedStudents.includes(student.userId)}
                            onCheckedChange={() =>
                              handleStudentToggle(student.userId)
                            }
                          />
                          <label
                            htmlFor={`student-${student.userId}`}
                            className="flex-1 flex items-center gap-3 cursor-pointer"
                          >
                            <div className="relative">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                                {student.firstName[0]}
                                {student.lastName[0]}
                              </div>
                              {selectedStudents.includes(student.userId) && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center">
                                  <span className="text-white text-xs">✓</span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate text-sm">
                                {student.firstName} {student.lastName}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {student.email}
                              </div>
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {/* Selected Students Summary */}
              {selectedStudents.length > 0 && (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="font-semibold text-sm text-blue-900 dark:text-blue-100">
                      Team Members ({selectedStudents.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {students
                      .filter((s) => selectedStudents.includes(s.userId))
                      .map((student) => (
                        <div
                          key={student.userId}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-gray-800 rounded-full text-xs font-medium border shadow-sm"
                        >
                          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold">
                            {student.firstName[0]}
                          </div>
                          <span className="truncate max-w-[120px]">
                            {student.firstName} {student.lastName}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="h-11"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || selectedStudents.length === 0}
              className="h-11 min-w-[140px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Project
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
