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
  FileText,
  Hash,
  Link as LinkIcon,
  ListTodo,
  Loader2,
  MessageSquare,
  PlayCircle,
  Plus,
  Send,
  Shield,
  Sparkles,
  Upload,
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

interface Student {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface Meeting {
  meetingId: string;
  milestoneId: string;
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
  createdAt: string;
  status: "scheduled" | "completed" | "cancelled";
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
  meetings: Meeting[];
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
    files: [] as File[],
  });

  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [fileHashes, setFileHashes] = useState<{ [key: string]: string }>({});
  const [submissionHash, setSubmissionHash] = useState<string>("");
  const [isGeneratingProof, setIsGeneratingProof] = useState(false);
  const [showProofReceipt, setShowProofReceipt] = useState(false);
  const [proofData, setProofData] = useState<any>(null);

  const [taskReviewForm, setTaskReviewForm] = useState({
    reviewComments: "",
    approved: true,
  });

  // Meeting states
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
  const canManageProject = user?.role === "supervisor" || user?.role === "coordinator" || user?.role === "admin";

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
            taskId: "t-demo-1",
            milestoneId: milestoneId,
            title: "Pending Task - Not Started Yet",
            description: "This task is pending and waiting to be started",
            details: "Complete the assigned work according to requirements. Click 'Start Task' to begin.",
            status: "pending",
            assignedTo: user?.userId || "stu-1",
            assignedToName: `${user?.firstName || "Alex"} ${user?.lastName || "Thompson"}`,
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
          {
            taskId: "t-demo-2",
            milestoneId: milestoneId,
            title: "In Progress Task - Ready to Submit",
            description: "This task is in progress and can be submitted",
            details: "You've started this task. Upload your work and submit for review.",
            status: "in_progress",
            assignedTo: user?.userId || "stu-1",
            assignedToName: `${user?.firstName || "Alex"} ${user?.lastName || "Thompson"}`,
            dueDate: "2024-12-05",
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
          {
            taskId: "t-demo-3",
            milestoneId: milestoneId,
            title: "Submitted Task - Waiting for Review",
            description: "This task has been submitted and is awaiting instructor review",
            details: "Task submitted with blockchain verification. Instructor will review and provide feedback.",
            status: "submitted",
            assignedTo: user?.userId || "stu-1",
            assignedToName: `${user?.firstName || "Alex"} ${user?.lastName || "Thompson"}`,
            dueDate: "2024-11-25",
            completedAt: null,
            submittedAt: "2024-11-20T14:30:00Z",
            submissionDetails: "Completed all required components. Implemented features as per specifications and added comprehensive documentation.",
            submissionUrl: "https://github.com/example/project",
            submissionHash: "0x7f8e9d2c3b4a5f6e7d8c9b0a1f2e3d4c5b6a7f8e9d2c3b4a5f6e7d8c9b0a1f2e",
            submissionTxId: "0xa3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4",
            fileHash: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            reviewedBy: null,
            reviewerName: null,
            reviewedAt: null,
            reviewComments: null,
            createdAt: "2024-11-01T08:00:00Z",
          },
          {
            taskId: "t-demo-4",
            milestoneId: milestoneId,
            title: "Approved Task - Successfully Completed",
            description: "This task was approved by the instructor",
            details: "Great work! This task met all requirements and was approved.",
            status: "approved",
            assignedTo: user?.userId || "stu-1",
            assignedToName: `${user?.firstName || "Alex"} ${user?.lastName || "Thompson"}`,
            dueDate: "2024-11-15",
            completedAt: "2024-11-14T16:00:00Z",
            submittedAt: "2024-11-14T16:00:00Z",
            submissionDetails: "Successfully completed all objectives with excellent code quality and documentation.",
            submissionUrl: "https://github.com/example/completed",
            submissionHash: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890",
            submissionTxId: "0xfedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210",
            fileHash: "sha256:d4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35",
            reviewedBy: "sup-1",
            reviewerName: "Dr. Sarah Johnson",
            reviewedAt: "2024-11-15T09:00:00Z",
            reviewComments: "Excellent work! All requirements met with high quality implementation. Well documented and tested.",
            createdAt: "2024-11-01T08:00:00Z",
          },
          {
            taskId: "t-demo-5",
            milestoneId: milestoneId,
            title: "Rejected Task - Needs Revision",
            description: "This task was rejected and needs to be resubmitted",
            details: "Review the feedback, make necessary changes, and resubmit.",
            status: "rejected",
            assignedTo: user?.userId || "stu-1",
            assignedToName: `${user?.firstName || "Alex"} ${user?.lastName || "Thompson"}`,
            dueDate: "2024-11-18",
            completedAt: null,
            submittedAt: "2024-11-17T10:00:00Z",
            submissionDetails: "Initial submission with basic implementation.",
            submissionUrl: "https://github.com/example/needs-work",
            submissionHash: "0x9e8f7d6c5b4a3e2f1e0d9c8b7a6e5f4e3d2c1b0a9e8f7d6c5b4a3e2f1e0d9c8b",
            submissionTxId: "0xb2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3",
            fileHash: "sha256:b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3",
            reviewedBy: "sup-1",
            reviewerName: "Dr. Sarah Johnson",
            reviewedAt: "2024-11-18T14:00:00Z",
            reviewComments: "Good start but needs more work. Please add error handling, improve documentation, and add unit tests before resubmitting.",
            createdAt: "2024-11-01T08:00:00Z",
          },
        ],
        students: [
          { userId: "stu-1", firstName: "Alex", lastName: "Thompson", email: "alex.t@student.edu", role: "Team Lead" },
          { userId: "stu-2", firstName: "Maya", lastName: "Patel", email: "maya.p@student.edu", role: "Frontend Developer" },
          { userId: "stu-3", firstName: "Jordan", lastName: "Lee", email: "jordan.l@student.edu", role: "Backend Developer" },
          { userId: "stu-4", firstName: "Sam", lastName: "Wilson", email: "sam.w@student.edu", role: "AI/ML Engineer" },
        ],
        meetings: [
          {
            meetingId: "meet-1",
            milestoneId: milestoneId,
            title: "Project Kickoff Meeting",
            description: "Initial project discussion and team introduction",
            scheduledAt: "2024-11-05T10:00:00Z",
            duration: 60,
            meetingUrl: "https://meet.google.com/abc-defg-hij",
            notes: "Discussed project requirements, assigned initial tasks, and set up communication channels.",
            aiSummary: "The team held a productive kickoff meeting to discuss the AI-Powered Student Management System project. Key decisions included technology stack selection (React, Node.js, PostgreSQL) and task distribution among team members. All participants agreed on bi-weekly sprint cycles and daily stand-ups.",
            actionItems: [
              "Alex to set up GitHub repository by Nov 6",
              "Maya to create initial UI mockups by Nov 8",
              "Jordan to design database schema by Nov 8",
              "Sam to research ML frameworks by Nov 10"
            ],
            attendees: ["stu-1", "stu-2", "stu-3", "stu-4", "sup-1"],
            createdBy: "sup-1",
            createdAt: "2024-11-04T09:00:00Z",
            status: "completed"
          },
          {
            meetingId: "meet-2",
            milestoneId: milestoneId,
            title: "Sprint Planning - Week 2",
            description: "Plan tasks for the upcoming sprint",
            scheduledAt: "2024-11-12T14:00:00Z",
            duration: 45,
            meetingUrl: "https://zoom.us/j/123456789",
            notes: null,
            aiSummary: null,
            actionItems: [],
            attendees: ["stu-1", "stu-2", "stu-3", "sup-1"],
            createdBy: "sup-1",
            createdAt: "2024-11-10T11:00:00Z",
            status: "scheduled"
          }
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
      setIsGeneratingProof(true);

      // Step 1: Calculate file hashes for all uploaded files
      const calculatedFileHashes: { [key: string]: string } = {};

      for (const file of taskSubmitForm.files) {
        const hash = await calculateSHA256(file);
        calculatedFileHashes[file.name] = hash;
        setFileHashes(prev => ({ ...prev, [file.name]: hash }));
      }

      // Step 2: Create submission data object
      const submissionData = {
        taskId: selectedTask.taskId,
        milestoneId: selectedTask.milestoneId,
        studentId: user?.userId || "current-user",
        submittedAt: new Date().toISOString(),
        submissionDetails: taskSubmitForm.submissionDetails,
        submissionUrl: taskSubmitForm.submissionUrl || null,
        files: taskSubmitForm.files.map(f => ({
          name: f.name,
          size: f.size,
          type: f.type,
          hash: calculatedFileHashes[f.name]
        }))
      };

      // Step 3: Calculate submission hash (SHA-256 of submission data)
      const submissionString = JSON.stringify(submissionData);
      const submissionHashValue = await calculateSHA256FromString(submissionString);
      setSubmissionHash(submissionHashValue);

      // Step 4: Simulate blockchain transaction
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const blockchainTxId = `0x${Math.random().toString(16).substring(2, 42)}${Math.random().toString(16).substring(2, 24)}`;

      // Step 5: Update task with submission data
      if (milestone) {
        const updatedTasks = milestone.tasks.map((task) =>
          task.taskId === selectedTask.taskId
            ? {
                ...task,
                status: "submitted",
                submittedAt: submissionData.submittedAt,
                submissionDetails: taskSubmitForm.submissionDetails,
                submissionUrl: taskSubmitForm.submissionUrl || null,
                submissionHash: submissionHashValue,
                submissionTxId: blockchainTxId,
                fileHash: Object.values(calculatedFileHashes).join(",") || null,
              }
            : task
        );

        setMilestone({ ...milestone, tasks: updatedTasks });
      }

      // Step 6: Generate proof receipt
      const proof = {
        taskTitle: selectedTask.title,
        studentName: `${user?.firstName || "Student"} ${user?.lastName || ""}`,
        submittedAt: submissionData.submittedAt,
        submissionHash: submissionHashValue,
        blockchainTxId,
        fileCount: taskSubmitForm.files.length,
        fileHashes: calculatedFileHashes,
      };
      setProofData(proof);

      toast.success("Task submitted successfully! Blockchain proof generated.");
      setIsGeneratingProof(false);
      setShowTaskSubmitDialog(false);
      setShowProofReceipt(true);
    } catch (error: any) {
      console.error("Submission error:", error);
      toast.error("Failed to submit task");
      setIsGeneratingProof(false);
    }
  };

  // Calculate SHA-256 hash from File
  const calculateSHA256 = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
          resolve(`sha256:${hashHex}`);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  // Calculate SHA-256 hash from string
  const calculateSHA256FromString = async (str: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return `0x${hashHex}`;
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setTaskSubmitForm(prev => ({ ...prev, files: [...prev.files, ...files] }));
  };

  // Remove file from selection
  const removeFile = (index: number) => {
    setTaskSubmitForm(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  // Download proof receipt as PDF
  const downloadProofReceipt = () => {
    if (!proofData) return;

    const receiptContent = `
BLOCKCHAIN SUBMISSION PROOF
═══════════════════════════════════════

Task: ${proofData.taskTitle}
Student: ${proofData.studentName}
Submitted: ${new Date(proofData.submittedAt).toLocaleString()}

BLOCKCHAIN VERIFICATION
─────────────────────────────────────
Submission Hash: ${proofData.submissionHash}
Transaction ID: ${proofData.blockchainTxId}

FILES SUBMITTED (${proofData.fileCount})
─────────────────────────────────────
${Object.entries(proofData.fileHashes).map(([name, hash]) =>
  `${name}\nHash: ${hash}\n`
).join('\n')}

This is a cryptographically secure proof of submission.
Verify at: ${window.location.origin}/verify/${proofData.blockchainTxId}
    `;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `submission-proof-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Proof receipt downloaded!");
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

  // Meeting handlers
  const handleScheduleMeeting = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!meetingForm.title.trim() || !meetingForm.scheduledAt) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      const newMeeting: Meeting = {
        meetingId: `meet-${Date.now()}`,
        milestoneId: milestoneId,
        title: meetingForm.title,
        description: meetingForm.description || null,
        scheduledAt: meetingForm.scheduledAt,
        duration: meetingForm.duration,
        meetingUrl: meetingForm.meetingUrl || null,
        notes: null,
        aiSummary: null,
        actionItems: [],
        attendees: milestone?.students.map(s => s.userId) || [],
        createdBy: user?.userId || "current-user",
        createdAt: new Date().toISOString(),
        status: "scheduled"
      };

      await new Promise((resolve) => setTimeout(resolve, 500));

      if (milestone) {
        setMilestone({
          ...milestone,
          meetings: [...milestone.meetings, newMeeting]
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
    } catch (error: any) {
      toast.error("Failed to schedule meeting");
    }
  };

  const handleGenerateAISummary = async (meeting: Meeting) => {
    if (!meeting.notes) {
      toast.error("Please add meeting notes first");
      return;
    }

    try {
      setIsGeneratingAISummary(true);

      // Simulate AI processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const aiSummary = `AI-Generated Summary:\n\nThe team discussed ${meeting.title}. Key points covered included progress updates, technical challenges, and next steps. The meeting was productive with clear action items identified for each team member. Overall, the team is on track with the milestone deliverables and maintaining good communication.`;

      const actionItems = [
        `Follow up on discussed items by ${new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}`,
        "Complete assigned tasks before next meeting",
        "Share progress updates in team channel"
      ];

      if (milestone) {
        const updatedMeetings = milestone.meetings.map((m) =>
          m.meetingId === meeting.meetingId
            ? { ...m, aiSummary, actionItems }
            : m
        );
        setMilestone({ ...milestone, meetings: updatedMeetings });
        setSelectedMeeting({ ...meeting, aiSummary, actionItems });
      }

      toast.success("AI summary generated successfully!");
    } catch (error: any) {
      toast.error("Failed to generate AI summary");
    } finally {
      setIsGeneratingAISummary(false);
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
                  {/* Temporarily visible to all users for testing - remove canManageProject check */}
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
        </div>

        {/* Task Submit Dialog */}
        <Dialog open={showTaskSubmitDialog} onOpenChange={setShowTaskSubmitDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto dark:bg-slate-950 bg-slate-100">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                Submit Task: {selectedTask?.title}
              </DialogTitle>
              <DialogDescription>
                Upload your work and submit for review. All submissions are recorded on blockchain for verification.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmitTask} className="space-y-6 mt-4">
              {/* Submission Details */}
              <div className="space-y-2">
                <Label htmlFor="submission-details" className="text-sm font-semibold flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Submission Details *
                </Label>
                <Textarea
                  id="submission-details"
                  value={taskSubmitForm.submissionDetails}
                  onChange={(e) =>
                    setTaskSubmitForm({ ...taskSubmitForm, submissionDetails: e.target.value })
                  }
                  placeholder="Describe what you've completed, challenges faced, and key learnings..."
                  className="min-h-[120px] resize-none"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Minimum 50 characters (Current: {taskSubmitForm.submissionDetails.length})
                </p>
              </div>

              {/* External URL (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="submission-url" className="text-sm font-semibold flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  External URL (Optional)
                </Label>
                <Input
                  id="submission-url"
                  value={taskSubmitForm.submissionUrl}
                  onChange={(e) =>
                    setTaskSubmitForm({ ...taskSubmitForm, submissionUrl: e.target.value })
                  }
                  placeholder="https://github.com/username/repo or Google Drive link..."
                  type="url"
                />
                <p className="text-xs text-muted-foreground">
                  Link to GitHub repo, Google Drive, or any external resource
                </p>
              </div>

              {/* File Upload Area */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Files
                </Label>

                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    id="file-upload"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.zip"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center gap-3"
                  >
                    <div className="p-4 bg-primary/10 rounded-full">
                      <Upload className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">Click to upload or drag and drop</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        PDF, DOC, Images, or ZIP (Max 10MB per file)
                      </p>
                    </div>
                  </label>
                </div>

                {/* File List */}
                {taskSubmitForm.files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-semibold">
                      Selected Files ({taskSubmitForm.files.length})
                    </p>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {taskSubmitForm.files.map((file, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="p-2 bg-primary/10 rounded">
                              <Upload className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{file.name}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{(file.size / 1024).toFixed(2)} KB</span>
                                {fileHashes[file.name] && (
                                  <>
                                    <span>•</span>
                                    <span className="truncate flex-1">
                                      Hash: {fileHashes[file.name].substring(0, 20)}...
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="ml-2"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Blockchain Info Box */}
              <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="font-semibold text-purple-900 dark:text-purple-100">
                      Blockchain Verification
                    </p>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      Your submission will be cryptographically hashed and recorded on
                      blockchain. This creates an immutable proof of your work with
                      timestamp verification.
                    </p>
                    {submissionHash && (
                      <div className="mt-2 p-2 bg-purple-100 dark:bg-purple-900/30 rounded text-xs font-mono break-all">
                        Submission Hash: {submissionHash}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowTaskSubmitDialog(false);
                    setTaskSubmitForm({
                      submissionDetails: "",
                      submissionUrl: "",
                      files: [],
                    });
                    setFileHashes({});
                    setSubmissionHash("");
                    setSelectedTask(null);
                  }}
                  disabled={isGeneratingProof}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isGeneratingProof ||
                    taskSubmitForm.submissionDetails.length < 50
                  }
                  className="min-w-[140px] bg-purple-600 hover:bg-purple-700"
                >
                  {isGeneratingProof ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Submit Task
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Task Review Dialog */}
        <Dialog open={showTaskReviewDialog} onOpenChange={setShowTaskReviewDialog}>
          <DialogContent className="max-w-2xl dark:bg-slate-950 bg-slate-100">
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
                  placeholder="e.g., Sprint Planning Meeting"
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

        {/* Proof Receipt Dialog */}
        <Dialog open={showProofReceipt} onOpenChange={setShowProofReceipt}>
          <DialogContent className="max-w-2xl dark:bg-slate-950 bg-slate-100">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                Submission Successful!
              </DialogTitle>
              <DialogDescription>
                Your task has been submitted with blockchain verification. Download your proof receipt below.
              </DialogDescription>
            </DialogHeader>

            {proofData && (
              <div className="space-y-4 mt-4">
                {/* Success Animation */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className="flex justify-center py-6"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
                    <div className="relative p-6 bg-green-100 dark:bg-green-900/30 rounded-full">
                      <Verified className="h-16 w-16 text-green-600" />
                    </div>
                  </div>
                </motion.div>

                {/* Task Info */}
                <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Task</p>
                      <p className="font-semibold">{proofData.taskTitle}</p>
                    </div>
                    <Badge className="bg-green-600">Submitted</Badge>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Student</p>
                    <p className="font-medium">{proofData.studentName}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Submitted At</p>
                    <p className="font-medium">{new Date(proofData.submittedAt).toLocaleString()}</p>
                  </div>
                </div>

                {/* Blockchain Verification */}
                <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 text-purple-900 dark:text-purple-100">
                    <Shield className="h-5 w-5" />
                    <p className="font-semibold">Blockchain Verification</p>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-purple-700 dark:text-purple-300 mb-1">Submission Hash</p>
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded text-xs font-mono break-all">
                        {proofData.submissionHash}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-purple-700 dark:text-purple-300 mb-1">Blockchain Transaction ID</p>
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded text-xs font-mono break-all">
                        {proofData.blockchainTxId}
                      </div>
                    </div>
                  </div>
                </div>

                {/* File Hashes */}
                {proofData.fileCount > 0 && (
                  <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      <p className="font-semibold">File Hashes ({proofData.fileCount})</p>
                    </div>
                    <div className="space-y-2 max-h-[150px] overflow-y-auto">
                      {Object.entries(proofData.fileHashes).map(([filename, hash]: [string, any]) => (
                        <div key={filename} className="text-xs space-y-1">
                          <p className="font-medium truncate">{filename}</p>
                          <p className="font-mono text-muted-foreground break-all">{hash}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const verifyUrl = `${window.location.origin}/verify/${proofData.blockchainTxId}`;
                      navigator.clipboard.writeText(verifyUrl);
                      toast.success("Verification link copied to clipboard!");
                    }}
                  >
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Copy Verify Link
                  </Button>
                  <Button
                    onClick={downloadProofReceipt}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Proof
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
