"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import useAuthStore from "@/store/store";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  ExternalLink,
  FileText,
  GraduationCap,
  Link as LinkIcon,
  Mail,
  PlayCircle,
  Sparkles,
  User,
  Users,
  XCircle,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Student {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string | null;
  joinedAt: string;
}

interface ResearchDetail {
  researchId: string;
  courseId: string;
  title: string;
  description: string | null;
  supervisorId: string;
  supervisorFirstName: string;
  supervisorLastName: string;
  supervisorEmail: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  publicationUrl: string | null;
  createdAt: string;
  updatedAt: string | null;
  students: Student[];
}

export default function ResearchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, accessToken } = useAuthStore();
  const researchId = params.researchId as string;

  const [research, setResearch] = useState<ResearchDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchResearchDetails = async () => {
    try {
      setIsLoading(true);

      // Mock data for frontend prototype
      const mockResearch = {
        researchId: researchId,
        courseId: "course-1",
        title: "Deep Learning Applications in Natural Language Processing",
        description: "This research explores advanced deep learning architectures for natural language understanding, focusing on transformer models and their applications in sentiment analysis, machine translation, and text summarization. The study includes implementation of novel attention mechanisms and comparative analysis with existing state-of-the-art models.",
        supervisorId: "sup-1",
        supervisorFirstName: "Dr. Emily",
        supervisorLastName: "Chen",
        supervisorEmail: "emily.chen@university.edu",
        status: "ongoing",
        startDate: "2024-08-15",
        endDate: "2025-06-30",
        publicationUrl: "https://arxiv.org/abs/2024.xxxxx",
        createdAt: "2024-08-15T10:30:00Z",
        updatedAt: "2024-11-01T14:20:00Z",
        students: [
          {
            userId: "stu-1",
            firstName: "Michael",
            lastName: "Rodriguez",
            email: "michael.r@student.edu",
            role: "Lead Researcher",
            joinedAt: "2024-08-15T10:30:00Z",
          },
          {
            userId: "stu-2",
            firstName: "Priya",
            lastName: "Kumar",
            email: "priya.k@student.edu",
            role: "Data Analyst",
            joinedAt: "2024-08-15T10:30:00Z",
          },
          {
            userId: "stu-3",
            firstName: "David",
            lastName: "Martinez",
            email: "david.m@student.edu",
            role: "ML Engineer",
            joinedAt: "2024-08-20T09:15:00Z",
          },
        ],
      };

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      setResearch(mockResearch);

      // Uncomment below when backend is ready
      // const response = await Axios.get(`/api/research/${researchId}`, {
      //   headers: { Authorization: `Bearer ${accessToken}` },
      // });
      // if (response.data.success) {
      //   setResearch(response.data.data);
      // }
    } catch (error: any) {
      console.error("Error fetching research:", error);
      toast.error("Failed to load research details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (researchId && accessToken) {
      fetchResearchDetails();
    }
  }, [researchId, accessToken]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      proposed: { icon: FileText, color: "bg-blue-100 text-blue-700 border-blue-200", label: "Proposed" },
      ongoing: { icon: PlayCircle, color: "bg-amber-100 text-amber-700 border-amber-200", label: "Ongoing" },
      completed: { icon: CheckCircle, color: "bg-green-100 text-green-700 border-green-200", label: "Completed" },
      published: { icon: Sparkles, color: "bg-purple-100 text-purple-700 border-purple-200", label: "Published" },
      archived: { icon: XCircle, color: "bg-gray-100 text-gray-700 border-gray-200", label: "Archived" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.proposed;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`} variant="outline">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (date: string | null) => {
    if (!date) return "Not set";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Clock className="w-12 h-12 text-orange-600" />
        </motion.div>
      </div>
    );
  }

  if (!research) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <AlertCircle className="w-16 h-16 text-gray-400" />
        <h2 className="text-2xl font-bold text-gray-700">Research not found</h2>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6 hover:bg-orange-100 dark:hover:bg-orange-900/30"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Course
          </Button>

          <div className="flex items-start justify-between mb-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center"
                >
                  <GraduationCap className="w-8 h-8 text-white" />
                </motion.div>
                <div>
                  <motion.h1
                    className="text-4xl font-bold text-gray-900 dark:text-gray-100"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {research.title}
                  </motion.h1>
                  <div className="flex items-center gap-3 flex-wrap mt-2">
                    {getStatusBadge(research.status)}
                    <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Created {formatDate(research.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <motion.div
            className="lg:col-span-2 space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {/* Research Overview */}
            <Card className="border-2 border-orange-200 dark:border-orange-800 shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30">
                <CardTitle className="text-orange-900 dark:text-orange-100 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Research Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {research.description ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-lg">
                      {research.description}
                    </p>
                  </motion.div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">
                    No description provided
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Research Timeline */}
            <Card className="border-2 border-amber-200 dark:border-amber-800 shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30">
                <CardTitle className="text-amber-900 dark:text-amber-100 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Research Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <motion.div
                    className="flex flex-col p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Start Date
                    </span>
                    <span className="text-xl font-bold text-blue-700 dark:text-blue-400">
                      {formatDate(research.startDate)}
                    </span>
                  </motion.div>

                  <motion.div
                    className="flex flex-col p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      End Date
                    </span>
                    <span className="text-xl font-bold text-purple-700 dark:text-purple-400">
                      {formatDate(research.endDate)}
                    </span>
                  </motion.div>

                  {research.updatedAt && (
                    <motion.div
                      className="flex flex-col p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Last Updated
                      </span>
                      <span className="text-xl font-bold text-green-700 dark:text-green-400">
                        {formatDate(research.updatedAt)}
                      </span>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Publication */}
            {research.publicationUrl && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="border-2 border-purple-200 dark:border-purple-800 shadow-lg overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-fuchsia-50 dark:from-purple-900/30 dark:to-fuchsia-900/30">
                    <CardTitle className="text-purple-900 dark:text-purple-100 flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Publication
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-2">
                            <LinkIcon className="w-4 h-4" />
                            Publication Link
                          </span>
                          <a
                            href={research.publicationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 font-medium"
                          >
                            View Publication
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>

          {/* Sidebar */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            {/* Research Supervisor */}
            <Card className="border-2 border-red-200 dark:border-red-800 shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/30">
                <CardTitle className="text-red-900 dark:text-red-100 flex items-center gap-2 text-base">
                  <User className="w-5 h-5" />
                  Research Supervisor
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <motion.div
                  className="flex items-center gap-3"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {research.supervisorFirstName[0]}
                    {research.supervisorLastName[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-lg text-gray-900 dark:text-gray-100">
                      {research.supervisorFirstName} {research.supervisorLastName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
                      <Mail className="w-3 h-3" />
                      {research.supervisorEmail}
                    </p>
                  </div>
                </motion.div>
              </CardContent>
            </Card>

            {/* Research Team */}
            <Card className="border-2 border-teal-200 dark:border-teal-800 shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/30 dark:to-cyan-900/30">
                <CardTitle className="text-teal-900 dark:text-teal-100 flex items-center gap-2 text-base">
                  <Users className="w-5 h-5" />
                  Research Team ({research.students.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ScrollArea className="max-h-[500px]">
                  <div className="space-y-3">
                    {research.students.map((student, index) => (
                      <motion.div
                        key={student.userId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="group p-4 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-lg hover:shadow-md transition-all border border-transparent hover:border-teal-300 dark:hover:border-teal-700"
                      >
                        <div className="flex items-center gap-3">
                          <motion.div
                            className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-md"
                            whileHover={{ scale: 1.1 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            {student.firstName[0]}
                            {student.lastName[0]}
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-gray-100">
                              {student.firstName} {student.lastName}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 truncate flex items-center gap-1 mt-1">
                              <Mail className="w-3 h-3" />
                              {student.email}
                            </p>
                            {student.role && (
                              <Badge variant="outline" className="mt-2 text-xs bg-white dark:bg-gray-800">
                                {student.role}
                              </Badge>
                            )}
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              Joined {formatDate(student.joinedAt)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="border-2 border-indigo-200 dark:border-indigo-800 shadow-lg overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30">
                  <CardTitle className="text-indigo-900 dark:text-indigo-100 flex items-center gap-2 text-base">
                    <FileText className="w-5 h-5" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Team Size
                      </span>
                      <Badge className="bg-blue-600 text-white text-base px-3 py-1">
                        {research.students.length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Status
                      </span>
                      {getStatusBadge(research.status)}
                    </div>
                    {research.publicationUrl && (
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Publication
                        </span>
                        <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
