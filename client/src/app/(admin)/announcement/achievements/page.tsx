"use client";

import {
  type Achievement,
  AchievementCard,
  type AchievementStatsResponse,
  type ApiResponse,
  CreateEditAchievementDialog,
  DeleteConfirmDialog,
  type ListAchievementResponse
} from "@/components/admin/achievement";
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

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const [createEditDialogOpen, setCreateEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    archived: 0,
    featured: 0,
  });

  // Fetch achievements
  const fetchAchievements = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page,
        limit,
      };

      if (searchTerm) params.q = searchTerm;
      if (statusFilter !== "all") params.status = statusFilter;
      if (typeFilter !== "all") params.type = typeFilter;

      const response = await Axios.get<ApiResponse<ListAchievementResponse>>(
        `${env.BACKEND_BASE_URL}/api/achievements`,
        { params }
      );

      if (response.data.success && response.data.data) {
        setAchievements(response.data.data.data);
        setTotal(response.data.data.total);

        // Fetch stats
        const statsResponse = await Axios.get<ApiResponse<AchievementStatsResponse>>(
          `${env.BACKEND_BASE_URL}/api/achievements/admin/stats`
        );

        if (statsResponse.data.success && statsResponse.data.data) {
          setStats(statsResponse.data.data);
        }
      } else {
        toast.error("Failed to load achievements");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to load achievements"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter, typeFilter]);

  useEffect(() => {
    fetchAchievements();
  }, [page, searchTerm, statusFilter, typeFilter]);

  const handleEdit = (achievement: Achievement) => {
    setEditingAchievement(achievement);
    setCreateEditDialogOpen(true);
  };

  const handleDelete = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setDeleteDialogOpen(true);
  };

  const handleCreateSuccess = () => {
    setEditingAchievement(null);
    fetchAchievements();
  };

  const handleDeleteSuccess = () => {
    setSelectedAchievement(null);
    fetchAchievements();
  };

  const handleNewAchievement = () => {
    setEditingAchievement(null);
    setCreateEditDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold">Achievements</h1>
            <p className="text-muted-foreground mt-1">
              Manage student and faculty achievements
            </p>
          </div>
          <Button size="lg" className="gap-2" onClick={handleNewAchievement}>
            <Plus className="w-5 h-5" />
            Add Achievement
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg">
                🏆
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
              <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center text-green-600 dark:text-green-400 font-bold text-lg">
                ✅
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
                📝
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Draft
                </p>
                <p className="text-2xl font-bold">{stats.draft}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400 font-bold text-lg">
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

          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-yellow-500/20 flex items-center justify-center text-yellow-600 dark:text-yellow-400 font-bold text-lg">
                ⭐
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Featured
                </p>
                <p className="text-2xl font-bold">{stats.featured}</p>
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
                placeholder="Search achievements..."
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
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="award">Award</SelectItem>
                <SelectItem value="certification">Certification</SelectItem>
                <SelectItem value="recognition">Recognition</SelectItem>
                <SelectItem value="scholarship">Scholarship</SelectItem>
                <SelectItem value="publication">Publication</SelectItem>
                <SelectItem value="patent">Patent</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Achievements Grid */}
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
          ) : achievements.length === 0 ? (
            <div className="bg-card rounded-lg border p-12 text-center">
              <p className="text-muted-foreground text-lg mb-4">
                No achievements found
              </p>
              <Button onClick={handleNewAchievement}>Create First Achievement</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement) => (
                <AchievementCard
                  key={achievement.achievementId}
                  achievement={achievement}
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
      <CreateEditAchievementDialog
        open={createEditDialogOpen}
        onOpenChange={setCreateEditDialogOpen}
        achievement={editingAchievement}
        onSuccess={handleCreateSuccess}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        achievement={selectedAchievement}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
