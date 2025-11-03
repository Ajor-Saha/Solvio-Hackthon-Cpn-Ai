"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Axios } from "@/config/axios";
import useAuthStore from "@/store/store";
import {
  Award,
  BookOpen,
  Brain,
  CheckCircle,
  Clock,
  Download,
  Edit,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  Presentation,
  Sparkles,
  Trash2,
  TrendingUp,
  XCircle
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import AddResourceDialog from "./AddResourceDialog";
import EditResourceDialog from "./EditResourceDialog";

interface CourseResource {
  resourceId: string;
  courseId: string;
  title: string;
  description: string | null;
  resourceType: "pdf" | "ppt" | "image" | "link";
  fileUrl: string;
  fileSize: string | null;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string | null;
  uploaderFirstName: string;
  uploaderLastName: string;
  uploaderEmail: string;
}

interface CourseResourcesProps {
  courseId: string;
}

// Mock quiz data structure
interface QuizQuestion {
  questionId: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
}

interface Quiz {
  quizId: string;
  title: string;
  description: string;
  resourceId: string;
  resourceTitle: string;
  questions: QuizQuestion[];
  createdAt: string;
  totalAttempts: number;
  averageScore: number;
  status: "draft" | "published";
}

interface QuizAttempt {
  attemptId: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
  timeTaken: number; // in seconds
}

// Mock data for existing quizzes
const MOCK_QUIZZES: Quiz[] = [
  {
    quizId: "quiz-1",
    title: "Introduction to Machine Learning - Quiz",
    description: "Test your understanding of basic ML concepts covered in the lecture slides",
    resourceId: "resource-1",
    resourceTitle: "ML Lecture 1: Introduction",
    questions: [
      {
        questionId: "q1",
        question: "What is the primary goal of supervised learning?",
        options: [
          "To find patterns in unlabeled data",
          "To learn from labeled training data to make predictions",
          "To maximize rewards through trial and error",
          "To reduce the dimensionality of data"
        ],
        correctAnswer: 1,
        explanation: "Supervised learning uses labeled training data to learn patterns and make predictions on new, unseen data.",
        difficulty: "easy"
      },
      {
        questionId: "q2",
        question: "Which of the following is NOT a type of machine learning?",
        options: [
          "Supervised Learning",
          "Unsupervised Learning",
          "Reinforcement Learning",
          "Predetermined Learning"
        ],
        correctAnswer: 3,
        explanation: "The three main types of machine learning are supervised, unsupervised, and reinforcement learning. 'Predetermined Learning' is not a recognized type.",
        difficulty: "easy"
      },
      {
        questionId: "q3",
        question: "What is overfitting in machine learning?",
        options: [
          "When a model performs well on training data but poorly on test data",
          "When a model is too simple to capture patterns",
          "When training takes too long",
          "When there is too much training data"
        ],
        correctAnswer: 0,
        explanation: "Overfitting occurs when a model learns the training data too well, including noise and outliers, resulting in poor generalization to new data.",
        difficulty: "medium"
      }
    ],
    createdAt: "2024-01-15T10:30:00Z",
    totalAttempts: 45,
    averageScore: 78,
    status: "published"
  },
  {
    quizId: "quiz-2",
    title: "Neural Networks Fundamentals",
    description: "Quiz based on Neural Networks PDF resource",
    resourceId: "resource-2",
    resourceTitle: "Neural Networks Chapter 1",
    questions: [
      {
        questionId: "q4",
        question: "What is the primary function of an activation function in a neural network?",
        options: [
          "To initialize weights",
          "To introduce non-linearity",
          "To calculate loss",
          "To update gradients"
        ],
        correctAnswer: 1,
        explanation: "Activation functions introduce non-linearity into the network, allowing it to learn complex patterns.",
        difficulty: "medium"
      },
      {
        questionId: "q5",
        question: "Which activation function is most commonly used in hidden layers of modern deep neural networks?",
        options: [
          "Sigmoid",
          "Tanh",
          "ReLU",
          "Linear"
        ],
        correctAnswer: 2,
        explanation: "ReLU (Rectified Linear Unit) is widely used because it helps avoid vanishing gradient problems and is computationally efficient.",
        difficulty: "medium"
      }
    ],
    createdAt: "2024-01-20T14:20:00Z",
    totalAttempts: 32,
    averageScore: 72,
    status: "published"
  }
];

// Mock quiz attempts
const MOCK_ATTEMPTS: QuizAttempt[] = [
  {
    attemptId: "attempt-1",
    quizId: "quiz-1",
    score: 85,
    totalQuestions: 3,
    completedAt: "2024-01-16T09:15:00Z",
    timeTaken: 420
  },
  {
    attemptId: "attempt-2",
    quizId: "quiz-2",
    score: 100,
    totalQuestions: 2,
    completedAt: "2024-01-21T11:30:00Z",
    timeTaken: 180
  }
];

const CourseResources = ({ courseId }: CourseResourcesProps) => {
  const [resources, setResources] = useState<CourseResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingResource, setEditingResource] = useState<CourseResource | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingResource, setDeletingResource] = useState<CourseResource | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { accessToken, user } = useAuthStore();

  // Quiz-related state
  const [quizzes, setQuizzes] = useState<Quiz[]>(MOCK_QUIZZES);
  const [attempts, setAttempts] = useState<QuizAttempt[]>(MOCK_ATTEMPTS);
  const [showQuizSection, setShowQuizSection] = useState(false);
  const [selectedResource, setSelectedResource] = useState<CourseResource | null>(null);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<Quiz | null>(null);
  const [activeTab, setActiveTab] = useState<"generate" | "existing" | "take">("generate");
  const [takingQuiz, setTakingQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  useEffect(() => {
    fetchResources();
  }, [courseId]);

  const fetchResources = async () => {
    if (!accessToken || !courseId) return;

    try {
      setIsLoading(true);
      const response = await Axios.get(`/api/course-resource/${courseId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.data.success) {
        setResources(response.data.data || []);
      }
    } catch (error: any) {
      console.error("Error fetching course resources:", error);
      toast.error("Failed to load course resources");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (resourceId: string) => {
    try {
      const response = await Axios.delete(
        `/api/course-resource/delete/${resourceId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Resource deleted successfully");
        setIsDeleteDialogOpen(false);
        setDeletingResource(null);
        fetchResources(); // Refresh the list
      }
    } catch (error: any) {
      console.error("Error deleting resource:", error);
      toast.error(error.response?.data?.message || "Failed to delete resource");
    }
  };

  const handleDeleteClick = (resource: CourseResource) => {
    setDeletingResource(resource);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setIsDeleteDialogOpen(false);
    setDeletingResource(null);
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="w-6 h-6 text-red-500" />;
      case "ppt":
        return <Presentation className="w-6 h-6 text-orange-500" />;
      case "image":
        return <ImageIcon className="w-6 h-6 text-blue-500" />;
      case "link":
        return <LinkIcon className="w-6 h-6 text-green-500" />;
      default:
        return <FileText className="w-6 h-6 text-gray-500" />;
    }
  };

  const getResourceBadgeColor = (type: string) => {
    switch (type) {
      case "pdf":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800";
      case "ppt":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800";
      case "image":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800";
      case "link":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const canDelete = (resource: CourseResource) => {
    // User can delete if they are the uploader or department admin
    return (
      user?.userId === resource.uploadedBy || user?.role === "department_admin"
    );
  };

  const canEdit = (resource: CourseResource) => {
    // User can edit if they are the uploader or department admin
    return (
      user?.userId === resource.uploadedBy || user?.role === "department_admin"
    );
  };

  const canAddResource = () => {
    // Only department admin or faculty can add resources
    return user?.role === "department_admin" || user?.role === "faculty";
  };

  const handleEditClick = (resource: CourseResource) => {
    setEditingResource(resource);
    setIsEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false);
    setEditingResource(null);
  };

  const handleOpenLink = (url: string) => {
    // Clean the URL - remove any extra formatting or wrapper characters
    let cleanUrl = url.trim();

    // Remove JSON-like wrapping if present
    if (cleanUrl.startsWith('{"') && cleanUrl.endsWith('"}')) {
      cleanUrl = cleanUrl.slice(2, -2);
    } else if (cleanUrl.startsWith('{') && cleanUrl.endsWith('}')) {
      cleanUrl = cleanUrl.slice(1, -1);
    }

    // Remove quotes if present
    cleanUrl = cleanUrl.replace(/^["']|["']$/g, '');

    // Ensure URL has protocol
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }

    console.log('Opening URL:', cleanUrl);
    window.open(cleanUrl, "_blank", "noopener,noreferrer");
  };

  // Quiz-related functions
  const handleGenerateQuiz = async (resource: CourseResource) => {
    setIsGeneratingQuiz(true);

    // Simulate AI quiz generation
    setTimeout(() => {
      const newQuiz: Quiz = {
        quizId: `quiz-${Date.now()}`,
        title: `${resource.title} - Auto-Generated Quiz`,
        description: `AI-generated quiz based on ${resource.title}`,
        resourceId: resource.resourceId,
        resourceTitle: resource.title,
        questions: [
          {
            questionId: `q-${Date.now()}-1`,
            question: `What is the main topic covered in ${resource.title}?`,
            options: [
              "Advanced algorithms and data structures",
              "Basic programming fundamentals",
              "Machine learning techniques",
              "Database management systems"
            ],
            correctAnswer: 2,
            explanation: "Based on the resource content, this focuses on machine learning concepts.",
            difficulty: "easy"
          },
          {
            questionId: `q-${Date.now()}-2`,
            question: "Which concept is most emphasized in this resource?",
            options: [
              "Theoretical foundations",
              "Practical implementation",
              "Historical context",
              "Future trends"
            ],
            correctAnswer: 1,
            explanation: "The resource emphasizes practical implementation with hands-on examples.",
            difficulty: "medium"
          },
          {
            questionId: `q-${Date.now()}-3`,
            question: "What is a key takeaway from this material?",
            options: [
              "Understanding basic syntax",
              "Mastering advanced optimization techniques",
              "Learning deployment strategies",
              "All of the above"
            ],
            correctAnswer: 3,
            explanation: "The material covers multiple aspects comprehensively.",
            difficulty: "hard"
          }
        ],
        createdAt: new Date().toISOString(),
        totalAttempts: 0,
        averageScore: 0,
        status: "draft"
      };

      setGeneratedQuiz(newQuiz);
      setQuizzes(prev => [newQuiz, ...prev]);
      setIsGeneratingQuiz(false);
      toast.success("Quiz generated successfully!");
    }, 2000);
  };

  const handleOpenQuizDialog = (resource: CourseResource) => {
    setSelectedResource(resource);
    setShowQuizSection(true);
    setActiveTab("generate");
    setGeneratedQuiz(null);
    setTakingQuiz(null);
    setQuizCompleted(false);

    // Scroll to quiz section
    setTimeout(() => {
      document.getElementById('quiz-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleStartQuiz = (quiz: Quiz) => {
    setTakingQuiz(quiz);
    setActiveTab("take");
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizCompleted(false);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: answerIndex
    }));
  };

  const handleNextQuestion = () => {
    if (takingQuiz && currentQuestionIndex < takingQuiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = () => {
    if (!takingQuiz) return;

    let correct = 0;
    takingQuiz.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correct++;
      }
    });

    const score = Math.round((correct / takingQuiz.questions.length) * 100);
    setQuizScore(score);
    setQuizCompleted(true);

    // Add attempt to mock data
    const newAttempt: QuizAttempt = {
      attemptId: `attempt-${Date.now()}`,
      quizId: takingQuiz.quizId,
      score,
      totalQuestions: takingQuiz.questions.length,
      completedAt: new Date().toISOString(),
      timeTaken: 300 // 5 minutes
    };
    setAttempts(prev => [newAttempt, ...prev]);

    toast.success(`Quiz completed! Your score: ${score}%`);
  };

  const getAttemptForQuiz = (quizId: string) => {
    return attempts.find(attempt => attempt.quizId === quizId);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400";
      case "medium":
        return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "hard":
        return "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  if (isLoading) {
    return (
      <>
        {canAddResource() && (
          <div className="mb-4 flex justify-end">
            <AddResourceDialog courseId={courseId} onResourceAdded={fetchResources} />
          </div>
        )}
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
        </div>
      </>
    );
  }

  if (resources.length === 0) {
    return (
      <>
        {canAddResource() && (
          <div className="mb-4 flex justify-end">
            <AddResourceDialog courseId={courseId} onResourceAdded={fetchResources} />
          </div>
        )}
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <FileText className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              No resources available
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Course resources will be displayed here once uploaded
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Add Resource Button */}
      {canAddResource() && (
        <div className="mb-4 flex justify-end">
          <AddResourceDialog courseId={courseId} onResourceAdded={fetchResources} />
        </div>
      )}

      {/* Resources List */}
      <div className="space-y-4">
        {resources.map((resource) => (
          <Card
            key={resource.resourceId}
            className="border-2 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow bg-white dark:bg-gray-900"
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {/* Resource Icon */}
                <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-200 dark:border-gray-700">
                  {getResourceIcon(resource.resourceType)}
                </div>

                {/* Resource Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1 line-clamp-2">
                        {resource.title}
                      </h3>
                      {resource.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                          {resource.description}
                        </p>
                      )}
                    </div>
                    <Badge
                      className={`${getResourceBadgeColor(
                        resource.resourceType
                      )} uppercase text-xs font-semibold flex-shrink-0`}
                    >
                      {resource.resourceType}
                    </Badge>
                  </div>

                  {/* Meta Information */}
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <span className="flex items-center gap-1">
                      <span className="font-medium">Uploaded by:</span>
                      {resource.uploaderFirstName} {resource.uploaderLastName}
                    </span>
                    <span className="text-gray-300 dark:text-gray-700">•</span>
                    <span>{formatDate(resource.createdAt)}</span>
                    {resource.fileSize && (
                      <>
                        <span className="text-gray-300 dark:text-gray-700">•</span>
                        <span>{resource.fileSize}</span>
                      </>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {resource.resourceType === "link" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleOpenLink(resource.fileUrl)}
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open Link
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => window.open(resource.fileUrl, "_blank", "noopener,noreferrer")}
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30"
                      onClick={() => handleOpenQuizDialog(resource)}
                    >
                      <Brain className="w-4 h-4" />
                      Generate Quiz
                    </Button>

                    {canEdit(resource) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                        onClick={() => handleEditClick(resource)}
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </Button>
                    )}

                    {canDelete(resource) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                        onClick={() => handleDeleteClick(resource)}
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Resource Dialog */}
      <EditResourceDialog
        resource={editingResource}
        open={isEditDialogOpen}
        onClose={handleEditDialogClose}
        onResourceUpdated={fetchResources}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={handleDeleteDialogClose}>
        <AlertDialogContent className="dark:bg-slate-950 bg-slate-100">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Resource?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{deletingResource?.title}&quot;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingResource && handleDelete(deletingResource.resourceId)}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Quiz Section - Displayed Below Resources */}
      {showQuizSection && (
        <div id="quiz-section" className="mt-8 pt-8 border-t-4 border-purple-200 dark:border-purple-800">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Quiz Manager
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Generate AI-powered quizzes or take existing quizzes
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setShowQuizSection(false);
                setSelectedResource(null);
                setGeneratedQuiz(null);
                setTakingQuiz(null);
                setQuizCompleted(false);
              }}
              className="gap-2"
            >
              <XCircle className="w-4 h-4" />
              Close
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 mb-6">
            <button
              onClick={() => setActiveTab("generate")}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === "generate"
                  ? "text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <Sparkles className="w-4 h-4 inline mr-2" />
              Generate Quiz
            </button>
            <button
              onClick={() => setActiveTab("existing")}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === "existing"
                  ? "text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <BookOpen className="w-4 h-4 inline mr-2" />
              Existing Quizzes ({quizzes.length})
            </button>
          </div>

          {/* Generate Quiz Tab */}
          {activeTab === "generate" && (
            <div className="space-y-4">
              {selectedResource && (
                <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                      {getResourceIcon(selectedResource.resourceType)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        {selectedResource.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedResource.description || "No description available"}
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {!generatedQuiz && !isGeneratingQuiz && (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Generate AI-Powered Quiz
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    Our AI will analyze the resource content and create a comprehensive quiz with multiple-choice questions
                  </p>
                  <Button
                    onClick={() => selectedResource && handleGenerateQuiz(selectedResource)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Quiz Now
                  </Button>
                </div>
              )}

              {isGeneratingQuiz && (
                <div className="text-center py-12">
                  <div className="relative w-20 h-20 mx-auto mb-4">
                    <div className="absolute inset-0 border-4 border-purple-200 dark:border-purple-800 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-purple-600 dark:border-purple-400 rounded-full border-t-transparent animate-spin"></div>
                    <Brain className="w-8 h-8 text-purple-600 dark:text-purple-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Generating Quiz...
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    AI is analyzing the content and creating questions
                  </p>
                </div>
              )}

              {generatedQuiz && (
                <div className="space-y-4">
                  <Card className="p-6 border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
                    <div className="flex items-start gap-3 mb-4">
                      <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                          Quiz Generated Successfully!
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          {generatedQuiz.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                            <FileText className="w-4 h-4" />
                            {generatedQuiz.questions.length} Questions
                          </span>
                          <span className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                            <Clock className="w-4 h-4" />
                            ~{generatedQuiz.questions.length * 2} minutes
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {generatedQuiz.questions.map((question, index) => (
                        <div
                          key={question.questionId}
                          className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">
                              Q{index + 1}. {question.question}
                            </h4>
                            <Badge className={`${getDifficultyColor(question.difficulty)} text-xs`}>
                              {question.difficulty}
                            </Badge>
                          </div>
                          <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            {question.options.map((option, optIndex) => (
                              <li key={optIndex} className="flex items-center gap-2">
                                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-medium">
                                  {String.fromCharCode(65 + optIndex)}
                                </span>
                                {option}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 flex gap-3">
                      <Button
                        onClick={() => handleStartQuiz(generatedQuiz)}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                      >
                        <Award className="w-4 h-4 mr-2" />
                        Take Quiz Now
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setGeneratedQuiz(null);
                          toast.success("Quiz saved to existing quizzes");
                        }}
                      >
                        Save & Close
                      </Button>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* Existing Quizzes Tab */}
          {activeTab === "existing" && (
            <div className="space-y-4">
              {quizzes.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No quizzes available yet. Generate one to get started!
                  </p>
                </div>
              ) : (
                quizzes.map((quiz) => {
                  const attempt = getAttemptForQuiz(quiz.quizId);
                  return (
                    <Card
                      key={quiz.quizId}
                      className="p-6 hover:shadow-lg transition-shadow border-2 border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                              {quiz.title}
                            </h3>
                            <Badge
                              className={
                                quiz.status === "published"
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                  : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                              }
                            >
                              {quiz.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {quiz.description}
                          </p>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <FileText className="w-4 h-4" />
                              {quiz.questions.length} Questions
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4" />
                              Avg Score: {quiz.averageScore}%
                            </span>
                            <span className="flex items-center gap-1">
                              <Award className="w-4 h-4" />
                              {quiz.totalAttempts} Attempts
                            </span>
                          </div>
                        </div>
                      </div>

                      {attempt && (
                        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              <div>
                                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                  Your Score: {attempt.score}%
                                </p>
                                <p className="text-xs text-blue-700 dark:text-blue-300">
                                  Completed {new Date(attempt.completedAt).toLocaleDateString()} • Time: {formatTime(attempt.timeTaken)}
                                </p>
                              </div>
                            </div>
                            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                              {attempt.score >= 80 ? "Excellent" : attempt.score >= 60 ? "Good" : "Needs Practice"}
                            </Badge>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-3">
                        <Button
                          onClick={() => handleStartQuiz(quiz)}
                          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                        >
                          {attempt ? "Retake Quiz" : "Take Quiz"}
                        </Button>
                        <Button variant="outline" size="sm">
                          <FileText className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          )}

          {/* Take Quiz Tab */}
          {activeTab === "take" && takingQuiz && !quizCompleted && (
            <div className="space-y-6">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Question {currentQuestionIndex + 1} of {takingQuiz.questions.length}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {Math.round(((currentQuestionIndex + 1) / takingQuiz.questions.length) * 100)}% Complete
                  </span>
                </div>
                <Progress
                  value={((currentQuestionIndex + 1) / takingQuiz.questions.length) * 100}
                  className="h-2"
                />
              </div>

              {/* Question Card */}
              <Card className="p-6 border-2 border-purple-200 dark:border-purple-800">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex-1">
                    {takingQuiz.questions[currentQuestionIndex].question}
                  </h3>
                  <Badge className={`${getDifficultyColor(takingQuiz.questions[currentQuestionIndex].difficulty)} ml-2`}>
                    {takingQuiz.questions[currentQuestionIndex].difficulty}
                  </Badge>
                </div>

                <RadioGroup
                  value={selectedAnswers[currentQuestionIndex]?.toString()}
                  onValueChange={(value: string) => handleAnswerSelect(parseInt(value))}
                >
                  <div className="space-y-3">
                    {takingQuiz.questions[currentQuestionIndex].options.map((option, index) => (
                      <div
                        key={index}
                        className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                          selectedAnswers[currentQuestionIndex] === index
                            ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700"
                        }`}
                        onClick={() => handleAnswerSelect(index)}
                      >
                        <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                        <Label
                          htmlFor={`option-${index}`}
                          className="flex-1 cursor-pointer font-medium text-gray-900 dark:text-gray-100"
                        >
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 text-sm font-semibold mr-3">
                            {String.fromCharCode(65 + index)}
                          </span>
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </Card>

              {/* Navigation Buttons */}
              <div className="flex justify-between gap-3">
                <Button
                  variant="outline"
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  Previous
                </Button>
                <div className="flex gap-2">
                  {currentQuestionIndex < takingQuiz.questions.length - 1 ? (
                    <Button onClick={handleNextQuestion} className="bg-purple-600 hover:bg-purple-700">
                      Next
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmitQuiz}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      disabled={Object.keys(selectedAnswers).length !== takingQuiz.questions.length}
                    >
                      Submit Quiz
                    </Button>
                  )}
                </div>
              </div>

              {/* Answer Status */}
              <div className="flex gap-2 flex-wrap justify-center">
                {takingQuiz.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`w-10 h-10 rounded-lg font-medium text-sm transition-all ${
                      index === currentQuestionIndex
                        ? "bg-purple-600 text-white scale-110"
                        : selectedAnswers[index] !== undefined
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quiz Results */}
          {activeTab === "take" && quizCompleted && takingQuiz && (
            <div className="space-y-6">
              <Card className={`p-8 text-center ${
                quizScore >= 80 ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" :
                quizScore >= 60 ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800" :
                "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
              }`}>
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  quizScore >= 80 ? "bg-green-100 dark:bg-green-900/40" :
                  quizScore >= 60 ? "bg-yellow-100 dark:bg-yellow-900/40" :
                  "bg-red-100 dark:bg-red-900/40"
                }`}>
                  {quizScore >= 80 ? (
                    <Award className="w-12 h-12 text-green-600 dark:text-green-400" />
                  ) : quizScore >= 60 ? (
                    <TrendingUp className="w-12 h-12 text-yellow-600 dark:text-yellow-400" />
                  ) : (
                    <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
                  )}
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {quizScore >= 80 ? "Excellent Work!" : quizScore >= 60 ? "Good Job!" : "Keep Practicing!"}
                </h2>
                <p className="text-5xl font-bold mb-2" style={{
                  background: quizScore >= 80 ? "linear-gradient(to right, #10b981, #059669)" :
                             quizScore >= 60 ? "linear-gradient(to right, #f59e0b, #d97706)" :
                             "linear-gradient(to right, #ef4444, #dc2626)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}>
                  {quizScore}%
                </p>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  You answered {Object.values(selectedAnswers).filter((ans, idx) =>
                    ans === takingQuiz.questions[idx].correctAnswer
                  ).length} out of {takingQuiz.questions.length} questions correctly
                </p>
              </Card>

              {/* Question Review */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Review Answers</h3>
                {takingQuiz.questions.map((question, index) => {
                  const userAnswer = selectedAnswers[index];
                  const isCorrect = userAnswer === question.correctAnswer;
                  return (
                    <Card key={question.questionId} className={`p-6 border-2 ${
                      isCorrect ? "border-green-200 dark:border-green-800" : "border-red-200 dark:border-red-800"
                    }`}>
                      <div className="flex items-start gap-3 mb-4">
                        {isCorrect ? (
                          <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
                        )}
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">
                            Q{index + 1}. {question.question}
                          </h4>
                          <div className="space-y-2">
                            {question.options.map((option, optIndex) => (
                              <div
                                key={optIndex}
                                className={`p-3 rounded-lg ${
                                  optIndex === question.correctAnswer
                                    ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                                    : optIndex === userAnswer && !isCorrect
                                    ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                                    : "bg-gray-50 dark:bg-gray-800"
                                }`}
                              >
                                <span className="font-medium">
                                  {String.fromCharCode(65 + optIndex)}.
                                </span>{" "}
                                {option}
                                {optIndex === question.correctAnswer && (
                                  <Badge className="ml-2 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                                    Correct
                                  </Badge>
                                )}
                                {optIndex === userAnswer && !isCorrect && (
                                  <Badge className="ml-2 bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                                    Your Answer
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              <span className="font-semibold">Explanation:</span> {question.explanation}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setQuizCompleted(false);
                    setActiveTab("existing");
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Back to Quizzes
                </Button>
                <Button
                  onClick={() => handleStartQuiz(takingQuiz)}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  Retake Quiz
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default CourseResources;
