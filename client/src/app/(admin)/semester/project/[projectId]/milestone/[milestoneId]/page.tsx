"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import useAuthStore from "@/store/store";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  CheckCircle2,
  Circle,
  Clock,
  Download,
  ExternalLink,
  Eye,
  Hash,
  Link as LinkIcon,
  ListTodo,
  MessageSquare,
  PlayCircle,
  Plus,
  Send,
  Shield,
  Upload,
  User,
  Verified,
  XCircle
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Task {
  taskId: string;
  milestoneId: string;
  title: string;
  description: string | null;
  details: string | null;
  status: string;
  assignedTo: string | null;
  assignedToName: string | null;
  dueDate: string | null;
  completedAt: string | null;
  submittedAt: string | null;
  submissionDetails: string | null;
  submissionUrl: string | null;
  submissionHash: string | null;
  submissionTxId: string | null;
  fileHash: string | null;
  reviewedBy: string | null;
  reviewerName: string | null;
  reviewedAt: string | null;
  reviewComments: string | null;
  createdAt: string;
}

interface Student {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface MilestoneDetail {
  milestoneId: string;
  projectId: string;
  projectTitle: string;
  title: string;
  description: string | null;
  status: string;
  startDate: string | null;
  deadline: string | null;
  approvedAt: string | null;
  approvedBy: string | null;
  approverFirstName: string | null;
  approverLastName: string | null;
  proofHash: string | null;
  blockchainTxId: string | null;
  createdAt: string;
  tasks: Task[];
  students: Student[];
}

export default function MilestoneTasksPage() {
  const params = useParams();
  const router = useRouter();
  const { user, accessToken } = useAuthStore();
  const projectId = params.projectId as string;
  const milestoneId = params.milestoneId as string;

  const [milestone, setMilestone] = useState<MilestoneDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [showTaskSubmitDialog, setShowTaskSubmitDialog] = useState(false);
  const [showTaskReviewDialog, setShowTaskReviewDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    details: "",
    assignedTo: "",
    dueDate: "",
  });

  const [taskSubmitForm, setTaskSubmitForm] = useState({
    submissionDetails: "",
    submissionUrl: "",
  });

  const [taskReviewForm, setTaskReviewForm] = useState({
    reviewComments: "",
    approved: true,
  });

