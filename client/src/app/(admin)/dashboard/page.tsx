"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Axios } from "@/config/axios";
import useAuthStore from "@/store/store";
import {
  Activity,
  Award,
  BookOpen,
  Brain,
  Calendar,
  Flame,
  Gamepad2,
  Lightbulb,
  Rocket,
  Target,
  TrendingUp
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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
  score: number;
  level: number;
  completedAt: string;
  duration: number; // seconds
}

interface CognitiveScore {
  assessmentId: string;
  weightedScore: number; // percent
  stressScore: number; // 0-100
  attentionScore: number; // 0-100
  cognitiveScore: number; // 0-100 (display as Personal Trait)
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
      const mockData = {
        recentQuizzes: recentQuizzesData,
        gameResults: [
          {
            gameId: "g1",
            gameName: "Color Match",
            score: 1250,
            level: 8,
            completedAt: new Date().toISOString(),
            duration: 180
          },
          {
            gameId: "g2",
            gameName: "Memory Challenge",
            score: 950,
            level: 6,
            completedAt: new Date(Date.now() - 43200000).toISOString(),
            duration: 150
          },
          {
            gameId: "g3",
            gameName: "Pattern Recognition",
            score: 1100,
            level: 7,
            completedAt: new Date(Date.now() - 86400000).toISOString(),
            duration: 200
          },
          {
            gameId: "g4",
            gameName: "Speed Math",
            score: 1400,
            level: 9,
            completedAt: new Date(Date.now() - 172800000).toISOString(),
            duration: 210
          },
          {
            gameId: "g5",
            gameName: "Focus Dash",
            score: 1020,
            level: 6,
            completedAt: new Date(Date.now() - 259200000).toISOString(),
            duration: 160
          }
        ],
        cognitiveScores: [
          {
            assessmentId: "c1",
            weightedScore: 87.5,
            stressScore: 25,
            attentionScore: 88,
            cognitiveScore: 85,
            createdAt: new Date().toISOString()
          },
          {
            assessmentId: "c2",
            weightedScore: 82.3,
            stressScore: 35,
            attentionScore: 82,
            cognitiveScore: 80,
            createdAt: new Date(Date.now() - 86400000).toISOString()
          },
          {
            assessmentId: "c3",
            weightedScore: 84.1,
            stressScore: 28,
            attentionScore: 86,
            cognitiveScore: 83,
            createdAt: new Date(Date.now() - 172800000).toISOString()
          }
        ],
        courses: subjectsProgressData.map((subject: any) => ({
          courseId: subject.subjectId,
          courseName: subject.subjectName,
          progress: subject.progressPercentage,
          enrolledAt: subject.enrolledAt,
          totalLessons: subject.totalTopics,
          completedLessons: subject.completedTopics,
          level: subject.level
        })),
        stats: statsData
      };
      setDashboardData(mockData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 dark:text-green-400";
    if (score >= 75) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getCognitiveScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const handleContinueLearning = (subjectName: string) => {
    const encodedName = subjectName.toLowerCase().replace(/\s+/g, '-');
    router.push(`/subjects/${encodedName}`);
  };

  // Derived chart data
  const quizTrendData = useMemo(() => {
    return dashboardData.recentQuizzes
      .slice()
      .reverse()
      .map((q, idx) => ({
        name: `Q${dashboardData.recentQuizzes.length - idx}`,
        score: q.score,
        correct: Math.round((q.score / 100) * q.totalMarks),
        total: q.totalMarks,
      }));
  }, [dashboardData.recentQuizzes]);

  const gameScoresData = useMemo(() => {
    return dashboardData.gameResults.map(g => ({ name: g.gameName, score: g.score }));
  }, [dashboardData.gameResults]);

  const courseProgressData = useMemo(() => {
    return dashboardData.courses.map(c => ({ name: c.courseName, progress: c.progress }));
  }, [dashboardData.courses]);

  const latestTraits = dashboardData.cognitiveScores[0];
  const traitPieData = latestTraits
    ? [
        { name: "Stress", value: latestTraits.stressScore, color: "#ef4444" },
        { name: "Attention", value: latestTraits.attentionScore, color: "#10b981" },
        { name: "Personal Trait", value: latestTraits.cognitiveScore, color: "#6366f1" },
      ]
    : [];

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <div className="space-y-6">
            {/* Welcome Header Skeleton */}
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-8 w-80" />
                <Skeleton className="h-5 w-64" />
              </div>
              <Skeleton className="h-6 w-32" />
            </div>

            {/* Stats Overview Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-8 w-12" />
                      </div>
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Tabs Skeleton */}
            <div className="space-y-6">
              <div className="flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
                <div className="grid w-full grid-cols-4 gap-1">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              </div>

              {/* Main Content Skeleton */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Quiz Results Skeleton */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-5" />
                      <Skeleton className="h-6 w-40" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-24" />
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                        <div className="text-right space-y-2">
                          <Skeleton className="h-8 w-12" />
                          <Skeleton className="h-3 w-8" />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Chart Skeleton */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-5" />
                      <Skeleton className="h-6 w-32" />
                    </div>
                  </CardHeader>
                  <CardContent className="h-64">
                    <Skeleton className="h-full w-full" />
                  </CardContent>
                </Card>
              </div>

              {/* Second Row Skeleton */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-5" />
                      <Skeleton className="h-6 w-40" />
                    </div>
                  </CardHeader>
                  <CardContent className="h-64">
                    <Skeleton className="h-full w-full" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-5" />
                      <Skeleton className="h-6 w-44" />
                    </div>
                  </CardHeader>
                  <CardContent className="h-64">
                    <Skeleton className="h-full w-full" />
                  </CardContent>
                </Card>
              </div>
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
                Welcome back, {user?.firstName || 'Student'}! 👋
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Here's your learning progress and achievements
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



          {/* Main Dashboard Content */}
          <Tabs defaultValue="overview" className="space-y-6">


            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Quiz Results */}



              </div>



              {/* Additional Enhancement Sections */}
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

              {/* Study Plan & Recommendations */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-indigo-500" />
                      Today's Study Plan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                        <span className="text-sm">Complete Machine Learning Quiz</span>
                      </div>
                      <Badge variant="secondary">09:00 AM</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Review Data Structures</span>
                      </div>
                      <Badge variant="secondary">02:00 PM</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm">Cognitive Training Game</span>
                      </div>
                      <Badge variant="secondary">06:00 PM</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-purple-500" />
                      AI Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-sm font-medium mb-1">Focus Area: Algorithms</div>
                      <div className="text-xs text-gray-600">You scored 65% on recent algorithm quizzes. Try more practice problems.</div>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-sm font-medium mb-1">Study Time Optimization</div>
                      <div className="text-xs text-gray-600">Your peak learning time is 9-11 AM. Schedule difficult topics then.</div>
                    </div>
                    <div className="p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                      <div className="text-sm font-medium mb-1">Memory Retention</div>
                      <div className="text-xs text-gray-600">Try spaced repetition for better long-term retention.</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="traits" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Traits over time */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-orange-600" />
                      Personal Traits Over Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dashboardData.cognitiveScores.slice().reverse()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={(d) => new Date((d as any).createdAt).toLocaleDateString()} />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="attentionScore" stroke="#22c55e" name="Attention" strokeWidth={2} />
                        <Line type="monotone" dataKey="cognitiveScore" stroke="#6366f1" name="Personal Trait" strokeWidth={2} />
                        <Line type="monotone" dataKey="weightedScore" stroke="#f59e0b" name="Weighted Score" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Traits Pie */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-pink-600" />
                      Latest Traits Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip />
                        <Legend />
                        <Pie data={traitPieData} dataKey="value" nameKey="name" outerRadius={80} label>
                          {traitPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Enhanced Personal Traits Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Cognitive Health Score */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-teal-600" />
                      Cognitive Health
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-teal-600 mb-2">85%</div>
                      <Progress value={85} className="mb-3" />
                      <div className="text-sm text-gray-600">Overall Brain Fitness</div>
                      <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                        <div className="p-2 bg-teal-50 dark:bg-teal-900/20 rounded">
                          <div className="font-medium">Memory</div>
                          <div className="text-teal-600">92%</div>
                        </div>
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                          <div className="font-medium">Focus</div>
                          <div className="text-blue-600">78%</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Learning Style */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-purple-600" />
                      Learning Style
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Visual</span>
                        <div className="flex items-center gap-2">
                          <Progress value={85} className="w-16" />
                          <span className="text-sm font-medium">85%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Auditory</span>
                        <div className="flex items-center gap-2">
                          <Progress value={60} className="w-16" />
                          <span className="text-sm font-medium">60%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Kinesthetic</span>
                        <div className="flex items-center gap-2">
                          <Progress value={72} className="w-16" />
                          <span className="text-sm font-medium">72%</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 p-2 bg-purple-50 dark:bg-purple-900/20 rounded text-xs">
                      <strong>Recommendation:</strong> Use visual aids and diagrams for better learning
                    </div>
                  </CardContent>
                </Card>

                {/* Mood & Energy */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-green-600" />
                      Mood & Energy
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-center">
                        <div className="text-2xl mb-2">😊</div>
                        <div className="text-lg font-semibold text-green-600">Good</div>
                        <div className="text-xs text-gray-500">Current mood level</div>
                      </div>
                      <Separator />
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Energy Level</span>
                          <span className="font-medium text-green-600">High</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Stress Level</span>
                          <span className="font-medium text-yellow-600">Moderate</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Focus Time</span>
                          <span className="font-medium text-blue-600">45 min</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="games" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gamepad2 className="w-5 h-5 text-purple-600" />
                    Game Statistics & Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{dashboardData.gameResults.length}</div>
                      <div className="text-sm text-purple-600">Games Played</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{Math.max(...dashboardData.gameResults.map(g => g.score))}</div>
                      <div className="text-sm text-green-600">Best Score</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{Math.max(...dashboardData.gameResults.map(g => g.level))}</div>
                      <div className="text-sm text-blue-600">Highest Level</div>
                    </div>
                  </div>

                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={gameScoresData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="score" fill="#a78bfa" name="Score" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Game Achievements & Challenges */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Award className="w-5 h-5 text-yellow-600" />
                          Game Achievements
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">🎯</div>
                            <div>
                              <div className="font-medium text-sm">Perfect Score</div>
                              <div className="text-xs text-gray-500">Achieved maximum score in Color Match</div>
                            </div>
                          </div>
                          <Badge variant="secondary">New!</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">⚡</div>
                            <div>
                              <div className="font-medium text-sm">Speed Runner</div>
                              <div className="text-xs text-gray-500">Completed maze in under 30 seconds</div>
                            </div>
                          </div>
                          <Badge variant="outline">Earned</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">🧠</div>
                            <div>
                              <div className="font-medium text-sm">Brain Master</div>
                              <div className="text-xs text-gray-500">Improved cognitive score by 20%</div>
                            </div>
                          </div>
                          <Badge variant="outline">Earned</Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="w-5 h-5 text-blue-600" />
                          Daily Challenges
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div>
                            <div className="font-medium text-sm">Memory Challenge</div>
                            <div className="text-xs text-gray-500">Remember 8+ sequences</div>
                            <Progress value={75} className="w-20 h-2 mt-2" />
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-blue-600">6/8</div>
                            <div className="text-xs text-gray-500">Progress</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div>
                            <div className="font-medium text-sm">Reaction Time</div>
                            <div className="text-xs text-gray-500">React in under 300ms</div>
                            <Progress value={100} className="w-20 h-2 mt-2" />
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">✓</div>
                            <div className="text-xs text-gray-500">Complete</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium text-sm">Focus Training</div>
                            <div className="text-xs text-gray-500">30 minutes of focus</div>
                            <Progress value={0} className="w-20 h-2 mt-2" />
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-400">0/30</div>
                            <div className="text-xs text-gray-500">Pending</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="courses" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    Enrolled Courses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {dashboardData.courses.map((course) => (
                      <div key={course.courseId} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">{course.courseName}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Enrolled {new Date(course.enrolledAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant={course.progress > 50 ? "default" : "secondary"}>
                            {course.progress}%
                          </Badge>
                        </div>

                        <div className="space-y-3">
                          <Progress value={course.progress} className="h-2" />

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              {course.completedLessons} of {course.totalLessons} lessons
                            </span>
                            <span className="font-medium">
                              {course.totalLessons - course.completedLessons} remaining
                            </span>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => handleContinueLearning(course.courseName)}
                          >
                            Continue Learning
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Courses Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Course Analytics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                      Learning Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-emerald-600">4.2h</div>
                        <div className="text-xs text-gray-600">Weekly Study Time</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">87%</div>
                        <div className="text-xs text-gray-600">Completion Rate</div>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Most Active Day</span>
                        <Badge variant="outline">Tuesday</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Preferred Study Time</span>
                        <Badge variant="outline">Morning</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Learning Streak</span>
                        <Badge variant="outline">12 days</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Upcoming Deadlines */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-red-600" />
                      Upcoming Deadlines
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <div>
                        <div className="font-medium text-sm">Machine Learning Assignment</div>
                        <div className="text-xs text-gray-500">Neural Networks Project</div>
                      </div>
                      <Badge variant="destructive">2 days</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <div>
                        <div className="font-medium text-sm">Database Systems Quiz</div>
                        <div className="text-xs text-gray-500">SQL Optimization</div>
                      </div>
                      <Badge variant="secondary">5 days</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div>
                        <div className="font-medium text-sm">Algorithms Mid-term</div>
                        <div className="text-xs text-gray-500">Dynamic Programming</div>
                      </div>
                      <Badge variant="outline">1 week</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Study Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-600" />
                    Smart Study Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
                      <div className="text-2xl mb-2">🎯</div>
                      <div className="font-semibold text-sm mb-1">Focus Session</div>
                      <div className="text-xs text-gray-600 mb-3">Review Machine Learning concepts you scored low on</div>
                      <Button size="sm" variant="outline" className="w-full">Start Now</Button>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
                      <div className="text-2xl mb-2">📚</div>
                      <div className="font-semibold text-sm mb-1">Practice Problems</div>
                      <div className="text-xs text-gray-600 mb-3">Solve 5 algorithm problems to improve understanding</div>
                      <Button size="sm" variant="outline" className="w-full">Practice</Button>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                      <div className="text-2xl mb-2">🤝</div>
                      <div className="font-semibold text-sm mb-1">Study Group</div>
                      <div className="text-xs text-gray-600 mb-3">Join a study session for Database Systems</div>
                      <Button size="sm" variant="outline" className="w-full">Join Group</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
