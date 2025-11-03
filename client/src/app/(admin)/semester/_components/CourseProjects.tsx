"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Axios } from "@/config/axios";
import useAuthStore from "@/store/store";
import {
  Calendar,
  Clock,
  ExternalLink,
  FolderGit2,
  Loader2,
  Plus,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import CreateProjectForm from "./CreateProjectForm";

interface ProjectStudent {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "member" | "instructor";
}

interface Project {
  projectId: string;
  title: string;
  description: string | null;
  status: "proposed" | "ongoing" | "completed" | "archived";
  startDate: string | null;
  endDate: string | null;
  projectUrl: string | null;
  createdAt: string;
  students: ProjectStudent[];
  supervisorName: string;
}

interface CourseProjectsProps {
  courseId: string;
}

export default function CourseProjects({ courseId }: CourseProjectsProps) {
  const { user, accessToken } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [courseId]);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const response = await Axios.get(`/api/project/course/${courseId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.data.success) {
        setProjects(response.data.data);
      }
    } catch (error: any) {
      console.error("Error fetching projects:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch projects"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const canCreateProject = () => {
    // Only faculty and department admin can create projects
    return user?.role === "faculty" || user?.role === "department_admin";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "proposed":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "ongoing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "archived":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ongoing":
        return <Clock className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Projects</h2>
          <p className="text-muted-foreground">
            {user?.role === "student"
              ? "Your assigned projects"
              : "Manage course projects and student assignments"}
          </p>
        </div>
        {canCreateProject() && !showCreateForm && (
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Project
          </Button>
        )}
      </div>

      {/* Create Project Form */}
      {canCreateProject() && showCreateForm && (
        <CreateProjectForm
          courseId={courseId}
          onProjectCreated={() => {
            fetchProjects();
            setShowCreateForm(false);
          }}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Projects List */}
      {projects.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <FolderGit2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
              <p className="text-muted-foreground mb-4">
                {canCreateProject()
                  ? "Create your first project to get started"
                  : "No projects have been assigned yet"}
              </p>
              {canCreateProject() && (
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Project
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card
              key={project.projectId}
              className="hover:shadow-lg transition-shadow duration-200"
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg line-clamp-2">
                    {project.title}
                  </CardTitle>
                  <Badge
                    className={`${getStatusColor(project.status)} flex items-center gap-1`}
                  >
                    {getStatusIcon(project.status)}
                    {project.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Description */}
                {project.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {project.description}
                  </p>
                )}

                {/* Supervisor */}
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Supervisor:</span>
                  <span className="font-medium">{project.supervisorName}</span>
                </div>

                {/* Dates */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {formatDate(project.startDate)}
                    </span>
                  </div>
                  {project.endDate && (
                    <>
                      <span className="text-muted-foreground">→</span>
                      <span className="text-muted-foreground">
                        {formatDate(project.endDate)}
                      </span>
                    </>
                  )}
                </div>

                {/* Team Members */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Users className="w-4 h-4" />
                    <span>Team ({project.students.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {project.students.slice(0, 3).map((student) => (
                      <div
                        key={student.userId}
                        className="flex items-center gap-2 bg-accent px-2 py-1 rounded-md"
                        title={`${student.firstName} ${student.lastName} - ${student.email}`}
                      >
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs">
                            {getInitials(student.firstName, student.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium">
                          {student.firstName} {student.lastName[0]}.
                        </span>
                        {student.role === "instructor" && (
                          <Badge
                            variant="secondary"
                            className="text-xs px-1 py-0"
                          >
                            Instructor
                          </Badge>
                        )}
                      </div>
                    ))}
                    {project.students.length > 3 && (
                      <div className="flex items-center justify-center w-8 h-8 bg-accent rounded-full text-xs font-medium">
                        +{project.students.length - 3}
                      </div>
                    )}
                  </div>
                </div>

                {/* Project URL */}
                {project.projectUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() =>
                      window.open(project.projectUrl!, "_blank", "noopener,noreferrer")
                    }
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Project
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