  const fetchMilestoneDetails = async () => {
    try {
      setIsLoading(true);

      // Mock data for frontend prototype
      const mockMilestone: MilestoneDetail = {
        milestoneId: milestoneId,
        projectId: projectId,
        projectTitle: "AI-Powered Student Management System",
        title: milestoneId === "m-1" ? "Project Setup & Requirements Analysis" :
               milestoneId === "m-2" ? "Database Design & API Development" :
               milestoneId === "m-3" ? "AI Model Training & Integration" :
               milestoneId === "m-4" ? "Frontend Development" :
               "Testing & Deployment",
        description: milestoneId === "m-1" ? "Complete initial setup, gather requirements, and create project architecture document" :
                     milestoneId === "m-2" ? "Design database schema, implement RESTful APIs, and set up authentication system" :
                     milestoneId === "m-3" ? "Train machine learning models for performance prediction and integrate with backend" :
                     milestoneId === "m-4" ? "Build responsive UI components, implement dashboards, and create user interfaces" :
                     "Conduct comprehensive testing, fix bugs, and deploy to production environment",
        status: milestoneId === "m-1" || milestoneId === "m-2" ? "approved" :
                milestoneId === "m-3" ? "ready_for_review" :
                milestoneId === "m-4" ? "in_progress" : "not_started",
        startDate: "2024-09-01",
        deadline: "2024-09-15",
        approvedAt: milestoneId === "m-1" || milestoneId === "m-2" ? "2024-09-14T16:30:00Z" : null,
        approvedBy: milestoneId === "m-1" || milestoneId === "m-2" ? "sup-1" : null,
        approverFirstName: milestoneId === "m-1" || milestoneId === "m-2" ? "Sarah" : null,
        approverLastName: milestoneId === "m-1" || milestoneId === "m-2" ? "Johnson" : null,
        proofHash: milestoneId === "m-1" ? "0x1234...abcd" : milestoneId === "m-2" ? "0x5678...efgh" : null,
        blockchainTxId: milestoneId === "m-1" ? "0xabc123...xyz789" : milestoneId === "m-2" ? "0xdef456...uvw012" : null,
        createdAt: "2024-09-01T08:00:00Z",
        tasks: milestoneId === "m-1" ? [
          {
            taskId: "t-1",
            milestoneId: "m-1",
            title: "Requirements Gathering",
            description: "Collect and document all project requirements",
            details: "Interview stakeholders, analyze existing systems, document functional and non-functional requirements",
            status: "approved",
            assignedTo: "stu-1",
            assignedToName: "Alex Thompson",
            dueDate: "2024-09-05",
            completedAt: "2024-09-04T16:00:00Z",
            submittedAt: "2024-09-04T16:00:00Z",
            submissionDetails: "Completed comprehensive requirements document with 45 functional requirements and 12 non-functional requirements. Includes user stories and acceptance criteria.",
            submissionUrl: "https://github.com/example/project/blob/main/docs/requirements.md",
            submissionHash: "0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
            submissionTxId: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef12",
            fileHash: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            reviewedBy: "sup-1",
            reviewerName: "Sarah Johnson",
            reviewedAt: "2024-09-05T09:00:00Z",
            reviewComments: "Excellent work! Requirements are comprehensive and well-documented. All acceptance criteria are clear.",
            createdAt: "2024-09-01T08:00:00Z",
          },
          {
            taskId: "t-2",
            milestoneId: "m-1",
            title: "System Architecture Design",
            description: "Design overall system architecture and technology stack",
            details: "Create architecture diagrams, select technologies, design database schema, plan deployment strategy",
            status: "approved",
            assignedTo: "stu-2",
            assignedToName: "Maya Patel",
            dueDate: "2024-09-10",
            completedAt: "2024-09-09T14:30:00Z",
            submittedAt: "2024-09-09T14:30:00Z",
            submissionDetails: "Created detailed system architecture with microservices design, selected React/Node.js stack, designed PostgreSQL schema",
            submissionUrl: "https://github.com/example/project/blob/main/docs/architecture.md",
            submissionHash: "0x2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae",
            submissionTxId: "0x2b3c4d5e6f7890abcdef1234567890abcdef1234",
            fileHash: "sha256:d4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35",
            reviewedBy: "sup-1",
            reviewerName: "Sarah Johnson",
            reviewedAt: "2024-09-10T10:00:00Z",
            reviewComments: "Great architecture design! Good choice of technologies and clear documentation.",
            createdAt: "2024-09-01T08:00:00Z",
          },
        ] : milestoneId === "m-3" ? [
          {
            taskId: "t-5",
            milestoneId: "m-3",
            title: "Data Collection & Preprocessing",
            description: "Collect training data and preprocess for ML models",
            details: "Gather student performance data, clean and normalize data, feature engineering, train/test split",
            status: "submitted",
            assignedTo: "stu-4",
            assignedToName: "Sam Wilson",
            dueDate: "2024-11-10",
            completedAt: "2024-11-08T15:30:00Z",
            submittedAt: "2024-11-08T15:30:00Z",
            submissionDetails: "Collected and preprocessed 10,000+ student records. Applied feature scaling, handled missing values, created 80/20 train/test split.",
            submissionUrl: "https://github.com/example/project/tree/main/ml/data",
            submissionHash: "0xb7a6c5d4e3f2e1f0e9d8c7b6a5b4c3e2f1e0f9e8d7c6b5a4b3c2e1f0e9d8c7b6",
            submissionTxId: "0x5e6f7890abcdef1234567890abcdef1234567890",
            fileHash: "sha256:7c5d4e3f2e1f0e9d8c7b6a5b4c3e2f1e0f9e8d7c6b5a4b3c2e1f0e9d8c7b6a5",
            reviewedBy: null,
            reviewerName: null,
            reviewedAt: null,
            reviewComments: null,
            createdAt: "2024-10-16T08:00:00Z",
          },
          {
            taskId: "t-6",
            milestoneId: "m-3",
            title: "Model Training & Validation",
            description: "Train ML models and validate performance",
            details: "Train multiple algorithms (Random Forest, Neural Networks), cross-validation, hyperparameter tuning",
            status: "in_progress",
            assignedTo: "stu-1",
            assignedToName: "Alex Thompson",
            dueDate: "2024-11-20",
            completedAt: null,
            submittedAt: null,
            submissionDetails: null,
            submissionUrl: null,
            submissionHash: null,
            submissionTxId: null,
            fileHash: null,
            reviewedBy: null,
            reviewerName: null,
            reviewedAt: null,
            reviewComments: null,
            createdAt: "2024-10-16T08:00:00Z",
          },
        ] : [
          {
            taskId: "t-demo",
            milestoneId: milestoneId,
            title: "Sample Task",
            description: "This is a sample task for demonstration",
            details: "Complete the assigned work according to requirements",
            status: "pending",
            assignedTo: "stu-1",
            assignedToName: "Alex Thompson",
            dueDate: "2024-12-01",
            completedAt: null,
            submittedAt: null,
            submissionDetails: null,
            submissionUrl: null,
            submissionHash: null,
            submissionTxId: null,
            fileHash: null,
            reviewedBy: null,
            reviewerName: null,
            reviewedAt: null,
            reviewComments: null,
            createdAt: "2024-11-01T08:00:00Z",
          },
        ],
        students: [
          { userId: "stu-1", firstName: "Alex", lastName: "Thompson", email: "alex.t@student.edu", role: "Team Lead" },
          { userId: "stu-2", firstName: "Maya", lastName: "Patel", email: "maya.p@student.edu", role: "Frontend Developer" },
          { userId: "stu-3", firstName: "Jordan", lastName: "Lee", email: "jordan.l@student.edu", role: "Backend Developer" },
          { userId: "stu-4", firstName: "Sam", lastName: "Wilson", email: "sam.w@student.edu", role: "AI/ML Engineer" },
        ],
      };

      await new Promise((resolve) => setTimeout(resolve, 800));
      setMilestone(mockMilestone);
    } catch (error: any) {
      console.error("Error fetching milestone:", error);
      toast.error("Failed to load milestone details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (milestoneId && accessToken) {
      fetchMilestoneDetails();
    }
  }, [milestoneId, accessToken]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!taskForm.title.trim()) {
      toast.error("Please enter task title");
      return;
    }

