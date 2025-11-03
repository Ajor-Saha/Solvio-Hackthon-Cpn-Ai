"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Axios } from "@/config/axios";
import useAuthStore from "@/store/store";
import {
  ArrowRight,
  Calendar,
  ExternalLink,
  FileText,
  FolderOpen,
  Lightbulb,
  Loader2,
  Mail,
  Plus,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CreateResearchForm } from "./CreateResearchForm";

interface Student {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string | null;
  role: string;
  joinedAt: string;
}

interface Research {
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

interface CourseResearchProps {
  courseId: string;
}

export function CourseResearch({ courseId }: CourseResearchProps) {
  const { user, accessToken } = useAuthStore();
  const router = useRouter();
  const [research, setResearch] = useState<Research[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const canCreateResearch = () => {
    return user?.role === "faculty" || user?.role === "department_admin";
  };

  const fetchResearch = async () => {
    try {
      setIsLoading(true);
      const response = await Axios.get(`/api/research/course/${courseId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.data.success) {
        setResearch(response.data.data || []);
      }
    } catch (error: any) {
      console.error("Error fetching research:", error);
      toast.error("Failed to load research");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (courseId && accessToken) {
      fetchResearch();
    }
  }, [courseId, accessToken]);

  const getStatusBadge = (status: string) => {
    const statusConfig: {
      [key: string]: { label: string; className: string };
    } = {
      proposed: {
        label: "📋 Proposed",
        className:
          "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      },
      ongoing: {
        label: "🔬 Ongoing",
        className:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      },
      completed: {
        label: "✅ Completed",
        className:
          "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      },
      published: {
        label: "📄 Published",
        className:
          "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      },
      archived: {
        label: "📦 Archived",
        className:
          "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
      },
    };

    const config = statusConfig[status] || statusConfig.proposed;
    return (
      <Badge className={config.className} variant="secondary">
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-orange-600" />
          <p className="text-gray-600 dark:text-gray-400">Loading research...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
            <Lightbulb className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Research
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {research.length} research {research.length === 1 ? "project" : "projects"}
            </p>
          </div>
        </div>

        {canCreateResearch() && !showCreateForm && (
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Research
          </Button>
        )}
      </div>

      {/* Create Form */}
      {canCreateResearch() && showCreateForm && (
        <CreateResearchForm
          courseId={courseId}
          onResearchCreated={() => {
            fetchResearch();
            setShowCreateForm(false);
          }}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Research List */}
      {research.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <FolderOpen className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              No research projects yet
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              {canCreateResearch()
                ? "Click the button above to create your first research project"
                : "Research projects will appear here once created"}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
          {research.map((item) => (
            <Card
              key={item.researchId}
              className="overflow-hidden hover:shadow-xl transition-all border-orange-200 dark:border-orange-800 hover:border-orange-300 dark:hover:border-orange-700 cursor-pointer group"
              onClick={() => router.push(`/semester/research/${item.researchId}`)}
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {getStatusBadge(item.status)}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1 line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors flex items-center gap-2">
                        {item.title}
                        <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h3>
                      {item.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Supervisor Info */}
                  <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                      {item.supervisorFirstName[0]}
                      {item.supervisorLastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {item.supervisorFirstName} {item.supervisorLastName}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {item.supervisorEmail}
                      </p>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium">Start:</span>
                      <span>{formatDate(item.startDate)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium">End:</span>
                      <span>{formatDate(item.endDate)}</span>
                    </div>
                  </div>

                  {/* Team Members */}
                  {item.students.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        <Users className="w-4 h-4" />
                        Research Team ({item.students.length})
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {item.students.map((student) => (
                          <div
                            key={student.userId}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-full text-xs border border-gray-200 dark:border-gray-700"
                          >
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-white text-[10px] font-bold">
                              {student.firstName[0]}
                              {student.lastName[0]}
                            </div>
                            <span className="font-medium">
                              {student.firstName} {student.lastName}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Links */}
                  {item.publicationUrl && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <a
                        href={item.publicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 hover:underline"
                      >
                        <FileText className="w-3 h-3" />
                        Publication
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
