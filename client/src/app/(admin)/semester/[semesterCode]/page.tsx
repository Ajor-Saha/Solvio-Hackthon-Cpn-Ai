"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Axios } from "@/config/axios";
import useAuthStore from "@/store/store";
import { BookOpen, Calendar, GraduationCap, Users } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Course {
  courseId: string;
  departmentId: string;
  courseCode: string;
  title: string;
  semester: string;
  credits: number;
  capacity: number;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export default function SemesterPage() {
  const params = useParams();
  const semesterCode = params.semesterCode as string;
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, user, accessToken } = useAuthStore();

  // Convert semesterCode (1-1) to semester format (1/1)
  const semester = semesterCode?.replace('-', '/');
  const [year, sem] = semesterCode?.split('-') || [];

  const fetchSemesterCourses = async () => {
    if (!isAuthenticated || !accessToken) return;

    if (!semester) {
      console.error('Semester is undefined or empty:', { semesterCode, semester });
      return;
    }

    try {
      setIsLoading(true);

      // Try the more reliable query parameter approach first
      console.log(`Fetching courses for semester: ${semester} using query parameter`);
      console.log(`Full URL: /api/course/by-semester?semester=${semester}`);

      const response = await Axios.get(`/api/course/by-semester`, {
        params: { semester }, // This will properly encode the parameter
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.data.success) {
        setCourses(response.data.data || []);
        console.log(`Successfully loaded ${response.data.data?.length || 0} courses for semester ${semester}`);
      }
    } catch (error: any) {
      console.error("Error fetching semester courses with query parameter:", error);

      // Fallback: Try the path parameter approach with URL encoding
      try {
        console.log('Trying fallback approach with path parameter...');
        const encodedSemester = encodeURIComponent(semester);
        console.log(`Fallback URL: /api/course/semester/${encodedSemester}`);

        const fallbackResponse = await Axios.get(`/api/course/semester/${encodedSemester}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (fallbackResponse.data.success) {
          setCourses(fallbackResponse.data.data || []);
          console.log(`Fallback successful: loaded ${fallbackResponse.data.data?.length || 0} courses`);
        }
      } catch (fallbackError: any) {
        console.error("Fallback also failed:", fallbackError);
        console.error("Response status:", fallbackError.response?.status);
        console.error("Response data:", fallbackError.response?.data);
        toast.error(`Failed to load semester courses: ${fallbackError.response?.data?.message || fallbackError.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (semester) {
      fetchSemesterCourses();
    }
  }, [semester, isAuthenticated, accessToken]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getSemesterName = (year: string, sem: string) => {
    const yearNames = { '1': 'First', '2': 'Second', '3': 'Third', '4': 'Fourth' };
    const semNames = { '1': 'First', '2': 'Second' };
    return `${yearNames[year as keyof typeof yearNames]} Year - ${semNames[sem as keyof typeof semNames]} Semester`;
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Authentication Required
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Please log in to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {semester && getSemesterName(year, sem)}
                </h1>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-gray-600 dark:text-gray-400">
                    {user?.role === "department_admin"
                      ? `All courses for semester ${semester}`
                      : `Your enrolled courses for semester ${semester}`}
                  </p>
                  {user?.role === "department_admin" && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      Admin View
                    </span>
                  )}
                  {user?.role === "faculty" && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Faculty View
                    </span>
                  )}
                  {user?.role === "student" && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      Student View
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Semester Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">
                        {user?.role === "department_admin" ? "Total Courses" : "Enrolled Courses"}
                      </p>
                      <p className="text-2xl font-bold">{courses.length}</p>
                    </div>
                    <BookOpen className="w-8 h-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">
                        {user?.role === "department_admin" ? "Total Credits" : "My Credits"}
                      </p>
                      <p className="text-2xl font-bold">
                        {courses.reduce((sum, course) => sum + course.credits, 0)}
                      </p>
                    </div>
                    <GraduationCap className="w-8 h-8 text-green-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Total Capacity</p>
                      <p className="text-2xl font-bold">
                        {courses.reduce((sum, course) => sum + course.capacity, 0)}
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-purple-200" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading courses...</span>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && courses.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
                {user?.role === "department_admin"
                  ? "No courses for this semester"
                  : "No enrolled courses for this semester"}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                {user?.role === "department_admin" ? (
                  <>
                    No courses have been created for {semester && getSemesterName(year, sem)} yet.
                    <span> Visit the Subjects page to create courses for this semester.</span>
                  </>
                ) : (
                  <>
                    You are not enrolled in any courses for {semester && getSemesterName(year, sem)}.
                    <span> Contact your department admin for course enrollment.</span>
                  </>
                )}
              </p>
            </div>
          )}

          {/* Courses Grid */}
          {!isLoading && courses.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Card
                  key={course.courseId}
                  className="group hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 overflow-hidden"
                >
                  {/* Card Header with Gradient Accent */}
                  <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-md flex-shrink-0">
                        {course.courseCode.length > 8 ? (
                          <span className="text-[10px] px-1 text-center leading-tight">{course.courseCode}</span>
                        ) : (
                          course.courseCode
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/semester/${semesterCode}/${course.courseCode}`}
                          className="block"
                        >
                          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors cursor-pointer hover:underline">
                            {course.title}
                          </h3>
                        </Link>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 pt-0">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Credits</div>
                        <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{course.credits}</div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Capacity</div>
                        <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{course.capacity}</div>
                      </div>
                    </div>

                    {/* Footer with Dates */}
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Created</span>
                        <span className="text-gray-700 dark:text-gray-300 font-medium">{formatDate(course.createdAt)}</span>
                      </div>
                      {course.updatedAt && course.updatedAt !== course.createdAt && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500 dark:text-gray-400">Updated</span>
                          <span className="text-gray-700 dark:text-gray-300 font-medium">{formatDate(course.updatedAt)}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