    try {
      const newTask: Task = {
        taskId: `t-${Date.now()}`,
        milestoneId: milestoneId,
        title: taskForm.title,
        description: taskForm.description || null,
        details: taskForm.details || null,
        status: "pending",
        assignedTo: taskForm.assignedTo || null,
        assignedToName:
          milestone?.students.find((s) => s.userId === taskForm.assignedTo)?.firstName +
            " " +
            milestone?.students.find((s) => s.userId === taskForm.assignedTo)?.lastName || null,
        dueDate: taskForm.dueDate || null,
        completedAt: null,
        submittedAt: null,
        submissionDetails: null,
        submissionUrl: null,
        submissionHash: null,
        submissionTxId: null,
        fileHash: null,
        reviewedBy: null,
        reviewerName: null,
        reviewedAt: null,
        reviewComments: null,
        createdAt: new Date().toISOString(),
      };

      await new Promise((resolve) => setTimeout(resolve, 500));

      if (milestone) {
        setMilestone({
          ...milestone,
          tasks: [...milestone.tasks, newTask],
        });
      }

      toast.success("Task created successfully!");
      setShowTaskDialog(false);
      setTaskForm({
        title: "",
        description: "",
        details: "",
        assignedTo: "",
        dueDate: "",
      });
    } catch (error: any) {
      toast.error("Failed to create task");
    }
  };

  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTask || !taskSubmitForm.submissionDetails.trim()) {
      toast.error("Please enter submission details");
      return;
    }

    try {
      // Simulate blockchain hash generation
      const submissionHash = `0x${Math.random().toString(16).substring(2, 66)}`;
      const blockchainTxId = `0x${Math.random().toString(16).substring(2, 42)}`;

      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate blockchain writing

      if (milestone) {
        const updatedTasks = milestone.tasks.map((task) =>
          task.taskId === selectedTask.taskId
            ? {
                ...task,
                status: "submitted",
                submittedAt: new Date().toISOString(),
                submissionDetails: taskSubmitForm.submissionDetails,
                submissionUrl: taskSubmitForm.submissionUrl || null,
                submissionHash,
                submissionTxId: blockchainTxId,
                fileHash: taskSubmitForm.submissionUrl
                  ? `sha256:${Math.random().toString(16).substring(2, 66)}`
                  : null,
              }
            : task
        );

        setMilestone({ ...milestone, tasks: updatedTasks });
      }

      toast.success("Task submitted successfully! Blockchain proof generated.");
      setShowTaskSubmitDialog(false);
      setTaskSubmitForm({
        submissionDetails: "",
        submissionUrl: "",
      });
      setSelectedTask(null);
    } catch (error: any) {
      toast.error("Failed to submit task");
    }
  };

  const handleReviewTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTask || !taskReviewForm.reviewComments.trim()) {
      toast.error("Please enter review comments");
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (milestone) {
        const updatedTasks = milestone.tasks.map((task) =>
          task.taskId === selectedTask.taskId
            ? {
                ...task,
                status: taskReviewForm.approved ? "approved" : "rejected",
                reviewedBy: user?.userId || "current-user",
                reviewerName: `${user?.firstName || "Current"} ${user?.lastName || "User"}`,
                reviewedAt: new Date().toISOString(),
                reviewComments: taskReviewForm.reviewComments,
                completedAt: taskReviewForm.approved ? new Date().toISOString() : null,
              }
            : task
        );

        setMilestone({ ...milestone, tasks: updatedTasks });
      }

      toast.success(`Task ${taskReviewForm.approved ? "approved" : "rejected"} successfully!`);
      setShowTaskReviewDialog(false);
      setTaskReviewForm({
        reviewComments: "",
        approved: true,
      });
      setSelectedTask(null);
    } catch (error: any) {
      toast.error("Failed to review task");
    }
  };

  const getMilestoneStatusBadge = (status: string) => {
    const statusConfig = {
      not_started: { icon: Circle, color: "bg-gray-100 text-gray-700 border-gray-200", label: "Not Started" },
      in_progress: { icon: PlayCircle, color: "bg-blue-100 text-blue-700 border-blue-200", label: "In Progress" },
      ready_for_review: { icon: Eye, color: "bg-purple-100 text-purple-700 border-purple-200", label: "Ready for Review" },
      approved: { icon: CheckCircle2, color: "bg-green-100 text-green-700 border-green-200", label: "Approved" },
      rejected: { icon: XCircle, color: "bg-red-100 text-red-700 border-red-200", label: "Rejected" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.not_started;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`} variant="outline">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getTaskStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { icon: Circle, color: "bg-gray-100 text-gray-700", label: "Pending" },
      in_progress: { icon: PlayCircle, color: "bg-blue-100 text-blue-700", label: "In Progress" },
      completed: { icon: CheckCircle, color: "bg-green-100 text-green-700", label: "Completed" },
      submitted: { icon: Send, color: "bg-purple-100 text-purple-700", label: "Submitted" },
      approved: { icon: CheckCircle2, color: "bg-green-100 text-green-700", label: "Approved" },
      rejected: { icon: XCircle, color: "bg-red-100 text-red-700", label: "Rejected" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
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

  const canManageProject = user?.role === "faculty" || user?.role === "department_admin";
  const isStudent = user?.role === "student";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Clock className="w-12 h-12 text-green-600" />
        </motion.div>
      </div>
    );
  }

  if (!milestone) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <AlertCircle className="w-16 h-16 text-gray-400" />
        <h2 className="text-2xl font-bold text-gray-700">Milestone not found</h2>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const taskStats = {
    total: milestone.tasks.length,
    pending: milestone.tasks.filter(t => t.status === "pending").length,
    in_progress: milestone.tasks.filter(t => t.status === "in_progress").length,
    submitted: milestone.tasks.filter(t => t.status === "submitted").length,
    approved: milestone.tasks.filter(t => t.status === "approved").length,
    rejected: milestone.tasks.filter(t => t.status === "rejected").length,
  };

  const completionPercentage = milestone.tasks.length > 0
    ? (taskStats.approved / milestone.tasks.length) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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
            className="mb-6 hover:bg-green-100 dark:hover:bg-green-900/30"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex items-start justify-between mb-8">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {milestone.projectTitle}
              </p>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                {milestone.title}
              </h1>
              {milestone.description && (
                <p className="text-gray-600 dark:text-gray-400 max-w-3xl">
                  {milestone.description}
                </p>
              )}
            </div>
            {getMilestoneStatusBadge(milestone.status)}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-2 border-blue-200 dark:border-blue-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{taskStats.total}</p>
                  </div>
                  <ListTodo className="w-8 h-8 text-blue-600 dark:text-blue-400 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-yellow-200 dark:border-yellow-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
                    <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                      {taskStats.in_progress + taskStats.pending}
                    </p>
                  </div>
                  <PlayCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-400 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 dark:border-purple-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Submitted</p>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{taskStats.submitted}</p>
                  </div>
                  <Send className="w-8 h-8 text-purple-600 dark:text-purple-400 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 dark:border-green-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Approved</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">{taskStats.approved}</p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Bar */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Milestone Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Completion</span>
                  <span className="font-bold">{completionPercentage.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPercentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-8">
          {/* Tasks Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-2 border-green-200 dark:border-green-800 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-green-900 dark:text-green-100 flex items-center gap-2">
                    <ListTodo className="w-5 h-5" />
                    Tasks ({milestone.tasks.length})
                  </CardTitle>
                  {canManageProject && (
                    <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Task
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl dark:bg-slate-950 bg-slate-100">
                        <DialogHeader>
                          <DialogTitle>Create New Task</DialogTitle>
                          <DialogDescription>
                            Add a new task to this milestone
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateTask} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="task-title">Task Title *</Label>
                            <Input
                              id="task-title"
                              value={taskForm.title}
                              onChange={(e) =>
                                setTaskForm({ ...taskForm, title: e.target.value })
                              }
                              placeholder="Enter task title"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="task-description">Description</Label>
                            <Textarea
                              id="task-description"
                              value={taskForm.description}
                              onChange={(e) =>
                                setTaskForm({ ...taskForm, description: e.target.value })
                              }
                              placeholder="Brief task description"
                              rows={2}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="task-details">Details</Label>
                            <Textarea
                              id="task-details"
                              value={taskForm.details}
                              onChange={(e) =>
                                setTaskForm({ ...taskForm, details: e.target.value })
                              }
                              placeholder="Detailed task requirements and instructions"
                              rows={3}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="task-assigned">Assign To</Label>
                              <Select
                                value={taskForm.assignedTo}
                                onValueChange={(value) =>
                                  setTaskForm({ ...taskForm, assignedTo: value })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select student" />
                                </SelectTrigger>
                                <SelectContent>
                                  {milestone.students.map((student) => (
                                    <SelectItem key={student.userId} value={student.userId}>
                                      {student.firstName} {student.lastName}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="task-due">Due Date</Label>
                              <Input
                                id="task-due"
                                type="date"
                                value={taskForm.dueDate}
                                onChange={(e) =>
                                  setTaskForm({ ...taskForm, dueDate: e.target.value })
                                }
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-3 pt-4">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setShowTaskDialog(false)}
                            >
                              Cancel
                            </Button>
                            <Button type="submit" className="bg-green-600 hover:bg-green-700">
                              Create Task
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {milestone.tasks.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <ListTodo className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No tasks yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {milestone.tasks.map((task, index) => (
                      <motion.div
                        key={task.taskId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-green-300 dark:hover:border-green-700 transition-all"
                      >
                        {/* Task Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {task.title}
                              </h3>
                              {getTaskStatusBadge(task.status)}
                            </div>
                            {task.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {task.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Task Details */}
                        {task.details && (
                          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              <span className="font-semibold">Details: </span>
                              {task.details}
                            </p>
                          </div>
                        )}

                        {/* Task Meta Info */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                          {task.assignedToName && (
                            <div className="flex items-center gap-2 text-sm">
                              <User className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-700 dark:text-gray-300">
                                <span className="font-semibold">Assigned:</span> {task.assignedToName}
                              </span>
                            </div>
                          )}
                          {task.dueDate && (
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-700 dark:text-gray-300">
                                <span className="font-semibold">Due:</span> {formatDate(task.dueDate)}
                              </span>
                            </div>
                          )}
                          {task.submittedAt && (
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-700 dark:text-gray-300">
                                <span className="font-semibold">Submitted:</span> {formatDate(task.submittedAt)}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Blockchain Verification */}
                        {task.submissionHash && task.submissionTxId && (
                          <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg border-2 border-purple-200 dark:border-purple-800">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-full">
                                <Verified className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                              </div>
                              <div className="flex-1 space-y-2">
                                <p className="font-semibold text-purple-900 dark:text-purple-100 flex items-center gap-2">
                                  <Shield className="w-4 h-4" />
                                  Blockchain Verified
                                </p>
                                <div className="space-y-1 text-xs">
                                  <div className="flex items-center gap-2">
                                    <Hash className="w-3 h-3 text-purple-600" />
                                    <span className="font-mono text-purple-700 dark:text-purple-300">
                                      {task.submissionHash.substring(0, 20)}...
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 px-2"
                                      onClick={() => {
                                        navigator.clipboard.writeText(task.submissionHash!);
                                        toast.success("Hash copied to clipboard!");
                                      }}
                                    >
                                      Copy
                                    </Button>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <LinkIcon className="w-3 h-3 text-purple-600" />
                                    <a
                                      href={`https://etherscan.io/tx/${task.submissionTxId}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                                    >
                                      View on Blockchain
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Submission Details */}
                        {task.submissionDetails && (
                          <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <p className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
                              Submission:
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {task.submissionDetails}
                            </p>
                            {task.submissionUrl && (
                              <a
                                href={task.submissionUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                                View Submission
                              </a>
                            )}
                          </div>
                        )}

                        {/* Review Comments */}
                        {task.reviewComments && (
                          <div className={`mb-4 p-4 rounded-lg ${
                            task.status === "approved"
                              ? "bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800"
                              : "bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800"
                          }`}>
                            <div className="flex items-start gap-2 mb-2">
                              <MessageSquare className={`w-4 h-4 mt-0.5 ${
                                task.status === "approved" ? "text-green-600" : "text-red-600"
                              }`} />
                              <div className="flex-1">
                                <p className="font-semibold text-sm text-gray-700 dark:text-gray-300">
                                  Review by {task.reviewerName}:
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {task.reviewComments}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                  {formatDate(task.reviewedAt)}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2 flex-wrap">
                          {isStudent && task.assignedTo === user?.userId && task.status === "pending" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                if (milestone) {
                                  const updatedTasks = milestone.tasks.map((t) =>
                                    t.taskId === task.taskId ? { ...t, status: "in_progress" } : t
                                  );
                                  setMilestone({ ...milestone, tasks: updatedTasks });
                                  toast.success("Task status updated to In Progress");
                                }
                              }}
                            >
                              Start Task
                            </Button>
                          )}

                          {isStudent && task.assignedTo === user?.userId &&
                           (task.status === "in_progress" || task.status === "rejected") && (
                            <Button
                              size="sm"
                              className="bg-purple-600 hover:bg-purple-700"
                              onClick={() => {
                                setSelectedTask(task);
                                setShowTaskSubmitDialog(true);
                              }}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Submit Task
                            </Button>
                          )}

                          {canManageProject && task.status === "submitted" && (
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                              onClick={() => {
                                setSelectedTask(task);
                                setShowTaskReviewDialog(true);
                              }}
                            >
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Review Task
                            </Button>
                          )}

                          {task.submissionHash && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-purple-300 text-purple-700 hover:bg-purple-50"
                              onClick={() => {
                                toast.success("Blockchain certificate downloaded!");
                              }}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download Certificate
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Task Submit Dialog */}
        <Dialog open={showTaskSubmitDialog} onOpenChange={setShowTaskSubmitDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Submit Task</DialogTitle>
              <DialogDescription>
                Submit your work with details and files. A blockchain proof will be generated.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitTask} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="submission-details">Submission Details *</Label>
                <Textarea
                  id="submission-details"
                  value={taskSubmitForm.submissionDetails}
                  onChange={(e) =>
                    setTaskSubmitForm({ ...taskSubmitForm, submissionDetails: e.target.value })
                  }
                  placeholder="Describe what you have completed, key achievements, and any challenges faced"
                  rows={5}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="submission-url">Submission URL</Label>
                <Input
                  id="submission-url"
                  value={taskSubmitForm.submissionUrl}
                  onChange={(e) =>
                    setTaskSubmitForm({ ...taskSubmitForm, submissionUrl: e.target.value })
                  }
                  placeholder="GitHub repository, document link, or demo URL"
                />
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div className="flex-1 text-sm">
                    <p className="font-semibold text-purple-900 dark:text-purple-100 mb-1">
                      Blockchain Verification
                    </p>
                    <p className="text-purple-700 dark:text-purple-300">
                      Your submission will be hashed and recorded on the blockchain for immutable proof.
                      This ensures your work is timestamped and tamper-proof.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowTaskSubmitDialog(false);
                    setSelectedTask(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                  <Upload className="w-4 h-4 mr-2" />
                  Submit with Blockchain Proof
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Task Review Dialog */}
        <Dialog open={showTaskReviewDialog} onOpenChange={setShowTaskReviewDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review Task Submission</DialogTitle>
              <DialogDescription>
                Review the student's work and provide feedback
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleReviewTask} className="space-y-4">
              <div className="space-y-2">
                <Label>Approval Decision</Label>
                <Select
                  value={taskReviewForm.approved.toString()}
                  onValueChange={(value) =>
                    setTaskReviewForm({ ...taskReviewForm, approved: value === "true" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">✅ Approve</SelectItem>
                    <SelectItem value="false">❌ Reject</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="review-comments">Review Comments *</Label>
                <Textarea
                  id="review-comments"
                  value={taskReviewForm.reviewComments}
                  onChange={(e) =>
                    setTaskReviewForm({ ...taskReviewForm, reviewComments: e.target.value })
                  }
                  placeholder={
                    taskReviewForm.approved
                      ? "Provide positive feedback and highlight what was done well..."
                      : "Explain what needs to be improved and provide constructive feedback..."
                  }
                  rows={5}
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowTaskReviewDialog(false);
                    setSelectedTask(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className={
                    taskReviewForm.approved
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  }
                >
                  {taskReviewForm.approved ? "Approve Task" : "Reject Task"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
