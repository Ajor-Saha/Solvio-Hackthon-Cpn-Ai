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
import { Loader2, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Student {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string | null;
}

interface CreateResearchFormProps {
  courseId: string;
  onResearchCreated: () => void;
  onCancel: () => void;
}

export function CreateResearchForm({
  courseId,
  onResearchCreated,
  onCancel,
}: CreateResearchFormProps) {
  const { accessToken } = useAuthStore();
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "proposed",
    startDate: "",
    endDate: "",
    publicationUrl: "",
  });

  // Fetch enrolled students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoadingStudents(true);
        const response = await Axios.get(
          `/api/course/enrollments/${courseId}?roleInCourse=student`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (response.data.success) {
          setStudents(response.data.data || []);
        }
      } catch (error: any) {
        console.error("Error fetching students:", error);
        toast.error("Failed to load students");
      } finally {
        setLoadingStudents(false);
      }
    };

    if (courseId && accessToken) {
      fetchStudents();
    }
  }, [courseId, accessToken]);

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
      toast.error("Please enter a research title");
      return;
    }

    if (selectedStudents.length === 0) {
      toast.error("Please select at least one student");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await Axios.post(
        "/api/research/create",
        {
          courseId,
          title: formData.title,
          description: formData.description || null,
          status: formData.status,
          startDate: formData.startDate || null,
          endDate: formData.endDate || null,
          publicationUrl: formData.publicationUrl || null,
          studentIds: selectedStudents,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Research created successfully!");

        // Show email notification stats
        const emailStats = response.data.data.emailNotifications;
        if (emailStats) {
          toast.info(
            `Email notifications: ${emailStats.sent} sent, ${emailStats.failed} failed`
          );
        }

        // Reset form
        setFormData({
          title: "",
          description: "",
          status: "proposed",
          startDate: "",
          endDate: "",
          publicationUrl: "",
        });
        setSelectedStudents([]);
        onResearchCreated();
      }
    } catch (error: any) {
      console.error("Error creating research:", error);
      toast.error(
        error.response?.data?.message || "Failed to create research"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-2 border-orange-200 dark:border-orange-800 shadow-2xl mb-8 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
      <CardHeader className="border-b border-orange-200 dark:border-orange-800 bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-orange-900 dark:text-orange-100 flex items-center gap-2">
            🔬 Create New Research
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="text-orange-600 hover:text-orange-700 hover:bg-orange-200/50 dark:text-orange-400 dark:hover:text-orange-300"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Basic Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-semibold">
                  Research Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Enter research title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="h-11"
                  required
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
                    <SelectItem value="ongoing">🔬 Ongoing</SelectItem>
                    <SelectItem value="completed">✅ Completed</SelectItem>
                    <SelectItem value="published">📄 Published</SelectItem>
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
                <Label htmlFor="publicationUrl" className="text-base font-semibold">
                  Publication URL
                </Label>
                <Input
                  id="publicationUrl"
                  type="url"
                  placeholder="https://..."
                  value={formData.publicationUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, publicationUrl: e.target.value })
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
                placeholder="Enter research description, objectives, and methodology..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="min-h-[600px] resize-none"
              />
            </div>

            {/* Right Column - Student Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">
                  Assign Researchers <span className="text-red-500">*</span>
                </Label>
                {selectedStudents.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                  >
                    {selectedStudents.length} selected
                  </Badge>
                )}
              </div>

              {loadingStudents ? (
                <div className="flex items-center justify-center py-12 border rounded-lg">
                  <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
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
                  <ScrollArea className="h-[520px]">
                    <div className="p-3 space-y-2">
                      {students.map((student) => (
                        <div
                          key={student.userId}
                          className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${
                            selectedStudents.includes(student.userId)
                              ? "bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700 shadow-sm"
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
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-semibold text-sm shadow-md">
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
                <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    <span className="font-semibold text-sm text-orange-900 dark:text-orange-100">
                      Research Team ({selectedStudents.length})
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
                          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white text-[10px] font-bold">
                            {student.firstName[0]}
                          </div>
                          <span className="truncate max-w-[120px]">
                            {student.firstName} {student.lastName[0]}.
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-orange-200 dark:border-orange-800">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-900/20"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>🔬 Create Research</>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
