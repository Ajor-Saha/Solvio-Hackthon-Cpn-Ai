"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Axios } from "@/config/axios";
import { env } from "@/config/env";
import { Loader2, Search, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Course {
  courseId: string;
  courseCode: string;
  title: string;
  semester: string;
  credits: number;
  capacity: number;
}

interface Student {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
}

interface StudentEnrollmentDialogProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function StudentEnrollmentDialog({
  course,
  isOpen,
  onClose,
  onSuccess,
}: StudentEnrollmentDialogProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchStudents();
    }
  }, [isOpen]);

  useEffect(() => {
    // Filter students based on search query
    if (searchQuery.trim() === "") {
      setFilteredStudents(students);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = students.filter(
        (student) =>
          student.firstName.toLowerCase().includes(query) ||
          student.lastName.toLowerCase().includes(query) ||
          student.email.toLowerCase().includes(query)
      );
      setFilteredStudents(filtered);
    }
  }, [searchQuery, students]);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const response = await Axios.get(
        `${env.BACKEND_BASE_URL}/api/user-management/department-users?role=student`
      );

      if (response.data.success) {
        setStudents(response.data.data || []);
        setFilteredStudents(response.data.data || []);
      }
    } catch (error: any) {
      console.error("Error fetching students:", error);
      toast.error("Failed to load students");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStudent = (studentId: string) => {
    const newSelected = new Set(selectedStudentIds);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudentIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedStudentIds.size === filteredStudents.length) {
      setSelectedStudentIds(new Set());
    } else {
      setSelectedStudentIds(new Set(filteredStudents.map((s) => s.userId)));
    }
  };

  const handleEnroll = async () => {
    if (selectedStudentIds.size === 0) {
      toast.error("Please select at least one student");
      return;
    }

    try {
      setIsEnrolling(true);
      const response = await Axios.post(
        `${env.BACKEND_BASE_URL}/api/course/enroll/bulk`,
        {
          courseId: course.courseId,
          userIds: Array.from(selectedStudentIds),
        }
      );

      if (response.data.success) {
        const { summary, failedEnrollments } = response.data.data;

        if (summary.successful > 0) {
          toast.success(
            `Successfully enrolled ${summary.successful} student(s)`
          );
        }

        if (failedEnrollments && failedEnrollments.length > 0) {
          toast.warning(
            `${failedEnrollments.length} student(s) could not be enrolled`
          );
          console.log("Failed enrollments:", failedEnrollments);
        }

        onSuccess();
      }
    } catch (error: any) {
      console.error("Error enrolling students:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to enroll students";
      toast.error(errorMessage);
    } finally {
      setIsEnrolling(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] bg-background dark:bg-[#1f1f1f] border rounded-lg shadow-lg">
        <DialogHeader>
          <DialogTitle>Enroll Students</DialogTitle>
          <DialogDescription>
            Course: {course.courseCode} - {course.title} (Capacity: {course.capacity})
          </DialogDescription>
        </DialogHeader>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Select All Checkbox */}
        {!isLoading && filteredStudents.length > 0 && (
          <div className="flex items-center gap-2 px-2">
            <Checkbox
              id="select-all"
              checked={
                selectedStudentIds.size === filteredStudents.length &&
                filteredStudents.length > 0
              }
              onCheckedChange={handleSelectAll}
            />
            <label
              htmlFor="select-all"
              className="text-sm font-medium cursor-pointer"
            >
              Select All ({filteredStudents.length})
            </label>
          </div>
        )}

        {/* Student List */}
        <ScrollArea className="h-[400px] pr-4">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}

          {!isLoading && filteredStudents.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery
                ? "No students found matching your search"
                : "No students available"}
            </div>
          )}

          {!isLoading && filteredStudents.length > 0 && (
            <div className="space-y-2">
              {filteredStudents.map((student) => (
                <div
                  key={student.userId}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => handleToggleStudent(student.userId)}
                >
                  <Checkbox
                    checked={selectedStudentIds.has(student.userId)}
                    onCheckedChange={() => handleToggleStudent(student.userId)}
                  />
                  <div className="flex items-center gap-3 flex-1">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {student.avatar ? (
                        <img
                          src={student.avatar}
                          alt={student.firstName}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {student.email}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <p className="text-sm text-muted-foreground">
              {selectedStudentIds.size} student(s) selected
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} disabled={isEnrolling}>
                Cancel
              </Button>
              <Button onClick={handleEnroll} disabled={isEnrolling || selectedStudentIds.size === 0}>
                {isEnrolling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enroll {selectedStudentIds.size > 0 && `(${selectedStudentIds.size})`}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
