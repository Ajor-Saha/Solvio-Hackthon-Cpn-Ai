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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import useAuthStore from "@/store/store";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle,
  CheckCircle2,
  Circle,
  Clock,
  ExternalLink,
  Eye,
  FileText,
  Hash,
  Link as LinkIcon,
  Mail,
  PlayCircle,
  Plus,
  Send,
  User,
  Users,
  XCircle
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Student {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  joinedAt: string;
}

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
  proofHash: string | null;
  blockchainTxId: string | null;
  createdAt: string;
  tasks: Task[];
}

interface ProjectDetail {
  projectId: string;
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
  projectUrl: string | null;
  createdAt: string;
  students: Student[];
  milestones: Milestone[];
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, accessToken } = useAuthStore();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showMilestoneDialog, setShowMilestoneDialog] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [showTaskSubmitDialog, setShowTaskSubmitDialog] = useState(false);
  const [showTaskReviewDialog, setShowTaskReviewDialog] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [expandedMilestones, setExpandedMilestones] = useState<Set<string>>(new Set());

  const [milestoneForm, setMilestoneForm] = useState({
    title: "",
    description: "",
    status: "not_started",
    startDate: "",
    deadline: "",
  });

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

  const fetchProjectDetails = async () => {
    try {
      setIsLoading(true);

      // Mock data for frontend prototype
      const mockProject: ProjectDetail = {
        projectId: projectId,
        courseId: "course-1",
        title: "AI-Powered Student Management System",
        description: "A comprehensive system that uses artificial intelligence to manage student data, track attendance, analyze performance patterns, and provide personalized learning recommendations. The system integrates with blockchain for secure credential verification.",
        status: "in_progress",
        startDate: "2024-09-01",
        endDate: "2025-05-30",
        projectUrl: "https://github.com/example/ai-student-system",
        createdAt: "2024-09-01T08:00:00Z",
        supervisorId: "sup-1",
        supervisorFirstName: "Sarah",
        supervisorLastName: "Johnson",
        supervisorEmail: "sarah.johnson@university.edu",
        students: [
          {
            userId: "stu-1",
            firstName: "Alex",
            lastName: "Thompson",
            email: "alex.t@student.edu",
            role: "Team Lead",
            joinedAt: "2024-09-01T08:00:00Z",
          },
          {
            userId: "stu-2",
            firstName: "Maya",
            lastName: "Patel",
            email: "maya.p@student.edu",
            role: "Frontend Developer",
            joinedAt: "2024-09-01T08:00:00Z",
          },
          {
            userId: "stu-3",
            firstName: "Jordan",
            lastName: "Lee",
            email: "jordan.l@student.edu",
            role: "Backend Developer",
            joinedAt: "2024-09-01T08:00:00Z",
          },
          {
            userId: "stu-4",
            firstName: "Sam",
            lastName: "Wilson",
            email: "sam.w@student.edu",
            role: "AI/ML Engineer",
            joinedAt: "2024-09-05T08:00:00Z",
          },
        ],
        milestones: [
          {
            milestoneId: "m-1",
            title: "Project Setup & Requirements Analysis",
            description: "Complete initial setup, gather requirements, and create project architecture document",
            status: "approved",
            startDate: "2024-09-01",
            deadline: "2024-09-15",
            proofHash: "0x1234...abcd",
            blockchainTxId: "0xabc123...xyz789",
            approvedAt: "2024-09-14T16:30:00Z",
            approvedBy: "sup-1",
            approverFirstName: "Sarah",
            approverLastName: "Johnson",
            createdAt: "2024-09-01T08:00:00Z",
            tasks: [
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
            ],
          },
          {
            milestoneId: "m-2",
            title: "Database Design & API Development",
            description: "Design database schema, implement RESTful APIs, and set up authentication system",
            status: "approved",
            startDate: "2024-09-16",
            deadline: "2024-10-15",
            proofHash: "0x5678...efgh",
            blockchainTxId: "0xdef456...uvw012",
            approvedAt: "2024-10-14T10:15:00Z",
            approvedBy: "sup-1",
            approverFirstName: "Sarah",
            approverLastName: "Johnson",
            createdAt: "2024-09-16T08:00:00Z",
            tasks: [
              {
                taskId: "t-3",
                milestoneId: "m-2",
                title: "Database Schema Implementation",
                description: "Implement the designed database schema with all tables and relationships",
                details: "Create tables for users, courses, projects, milestones, tasks with proper foreign keys and indexes",
                status: "approved",
                assignedTo: "stu-3",
                assignedToName: "Jordan Lee",
                dueDate: "2024-09-25",
                completedAt: "2024-09-24T18:00:00Z",
                submittedAt: "2024-09-24T18:00:00Z",
                submissionDetails: "Implemented complete database schema with 12 tables, proper relationships, and optimized indexes. Added seed data for testing.",
                submissionUrl: "https://github.com/example/project/tree/main/database",
                submissionHash: "0x9c90e0a7b6e7c8d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1",
                submissionTxId: "0x3c4d5e6f7890abcdef1234567890abcdef123456",
                fileHash: "sha256:4d227e7b67d8e7b9c5c9e7e4b5b8d6e4e9d8e7b6c5b4c3e2f1e0b9c8b7a6a5b4",
                reviewedBy: "sup-1",
                reviewerName: "Sarah Johnson",
                reviewedAt: "2024-09-25T10:00:00Z",
                reviewComments: "Database schema is well-designed with proper normalization and efficient indexes.",
                createdAt: "2024-09-16T08:00:00Z",
              },
              {
                taskId: "t-4",
                milestoneId: "m-2",
                title: "Authentication API",
                description: "Implement user authentication and authorization APIs",
                details: "JWT-based authentication, role-based access control, password hashing, session management",
                status: "approved",
                assignedTo: "stu-4",
                assignedToName: "Sam Wilson",
                dueDate: "2024-10-05",
                completedAt: "2024-10-04T16:45:00Z",
                submittedAt: "2024-10-04T16:45:00Z",
                submissionDetails: "Implemented secure JWT authentication with refresh tokens, bcrypt password hashing, and role-based middleware.",
                submissionUrl: "https://github.com/example/project/tree/main/src/auth",
                submissionHash: "0xa6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9e8d7c6b5a4b3c2e1f0e9d8c7b6a5",
                submissionTxId: "0x4d5e6f7890abcdef1234567890abcdef12345678",
                fileHash: "sha256:6b4e3c2d1e0f9e8d7c6b5a4b3c2e1f0e9d8c7b6a5b4c3e2f1e0f9e8d7c6b5a4",
                reviewedBy: "sup-1",
                reviewerName: "Sarah Johnson",
                reviewedAt: "2024-10-05T11:00:00Z",
                reviewComments: "Excellent security implementation! Proper use of JWT and bcrypt. Good test coverage.",
                createdAt: "2024-09-16T08:00:00Z",
              },
            ],
          },
          {
            milestoneId: "m-3",
            title: "AI Model Training & Integration",
            description: "Train machine learning models for performance prediction and integrate with backend",
            status: "ready_for_review",
            startDate: "2024-10-16",
            deadline: "2024-11-30",
            proofHash: "0x9abc...ijkl",
            blockchainTxId: null,
            approvedAt: null,
            approvedBy: null,
            approverFirstName: null,
            approverLastName: null,
            createdAt: "2024-10-16T08:00:00Z",
            tasks: [
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
            ],
          },
          {
            milestoneId: "m-4",
            title: "Frontend Development",
            description: "Build responsive UI components, implement dashboards, and create user interfaces",
            status: "in_progress",
            startDate: "2024-11-01",
            deadline: "2024-12-15",
            proofHash: null,
            blockchainTxId: null,
            approvedAt: null,
            approvedBy: null,
            approverFirstName: null,
            approverLastName: null,
            createdAt: "2024-11-01T08:00:00Z",
            tasks: [
              {
                taskId: "t-7",
                milestoneId: "m-4",
                title: "Component Library Setup",
                description: "Set up design system and component library",
                details: "Configure Tailwind CSS, create reusable components, implement dark mode, set up Storybook",
                status: "in_progress",
                assignedTo: "stu-2",
                assignedToName: "Maya Patel",
                dueDate: "2024-11-15",
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
                taskId: "t-8",
                milestoneId: "m-4",
                title: "Dashboard Implementation",
                description: "Create student and faculty dashboards",
                details: "Student progress dashboard, faculty supervision interface, analytics charts, responsive design",
                status: "pending",
                assignedTo: "stu-3",
                assignedToName: "Jordan Lee",
                dueDate: "2024-12-10",
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
          },
          {
            milestoneId: "m-5",
            title: "Testing & Deployment",
            description: "Conduct comprehensive testing, fix bugs, and deploy to production environment",
            status: "not_started",
            startDate: "2024-12-16",
            deadline: "2025-01-15",
            proofHash: null,
            blockchainTxId: null,
            approvedAt: null,
            approvedBy: null,
            approverFirstName: null,
            approverLastName: null,
            createdAt: "2024-12-16T08:00:00Z",
            tasks: [
              {
                taskId: "t-9",
                milestoneId: "m-5",
                title: "Unit & Integration Testing",
                description: "Write comprehensive test suites",
                details: "Unit tests for all components, integration tests for APIs, end-to-end testing with Cypress",
                status: "pending",
                assignedTo: "stu-1",
                assignedToName: "Alex Thompson",
                dueDate: "2025-01-05",
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
                createdAt: "2024-12-16T08:00:00Z",
              },
              {
                taskId: "t-10",
                milestoneId: "m-5",
                title: "Production Deployment",
                description: "Deploy to production and configure monitoring",
                details: "Set up CI/CD pipeline, configure production servers, implement monitoring and logging",
                status: "pending",
                assignedTo: "stu-4",
                assignedToName: "Sam Wilson",
                dueDate: "2025-01-12",
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
                createdAt: "2024-12-16T08:00:00Z",
              },
            ],
          },
        ],
      };

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      setProject(mockProject);

      // Uncomment below when backend is ready
      // const response = await Axios.get(`/api/project/${projectId}`, {
      //   headers: { Authorization: `Bearer ${accessToken}` },
      // });
      // if (response.data.success) {
      //   const projectData = response.data.data;
      //   setProject({
      //     ...projectData,
      //     milestones: projectData.milestones || [],
      //     students: projectData.students || [],
      //   });
      // }
    } catch (error: any) {
      console.error("Error fetching project:", error);
      toast.error("Failed to load project details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (projectId && accessToken) {
      fetchProjectDetails();
    }
  }, [projectId, accessToken]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      proposed: { icon: FileText, color: "bg-blue-100 text-blue-700 border-blue-200", label: "Proposed" },
      ongoing: { icon: PlayCircle, color: "bg-yellow-100 text-yellow-700 border-yellow-200", label: "Ongoing" },
      completed: { icon: CheckCircle, color: "bg-green-100 text-green-700 border-green-200", label: "Completed" },
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
      ready_for_review: { icon: Eye, color: "bg-purple-100 text-purple-700", label: "Ready for Review" },
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

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!milestoneForm.title.trim()) {
      toast.error("Please enter milestone title");
      return;
    }

    try {
      // Mock milestone creation for frontend prototype
      const newMilestone: Milestone = {
        milestoneId: `m-${Date.now()}`,
        title: milestoneForm.title,
        description: milestoneForm.description || null,
        status: milestoneForm.status,
        startDate: milestoneForm.startDate || null,
        deadline: milestoneForm.deadline || null,
        proofHash: null,
        blockchainTxId: null,
        approvedAt: null,
        approvedBy: null,
        approverFirstName: null,
        approverLastName: null,
        createdAt: new Date().toISOString(),
        tasks: [], // Initialize with empty tasks array
      };

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Add to local state
      if (project) {
        setProject({
          ...project,
          milestones: [...project.milestones, newMilestone],
        });
      }

      toast.success("Milestone created successfully!");
      setShowMilestoneDialog(false);
      setMilestoneForm({
        title: "",
        description: "",
        status: "not_started",
        startDate: "",
        deadline: "",
      });

      // Uncomment below when backend is ready
      // const response = await Axios.post(
      //   "/api/milestone/create",
      //   {
      //     projectId,
      //     title: milestoneForm.title,
      //     description: milestoneForm.description || null,
      //     status: milestoneForm.status,
      //     startDate: milestoneForm.startDate || null,
      //     deadline: milestoneForm.deadline || null,
      //   },
      //   {
      //     headers: { Authorization: `Bearer ${accessToken}` },
      //   }
      // );
      // if (response.data.success) {
      //   toast.success("Milestone created successfully!");
      //   setShowMilestoneDialog(false);
      //   setMilestoneForm({
      //     title: "",
      //     description: "",
      //     status: "not_started",
      //     startDate: "",
      //     deadline: "",
      //   });
      //   fetchProjectDetails();
      // }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create milestone");
    }
  };

  // Task Management Functions
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!taskForm.title.trim() || !selectedMilestone) {
      toast.error("Please enter task title and select milestone");
      return;
    }

    try {
      const newTask: Task = {
        taskId: `t-${Date.now()}`,
        milestoneId: selectedMilestone,
        title: taskForm.title,
        description: taskForm.description || null,
        details: taskForm.details || null,
        status: "pending",
        assignedTo: taskForm.assignedTo || null,
        assignedToName: project?.students.find(s => s.userId === taskForm.assignedTo)?.firstName + " " +
                       project?.students.find(s => s.userId === taskForm.assignedTo)?.lastName || null,
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

      if (project) {
        const updatedMilestones = project.milestones.map(milestone =>
          milestone.milestoneId === selectedMilestone
            ? { ...milestone, tasks: [...milestone.tasks, newTask] }
            : milestone
        );

        setProject({ ...project, milestones: updatedMilestones });
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
      setSelectedMilestone(null);
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
      const submissionData = {
        taskId: selectedTask.taskId,
        submissionDetails: taskSubmitForm.submissionDetails,
        submissionUrl: taskSubmitForm.submissionUrl,
        submittedAt: new Date().toISOString(),
      };

      const submissionHash = `0x${Math.random().toString(16).substring(2, 66)}`;
      const blockchainTxId = `0x${Math.random().toString(16).substring(2, 42)}`;

      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate blockchain writing

      if (project) {
        const updatedMilestones = project.milestones.map(milestone => ({
          ...milestone,
          tasks: milestone.tasks.map(task =>
            task.taskId === selectedTask.taskId
              ? {
                  ...task,
                  status: "submitted",
                  submittedAt: new Date().toISOString(),
                  submissionDetails: taskSubmitForm.submissionDetails,
                  submissionUrl: taskSubmitForm.submissionUrl || null,
                  submissionHash,
                  submissionTxId: blockchainTxId,
                  fileHash: taskSubmitForm.submissionUrl ? `sha256:${Math.random().toString(16).substring(2, 66)}` : null,
                }
              : task
          )
        }));

        setProject({ ...project, milestones: updatedMilestones });
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

      if (project) {
        const updatedMilestones = project.milestones.map(milestone => ({
          ...milestone,
          tasks: milestone.tasks.map(task =>
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
          )
        }));

        setProject({ ...project, milestones: updatedMilestones });
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

  const generateBlockchainProof = (task: Task) => {
    if (!task.submissionHash || !task.submissionTxId) return null;

    return {
      hash: task.submissionHash,
      txId: task.submissionTxId,
      timestamp: task.submittedAt,
      verified: true,
    };
  };

  const toggleMilestoneExpansion = (milestoneId: string) => {
    setExpandedMilestones(prev => {
      const newSet = new Set(prev);
      if (newSet.has(milestoneId)) {
        newSet.delete(milestoneId);
      } else {
        newSet.add(milestoneId);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Clock className="w-12 h-12 text-blue-600" />
        </motion.div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <AlertCircle className="w-16 h-16 text-gray-400" />
        <h2 className="text-2xl font-bold text-gray-700">Project not found</h2>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const canManageProject = user?.role === "faculty" || user?.role === "department_admin" || user?.userId === project.supervisorId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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
            className="mb-6 hover:bg-blue-100 dark:hover:bg-blue-900/30"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Course
          </Button>

          <div className="flex items-start justify-between mb-8">
            <div className="flex-1">
              <motion.h1
                className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                {project.title}
              </motion.h1>
              <div className="flex items-center gap-3 flex-wrap">
                {getStatusBadge(project.status)}
                <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Created {formatDate(project.createdAt)}
                </span>
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
            {/* Description */}
            <Card className="border-2 border-blue-200 dark:border-blue-800 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30">
                <CardTitle className="text-blue-900 dark:text-blue-100 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Project Description
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {project.description ? (
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {project.description}
                  </p>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">
                    No description provided
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="border-2 border-purple-200 dark:border-purple-800 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30">
                <CardTitle className="text-purple-900 dark:text-purple-100 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Project Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      Start Date
                    </span>
                    <span className="text-lg font-bold text-purple-700 dark:text-purple-400">
                      {formatDate(project.startDate)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      End Date
                    </span>
                    <span className="text-lg font-bold text-pink-700 dark:text-pink-400">
                      {formatDate(project.endDate)}
                    </span>
                  </div>
                </div>
                {project.projectUrl && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                      <LinkIcon className="w-4 h-4" />
                      Project URL
                    </span>
                    <a
                      href={project.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 mt-2"
                    >
                      {project.projectUrl}
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
                    Milestones ({project.milestones.length})
                  </CardTitle>
                  {canManageProject && (
                    <Dialog open={showMilestoneDialog} onOpenChange={setShowMilestoneDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Milestone
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl dark:bg-slate-950 bg-slate-100">
                        <DialogHeader>
                          <DialogTitle>Create New Milestone</DialogTitle>
                          <DialogDescription>
                            Add a new milestone to track project progress
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateMilestone} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="milestone-title">
                              Title <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="milestone-title"
                              placeholder="Milestone title"
                              value={milestoneForm.title}
                              onChange={(e) =>
                                setMilestoneForm({ ...milestoneForm, title: e.target.value })
                              }
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="milestone-description">Description</Label>
                            <Textarea
                              id="milestone-description"
                              placeholder="Milestone description"
                              value={milestoneForm.description}
                              onChange={(e) =>
                                setMilestoneForm({ ...milestoneForm, description: e.target.value })
                              }
                              rows={3}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="milestone-start">Start Date</Label>
                              <Input
                                id="milestone-start"
                                type="date"
                                value={milestoneForm.startDate}
                                onChange={(e) =>
                                  setMilestoneForm({ ...milestoneForm, startDate: e.target.value })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="milestone-deadline">Deadline</Label>
                              <Input
                                id="milestone-deadline"
                                type="date"
                                value={milestoneForm.deadline}
                                onChange={(e) =>
                                  setMilestoneForm({ ...milestoneForm, deadline: e.target.value })
                                }
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="milestone-status">Status</Label>
                            <Select
                              value={milestoneForm.status}
                              onValueChange={(value) =>
                                setMilestoneForm({ ...milestoneForm, status: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="not_started">Not Started</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="ready_for_review">Ready for Review</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex justify-end gap-3 pt-4">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setShowMilestoneDialog(false)}
                            >
                              Cancel
                            </Button>
                            <Button type="submit" className="bg-green-600 hover:bg-green-700">
                              Create Milestone
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <ScrollArea className="h-[500px] pr-4">
                  <AnimatePresence>
                    {project.milestones.length === 0 ? (
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
                        {project.milestones.map((milestone, index) => (
                          <motion.div
                            key={milestone.milestoneId}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => router.push(`/semester/project/${projectId}/milestone/${milestone.milestoneId}`)}
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
                            {milestone.proofHash && (
                              <div className="mt-3 p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded text-xs">
                                <span className="font-semibold flex items-center gap-1">
                                  <Hash className="w-3 h-3" />
                                  Proof Hash:
                                </span>
                                <code className="text-indigo-700 dark:text-indigo-400">
                                  {milestone.proofHash}
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
            {/* Supervisor */}
            <Card className="border-2 border-orange-200 dark:border-orange-800 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30">
                <CardTitle className="text-orange-900 dark:text-orange-100 flex items-center gap-2 text-base">
                  <User className="w-5 h-5" />
                  Project Supervisor
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-lg">
                    {project.supervisorFirstName[0]}
                    {project.supervisorLastName[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {project.supervisorFirstName} {project.supervisorLastName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {project.supervisorEmail}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team Members */}
            <Card className="border-2 border-teal-200 dark:border-teal-800 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/30 dark:to-cyan-900/30">
                <CardTitle className="text-teal-900 dark:text-teal-100 flex items-center gap-2 text-base">
                  <Users className="w-5 h-5" />
                  Team Members ({project.students.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ScrollArea className="max-h-[400px]">
                  <div className="space-y-3">
                    {project.students.map((student, index) => (
                      <motion.div
                        key={student.userId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="flex items-center gap-3 p-3 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-lg"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm">
                          {student.firstName[0]}
                          {student.lastName[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            {student.email}
                          </p>
                          {student.role && (
                            <Badge variant="outline" className="mt-1 text-xs">
                              {student.role}
                            </Badge>
                          )}
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
                      const count = project.milestones.filter((m) => m.status === status).length;
                      const percentage =
                        project.milestones.length > 0
                          ? (count / project.milestones.length) * 100
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
    </div>
  );
}
