"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Axios } from "@/config/axios";
import useAuthStore from "@/store/store";
import { BookOpen, Calendar, GraduationCap, Users } from "lucide-react";
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
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {semester && getSemesterName(year, sem)}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Courses for semester {semester}
                </p>
              </div>
            </div>

            {/* Semester Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Total Courses</p>
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
                      <p className="text-green-100 text-sm">Total Credits</p>
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
                No courses for this semester
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                No courses have been created for {semester && getSemesterName(year, sem)} yet.
                {user?.role === "department_admin" && (
                  <span> Visit the Subjects page to create courses for this semester.</span>
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
                  className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 hover:scale-[1.02]"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          {course.courseCode}
                        </div>
                        <div className="flex flex-col">
                          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {course.courseCode}
                          </CardTitle>
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-0 font-medium w-fit">
                            {course.semester}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <h3 className="text-base font-medium text-gray-800 dark:text-gray-200 mt-2">
                      {course.title}
                    </h3>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Credits:</span>
                        <span className="font-medium">{course.credits}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Capacity:</span>
                        <span className="font-medium">{course.capacity}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-xs text-gray-500">
                        Created: {formatDate(course.createdAt)}
                      </div>
                      {course.updatedAt && course.updatedAt !== course.createdAt && (
                        <div className="text-xs text-gray-500">
                          Updated: {formatDate(course.updatedAt)}
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
