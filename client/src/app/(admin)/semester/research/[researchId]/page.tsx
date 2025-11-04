"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import useAuthStore from "@/store/store";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle,
  CheckCircle2,
  Circle,
  Clock,
  ExternalLink,
  FileText,
  GraduationCap,
  Hash,
  Link as LinkIcon,
  Loader2,
  Mail,
  PlayCircle,
  Plus,
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

interface Milestone {
  milestoneId: string;
  title: string;
  description: string | null;
  status: string;
  startDate: string | null;
  deadline: string | null;
  approvedAt: string | null;
  approvedBy: string | null;
  approverFirstName: string | null;
  approverLastName: string | null;
  blockchainHash: string | null;
  blockchainTxId: string | null;
  createdAt: string;
}

interface ResearchDetail {
  researchId: string;
  courseId: string;
  courseCode: string | null;
  semester: string | null;
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
  milestones: Milestone[];
}

export default function ResearchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, accessToken } = useAuthStore();
  const researchId = params.researchId as string;

  const [research, setResearch] = useState<ResearchDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddMilestoneOpen, setIsAddMilestoneOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add Milestone Form State
  const [newMilestone, setNewMilestone] = useState({
    title: "",
    description: "",
    startDate: "",
    deadline: "",
  });

  const fetchResearchDetails = async () => {
    try {
      setIsLoading(true);

      // Mock data for frontend prototype
      const mockResearch: ResearchDetail = {
        researchId: researchId,
        courseId: "course-1",
        courseCode: "CSE450",
        semester: "4/1",
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
        milestones: [
          {
            milestoneId: "m-1",
            title: "Research Problem Definition & Literature Review",
            description: "Identify research gaps, define problem statement, and conduct comprehensive literature survey",
            status: "approved",
            startDate: "2024-08-15",
            deadline: "2024-09-30",
            blockchainHash: "0x1234...abcd",
            blockchainTxId: "0xabc123...xyz789",
            approvedAt: "2024-09-28T16:30:00Z",
            approvedBy: "sup-1",
            approverFirstName: "Dr. Emily",
            approverLastName: "Chen",
            createdAt: "2024-08-15T10:00:00Z",
          },
          {
            milestoneId: "m-2",
            title: "Dataset Collection & Preprocessing",
            description: "Collect diverse NLP datasets, perform data cleaning, tokenization, and create splits",
            status: "approved",
            startDate: "2024-10-01",
            deadline: "2024-10-31",
            blockchainHash: "0x5678...efgh",
            blockchainTxId: "0xdef456...uvw012",
            approvedAt: "2024-10-30T10:15:00Z",
            approvedBy: "sup-1",
            approverFirstName: "Dr. Emily",
            approverLastName: "Chen",
            createdAt: "2024-10-01T08:00:00Z",
          },
          {
            milestoneId: "m-3",
            title: "Model Architecture Design & Implementation",
            description: "Design novel attention mechanisms, implement baseline and proposed models",
            status: "ready_for_review",
            startDate: "2024-11-01",
            deadline: "2024-12-31",
            blockchainHash: "0x9abc...ijkl",
            blockchainTxId: null,
            approvedAt: null,
            approvedBy: null,
            approverFirstName: null,
            approverLastName: null,
            createdAt: "2024-11-01T09:00:00Z",
          },
          {
            milestoneId: "m-4",
            title: "Evaluation & Benchmarking",
            description: "Evaluate models on multiple benchmarks and perform ablation studies",
            status: "in_progress",
            startDate: "2025-01-01",
            deadline: "2025-02-28",
            blockchainHash: null,
            blockchainTxId: null,
            approvedAt: null,
            approvedBy: null,
            approverFirstName: null,
            approverLastName: null,
            createdAt: "2024-11-01T09:00:00Z",
          },
          {
            milestoneId: "m-5",
            title: "Paper Writing & Publication",
            description: "Write research paper, submit to conference/journal, and address reviewer comments",
            status: "not_started",
            startDate: "2025-03-01",
            deadline: "2025-06-30",
            blockchainHash: null,
            blockchainTxId: null,
            approvedAt: null,
            approvedBy: null,
            approverFirstName: null,
            approverLastName: null,
            createdAt: "2024-11-01T09:00:00Z",
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

  const getMilestoneStatusBadge = (status: string) => {
    const statusConfig = {
      not_started: { icon: Circle, color: "bg-gray-100 text-gray-700", label: "Not Started" },
      in_progress: { icon: PlayCircle, color: "bg-blue-100 text-blue-700", label: "In Progress" },
      ready_for_review: { icon: Loader2, color: "bg-purple-100 text-purple-700", label: "Ready for Review" },
      approved: { icon: CheckCircle2, color: "bg-green-100 text-green-700", label: "Approved" },
      rejected: { icon: XCircle, color: "bg-red-100 text-red-700", label: "Rejected" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.not_started;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1 text-xs`} variant="outline">
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

  const handleAddMilestone = async () => {
    if (!newMilestone.title.trim()) {
      toast.error("Please enter a milestone title");
      return;
    }

    if (!newMilestone.startDate || !newMilestone.deadline) {
      toast.error("Please select both start date and deadline");
      return;
    }

    if (new Date(newMilestone.deadline) < new Date(newMilestone.startDate)) {
      toast.error("Deadline cannot be before start date");
      return;
    }

    try {
      setIsSubmitting(true);

      // Mock API call - Replace with actual API when backend is ready
      const mockNewMilestone: Milestone = {
        milestoneId: `m-${Date.now()}`,
        title: newMilestone.title,
        description: newMilestone.description || null,
        status: "not_started",
        startDate: newMilestone.startDate,
        deadline: newMilestone.deadline,
        blockchainHash: null,
        blockchainTxId: null,
        approvedAt: null,
        approvedBy: null,
        approverFirstName: null,
        approverLastName: null,
        createdAt: new Date().toISOString(),
      };

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update local state
      if (research) {
        setResearch({
          ...research,
          milestones: [...research.milestones, mockNewMilestone],
        });
      }

      // Uncomment when backend is ready:
      // const response = await Axios.post(
      //   `/api/milestone`,
      //   {
      //     researchId,
      //     title: newMilestone.title,
      //     description: newMilestone.description,
      //     startDate: newMilestone.startDate,
      //     deadline: newMilestone.deadline,
      //   },
      //   {
      //     headers: { Authorization: `Bearer ${accessToken}` },
      //   }
      // );
      // if (response.data.success) {
      //   setResearch({
      //     ...research,
      //     milestones: [...research.milestones, response.data.data],
      //   });
      // }

      toast.success("Milestone added successfully!");
      setIsAddMilestoneOpen(false);
      setNewMilestone({ title: "", description: "", startDate: "", deadline: "" });
    } catch (error: any) {
      console.error("Error adding milestone:", error);
      toast.error("Failed to add milestone");
    } finally {
      setIsSubmitting(false);
    }
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

  const canManageResearch =
    user?.role === "faculty" || user?.role === "department_admin" || user?.userId === research.supervisorId;

  const handleBackNavigation = () => {
    // Navigate back to the course page with research tab
    if (research?.semester && research?.courseCode) {
      const semesterCode = research.semester.replace('/', '-');
      router.push(`/semester/${semesterCode}/${research.courseCode}?tab=research`);
    } else {
      router.back();
    }
  };

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
            onClick={handleBackNavigation}
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
                  <p className="text-gray-500 dark:text-gray-400 italic">No description provided</p>
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
                <div className="grid grid-cols-2 gap-6">
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
                </div>
                {research.publicationUrl && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                      <LinkIcon className="w-4 h-4" />
                      Publication URL
                    </span>
                    <a
                      href={research.publicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 mt-2"
                    >
                      {research.publicationUrl}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Milestones */}
            <Card className="border-2 border-green-200 dark:border-green-800 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-green-900 dark:text-green-100 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Milestones ({research.milestones.length})
                  </CardTitle>
                  {canManageResearch && (
                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => setIsAddMilestoneOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Milestone
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <ScrollArea className="h-[500px] pr-4">
                  <AnimatePresence>
                    {research.milestones.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center py-12 text-gray-500 dark:text-gray-400"
                      >
                        <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No milestones yet</p>
                      </motion.div>
                    ) : (
                      <div className="space-y-4">
                        {research.milestones.map((milestone, index) => (
                          <motion.div
                            key={milestone.milestoneId}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() =>
                              router.push(
                                `/semester/research/${researchId}/milestone/${milestone.milestoneId}`
                              )
                            }
                            className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-green-300 dark:hover:border-green-700 transition-all hover:shadow-md cursor-pointer group"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors flex items-center gap-2">
                                  {milestone.title}
                                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </h4>
                                {getMilestoneStatusBadge(milestone.status)}
                              </div>
                            </div>
                            {milestone.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                {milestone.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                              {milestone.startDate && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Start: {formatDate(milestone.startDate)}
                                </span>
                              )}
                              {milestone.deadline && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Deadline: {formatDate(milestone.deadline)}
                                </span>
                              )}
                            </div>
                            {milestone.blockchainHash && (
                              <div className="mt-3 p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded text-xs">
                                <span className="font-semibold flex items-center gap-1">
                                  <Hash className="w-3 h-3" />
                                  Blockchain Hash:
                                </span>
                                <code className="text-indigo-700 dark:text-indigo-400">
                                  {milestone.blockchainHash}
                                </code>
                              </div>
                            )}
                            {milestone.approvedAt && milestone.approverFirstName && (
                              <div className="mt-2 text-xs text-green-700 dark:text-green-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Approved by {milestone.approverFirstName} {milestone.approverLastName} on{" "}
                                {formatDate(milestone.approvedAt)}
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </AnimatePresence>
                </ScrollArea>
              </CardContent>
            </Card>
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
                              <Badge
                                variant="outline"
                                className="mt-2 text-xs bg-white dark:bg-gray-800"
                              >
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

            {/* Progress Stats */}
            <Card className="border-2 border-indigo-200 dark:border-indigo-800 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30">
                <CardTitle className="text-indigo-900 dark:text-indigo-100 flex items-center gap-2 text-base">
                  <CheckCircle2 className="w-5 h-5" />
                  Progress Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {["not_started", "in_progress", "ready_for_review", "approved", "rejected"].map(
                    (status) => {
                      const count = research.milestones.filter((m) => m.status === status).length;
                      const percentage =
                        research.milestones.length > 0
                          ? (count / research.milestones.length) * 100
                          : 0;

                      return (
                        <div key={status}>
                          <div className="flex items-center justify-between mb-2">
                            {getMilestoneStatusBadge(status)}
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              {count}
                            </span>
                          </div>
                          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full ${
                                status === "approved"
                                  ? "bg-green-500"
                                  : status === "rejected"
                                  ? "bg-red-500"
                                  : status === "ready_for_review"
                                  ? "bg-purple-500"
                                  : status === "in_progress"
                                  ? "bg-blue-500"
                                  : "bg-gray-400"
                              }`}
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 1, delay: 0.5 }}
                            />
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Add Milestone Dialog */}
      <Dialog open={isAddMilestoneOpen} onOpenChange={setIsAddMilestoneOpen}>
        <DialogContent className="sm:max-w-[600px] dark:bg-slate-950 bg-slate-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Add New Milestone
            </DialogTitle>
            <DialogDescription>
              Create a new milestone for this research project. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Milestone Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g., Model Architecture Design & Implementation"
                value={newMilestone.title}
                onChange={(e) =>
                  setNewMilestone({ ...newMilestone, title: e.target.value })
                }
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the goals and deliverables of this milestone..."
                value={newMilestone.description}
                onChange={(e) =>
                  setNewMilestone({ ...newMilestone, description: e.target.value })
                }
                rows={4}
                className="w-full resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">
                  Start Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newMilestone.startDate}
                  onChange={(e) =>
                    setNewMilestone({ ...newMilestone, startDate: e.target.value })
                  }
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">
                  Deadline <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="deadline"
                  type="date"
                  value={newMilestone.deadline}
                  onChange={(e) =>
                    setNewMilestone({ ...newMilestone, deadline: e.target.value })
                  }
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddMilestoneOpen(false);
                setNewMilestone({ title: "", description: "", startDate: "", deadline: "" });
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddMilestone}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Milestone
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
