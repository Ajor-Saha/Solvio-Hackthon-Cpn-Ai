"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import useAuthStore from "@/store/store";
import {
  Activity,
  Award,
  BookOpen,
  Brain,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Flame,
  FolderKanban,
  GitBranch,
  GraduationCap,
  Lightbulb,
  ListTodo,
  MessageSquare,
  PieChart,
  Rocket,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  UserCheck,
  Users,
  Video,
  Zap
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

// Mock Data
const MOCK_DATA = {
  student: {
    stats: {
      enrolledCourses: 5,
      activeProjects: 3,
      completedTasks: 24,
      upcomingMeetings: 2,
      achievements: 8
    },
    courses: [
      { id: 1, name: "Data Structures & Algorithms", progress: 75, teacher: "Dr. Smith", nextClass: "Tomorrow, 10:00 AM" },
      { id: 2, name: "Database Management Systems", progress: 60, teacher: "Prof. Johnson", nextClass: "Today, 2:00 PM" },
      { id: 3, name: "Software Engineering", progress: 85, teacher: "Dr. Williams", nextClass: "Wed, 11:00 AM" },
      { id: 4, name: "Machine Learning", progress: 45, teacher: "Dr. Chen", nextClass: "Thu, 3:00 PM" },
      { id: 5, name: "Web Development", progress: 90, teacher: "Prof. Davis", nextClass: "Fri, 9:00 AM" }
    ],
    projects: [
      { id: 1, name: "E-Commerce Platform", course: "Web Development", progress: 80, deadline: "2 days", status: "On Track" },
      { id: 2, name: "ML Classification Model", course: "Machine Learning", progress: 55, deadline: "1 week", status: "In Progress" },
      { id: 3, name: "Database Design Project", course: "DBMS", progress: 70, deadline: "3 days", status: "On Track" }
    ],
    recentTasks: [
      { id: 1, title: "Complete Chapter 5 Quiz", course: "DSA", dueDate: "Today", priority: "high" },
      { id: 2, title: "Submit Project Proposal", course: "Software Engineering", dueDate: "Tomorrow", priority: "high" },
      { id: 3, title: "Research Paper Review", course: "Machine Learning", dueDate: "3 days", priority: "medium" },
      { id: 4, title: "Lab Assignment 3", course: "DBMS", dueDate: "5 days", priority: "low" }
    ],
    recommendations: [
      { id: 1, type: "job", title: "Software Engineer Intern", company: "Tech Corp", match: 95 },
      { id: 2, type: "competition", title: "National Hackathon 2025", organizer: "ACM", match: 88 },
      { id: 3, type: "research", title: "AI Research Assistant", professor: "Dr. Kumar", match: 82 }
    ]
  },
  faculty: {
    stats: {
      activeCourses: 4,
      totalStudents: 156,
      activeProjects: 12,
      pendingReviews: 8,
      upcomingMeetings: 5
    },
    courses: [
      { id: 1, name: "Data Structures & Algorithms", code: "CSE-201", students: 45, progress: 65 },
      { id: 2, name: "Advanced Algorithms", code: "CSE-401", students: 32, progress: 55 },
      { id: 3, name: "Discrete Mathematics", code: "MATH-301", students: 48, progress: 70 },
      { id: 4, name: "Theory of Computation", code: "CSE-302", students: 31, progress: 50 }
    ],
    projects: [
      { id: 1, name: "E-Commerce System", students: ["Alice", "Bob", "Charlie"], progress: 75, status: "On Track" },
      { id: 2, name: "ML Classifier", students: ["David", "Eve"], progress: 60, status: "Review Needed" },
      { id: 3, name: "Mobile App Development", students: ["Frank", "Grace", "Henry"], progress: 85, status: "On Track" }
    ],
    pendingTasks: [
      { id: 1, type: "Grade Assignments", count: 8, course: "DSA", priority: "high" },
      { id: 2, type: "Review Submissions", count: 5, course: "Advanced Algorithms", priority: "high" },
      { id: 3, type: "Update Resources", count: 3, course: "Discrete Math", priority: "medium" },
      { id: 4, type: "Schedule Meetings", count: 4, course: "Theory of Computation", priority: "medium" }
    ],
    recentActivity: [
      { id: 1, action: "Graded Assignment", course: "CSE-201", time: "2 hours ago" },
      { id: 2, action: "Created New Project", course: "CSE-401", time: "5 hours ago" },
      { id: 3, action: "Uploaded Resources", course: "MATH-301", time: "Yesterday" },
      { id: 4, action: "Scheduled Meeting", course: "CSE-302", time: "2 days ago" }
    ]
  },
  admin: {
    stats: {
      totalStudents: 1247,
      totalFaculty: 48,
      activeCourses: 156,
      activeProjects: 89,
      avgPerformance: 87
    },
    departmentMetrics: [
      { name: "Student Enrollment", value: 92, trend: "up" },
      { name: "Faculty Utilization", value: 85, trend: "up" },
      { name: "Course Completion", value: 78, trend: "stable" },
      { name: "Project Success Rate", value: 83, trend: "up" }
    ],
    recentAnnouncements: [
      { id: 1, type: "Job", title: "Google SDE Internship", date: "2 hours ago" },
      { id: 2, type: "Competition", title: "Smart India Hackathon", date: "5 hours ago" },
      { id: 3, type: "Achievement", title: "Student Research Publication", date: "Yesterday" },
      { id: 4, type: "Higher Study", title: "MIT PhD Opportunities", date: "2 days ago" }
    ],
    quickActions: [
      { id: 1, icon: Users, title: "Manage Users", description: "Add/edit students and faculty", color: "blue" },
      { id: 2, icon: BookOpen, title: "Course Setup", description: "Create and manage courses", color: "green" },
      { id: 3, icon: Trophy, title: "Announcements", description: "Post opportunities", color: "purple" },
      { id: 4, icon: PieChart, title: "Analytics", description: "View detailed reports", color: "orange" }
    ]
  }
};

export default function DashboardClient() {
  const { user } = useAuthStore();
  const router = useRouter();

  const mockData = useMemo(() => {
    if (user?.role === 'student') return MOCK_DATA.student;
    if (user?.role === 'faculty') return MOCK_DATA.faculty;
    return MOCK_DATA.admin;
  }, [user?.role]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="space-y-6 max-w-7xl mx-auto">
          {/* Welcome Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Welcome back, {user?.firstName || 'User'}! 👋
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                {user?.role === 'student' && "Here's your learning progress and achievements"}
                {user?.role === 'faculty' && "Manage your courses, students, and academic activities"}
                {user?.role === 'department_admin' && "Oversee department operations and analytics"}
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {new Date().toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>

          {/* Role-Specific Dashboard Content */}
          {user?.role === 'student' && mockData && 'courses' in mockData && (
            <div className="space-y-6">
              {/* Student Stats Overview */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                <Card className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                  <CardContent className="p-4 sm:p-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <BookOpen className="w-8 h-8 text-blue-100 opacity-80" />
                        <Sparkles className="w-4 h-4 text-blue-200" />
                      </div>
                      <div>
                        <p className="text-2xl sm:text-3xl font-bold">{mockData.stats.enrolledCourses}</p>
                        <p className="text-xs sm:text-sm text-blue-100 font-medium">Enrolled Courses</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 text-white border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                  <CardContent className="p-4 sm:p-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <FolderKanban className="w-8 h-8 text-emerald-100 opacity-80" />
                        <TrendingUp className="w-4 h-4 text-emerald-200" />
                      </div>
                      <div>
                        <p className="text-2xl sm:text-3xl font-bold">{mockData.stats.activeProjects}</p>
                        <p className="text-xs sm:text-sm text-emerald-100 font-medium">Active Projects</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 text-white border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                  <CardContent className="p-4 sm:p-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <CheckCircle2 className="w-8 h-8 text-purple-100 opacity-80" />
                        <Zap className="w-4 h-4 text-purple-200" />
                      </div>
                      <div>
                        <p className="text-2xl sm:text-3xl font-bold">{mockData.stats.completedTasks}</p>
                        <p className="text-xs sm:text-sm text-purple-100 font-medium">Tasks Completed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                  <CardContent className="p-4 sm:p-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Video className="w-8 h-8 text-orange-100 opacity-80" />
                        <Clock className="w-4 h-4 text-orange-200" />
                      </div>
                      <div>
                        <p className="text-2xl sm:text-3xl font-bold">{mockData.stats.upcomingMeetings}</p>
                        <p className="text-xs sm:text-sm text-orange-100 font-medium">Upcoming Meetings</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-pink-500 via-pink-600 to-pink-700 text-white border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                  <CardContent className="p-4 sm:p-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Trophy className="w-8 h-8 text-pink-100 opacity-80" />
                        <Award className="w-4 h-4 text-pink-200" />
                      </div>
                      <div>
                        <p className="text-2xl sm:text-3xl font-bold">{mockData.stats.achievements}</p>
                        <p className="text-xs sm:text-sm text-pink-100 font-medium">Achievements</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Enrolled Courses */}
                <Card className="lg:col-span-2 border-none shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      My Courses
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {mockData.courses.map((course) => (
                      <div key={course.id} className="p-4 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-blue-900/20 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{course.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Instructor: {course.teacher}</p>
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {course.nextClass}
                            </p>
                          </div>
                          <Badge variant="outline" className="bg-white dark:bg-gray-800">
                            {course.progress}%
                          </Badge>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Quick Actions & AI Recommendations */}
                <div className="space-y-6">
                  {/* Quick Actions */}
                  <Card className="border-none shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                          <Rocket className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        Quick Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button variant="outline" className="w-full justify-start gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/20" size="sm">
                        <Brain className="w-4 h-4 text-blue-600" />
                        <span className="text-sm">AI Research Assistant</span>
                      </Button>
                      <Button variant="outline" className="w-full justify-start gap-2 hover:bg-green-50 dark:hover:bg-green-900/20" size="sm">
                        <Target className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Submit Task</span>
                      </Button>
                      <Button variant="outline" className="w-full justify-start gap-2 hover:bg-purple-50 dark:hover:bg-purple-900/20" size="sm">
                        <Video className="w-4 h-4 text-purple-600" />
                        <span className="text-sm">Join Meeting</span>
                      </Button>
                      <Button variant="outline" className="w-full justify-start gap-2 hover:bg-orange-50 dark:hover:bg-orange-900/20" size="sm">
                        <Briefcase className="w-4 h-4 text-orange-600" />
                        <span className="text-sm">Browse Opportunities</span>
                      </Button>
                    </CardContent>
                  </Card>

                  {/* AI Recommendations */}
                  <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                          <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        AI Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {mockData.recommendations.map((rec) => (
                        <div key={rec.id} className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-800">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <Badge variant="outline" className="mb-2 text-xs">{rec.type}</Badge>
                              <h4 className="font-medium text-sm text-gray-900 dark:text-white">{rec.title}</h4>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {rec.company || rec.organizer || rec.professor}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 px-2 py-1 rounded-full">
                              <Sparkles className="w-3 h-3 text-purple-600" />
                              <span className="text-xs font-bold text-purple-700 dark:text-purple-300">{rec.match}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Projects and Tasks */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Active Projects */}
                <Card className="border-none shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                        <FolderKanban className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      Active Projects
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {mockData.projects.map((project) => (
                      <div key={project.id} className="p-4 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{project.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{project.course}</p>
                          </div>
                          <Badge className={project.status === 'On Track' ? 'bg-green-500' : 'bg-yellow-500'}>
                            {project.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <Progress value={project.progress} className="flex-1 mr-3 h-2" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{project.progress}%</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Due in {project.deadline}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Recent Tasks */}
                <Card className="border-none shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                        <ListTodo className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      Upcoming Tasks
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {mockData.recentTasks.map((task) => (
                      <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200 dark:border-orange-800">
                        <div className={`mt-1 w-2 h-2 rounded-full ${
                          task.priority === 'high' ? 'bg-red-500' : 
                          task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm text-gray-900 dark:text-white">{task.title}</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{task.course}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">{task.dueDate}</Badge>
                            <Badge variant="outline" className={`text-xs ${
                              task.priority === 'high' ? 'border-red-300 text-red-700 dark:border-red-700 dark:text-red-400' :
                              task.priority === 'medium' ? 'border-yellow-300 text-yellow-700 dark:border-yellow-700 dark:text-yellow-400' :
                              'border-green-300 text-green-700 dark:border-green-700 dark:text-green-400'
                            }`}>
                              {task.priority}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {user?.role === 'faculty' && mockData && 'courses' in mockData && (
            <div className="space-y-6">
              {/* Faculty Stats Overview */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                <Card className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700 text-white border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                  <CardContent className="p-4 sm:p-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <BookOpen className="w-8 h-8 text-indigo-100 opacity-80" />
                        <TrendingUp className="w-4 h-4 text-indigo-200" />
                      </div>
                      <div>
                        <p className="text-2xl sm:text-3xl font-bold">{mockData.stats.activeCourses}</p>
                        <p className="text-xs sm:text-sm text-indigo-100 font-medium">Active Courses</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 text-white border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                  <CardContent className="p-4 sm:p-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Users className="w-8 h-8 text-emerald-100 opacity-80" />
                        <Sparkles className="w-4 h-4 text-emerald-200" />
                      </div>
                      <div>
                        <p className="text-2xl sm:text-3xl font-bold">{mockData.stats.totalStudents}</p>
                        <p className="text-xs sm:text-sm text-emerald-100 font-medium">Total Students</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                  <CardContent className="p-4 sm:p-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <FolderKanban className="w-8 h-8 text-blue-100 opacity-80" />
                        <GitBranch className="w-4 h-4 text-blue-200" />
                      </div>
                      <div>
                        <p className="text-2xl sm:text-3xl font-bold">{mockData.stats.activeProjects}</p>
                        <p className="text-xs sm:text-sm text-blue-100 font-medium">Active Projects</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                  <CardContent className="p-4 sm:p-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Clock className="w-8 h-8 text-orange-100 opacity-80" />
                        <Zap className="w-4 h-4 text-orange-200" />
                      </div>
                      <div>
                        <p className="text-2xl sm:text-3xl font-bold">{mockData.stats.pendingReviews}</p>
                        <p className="text-xs sm:text-sm text-orange-100 font-medium">Pending Reviews</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 text-white border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                  <CardContent className="p-4 sm:p-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Video className="w-8 h-8 text-purple-100 opacity-80" />
                        <Calendar className="w-4 h-4 text-purple-200" />
                      </div>
                      <div>
                        <p className="text-2xl sm:text-3xl font-bold">{mockData.stats.upcomingMeetings}</p>
                        <p className="text-xs sm:text-sm text-purple-100 font-medium">Upcoming Meetings</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* My Courses */}
                <Card className="border-none shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                        <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      My Courses This Semester
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {mockData.courses.map((course) => (
                      <div key={course.id} className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border border-indigo-200 dark:border-indigo-800 hover:shadow-md transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{course.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{course.code} • {course.students} students</p>
                          </div>
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-0">
                            Active
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={course.progress} className="flex-1 h-2" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{course.progress}%</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Recent Activities */}
                <Card className="border-none shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                        <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      Recent Activities
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {mockData.recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm text-gray-900 dark:text-white">{activity.action}</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{activity.course} • {activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Student Projects & Pending Tasks */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Student Projects */}
                <Card className="border-none shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <FolderKanban className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      Student Projects
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {mockData.projects.map((project) => (
                      <div key={project.id} className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{project.name}</h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              Team: {project.students.join(', ')}
                            </p>
                          </div>
                          <Badge className={
                            project.status === 'On Track' ? 'bg-green-500' : 
                            project.status === 'Review Needed' ? 'bg-yellow-500' : 'bg-blue-500'
                          }>
                            {project.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <Progress value={project.progress} className="flex-1 h-2" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{project.progress}%</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Pending Tasks */}
                <Card className="border-none shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                        <ListTodo className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      Pending Tasks
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {mockData.pendingTasks.map((task) => (
                      <div key={task.id} className="p-4 rounded-lg bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200 dark:border-orange-800">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{task.type}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{task.course}</p>
                          </div>
                          <Badge variant="outline" className={
                            task.priority === 'high' ? 'border-red-300 text-red-700 dark:border-red-700 dark:text-red-400' :
                            'border-yellow-300 text-yellow-700 dark:border-yellow-700 dark:text-yellow-400'
                          }>
                            {task.count} items
                          </Badge>
                        </div>
                        <Button size="sm" className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600">
                          Review Now
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {user?.role === 'department_admin' && mockData && 'departmentMetrics' in mockData && (
            <div className="space-y-6">
              {/* Admin Stats Overview */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                <Card className="bg-gradient-to-br from-slate-500 via-slate-600 to-slate-700 text-white border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                  <CardContent className="p-4 sm:p-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Users className="w-8 h-8 text-slate-100 opacity-80" />
                        <TrendingUp className="w-4 h-4 text-slate-200" />
                      </div>
                      <div>
                        <p className="text-2xl sm:text-3xl font-bold">{mockData.stats.totalStudents}</p>
                        <p className="text-xs sm:text-sm text-slate-100 font-medium">Total Students</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-teal-500 via-teal-600 to-teal-700 text-white border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                  <CardContent className="p-4 sm:p-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <UserCheck className="w-8 h-8 text-teal-100 opacity-80" />
                        <Sparkles className="w-4 h-4 text-teal-200" />
                      </div>
                      <div>
                        <p className="text-2xl sm:text-3xl font-bold">{mockData.stats.totalFaculty}</p>
                        <p className="text-xs sm:text-sm text-teal-100 font-medium">Faculty Members</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700 text-white border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                  <CardContent className="p-4 sm:p-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <BookOpen className="w-8 h-8 text-indigo-100 opacity-80" />
                        <Activity className="w-4 h-4 text-indigo-200" />
                      </div>
                      <div>
                        <p className="text-2xl sm:text-3xl font-bold">{mockData.stats.activeCourses}</p>
                        <p className="text-xs sm:text-sm text-indigo-100 font-medium">Active Courses</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 text-white border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                  <CardContent className="p-4 sm:p-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <FolderKanban className="w-8 h-8 text-emerald-100 opacity-80" />
                        <GitBranch className="w-4 h-4 text-emerald-200" />
                      </div>
                      <div>
                        <p className="text-2xl sm:text-3xl font-bold">{mockData.stats.activeProjects}</p>
                        <p className="text-xs sm:text-sm text-emerald-100 font-medium">Active Projects</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 text-white border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                  <CardContent className="p-4 sm:p-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Target className="w-8 h-8 text-purple-100 opacity-80" />
                        <Zap className="w-4 h-4 text-purple-200" />
                      </div>
                      <div>
                        <p className="text-2xl sm:text-3xl font-bold">{mockData.stats.avgPerformance}%</p>
                        <p className="text-xs sm:text-sm text-purple-100 font-medium">Avg Performance</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Department Metrics & Recent Announcements */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Department Metrics */}
                <Card className="border-none shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <PieChart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      Department Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {mockData.departmentMetrics.map((metric, index) => (
                      <div key={index} className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900 dark:text-white">{metric.name}</span>
                          <Badge className={
                            metric.trend === 'up' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                            metric.trend === 'down' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                            'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
                          }>
                            {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'} {metric.value}%
                          </Badge>
                        </div>
                        <Progress value={metric.value} className="h-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Recent Announcements */}
                <Card className="border-none shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                        <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      Recent Announcements
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {mockData.recentAnnouncements.map((announcement) => (
                      <div key={announcement.id} className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800">
                        <div className={`mt-1 w-2 h-2 rounded-full ${
                          announcement.type === 'Job' ? 'bg-blue-500' :
                          announcement.type === 'Competition' ? 'bg-green-500' :
                          announcement.type === 'Achievement' ? 'bg-yellow-500' : 'bg-purple-500'
                        }`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">{announcement.type}</Badge>
                            <span className="text-xs text-gray-500">{announcement.date}</span>
                          </div>
                          <h4 className="font-medium text-sm text-gray-900 dark:text-white">{announcement.title}</h4>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Quick Management Tools */}
              <Card className="border-none shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
                      <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    Quick Management Tools
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {mockData.quickActions.map((action) => {
                      const IconComponent = action.icon;
                      const colorMap: Record<string, string> = {
                        blue: 'from-blue-500 to-blue-600',
                        green: 'from-green-500 to-green-600',
                        purple: 'from-purple-500 to-purple-600',
                        orange: 'from-orange-500 to-orange-600',
                      };
                      return (
                        <div key={action.id} className="group p-5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all hover:-translate-y-1">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorMap[action.color]} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{action.title}</h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">{action.description}</p>
                          <Button size="sm" variant="outline" className="w-full group-hover:bg-gray-200 dark:group-hover:bg-gray-600">
                            Open
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
