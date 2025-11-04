"use client";

import {
  type ApiResponse,
  CreateEditResearchDialog,
  DeleteConfirmDialog,
  type ListResearchResponse,
  type Research,
  ResearchCard,
  type ResearchStatsResponse
} from "@/components/admin/research";
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
import { Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ResearchPage() {
  const [research, setResearch] = useState<Research[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const [createEditDialogOpen, setCreateEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingResearch, setEditingResearch] = useState<Research | null>(null);
  const [selectedResearch, setSelectedResearch] = useState<Research | null>(null);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    proposed: 0,
    ongoing: 0,
    completed: 0,
    published: 0,
    archived: 0,
  });

  // Fetch research projects
  const fetchResearch = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page,
        limit,
      };

      if (searchTerm) params.q = searchTerm;
      if (statusFilter !== "all") params.status = statusFilter;

      const response = await Axios.get<ApiResponse<ListResearchResponse>>(
        `${env.BACKEND_BASE_URL}/api/research`,
        { params }
      );

      if (response.data.success && response.data.data) {
        setResearch(response.data.data.data);
        setTotal(response.data.data.total);

        // Fetch stats
        const statsResponse = await Axios.get<ApiResponse<ResearchStatsResponse>>(
          `${env.BACKEND_BASE_URL}/api/research/admin/stats`
        );

        if (statsResponse.data.success && statsResponse.data.data) {
          setStats(statsResponse.data.data);
        }
      } else {
        toast.error("Failed to load research projects");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to load research projects"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    fetchResearch();
  }, [page, searchTerm, statusFilter]);

  const handleEdit = (research: Research) => {
    setEditingResearch(research);
    setCreateEditDialogOpen(true);
  };

  const handleDelete = (research: Research) => {
    setSelectedResearch(research);
    setDeleteDialogOpen(true);
  };

  const handleCreateSuccess = () => {
    setEditingResearch(null);
    fetchResearch();
  };

  const handleDeleteSuccess = () => {
    setSelectedResearch(null);
    fetchResearch();
  };

  const handleNewResearch = () => {
    setEditingResearch(null);
    setCreateEditDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold">Research Projects</h1>
            <p className="text-muted-foreground mt-1">
              Manage research projects and publications
            </p>
          </div>
          <Button size="lg" className="gap-2" onClick={handleNewResearch}>
            <Plus className="w-5 h-5" />
            Add Research
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg">
                🔬
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total
                </p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg">
                💡
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Proposed
                </p>
                <p className="text-2xl font-bold">{stats.proposed}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-lg">
                ⚡
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Ongoing
                </p>
                <p className="text-2xl font-bold">{stats.ongoing}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center text-green-600 dark:text-green-400 font-bold text-lg">
                ✅
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Completed
                </p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-lg">
                📚
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Published
                </p>
                <p className="text-2xl font-bold">{stats.published}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gray-500/20 flex items-center justify-center text-gray-600 dark:text-gray-400 font-bold text-lg">
                📦
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Archived
                </p>
                <p className="text-2xl font-bold">{stats.archived}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-card rounded-lg border p-6 space-y-4">
          <div className="flex gap-2 flex-col sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search research projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="proposed">Proposed</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Research Projects Grid */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-card rounded-lg border animate-pulse h-80"
                />
              ))}
            </div>
          ) : research.length === 0 ? (
            <div className="bg-card rounded-lg border p-12 text-center">
              <p className="text-muted-foreground text-lg mb-4">
                No research projects found
              </p>
              <Button onClick={handleNewResearch}>Create First Research Project</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {research.map((project) => (
                <ResearchCard
                  key={project.researchId}
                  research={project}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {total > limit && (
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {Math.ceil(total / limit)}
            </span>
            <Button
              variant="outline"
              disabled={page >= Math.ceil(total / limit)}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <CreateEditResearchDialog
        open={createEditDialogOpen}
        onOpenChange={setCreateEditDialogOpen}
        research={editingResearch}
        onSuccess={handleCreateSuccess}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        research={selectedResearch}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
