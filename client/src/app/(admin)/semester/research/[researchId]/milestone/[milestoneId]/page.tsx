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
  DialogTitle
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
  Calendar,
  CheckCircle,
  CheckCircle2,
  Circle,
  Clock,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Link as LinkIcon,
  ListTodo,
  Loader2,
  MessageSquare,
  PlayCircle,
  Plus,
  Send,
  Shield,
  Sparkles,
  User,
  Users,
  Verified,
  Video,
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

interface Meeting {
  meetingId: string;
  title: string;
  description: string | null;
  scheduledAt: string;
  duration: number; // in minutes
  meetingUrl: string | null;
  notes: string | null;
  aiSummary: string | null;
  actionItems: string[];
  attendees: string[];
  createdBy: string;
  status: "scheduled" | "completed" | "cancelled";
  createdAt: string;
}

interface MilestoneDetail {
  milestoneId: string;
  researchId: string;
  researchTitle: string;
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
  tasks: Task[];
  meetings: Meeting[];
}

export default function ResearchMilestoneDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, accessToken } = useAuthStore();
  const researchId = params.researchId as string;
  const milestoneId = params.milestoneId as string;

  const [milestone, setMilestone] = useState<MilestoneDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add Task Form State
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    details: "",
    dueDate: "",
  });

  // Meeting State
  const [showMeetingDialog, setShowMeetingDialog] = useState(false);
  const [showMeetingDetailsDialog, setShowMeetingDetailsDialog] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [isGeneratingAISummary, setIsGeneratingAISummary] = useState(false);
  const [meetingForm, setMeetingForm] = useState({
    title: "",
    description: "",
    scheduledAt: "",
    duration: 60,
    meetingUrl: "",
  });

  // Role-based access control
  const isStudent = user?.role === "student";
  const canManageResearch = user?.role === "supervisor" || user?.role === "coordinator" || user?.role === "admin";
  const canManageMilestone = canManageResearch; // Alias for consistency

  const fetchMilestoneDetails = async () => {
    try {
      setIsLoading(true);

      // Mock data for frontend prototype
      const mockMilestone: MilestoneDetail = {
        milestoneId: milestoneId,
        researchId: researchId,
        researchTitle: "Deep Learning Applications in Natural Language Processing",
        title: "Model Architecture Design & Implementation",
        description:
          "Design novel attention mechanisms, implement baseline and proposed models using PyTorch/TensorFlow, and optimize model performance.",
        status: "ready_for_review",
        startDate: "2024-11-01",
        deadline: "2024-12-31",
        blockchainHash: "0x9abc...ijkl",
        blockchainTxId: "0xfgh789...mno345",
        approvedAt: null,
        approvedBy: null,
        approverFirstName: null,
        approverLastName: null,
        createdAt: "2024-11-01T09:00:00Z",
        tasks: [
          {
            taskId: "t-1",
            milestoneId: milestoneId,
            title: "Baseline Model Implementation",
            description: "Implement standard BERT and GPT-2 baselines for comparison",
            details:
              "Set up development environment, implement BERT base model, implement GPT-2 model, create training scripts, document implementation details",
            status: "approved",
            assignedTo: "stu-1",
            assignedToName: "Michael Rodriguez",
            dueDate: "2024-11-15",
            completedAt: "2024-11-14T16:00:00Z",
            submittedAt: "2024-11-14T16:00:00Z",
            submissionDetails:
              "Implemented BERT-base and GPT-2 models with custom training pipeline. Added comprehensive logging and checkpoint management. Achieved baseline accuracy of 87% on validation set.",
            submissionUrl: "https://github.com/research-team/nlp-research/tree/main/baseline-models",
            submissionHash: "0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
            submissionTxId: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef12",
            fileHash: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            reviewedBy: "sup-1",
            reviewerName: "Dr. Emily Chen",
            reviewedAt: "2024-11-15T09:00:00Z",
            reviewComments:
              "Excellent implementation! Code is clean and well-documented. Baseline results look promising.",
            createdAt: "2024-11-01T09:00:00Z",
          },
          {
            taskId: "t-2",
            milestoneId: milestoneId,
            title: "Novel Attention Mechanism Design",
            description: "Design and implement enhanced multi-head attention with positional encoding",
            details:
              "Research state-of-the-art attention mechanisms, design novel approach, implement in PyTorch, test on sample data, document architecture",
            status: "submitted",
            assignedTo: "stu-3",
            assignedToName: "David Martinez",
            dueDate: "2024-12-01",
            completedAt: "2024-11-28T18:30:00Z",
            submittedAt: "2024-11-28T18:30:00Z",
            submissionDetails:
              "Designed and implemented a novel sparse attention mechanism with dynamic masking. Initial tests show 15% reduction in computation time while maintaining accuracy. Includes visualization tools for attention patterns.",
            submissionUrl:
              "https://github.com/research-team/nlp-research/tree/main/novel-attention",
            submissionHash: "0x2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae",
            submissionTxId: "0x2b3c4d5e6f7890abcdef1234567890abcdef1234",
            fileHash: "sha256:d4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35",
            reviewedBy: null,
            reviewerName: null,
            reviewedAt: null,
            reviewComments: null,
            createdAt: "2024-11-05T11:00:00Z",
          },
          {
            taskId: "t-3",
            milestoneId: milestoneId,
            title: "Model Training Pipeline",
            description: "Set up distributed training with mixed precision and gradient accumulation",
            details:
              "Configure multi-GPU training, implement mixed precision, add gradient accumulation, set up tensorboard logging, create training scripts",
            status: "in_progress",
            assignedTo: "stu-2",
            assignedToName: "Priya Kumar",
            dueDate: "2024-12-15",
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
            createdAt: "2024-11-10T13:00:00Z",
          },
          {
            taskId: "t-4",
            milestoneId: milestoneId,
            title: "Hyperparameter Tuning",
            description:
              "Perform grid search and optimize learning rate, batch size, and architecture params",
            details:
              "Define hyperparameter search space, implement grid search, use validation set for tuning, document optimal parameters, analyze results",
            status: "pending",
            assignedTo: user?.userId || "stu-1",
            assignedToName: `${user?.firstName || "Michael"} ${user?.lastName || "Rodriguez"}`,
            dueDate: "2024-12-25",
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
            createdAt: "2024-11-15T10:00:00Z",
          },
          {
            taskId: "t-5",
            milestoneId: milestoneId,
            title: "Performance Evaluation",
            description: "Evaluate model performance on test dataset with comprehensive metrics",
            details:
              "Run inference on test set, calculate accuracy/F1/precision/recall, generate confusion matrix, compare with baselines, visualize results",
            status: "rejected",
            assignedTo: user?.userId || "stu-2",
            assignedToName: `${user?.firstName || "Priya"} ${user?.lastName || "Kumar"}`,
            dueDate: "2024-12-28",
            completedAt: null,
            submittedAt: "2024-12-20T16:00:00Z",
            submissionDetails: "Ran initial evaluation on test set. Basic metrics calculated.",
            submissionUrl: "https://github.com/research-team/nlp-research/tree/main/evaluation",
            submissionHash: "0xc5d4e3f2e1f0e9d8c7b6a5b4c3e2f1e0f9e8d7c6b5a4b3c2e1f0e9d8c7b6a5b4",
            submissionTxId: "0x7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f",
            fileHash: "sha256:c5d4e3f2e1f0e9d8c7b6a5b4c3e2f1e0f9e8d7c6b5a4b3c2e1f0e9d8c7b6a5b4",
            reviewedBy: "sup-1",
            reviewerName: "Dr. Emily Chen",
            reviewedAt: "2024-12-21T10:00:00Z",
            reviewComments: "Good start, but needs more comprehensive analysis. Please add error analysis, statistical significance tests, and comparison with multiple baselines. Also include visualizations of model performance across different data subsets.",
            createdAt: "2024-11-18T11:00:00Z",
          },
        ],
        meetings: [
          {
            meetingId: "meet-1",
            title: "Research Kickoff Meeting",
            description: "Initial discussion about model architecture and research methodology",
            scheduledAt: "2024-11-05T14:00:00Z",
            duration: 90,
            meetingUrl: "https://meet.google.com/abc-defg-hij",
            notes: "Discussed baseline models selection, proposed novel attention mechanism approach, and set timeline for implementation. Team agreed on using PyTorch for consistency. Dr. Chen suggested adding ablation studies.",
            aiSummary: "The research team held a productive kickoff meeting to establish the foundation for the NLP project. Key decisions included selecting BERT and GPT-2 as baseline models and focusing on sparse attention mechanisms. Dr. Chen emphasized the importance of thorough documentation and suggested conducting ablation studies to understand component contributions. The team agreed on weekly progress meetings and established a shared GitHub repository.",
            actionItems: [
              "Michael to set up GitHub repository and project structure",
              "David to research existing sparse attention implementations",
              "All team members to review latest papers on attention mechanisms",
            ],
            attendees: ["Dr. Emily Chen", "Michael Rodriguez", "David Martinez", "Sarah Johnson"],
            createdBy: "sup-1",
            status: "completed" as const,
            createdAt: "2024-11-01T09:00:00Z",
          },
          {
            meetingId: "meet-2",
            title: "Progress Review - Week 4",
            description: "Review baseline implementation and discuss novel attention design",
            scheduledAt: "2024-12-03T15:00:00Z",
            duration: 60,
            meetingUrl: "https://meet.google.com/xyz-abcd-efg",
            notes: null,
            aiSummary: null,
            actionItems: [],
            attendees: ["Dr. Emily Chen", "Michael Rodriguez", "David Martinez"],
            createdBy: "sup-1",
            status: "scheduled" as const,
            createdAt: "2024-11-25T10:00:00Z",
          },
        ],
      };

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      setMilestone(mockMilestone);

      // Uncomment below when backend is ready
      // const response = await Axios.get(`/api/milestone/${milestoneId}`, {
      //   headers: { Authorization: `Bearer ${accessToken}` },
      // });
      // if (response.data.success) {
      //   setMilestone(response.data.data);
      // }
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

  const getMilestoneStatusBadge = (status: string) => {
    const statusConfig = {
      not_started: { icon: Circle, color: "bg-gray-100 text-gray-700", label: "Not Started" },
      in_progress: { icon: PlayCircle, color: "bg-blue-100 text-blue-700", label: "In Progress" },
      ready_for_review: {
        icon: Send,
        color: "bg-purple-100 text-purple-700",
        label: "Ready for Review",
      },
      approved: { icon: CheckCircle2, color: "bg-green-100 text-green-700", label: "Approved" },
      rejected: { icon: XCircle, color: "bg-red-100 text-red-700", label: "Rejected" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.not_started;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`} variant="outline">
        <Icon className="w-4 h-4" />
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

  const handleAddTask = async () => {
    if (!newTask.title.trim()) {
      toast.error("Please enter a task title");
      return;
    }

    if (!newTask.dueDate) {
      toast.error("Please select a due date");
      return;
    }

    try {
      setIsSubmitting(true);

      // Mock API call - Replace with actual API when backend is ready
      const mockNewTask: Task = {
        taskId: `t-${Date.now()}`,
        milestoneId: milestoneId,
        title: newTask.title,
        description: newTask.description || null,
        details: newTask.details || null,
        status: "pending",
        assignedTo: null,
        assignedToName: null,
        dueDate: newTask.dueDate,
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

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update local state
      if (milestone) {
        setMilestone({
          ...milestone,
          tasks: [...milestone.tasks, mockNewTask],
        });
      }

      // Uncomment when backend is ready:
      // const response = await Axios.post(
      //   `/api/task`,
      //   {
      //     milestoneId,
      //     title: newTask.title,
      //     description: newTask.description,
      //     details: newTask.details,
      //     dueDate: newTask.dueDate,
      //   },
      //   {
      //     headers: { Authorization: `Bearer ${accessToken}` },
      //   }
      // );
      // if (response.data.success) {
      //   setMilestone({
      //     ...milestone,
      //     tasks: [...milestone.tasks, response.data.data],
      //   });
      // }

      toast.success("Task added successfully!");
      setIsAddTaskOpen(false);
      setNewTask({ title: "", description: "", details: "", dueDate: "" });
    } catch (error: any) {
      console.error("Error adding task:", error);
      toast.error("Failed to add task");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Meeting Handlers
  const handleScheduleMeeting = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!meetingForm.title.trim() || !meetingForm.scheduledAt) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const newMeeting: Meeting = {
        meetingId: `meet-${Date.now()}`,
        title: meetingForm.title,
        description: meetingForm.description || null,
        scheduledAt: meetingForm.scheduledAt,
        duration: meetingForm.duration,
        meetingUrl: meetingForm.meetingUrl || null,
        notes: null,
        aiSummary: null,
        actionItems: [],
        attendees: [user?.firstName + " " + user?.lastName || "Current User"],
        createdBy: user?.userId || "current-user",
        status: "scheduled",
        createdAt: new Date().toISOString(),
      };

      // Update milestone with new meeting
      if (milestone) {
        setMilestone({
          ...milestone,
          meetings: [...milestone.meetings, newMeeting],
        });
      }

      toast.success("Meeting scheduled successfully!");
      setShowMeetingDialog(false);
      setMeetingForm({
        title: "",
        description: "",
        scheduledAt: "",
        duration: 60,
        meetingUrl: "",
      });
    } catch (error) {
      console.error("Error scheduling meeting:", error);
      toast.error("Failed to schedule meeting");
    }
  };

  const handleGenerateAISummary = async (meeting: Meeting) => {
    try {
      setIsGeneratingAISummary(true);

      // Simulate AI processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Generate mock AI summary
      const aiSummary = `The team held a productive ${meeting.title.toLowerCase()}. Key discussions centered around research progress, methodology refinements, and next steps. Team members shared updates on their assigned tasks and identified potential challenges. The supervisor provided valuable feedback and guidance on improving the research approach.`;

      const actionItems = [
        `${meeting.attendees[1] || "Team member"} to implement feedback from discussion`,
        `All members to review and update documentation by next meeting`,
        `Schedule follow-up meeting to review progress on action items`,
      ];

      // Update meeting with AI summary
      if (milestone) {
        const updatedMeetings = milestone.meetings.map((m) =>
          m.meetingId === meeting.meetingId
            ? { ...m, aiSummary, actionItems, status: "completed" as const }
            : m
        );

        setMilestone({
          ...milestone,
          meetings: updatedMeetings,
        });

        // Update selected meeting
        setSelectedMeeting({
          ...meeting,
          aiSummary,
          actionItems,
          status: "completed",
        });
      }

      toast.success("AI summary generated successfully!");
    } catch (error) {
      console.error("Error generating AI summary:", error);
      toast.error("Failed to generate AI summary");
    } finally {
      setIsGeneratingAISummary(false);
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

  if (!milestone) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <AlertCircle className="w-16 h-16 text-gray-400" />
        <h2 className="text-2xl font-bold text-gray-700">Milestone not found</h2>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

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
            onClick={() => router.push(`/semester/research/${researchId}`)}
            className="mb-6 hover:bg-green-100 dark:hover:bg-green-900/30"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Research
          </Button>

          <div className="mb-8">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {milestone.researchTitle}
            </p>
            <motion.h1
              className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {milestone.title}
            </motion.h1>
            <div className="flex items-center gap-3 flex-wrap">
              {getMilestoneStatusBadge(milestone.status)}
              <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Created {formatDate(milestone.createdAt)}
              </span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Tasks */}
          <motion.div
            className="lg:col-span-2 space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {/* Tasks List */}
            <Card className="border-2 border-green-200 dark:border-green-800 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-green-900 dark:text-green-100 flex items-center gap-2">
                    <ListTodo className="w-5 h-5" />
                    Tasks ({milestone.tasks.length})
                  </CardTitle>
                  {canManageMilestone && (
                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => setIsAddTaskOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Task
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <ScrollArea className="h-[700px] pr-4">
                  <AnimatePresence>
                    {milestone.tasks.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center py-12 text-gray-500 dark:text-gray-400"
                      >
                        <ListTodo className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No tasks yet</p>
                      </motion.div>
                    ) : (
                      <div className="space-y-4">
                        {milestone.tasks.map((task, index) => (
                          <motion.div
                            key={task.taskId}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-5 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg transition-all"
                          >
                            {/* Task Header */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2">
                                  {task.title}
                                </h4>
                                <div className="flex items-center gap-2">
                                  {getTaskStatusBadge(task.status)}
                                  {task.assignedToName && (
                                    <Badge variant="outline" className="text-xs">
                                      <User className="w-3 h-3 mr-1" />
                                      {task.assignedToName}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Task Description */}
                            {task.description && (
                              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                                {task.description}
                              </p>
                            )}

                            {/* Task Details */}
                            {task.details && (
                              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  <strong>Details:</strong> {task.details}
                                </p>
                              </div>
                            )}

                            {/* Task Dates */}
                            <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400 mb-4">
                              {task.dueDate && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Due: {formatDate(task.dueDate)}
                                </span>
                              )}
                              {task.completedAt && (
                                <span className="flex items-center gap-1 text-green-600">
                                  <CheckCircle className="w-3 h-3" />
                                  Completed: {formatDate(task.completedAt)}
                                </span>
                              )}
                            </div>

                            {/* Submission Details */}
                            {task.submittedAt && (
                              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                <div className="flex items-center gap-2 mb-3">
                                  <Send className="w-4 h-4 text-blue-600" />
                                  <span className="font-semibold text-blue-900 dark:text-blue-100">
                                    Submission
                                  </span>
                                  <Badge className="bg-blue-600 text-white text-xs">
                                    Submitted on {formatDate(task.submittedAt)}
                                  </Badge>
                                </div>

                                {task.submissionDetails && (
                                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                                    {task.submissionDetails}
                                  </p>
                                )}

                                {task.submissionUrl && (
                                  <a
                                    href={task.submissionUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 text-sm mb-3"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    View Submission
                                  </a>
                                )}

                                {/* Blockchain Proof */}
                                {task.submissionHash && (
                                  <div className="mt-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded border border-indigo-200 dark:border-indigo-800">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Shield className="w-4 h-4 text-indigo-600" />
                                      <span className="font-semibold text-indigo-900 dark:text-indigo-100 text-sm">
                                        Blockchain Verified
                                      </span>
                                      <Verified className="w-4 h-4 text-indigo-600" />
                                    </div>

                                    <div className="space-y-2 text-xs">
                                      <div>
                                        <span className="text-gray-600 dark:text-gray-400">
                                          Submission Hash:
                                        </span>
                                        <code className="block mt-1 text-indigo-700 dark:text-indigo-400 bg-white dark:bg-gray-800 px-2 py-1 rounded overflow-x-auto">
                                          {task.submissionHash}
                                        </code>
                                      </div>

                                      {task.submissionTxId && (
                                        <div>
                                          <span className="text-gray-600 dark:text-gray-400">
                                            Transaction ID:
                                          </span>
                                          <code className="block mt-1 text-indigo-700 dark:text-indigo-400 bg-white dark:bg-gray-800 px-2 py-1 rounded overflow-x-auto">
                                            {task.submissionTxId}
                                          </code>
                                        </div>
                                      )}

                                      {task.fileHash && (
                                        <div>
                                          <span className="text-gray-600 dark:text-gray-400">
                                            File Hash:
                                          </span>
                                          <code className="block mt-1 text-indigo-700 dark:text-indigo-400 bg-white dark:bg-gray-800 px-2 py-1 rounded overflow-x-auto">
                                            {task.fileHash}
                                          </code>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Review Comments */}
                            {task.reviewedAt && task.reviewComments && (
                              <div
                                className={`mt-4 p-4 rounded-lg border ${
                                  task.status === "approved"
                                    ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                                    : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                                }`}
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <MessageSquare className="w-4 h-4" />
                                  <span className="font-semibold">Review by {task.reviewerName}</span>
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${
                                      task.status === "approved"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                    }`}
                                  >
                                    {formatDate(task.reviewedAt)}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                  {task.reviewComments}
                                </p>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="mt-4 flex items-center gap-2">
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
                                  <PlayCircle className="w-3 h-3 mr-2" />
                                  Start Task
                                </Button>
                              )}
                              {isStudent && task.assignedTo === user?.userId &&
                               (task.status === "in_progress" || task.status === "rejected") && (
                                <Button
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700"
                                  onClick={() => {
                                    toast.info("Submit task functionality will be implemented soon");
                                  }}
                                >
                                  <Send className="w-3 h-3 mr-2" />
                                  Submit Task
                                </Button>
                              )}
                              {canManageMilestone && task.status === "submitted" && (
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => {
                                    toast.info("Review submission functionality will be implemented soon");
                                  }}
                                >
                                  <Eye className="w-3 h-3 mr-2" />
                                  Review Submission
                                </Button>
                              )}
                              {task.submissionUrl && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    window.open(task.submissionUrl!, "_blank");
                                  }}
                                >
                                  <ExternalLink className="w-3 h-3 mr-2" />
                                  View Submission
                                </Button>
                              )}
                              {task.submissionHash && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-purple-300 text-purple-700"
                                  onClick={() => {
                                    toast.success("Blockchain certificate downloaded!");
                                  }}
                                >
                                  <Download className="w-3 h-3 mr-2" />
                                  Download Certificate
                                </Button>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </AnimatePresence>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>

          {/* Meetings Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8"
          >
            <Card className="border-2 border-indigo-200 dark:border-indigo-800 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Video className="w-6 h-6 text-indigo-600" />
                    Meetings & Discussions
                  </CardTitle>
                  {/* Temporarily visible to all users for testing - remove canManageResearch check */}
                  <Button
                    size="sm"
                    onClick={() => setShowMeetingDialog(true)}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule Meeting
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {milestone.meetings.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Video className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p>No meetings scheduled yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {milestone.meetings.map((meeting, index) => (
                      <motion.div
                        key={meeting.meetingId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-5 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all cursor-pointer"
                        onClick={() => {
                          setSelectedMeeting(meeting);
                          setShowMeetingDetailsDialog(true);
                        }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2">
                              {meeting.title}
                            </h4>
                            <div className="flex items-center gap-2">
                              <Badge
                                className={
                                  meeting.status === "completed"
                                    ? "bg-green-100 text-green-700"
                                    : meeting.status === "cancelled"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-blue-100 text-blue-700"
                                }
                              >
                                {meeting.status}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                <Clock className="w-3 h-3 inline mr-1" />
                                {meeting.duration} min
                              </span>
                            </div>
                          </div>
                        </div>

                        {meeting.description && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                            {meeting.description}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(meeting.scheduledAt).toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {meeting.attendees.length} attendees
                          </span>
                        </div>

                        {meeting.aiSummary && (
                          <div className="mt-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
                            <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 mb-2">
                              <Sparkles className="w-4 h-4" />
                              <span className="text-sm font-semibold">AI Summary Available</span>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
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
            {/* Milestone Info */}
            <Card className="border-2 border-purple-200 dark:border-purple-800 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30">
                <CardTitle className="text-purple-900 dark:text-purple-100 flex items-center gap-2 text-base">
                  <Calendar className="w-5 h-5" />
                  Milestone Info
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {milestone.description && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {milestone.description}
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  {milestone.startDate && (
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Start Date</span>
                      <span className="font-semibold text-blue-700 dark:text-blue-400">
                        {formatDate(milestone.startDate)}
                      </span>
                    </div>
                  )}

                  {milestone.deadline && (
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Deadline</span>
                      <span className="font-semibold text-red-700 dark:text-red-400">
                        {formatDate(milestone.deadline)}
                      </span>
                    </div>
                  )}

                  {milestone.approvedAt && (
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Approved</span>
                      <span className="font-semibold text-green-700 dark:text-green-400">
                        {formatDate(milestone.approvedAt)}
                      </span>
                    </div>
                  )}
                </div>

                {milestone.approverFirstName && (
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Approved by</p>
                    <p className="font-semibold text-green-900 dark:text-green-100">
                      {milestone.approverFirstName} {milestone.approverLastName}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Blockchain Proof */}
            {milestone.blockchainHash && (
              <Card className="border-2 border-indigo-200 dark:border-indigo-800 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30">
                  <CardTitle className="text-indigo-900 dark:text-indigo-100 flex items-center gap-2 text-base">
                    <Shield className="w-5 h-5" />
                    Blockchain Verification
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <Verified className="w-5 h-5 text-indigo-600" />
                      <span className="font-semibold text-indigo-900 dark:text-indigo-100">
                        Verified on Blockchain
                      </span>
                    </div>

                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Blockchain Hash:
                      </p>
                      <code className="text-xs font-mono bg-white dark:bg-gray-800 px-3 py-2 rounded block overflow-x-auto text-indigo-700 dark:text-indigo-400">
                        {milestone.blockchainHash}
                      </code>
                    </div>

                    {milestone.blockchainTxId && (
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Transaction ID:
                        </p>
                        <code className="text-xs font-mono bg-white dark:bg-gray-800 px-3 py-2 rounded block overflow-x-auto text-indigo-700 dark:text-indigo-400">
                          {milestone.blockchainTxId}
                        </code>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Task Statistics */}
            <Card className="border-2 border-gray-200 dark:border-gray-700 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/30 dark:to-slate-900/30">
                <CardTitle className="text-gray-900 dark:text-gray-100 flex items-center gap-2 text-base">
                  <ListTodo className="w-5 h-5" />
                  Task Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {["pending", "in_progress", "submitted", "approved", "rejected"].map((status) => {
                    const count = milestone.tasks.filter((t) => t.status === status).length;
                    const percentage =
                      milestone.tasks.length > 0
                        ? (count / milestone.tasks.length) * 100
                        : 0;

                    return (
                      <div key={status}>
                        <div className="flex items-center justify-between mb-1">
                          {getTaskStatusBadge(status)}
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
                                : status === "submitted"
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
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Add Task Dialog */}
      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <DialogContent className="sm:max-w-[600px] dark:bg-slate-950 bg-slate-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-green-600" />
              Add New Task
            </DialogTitle>
            <DialogDescription>
              Create a new task for this milestone. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="taskTitle">
                Task Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="taskTitle"
                placeholder="e.g., Baseline Model Implementation"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taskDescription">Brief Description</Label>
              <Input
                id="taskDescription"
                placeholder="Short summary of the task..."
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taskDetails">Detailed Instructions</Label>
              <Textarea
                id="taskDetails"
                placeholder="Provide detailed steps, requirements, or additional information..."
                value={newTask.details}
                onChange={(e) => setNewTask({ ...newTask, details: e.target.value })}
                rows={4}
                className="w-full resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taskDueDate">
                Due Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="taskDueDate"
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                className="w-full"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddTaskOpen(false);
                setNewTask({ title: "", description: "", details: "", dueDate: "" });
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddTask}
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
                  Add Task
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Meeting Dialog */}
      <Dialog open={showMeetingDialog} onOpenChange={setShowMeetingDialog}>
        <DialogContent className="max-w-2xl dark:bg-slate-950 bg-slate-100">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Video className="h-6 w-6 text-indigo-600" />
              Schedule New Meeting
            </DialogTitle>
            <DialogDescription>
              Schedule a meeting to discuss milestone progress and next steps.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleScheduleMeeting} className="space-y-6 mt-4">
            {/* Meeting Title */}
            <div className="space-y-2">
              <Label htmlFor="meeting-title" className="text-sm font-semibold">
                Meeting Title *
              </Label>
              <Input
                id="meeting-title"
                value={meetingForm.title}
                onChange={(e) =>
                  setMeetingForm({ ...meetingForm, title: e.target.value })
                }
                placeholder="e.g., Research Progress Review"
                required
              />
            </div>

            {/* Meeting Description */}
            <div className="space-y-2">
              <Label htmlFor="meeting-description" className="text-sm font-semibold">
                Description
              </Label>
              <Textarea
                id="meeting-description"
                value={meetingForm.description}
                onChange={(e) =>
                  setMeetingForm({ ...meetingForm, description: e.target.value })
                }
                placeholder="Meeting agenda and topics to discuss..."
                className="min-h-[100px] resize-none"
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="meeting-date" className="text-sm font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date & Time *
                </Label>
                <Input
                  id="meeting-date"
                  type="datetime-local"
                  value={meetingForm.scheduledAt}
                  onChange={(e) =>
                    setMeetingForm({ ...meetingForm, scheduledAt: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meeting-duration" className="text-sm font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Duration (minutes) *
                </Label>
                <Input
                  id="meeting-duration"
                  type="number"
                  min="15"
                  step="15"
                  value={meetingForm.duration}
                  onChange={(e) =>
                    setMeetingForm({ ...meetingForm, duration: parseInt(e.target.value) || 60 })
                  }
                  required
                />
              </div>
            </div>

            {/* Meeting URL */}
            <div className="space-y-2">
              <Label htmlFor="meeting-url" className="text-sm font-semibold flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                Meeting URL
              </Label>
              <Input
                id="meeting-url"
                type="url"
                value={meetingForm.meetingUrl}
                onChange={(e) =>
                  setMeetingForm({ ...meetingForm, meetingUrl: e.target.value })
                }
                placeholder="https://meet.google.com/... or Zoom link"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowMeetingDialog(false);
                  setMeetingForm({
                    title: "",
                    description: "",
                    scheduledAt: "",
                    duration: 60,
                    meetingUrl: "",
                  });
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                <Video className="w-4 h-4 mr-2" />
                Schedule Meeting
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Meeting Details Dialog */}
      <Dialog open={showMeetingDetailsDialog} onOpenChange={setShowMeetingDetailsDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto dark:bg-slate-950 bg-slate-100">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Video className="h-6 w-6 text-indigo-600" />
              {selectedMeeting?.title}
            </DialogTitle>
            <DialogDescription>
              Meeting scheduled for {selectedMeeting && new Date(selectedMeeting.scheduledAt).toLocaleString()}
            </DialogDescription>
          </DialogHeader>

          {selectedMeeting && (
            <div className="space-y-6 mt-4">
              {/* Meeting Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">Status</Label>
                  <Badge
                    className={
                      selectedMeeting.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : selectedMeeting.status === "cancelled"
                        ? "bg-red-100 text-red-700"
                        : "bg-blue-100 text-blue-700"
                    }
                  >
                    {selectedMeeting.status}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">Duration</Label>
                  <p className="text-sm font-medium">{selectedMeeting.duration} minutes</p>
                </div>
              </div>

              {/* Description */}
              {selectedMeeting.description && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Description</Label>
                  <p className="text-sm text-gray-700 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    {selectedMeeting.description}
                  </p>
                </div>
              )}

              {/* Meeting URL */}
              {selectedMeeting.meetingUrl && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <LinkIcon className="h-4 w-4" />
                    Meeting Link
                  </Label>
                  <a
                    href={selectedMeeting.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-700 text-sm underline flex items-center gap-1"
                  >
                    Join Meeting
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {/* Attendees */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Attendees ({selectedMeeting.attendees.length})
                </Label>
                <div className="flex flex-wrap gap-2">
                  {selectedMeeting.attendees.map((attendee) => (
                    <Badge key={attendee} variant="outline" className="px-3 py-1">
                      {attendee}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Meeting Notes */}
              {selectedMeeting.notes && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Meeting Notes
                  </Label>
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {selectedMeeting.notes}
                    </p>
                  </div>
                </div>
              )}

              {/* AI Summary Section */}
              {selectedMeeting.status === "completed" && (
                <div className="space-y-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                      AI-Generated Summary
                    </Label>
                    {!selectedMeeting.aiSummary && (
                      <Button
                        size="sm"
                        onClick={() => handleGenerateAISummary(selectedMeeting)}
                        disabled={isGeneratingAISummary}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        {isGeneratingAISummary ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate AI Summary
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  {selectedMeeting.aiSummary ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {selectedMeeting.aiSummary}
                        </p>
                      </div>

                      {/* Action Items */}
                      {selectedMeeting.actionItems && selectedMeeting.actionItems.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">Action Items</Label>
                          <ul className="space-y-2">
                            {selectedMeeting.actionItems.map((item, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700 dark:text-gray-300">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Click the button above to generate an AI summary of this meeting.
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => {
                    setShowMeetingDetailsDialog(false);
                    setSelectedMeeting(null);
                  }}
                  variant="outline"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
