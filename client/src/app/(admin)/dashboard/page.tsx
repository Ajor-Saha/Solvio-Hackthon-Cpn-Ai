"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs } from "@/components/ui/tabs";
import { Axios } from "@/config/axios";
import useAuthStore from "@/store/store";
import {
  Activity,
  Award,
  BookOpen,
  Brain,
  Calendar,
  Clock,
  FileText,
  Flame,
  Gamepad2,
  GraduationCap,
  Lightbulb,
  PieChart,
  Rocket,
  Target,
  TrendingUp,
  UserCheck,
  Users
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface QuizResult {
  resultId: string;
  quizId: string;
  score: number; // percent 0-100
  totalMarks: number; // total questions
  timeTaken: number; // seconds
  completedAt: string;
  subject: {
    name: string;
  };
  topic: {
    title: string;
  };
}

interface GameResult {
  gameId: string;
  gameName: string;
  score: number
  level: number;
  completedAt: string;
}

interface CognitiveScore {
  cognitiveScore: number;
  attentionScore: number;
  weightedScore: number;
  createdAt: string;
}

interface Course {
  courseId: string;
  courseName: string;
  progress: number; // percent
  enrolledAt: string;
  totalLessons: number;
  completedLessons: number;
  level: string; // beginner, intermediate, advanced
}

export default function DashboardClient() {
  const { accessToken, user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    recentQuizzes: [] as QuizResult[],
    gameResults: [] as GameResult[],
    cognitiveScores: [] as CognitiveScore[],
    courses: [] as Course[],
    stats: {
      totalQuizzes: 0,
      avgQuizScore: 0,
      totalGamesPlayed: 0,
      avgCognitiveScore: 0,
      coursesEnrolled: 0,
    }
  });

  useEffect(() => {
    if (accessToken) {
      fetchDashboardData();
    }
  }, [accessToken]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch real dashboard statistics, recent quizzes, and subjects with progress in parallel
      const [statsResponse, recentQuizzesResponse, subjectsProgressResponse] = await Promise.all([
        Axios.get('/api/dashboard/stats', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }),
        Axios.get('/api/dashboard/recent-quizzes', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }),
        Axios.get('/api/dashboard/subjects-progress', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }),
      ]);

      const statsData = statsResponse.data.success ? statsResponse.data.data : {
        totalQuizzes: 0,
        avgQuizScore: 0,
        totalGamesPlayed: 0,
        avgCognitiveScore: 0,
        coursesEnrolled: 0,
      };

      const recentQuizzesData = recentQuizzesResponse.data.success
        ? recentQuizzesResponse.data.data
        : [];

      const subjectsProgressData = subjectsProgressResponse.data.success
        ? subjectsProgressResponse.data.data
        : [];

      // Mock data for other sections (to be replaced with real APIs later)
      const mockGameResults: GameResult[] = [
        {
          gameId: "1",
          gameName: "Color Match",
          score: 85,
          level: 3,
          completedAt: new Date().toISOString(),
        },
        {
          gameId: "2",
          gameName: "Maze Escape",
          score: 92,
          level: 5,
          completedAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ];

      const mockCognitiveScores: CognitiveScore[] = [
        {
          cognitiveScore: 78,
          attentionScore: 85,
          weightedScore: 82,
          createdAt: new Date().toISOString(),
        },
        {
          cognitiveScore: 75,
          attentionScore: 80,
          weightedScore: 78,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ];

      const mockCourses: Course[] = subjectsProgressData.map((subject: any, index: number) => ({
        courseId: subject.subjectId || `course-${index}`,
        courseName: subject.subjectName || `Course ${index + 1}`,
        progress: Math.floor(Math.random() * 100),
        enrolledAt: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(),
        totalLessons: Math.floor(Math.random() * 20) + 10,
        completedLessons: Math.floor(Math.random() * 15) + 5,
        level: ["beginner", "intermediate", "advanced"][Math.floor(Math.random() * 3)],
      }));

      setDashboardData({
        recentQuizzes: recentQuizzesData,
        gameResults: mockGameResults,
        cognitiveScores: mockCognitiveScores,
        courses: mockCourses,
        stats: statsData,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const handleContinueLearning = (courseName: string) => {
    toast.info(`Continuing with ${courseName}...`);
    // Add navigation logic here
  };

  // Mock data for charts
  const quizTrendData = useMemo(() => {
    return dashboardData.recentQuizzes.slice(0, 5).map((quiz, index) => ({
      name: `Quiz ${index + 1}`,
      score: quiz.score,
      correct: Math.round((quiz.score / 100) * quiz.totalMarks),
      total: quiz.totalMarks,
    }));
  }, [dashboardData.recentQuizzes]);

  const courseProgressData = useMemo(() => {
    return dashboardData.courses.slice(0, 5).map((course) => ({
      name: course.courseName.length > 15
        ? course.courseName.substring(0, 15) + '...'
        : course.courseName,
      progress: course.progress,
    }));
  }, [dashboardData.courses]);

  const traitPieData = useMemo(() => {
    const latestScore = dashboardData.cognitiveScores[0];
    if (!latestScore) return [];

    return [
      { name: 'Cognitive', value: latestScore.cognitiveScore, color: '#6366f1' },
      { name: 'Attention', value: latestScore.attentionScore, color: '#22c55e' },
      { name: 'Weighted', value: latestScore.weightedScore, color: '#f59e0b' },
    ];
  }, [dashboardData.cognitiveScores]);

  const gameScoresData = useMemo(() => {
    return dashboardData.gameResults.map((game) => ({
      name: game.gameName.length > 10
        ? game.gameName.substring(0, 10) + '...'
        : game.gameName,
      score: game.score,
    }));
  }, [dashboardData.gameResults]);

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <div className="space-y-6">
            {/* Loading Header */}
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96" />
              </div>
              <Skeleton className="h-6 w-32" />
            </div>

            {/* Loading Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-6 w-8" />
                      </div>
                      <Skeleton className="h-8 w-8 rounded" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Loading Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                        <Skeleton className="h-6 w-12" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-64 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="space-y-6">
          {/* Welcome Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Welcome back, {user?.firstName || 'User'}! 👋
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {user?.role === 'student' && "Here's your learning progress and achievements"}
                {user?.role === 'faculty' && "Manage your courses, students, and academic activities"}
                {user?.role === 'department_admin' && "Oversee department operations and analytics"}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>

          {/* Role-Specific Dashboard Content */}
          {user?.role === 'student' && (
            <Tabs defaultValue="overview" className="space-y-6">
              {/* Student Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm">Total Quizzes</p>
                        <p className="text-2xl font-bold">{dashboardData.stats.totalQuizzes}</p>
                      </div>
                      <BookOpen className="w-8 h-8 text-blue-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm">Avg Quiz Score</p>
                        <p className="text-2xl font-bold">{dashboardData.stats.avgQuizScore}%</p>
                      </div>
                      <Target className="w-8 h-8 text-green-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm">Games Played</p>
                        <p className="text-2xl font-bold">{dashboardData.stats.totalGamesPlayed}</p>
                      </div>
                      <Gamepad2 className="w-8 h-8 text-purple-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100 text-sm">Personal Trait</p>
                        <p className="text-2xl font-bold">{dashboardData.stats.avgCognitiveScore}</p>
                      </div>
                      <Brain className="w-8 h-8 text-orange-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-pink-100 text-sm">Courses</p>
                        <p className="text-2xl font-bold">{dashboardData.stats.coursesEnrolled}</p>
                      </div>
                      <BookOpen className="w-8 h-8 text-pink-200" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Student-specific content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Study Streak */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Flame className="w-5 h-5 text-orange-500" />
                      Study Streak
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-600">7</div>
                      <div className="text-sm text-gray-500">Days in a row</div>
                      <div className="flex justify-center gap-1 mt-3">
                        {[1,2,3,4,5,6,7].map(day => (
                          <div key={day} className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {day}
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-gray-400 mt-2">Keep it up! 🔥</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Rocket className="w-5 h-5 text-blue-500" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                      <BookOpen className="w-4 h-4" /> Start Quiz
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                      <Brain className="w-4 h-4" /> Play Cognitive Game
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                      <Target className="w-4 h-4" /> Set Study Goal
                    </Button>
                  </CardContent>
                </Card>

                {/* Achievements */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-yellow-500" />
                      Recent Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white">
                        🏆
                      </div>
                      <div>
                        <div className="text-sm font-medium">Quiz Master</div>
                        <div className="text-xs text-gray-500">10 quizzes completed</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                        ⚡
                      </div>
                      <div>
                        <div className="text-sm font-medium">Speed Learner</div>
                        <div className="text-xs text-gray-500">Fast completion streak</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </Tabs>
          )}

          {user?.role === 'faculty' && (
            <div className="space-y-6">
              {/* Faculty Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-indigo-100 text-sm">My Courses</p>
                        <p className="text-2xl font-bold">6</p>
                      </div>
                      <BookOpen className="w-8 h-8 text-indigo-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-emerald-100 text-sm">Total Students</p>
                        <p className="text-2xl font-bold">142</p>
                      </div>
                      <Users className="w-8 h-8 text-emerald-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm">Assignments</p>
                        <p className="text-2xl font-bold">23</p>
                      </div>
                      <FileText className="w-8 h-8 text-blue-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm">Avg Grade</p>
                        <p className="text-2xl font-bold">B+</p>
                      </div>
                      <GraduationCap className="w-8 h-8 text-purple-200" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Faculty-specific content */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* My Courses */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      My Courses This Semester
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div>
                        <div className="font-medium text-sm">Data Structures & Algorithms</div>
                        <div className="text-xs text-gray-500">CSE-201 • 45 students</div>
                      </div>
                      <Badge variant="outline">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div>
                        <div className="font-medium text-sm">Database Management Systems</div>
                        <div className="text-xs text-gray-500">CSE-301 • 38 students</div>
                      </div>
                      <Badge variant="outline">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div>
                        <div className="font-medium text-sm">Software Engineering</div>
                        <div className="text-xs text-gray-500">CSE-401 • 32 students</div>
                      </div>
                      <Badge variant="outline">Active</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activities */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-green-600" />
                      Recent Activities
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <div className="text-sm font-medium">Assignment graded</div>
                        <div className="text-xs text-gray-500">CSE-301 Database Project • 2 hours ago</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <div className="text-sm font-medium">New quiz created</div>
                        <div className="text-xs text-gray-500">CSE-201 Sorting Algorithms • 5 hours ago</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                      <div>
                        <div className="text-sm font-medium">Class attendance marked</div>
                        <div className="text-xs text-gray-500">CSE-401 Software Testing • Yesterday</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Pending Tasks */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-600" />
                    Pending Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <div className="text-2xl mb-2">📝</div>
                      <div className="font-semibold text-sm mb-1">Grade Assignments</div>
                      <div className="text-xs text-gray-600 mb-3">12 assignments pending review</div>
                      <Button size="sm" variant="outline" className="w-full">Review Now</Button>
                    </div>
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <div className="text-2xl mb-2">📊</div>
                      <div className="font-semibold text-sm mb-1">Update Attendance</div>
                      <div className="text-xs text-gray-600 mb-3">Mark attendance for 3 classes</div>
                      <Button size="sm" variant="outline" className="w-full">Update</Button>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-2xl mb-2">📚</div>
                      <div className="font-semibold text-sm mb-1">Prepare Materials</div>
                      <div className="text-xs text-gray-600 mb-3">Upload resources for next week</div>
                      <Button size="sm" variant="outline" className="w-full">Prepare</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {user?.role === 'department_admin' && (
            <div className="space-y-6">
              {/* Admin Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card className="bg-gradient-to-br from-slate-500 to-slate-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-100 text-sm">Total Students</p>
                        <p className="text-2xl font-bold">1,247</p>
                      </div>
                      <Users className="w-8 h-8 text-slate-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-teal-100 text-sm">Faculty Members</p>
                        <p className="text-2xl font-bold">48</p>
                      </div>
                      <UserCheck className="w-8 h-8 text-teal-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-indigo-100 text-sm">Active Courses</p>
                        <p className="text-2xl font-bold">156</p>
                      </div>
                      <BookOpen className="w-8 h-8 text-indigo-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-emerald-100 text-sm">Avg Performance</p>
                        <p className="text-2xl font-bold">87%</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-emerald-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm">Announcements</p>
                        <p className="text-2xl font-bold">23</p>
                      </div>
                      <FileText className="w-8 h-8 text-purple-200" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Admin-specific content */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Department Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-blue-600" />
                      Department Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Student Enrollment</span>
                      <div className="flex items-center gap-2">
                        <Progress value={92} className="w-20" />
                        <span className="text-sm font-medium">92%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Faculty Utilization</span>
                      <div className="flex items-center gap-2">
                        <Progress value={85} className="w-20" />
                        <span className="text-sm font-medium">85%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Course Completion</span>
                      <div className="flex items-center gap-2">
                        <Progress value={78} className="w-20" />
                        <span className="text-sm font-medium">78%</span>
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-lg font-bold text-blue-600">4.2</div>
                        <div className="text-xs text-gray-600">Avg GPA</div>
                      </div>
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-lg font-bold text-green-600">96%</div>
                        <div className="text-xs text-gray-600">Pass Rate</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Administrative Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-green-600" />
                      Recent Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <div className="text-sm font-medium">New faculty onboarded</div>
                        <div className="text-xs text-gray-500">Dr. Sarah Ahmed joined CSE dept • 2 hours ago</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <div className="text-sm font-medium">Course schedule updated</div>
                        <div className="text-xs text-gray-500">Spring 2024 timetable finalized • 5 hours ago</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                      <div>
                        <div className="text-sm font-medium">Budget approval</div>
                        <div className="text-xs text-gray-500">Lab equipment purchase approved • Yesterday</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                      <div>
                        <div className="text-sm font-medium">Announcement published</div>
                        <div className="text-xs text-gray-500">Semester exam schedule released • 2 days ago</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Management Tools */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-600" />
                    Quick Management Tools
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                      <div className="text-2xl mb-2">👥</div>
                      <div className="font-semibold text-sm mb-1">Manage Users</div>
                      <div className="text-xs text-gray-600 mb-3">Add/edit students and faculty</div>
                      <Button size="sm" variant="outline" className="w-full">Manage</Button>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
                      <div className="text-2xl mb-2">📚</div>
                      <div className="font-semibold text-sm mb-1">Course Setup</div>
                      <div className="text-xs text-gray-600 mb-3">Create and manage courses</div>
                      <Button size="sm" variant="outline" className="w-full">Setup</Button>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
                      <div className="text-2xl mb-2">📊</div>
                      <div className="font-semibold text-sm mb-1">Analytics</div>
                      <div className="text-xs text-gray-600 mb-3">View detailed reports</div>
                      <Button size="sm" variant="outline" className="w-full">View Reports</Button>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg">
                      <div className="text-2xl mb-2">📢</div>
                      <div className="font-semibold text-sm mb-1">Announcements</div>
                      <div className="text-xs text-gray-600 mb-3">Post department updates</div>
                      <Button size="sm" variant="outline" className="w-full">Create</Button>
                    </div>
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
