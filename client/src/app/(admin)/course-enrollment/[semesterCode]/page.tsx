"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Axios } from "@/config/axios";
import { env } from "@/config/env";
import useAuthStore from "@/store/store";
import { BookOpen, Users, UserCheck, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { StudentEnrollmentDialog } from "./_components/student-enrollment-dialog";
import { FacultyEnrollmentDialog } from "./_components/faculty-enrollment-dialog";

interface Course {
  courseId: string;
  courseCode: string;
  title: string;
  semester: string;
  credits: number;
  capacity: number;
  departmentId: string;
}

export default function SemesterEnrollmentPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [enrollmentType, setEnrollmentType] = useState<"student" | "faculty" | null>(null);

  const semesterCode = params.semesterCode as string;
  const semesterDisplay = semesterCode?.replace("-", "/");

  useEffect(() => {
    if (user?.role !== "department_admin") {
      router.push("/dashboard");
      return;
    }
    fetchCourses();
  }, [user, semesterCode]);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const response = await Axios.get(
        `${env.BACKEND_BASE_URL}/api/course/by-semester?semester=${semesterDisplay}`
      );

      if (response.data.success) {
        setCourses(response.data.data || []);
      }
    } catch (error: any) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to load courses");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnrollmentClick = (course: Course, type: "student" | "faculty") => {
    setSelectedCourse(course);
    setEnrollmentType(type);
  };

  const handleCloseDialog = () => {
    setSelectedCourse(null);
    setEnrollmentType(null);
  };

  const handleEnrollmentSuccess = () => {
    toast.success("Enrollment completed successfully");
    handleCloseDialog();
  };

  if (user?.role !== "department_admin") {
    return null;
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <Link href="/course-enrollment">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Semesters
          </Button>
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-primary/10 rounded-lg">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Semester {semesterDisplay} Courses</h1>
            <p className="text-muted-foreground">
              Manage student and faculty enrollments for courses
            </p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && courses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Courses Found</h3>
          <p className="text-muted-foreground mb-4">
            No courses are available for Semester {semesterDisplay}
          </p>
          <Link href="/subjects">
            <Button>Add New Course</Button>
          </Link>
        </div>
      )}

      {/* Courses Table */}
      {!isLoading && courses.length > 0 && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Course Code</TableHead>
                <TableHead>Course Title</TableHead>
                <TableHead className="text-center w-[100px]">Credits</TableHead>
                <TableHead className="text-center w-[100px]">Capacity</TableHead>
                <TableHead className="text-right w-[300px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.courseId}>
                  <TableCell className="font-mono font-semibold">
                    {course.courseCode}
                  </TableCell>
                  <TableCell className="font-medium">{course.title}</TableCell>
                  <TableCell className="text-center">{course.credits}</TableCell>
                  <TableCell className="text-center">{course.capacity}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEnrollmentClick(course, "student")}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Student Enrollment
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEnrollmentClick(course, "faculty")}
                      >
                        <UserCheck className="h-4 w-4 mr-2" />
                        Teacher Enrollment
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Enrollment Dialogs */}
      {selectedCourse && enrollmentType === "student" && (
        <StudentEnrollmentDialog
          course={selectedCourse}
          isOpen={true}
          onClose={handleCloseDialog}
          onSuccess={handleEnrollmentSuccess}
        />
      )}

      {selectedCourse && enrollmentType === "faculty" && (
        <FacultyEnrollmentDialog
          course={selectedCourse}
          isOpen={true}
          onClose={handleCloseDialog}
          onSuccess={handleEnrollmentSuccess}
        />
      )}
    </div>
  );
}
