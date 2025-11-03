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

interface Faculty {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
}

interface FacultyEnrollmentDialogProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function FacultyEnrollmentDialog({
  course,
  isOpen,
  onClose,
  onSuccess,
}: FacultyEnrollmentDialogProps) {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [filteredFaculty, setFilteredFaculty] = useState<Faculty[]>([]);
  const [selectedFacultyIds, setSelectedFacultyIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchFaculty();
    }
  }, [isOpen]);

  useEffect(() => {
    // Filter faculty based on search query
    if (searchQuery.trim() === "") {
      setFilteredFaculty(faculty);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = faculty.filter(
        (f) =>
          f.firstName.toLowerCase().includes(query) ||
          f.lastName.toLowerCase().includes(query) ||
          f.email.toLowerCase().includes(query)
      );
      setFilteredFaculty(filtered);
    }
  }, [searchQuery, faculty]);

  const fetchFaculty = async () => {
    try {
      setIsLoading(true);
      const response = await Axios.get(
        `${env.BACKEND_BASE_URL}/api/user-management/department-users?role=faculty`
      );

      if (response.data.success) {
        setFaculty(response.data.data || []);
        setFilteredFaculty(response.data.data || []);
      }
    } catch (error: any) {
      console.error("Error fetching faculty:", error);
      toast.error("Failed to load faculty members");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFaculty = (facultyId: string) => {
    const newSelected = new Set(selectedFacultyIds);
    if (newSelected.has(facultyId)) {
      newSelected.delete(facultyId);
    } else {
      newSelected.add(facultyId);
    }
    setSelectedFacultyIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedFacultyIds.size === filteredFaculty.length) {
      setSelectedFacultyIds(new Set());
    } else {
      setSelectedFacultyIds(new Set(filteredFaculty.map((f) => f.userId)));
    }
  };

  const handleEnroll = async () => {
    if (selectedFacultyIds.size === 0) {
      toast.error("Please select at least one faculty member");
      return;
    }

    try {
      setIsEnrolling(true);

      // Enroll each faculty member individually as instructors
      const enrollmentPromises = Array.from(selectedFacultyIds).map((facultyId) =>
        Axios.post(`${env.BACKEND_BASE_URL}/api/course/enroll`, {
          courseId: course.courseId,
          userId: facultyId,
          roleInCourse: "instructor",
        })
      );

      const results = await Promise.allSettled(enrollmentPromises);

      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      if (successful > 0) {
        toast.success(`Successfully enrolled ${successful} faculty member(s) as instructor(s)`);
      }

      if (failed > 0) {
        toast.warning(`${failed} faculty member(s) could not be enrolled`);

        // Log failed enrollments for debugging
        results.forEach((result, index) => {
          if (result.status === "rejected") {
            console.error(`Failed to enroll faculty:`, result.reason);
          }
        });
      }

      if (successful > 0) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error enrolling faculty:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to enroll faculty members";
      toast.error(errorMessage);
    } finally {
      setIsEnrolling(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] bg-background dark:bg-[#1f1f1f] border rounded-lg shadow-lg">
        <DialogHeader>
          <DialogTitle>Enroll Faculty as Instructors</DialogTitle>
          <DialogDescription>
            Course: {course.courseCode} - {course.title}
          </DialogDescription>
        </DialogHeader>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search faculty by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Select All Checkbox */}
        {!isLoading && filteredFaculty.length > 0 && (
          <div className="flex items-center gap-2 px-2">
            <Checkbox
              id="select-all"
              checked={
                selectedFacultyIds.size === filteredFaculty.length &&
                filteredFaculty.length > 0
              }
              onCheckedChange={handleSelectAll}
            />
            <label
              htmlFor="select-all"
              className="text-sm font-medium cursor-pointer"
            >
              Select All ({filteredFaculty.length})
            </label>
          </div>
        )}

        {/* Faculty List */}
        <ScrollArea className="h-[400px] pr-4">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}

          {!isLoading && filteredFaculty.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery
                ? "No faculty members found matching your search"
                : "No faculty members available"}
            </div>
          )}

          {!isLoading && filteredFaculty.length > 0 && (
            <div className="space-y-2">
              {filteredFaculty.map((member) => (
                <div
                  key={member.userId}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => handleToggleFaculty(member.userId)}
                >
                  <Checkbox
                    checked={selectedFacultyIds.has(member.userId)}
                    onCheckedChange={() => handleToggleFaculty(member.userId)}
                  />
                  <div className="flex items-center gap-3 flex-1">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {member.avatar ? (
                        <img
                          src={member.avatar}
                          alt={member.firstName}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {member.email}
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
              {selectedFacultyIds.size} faculty member(s) selected
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} disabled={isEnrolling}>
                Cancel
              </Button>
              <Button onClick={handleEnroll} disabled={isEnrolling || selectedFacultyIds.size === 0}>
                {isEnrolling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enroll as Instructor {selectedFacultyIds.size > 0 && `(${selectedFacultyIds.size})`}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
