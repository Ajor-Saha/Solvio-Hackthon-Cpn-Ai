"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Axios } from "@/config/axios";
import { env } from "@/config/env";
import { toast } from "sonner";
import { Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { EditShowcaseDialog } from "@/components/admin/announcement/edit-showcase-dialog";
import { DeleteConfirmDialog } from "@/components/admin/announcement/delete-confirm-dialog";
import { ShowcasePostCard } from "@/components/admin/announcement/showcase-post-card";
import type {
  Showcase,
  ListShowcaseResponse,
  ApiResponse,
} from "@/components/admin/announcement/types";

interface FilterOptions {
  page: number;
  limit: number;
  search: string;
  featured?: boolean;
}

export default function AnnouncementPage() {
  const router = useRouter();
  const [showcases, setShowcases] = useState<Showcase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Selected showcase states
  const [selectedShowcase, setSelectedShowcase] = useState<Showcase>();
  const [editingShowcase, setEditingShowcase] = useState<Showcase>();

  // Filter states
  const [filters, setFilters] = useState<FilterOptions>({
    page: 1,
    limit: 12,
    search: "",
  });

  // Fetch showcases
  const fetchShowcases = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: filters.page.toString(),
        limit: filters.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.featured !== undefined && {
          featured: filters.featured.toString(),
        }),
      });

      const response = await Axios.get<ApiResponse<ListShowcaseResponse>>(
        `${env.BACKEND_BASE_URL}/api/showcases?${params.toString()}`
      );

      if (response.data.success && response.data.data) {
        setShowcases(response.data.data.data);
        setTotal(response.data.data.total);
      } else {
        toast.error("Failed to fetch showcases");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch showcases");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShowcases();
  }, [filters.page, filters.limit, filters.search, filters.featured]);

  // Handle actions
  const handleEdit = (showcase: Showcase) => {
    setEditingShowcase(showcase);
    setEditDialogOpen(true);
  };

  const handleDelete = (showcase: Showcase) => {
    setSelectedShowcase(showcase);
    setDeleteDialogOpen(true);
  };

  const handleEditSuccess = () => {
    fetchShowcases();
  };

  const handleDeleteSuccess = () => {
    fetchShowcases();
  };

  const handleNewShowcase = () => {
    router.push("/announcement/create");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Department Showcase
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and showcase your department's achievements and projects
          </p>
        </div>
        <Button onClick={handleNewShowcase} className="gap-2">
          <Plus className="w-4 h-4" />
          New Showcase
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search showcases..."
            value={filters.search}
            onChange={(e) =>
              setFilters({ ...filters, search: e.target.value, page: 1 })
            }
            className="pl-10"
          />
        </div>
        <Select
          value={
            filters.featured !== undefined ? filters.featured.toString() : "all"
          }
          onValueChange={(value) => {
            if (value === "all") {
              setFilters({ ...filters, featured: undefined, page: 1 });
            } else {
              setFilters({
                ...filters,
                featured: value === "true",
                page: 1,
              });
            }
          }}
        >
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Showcases</SelectItem>
            <SelectItem value="true">Featured Only</SelectItem>
            <SelectItem value="false">Regular Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Posts Grid - Single Column */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-3">
            <div className="animate-pulse space-y-3">
              <div className="h-64 bg-muted rounded-lg max-w-2xl mx-auto w-full"></div>
              <div className="h-4 bg-muted rounded w-3/4 max-w-2xl mx-auto"></div>
              <div className="h-4 bg-muted rounded w-1/2 max-w-2xl mx-auto"></div>
            </div>
          </div>
        </div>
      ) : showcases.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="text-6xl">📭</div>
            <div>
              <h3 className="font-semibold text-lg">No showcases found</h3>
              <p className="text-muted-foreground text-sm">
                Create your first showcase to get started
              </p>
            </div>
            <Button onClick={handleNewShowcase} className="gap-2">
              <Plus className="w-4 h-4" />
              Create First Showcase
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {showcases.map((showcase) => (
            <ShowcasePostCard
              key={showcase.showcaseId}
              showcase={showcase}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Pagination Info */}
      {showcases.length > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground pt-6 border-t">
          <p>
            Showing {showcases.length} of {total} showcases
          </p>
          {total > filters.limit && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setFilters({
                    ...filters,
                    page: Math.max(1, filters.page - 1),
                  })
                }
                disabled={filters.page === 1}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setFilters({
                    ...filters,
                    page: filters.page + 1,
                  })
                }
                disabled={filters.page * filters.limit >= total}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Dialogs */}
      <EditShowcaseDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        showcase={editingShowcase}
        onSuccess={handleEditSuccess}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        showcase={selectedShowcase}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
