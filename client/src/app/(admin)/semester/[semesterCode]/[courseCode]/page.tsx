"use client";

import { CourseProjects, CourseResources } from "@/app/(admin)/semester/_components";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Axios } from "@/config/axios";
import useAuthStore from "@/store/store";
import {
  BookOpen,
  FileText,
  Folder,
  GraduationCap,
  Lightbulb,
  Users
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
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

interface Enrollment {
  enrollmentId: string;
  courseId: string;
  userId: string;
  roleInCourse: "student" | "instructor";
  enrollmentDate: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string | null;
}

const CoursePage = () => {
  const params = useParams();
  const router = useRouter();
  const semesterCode = params.semesterCode as string;
  const courseCode = params.courseCode as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingEnrollments, setIsLoadingEnrollments] = useState(false);
  const [activeTab, setActiveTab] = useState("people");
  const { isAuthenticated, accessToken } = useAuthStore();

  const semester = semesterCode?.replace('-', '/');

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!isAuthenticated || !accessToken || !semester || !courseCode) return;

      try {
        setIsLoading(true);
        const response = await Axios.get(`/api/course/by-semester`, {
          params: { semester },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.data.success) {
          const courses = response.data.data || [];
          const foundCourse = courses.find((c: Course) => c.courseCode === courseCode);

          if (foundCourse) {
            setCourse(foundCourse);
            // Fetch enrollments after course is found
            fetchEnrollments(foundCourse.courseId);
          } else {
            toast.error("Course not found");
            router.push(`/semester/${semesterCode}`);
          }
        }
      } catch (error: any) {
        console.error("Error fetching course details:", error);
        toast.error("Failed to load course details");
      } finally {
        setIsLoading(false);
      }
    };

    const fetchEnrollments = async (courseId: string) => {
      try {
        setIsLoadingEnrollments(true);
        const response = await Axios.get(`/api/course/enrollments/${courseId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.data.success) {
          setEnrollments(response.data.data || []);
        }
      } catch (error: any) {
        console.error("Error fetching enrollments:", error);
        toast.error("Failed to load enrollment data");
      } finally {
        setIsLoadingEnrollments(false);
      }
    };

    fetchCourseDetails();
  }, [semester, courseCode, isAuthenticated, accessToken]);

  // Calculate enrollment stats
  const instructors = enrollments.filter((e) => e.roleInCourse === "instructor");
  const students = enrollments.filter((e) => e.roleInCourse === "student");
  const enrolledCount = students.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Course Not Found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            The requested course could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      {/* Hero Header Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
            {/* Course Info */}
            <div className="flex items-start gap-3 md:gap-4">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white font-bold text-base md:text-lg shadow-2xl border-2 border-white/30 flex-shrink-0">
                {course.courseCode.length > 8 ? (
                  <span className="text-xs md:text-sm px-2 text-center leading-tight">{course.courseCode}</span>
                ) : (
                  course.courseCode
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 md:gap-3 mb-2 flex-wrap">
                  <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30 text-xs md:text-sm">
                    {course.semester}
                  </Badge>
                  <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30 text-xs md:text-sm">
                    {course.credits} Credits
                  </Badge>
                </div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-1 md:mb-2 text-white drop-shadow-lg line-clamp-2">
                  {course.title}
                </h1>
                <p className="text-blue-100 text-sm md:text-lg">
                  Course Code: {course.courseCode}
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-3 md:gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 md:p-4 border border-white/20 shadow-xl min-w-[100px] md:min-w-[120px]">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-3 h-3 md:w-4 md:h-4 text-blue-200" />
                  <span className="text-[10px] md:text-xs text-blue-200">Enrolled</span>
                </div>
                <p className="text-xl md:text-2xl font-bold text-white">
                  {enrolledCount}/{course.capacity}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 md:p-4 border border-white/20 shadow-xl min-w-[100px] md:min-w-[120px]">
                <div className="flex items-center gap-2 mb-1">
                  <GraduationCap className="w-3 h-3 md:w-4 md:h-4 text-purple-200" />
                  <span className="text-[10px] md:text-xs text-purple-200">Credits</span>
                </div>
                <p className="text-xl md:text-2xl font-bold text-white">{course.credits}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <div className="flex-1 bg-gray-50 mt-5 dark:bg-gray-950">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tabs Navigation - Sticky */}
          <div className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <TabsList className="w-full justify-start h-12 md:h-14 bg-transparent border-0 p-0 gap-1 md:gap-2">
                <TabsTrigger
                  value="people"
                  className="data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900/20 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-400 rounded-none h-full px-3 md:px-6 text-xs md:text-sm"
                >
                  <Users className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">People</span>
                  <span className="sm:hidden">People</span>
                </TabsTrigger>
                <TabsTrigger
                  value="resources"
                  className="data-[state=active]:bg-green-50 dark:data-[state=active]:bg-green-900/20 data-[state=active]:text-green-600 dark:data-[state=active]:text-green-400 data-[state=active]:border-b-2 data-[state=active]:border-green-600 dark:data-[state=active]:border-green-400 rounded-none h-full px-3 md:px-6 text-xs md:text-sm"
                >
                  <FileText className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Resources</span>
                  <span className="sm:hidden">Resources</span>
                </TabsTrigger>
                <TabsTrigger
                  value="project"
                  className="data-[state=active]:bg-purple-50 dark:data-[state=active]:bg-purple-900/20 data-[state=active]:text-purple-600 dark:data-[state=active]:text-purple-400 data-[state=active]:border-b-2 data-[state=active]:border-purple-600 dark:data-[state=active]:border-purple-400 rounded-none h-full px-3 md:px-6 text-xs md:text-sm"
                >
                  <Folder className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Project</span>
                  <span className="sm:hidden">Project</span>
                </TabsTrigger>
                <TabsTrigger
                  value="research"
                  className="data-[state=active]:bg-orange-50 dark:data-[state=active]:bg-orange-900/20 data-[state=active]:text-orange-600 dark:data-[state=active]:text-orange-400 data-[state=active]:border-b-2 data-[state=active]:border-orange-600 dark:data-[state=active]:border-orange-400 rounded-none h-full px-3 md:px-6 text-xs md:text-sm"
                >
                  <Lightbulb className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Research</span>
                  <span className="sm:hidden">Research</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Content Area */}
          <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 md:py-8">
            {/* People Tab */}
            <TabsContent value="people" className="mt-0">
              <Card className="border-0 shadow-lg bg-white dark:bg-gray-900">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">People</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {enrolledCount} students and {instructors.length} instructor(s) enrolled
                      </p>
                    </div>
                  </div>

                  {isLoadingEnrollments ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                    </div>
                  ) : enrollments.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <Users className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 mb-2">No enrollments yet</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500">
                          Students and instructors will appear here once enrolled
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Instructors Section */}
                      {instructors.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            Instructor{instructors.length > 1 ? 's' : ''} ({instructors.length})
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {instructors.map((instructor) => (
                              <div
                                key={instructor.enrollmentId}
                                className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 hover:shadow-md transition-shadow"
                              >
                                <div className="w-12 h-12 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                                  {instructor.firstName[0]}{instructor.lastName[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                                    {instructor.firstName} {instructor.lastName}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                    {instructor.email}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Students Section */}
                      {students.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                            Students ({students.length})
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {students.map((student) => (
                              <div
                                key={student.enrollmentId}
                                className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                              >
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                                  {student.firstName[0]}{student.lastName[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                                    {student.firstName} {student.lastName}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                    {student.email}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="mt-0">
            <Card className="border-0 shadow-lg bg-white dark:bg-gray-900">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Resources</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Course materials, documents, and learning resources
                    </p>
                  </div>
                </div>
                {course && <CourseResources courseId={course.courseId} />}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Project Tab */}
          <TabsContent value="project" className="mt-0">
            <Card className="border-0 shadow-lg bg-white dark:bg-gray-900">
              <CardContent className="p-6 md:p-8">
                {course && <CourseProjects courseId={course.courseId} />}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Research Tab */}
          <TabsContent value="research" className="mt-0">
            <Card className="border-0 shadow-lg bg-white dark:bg-gray-900">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                    <Lightbulb className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Research</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Research papers, studies, and academic work
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Lightbulb className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 mb-2">No research available</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      Research content will be displayed here
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          </main>
        </Tabs>
      </div>
    </div>
  );
};

export default CoursePage;
