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
import { Axios } from "@/config/axios";
import useAuthStore from "@/store/store";
import {
  Download,
  Edit,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  Presentation,
  Trash2
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

const CourseResources = ({ courseId }: CourseResourcesProps) => {
  const [resources, setResources] = useState<CourseResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingResource, setEditingResource] = useState<CourseResource | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingResource, setDeletingResource] = useState<CourseResource | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { accessToken, user } = useAuthStore();

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
    </>
  );
};

export default CourseResources;
