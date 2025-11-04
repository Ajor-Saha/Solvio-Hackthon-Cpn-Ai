"use client";

import {
  CreateEditHigherStudyDialog,
  DeleteConfirmDialog,
  HigherStudyCard,
  type HigherStudy,
  type HigherStudyStatsResponse,
  type ListHigherStudyResponse,
} from "@/components/admin/higher-study";
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

export default function HigherStudiesPage() {
  const [higherStudies, setHigherStudies] = useState<HigherStudy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 9;

  const [createEditDialogOpen, setCreateEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingHigherStudy, setEditingHigherStudy] = useState<HigherStudy | null>(null);
  const [selectedHigherStudy, setSelectedHigherStudy] = useState<HigherStudy | null>(null);

  const [stats, setStats] = useState<HigherStudyStatsResponse | null>(null);

  const fetchHigherStudies = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = {
        page,
        limit,
      };

      if (searchTerm) params.q = searchTerm;
      if (statusFilter !== "all") params.status = statusFilter;
      if (typeFilter !== "all") params.type = typeFilter;

      const [listResponse, statsResponse] = await Promise.all([
        Axios.get(`${env.BACKEND_BASE_URL}/api/higher-studies`, { params }),
        Axios.get(`${env.BACKEND_BASE_URL}/api/higher-studies/admin/stats`),
      ]);

      if (listResponse.data.success && listResponse.data.data) {
        const payload = listResponse.data.data as ListHigherStudyResponse | HigherStudy[];
        let rows: HigherStudy[] = [];
        let totalCount = 0;

        if (Array.isArray(payload)) {
          rows = payload;
          totalCount = rows.length;
        } else {
          rows = payload.data || [];
          totalCount = payload.total || rows.length || 0;
        }

        setHigherStudies(rows);
        setTotal(totalCount);
      } else {
        toast.error("Failed to load higher studies");
      }

      if (statsResponse.data.success && statsResponse.data.data) {
        setStats(statsResponse.data.data);
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to load higher studies"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter, typeFilter]);

  useEffect(() => {
    fetchHigherStudies();
  }, [page, searchTerm, statusFilter, typeFilter]);

  const handleNewHigherStudy = () => {
    setEditingHigherStudy(null);
    setCreateEditDialogOpen(true);
  };

  const handleEdit = (higherStudy: HigherStudy) => {
    setEditingHigherStudy(higherStudy);
    setCreateEditDialogOpen(true);
  };

  const handleDelete = (higherStudy: HigherStudy) => {
    setSelectedHigherStudy(higherStudy);
    setDeleteDialogOpen(true);
  };

  const handleCreateSuccess = () => {
    setEditingHigherStudy(null);
    fetchHigherStudies();
  };

  const handleDeleteSuccess = () => {
    setSelectedHigherStudy(null);
    fetchHigherStudies();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold">Higher Studies</h1>
            <p className="text-muted-foreground mt-1">
              Manage higher education opportunities
            </p>
          </div>
          <Button size="lg" className="gap-2" onClick={handleNewHigherStudy}>
            <Plus className="w-5 h-5" />
            Add Higher Study
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-600 font-bold text-lg">
                🎓
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total
                </p>
                <p className="text-2xl font-bold">{stats?.total ?? 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center text-green-600 font-bold text-lg">
                ✅
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active
                </p>
                <p className="text-2xl font-bold">{stats?.active ?? 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gray-500/20 flex items-center justify-center text-gray-600 font-bold text-lg">
                📝
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Draft
                </p>
                <p className="text-2xl font-bold">{stats?.draft ?? 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-500/20 flex items-center justify-center text-red-600 font-bold text-lg">
                🔒
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Closed
                </p>
                <p className="text-2xl font-bold">{stats?.closed ?? 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-yellow-500/20 flex items-center justify-center text-yellow-600 font-bold text-lg">
                📦
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Archived
                </p>
                <p className="text-2xl font-bold">{stats?.archived ?? 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-600 font-bold text-lg">
                💰
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Scholarships
                </p>
                <p className="text-2xl font-bold">{stats?.withScholarship ?? 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6 space-y-4">
          <div className="flex gap-2 flex-col sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search higher studies..."
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="masters">Masters</SelectItem>
                <SelectItem value="phd">PhD</SelectItem>
                <SelectItem value="postdoc">Postdoc</SelectItem>
                <SelectItem value="fellowship">Fellowship</SelectItem>
                <SelectItem value="exchange_program">Exchange Program</SelectItem>
                <SelectItem value="research_opportunity">Research Opportunity</SelectItem>
                <SelectItem value="scholarship">Scholarship</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

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
          ) : higherStudies.length === 0 ? (
            <div className="bg-card rounded-lg border p-12 text-center">
              <p className="text-muted-foreground text-lg mb-4">
                No higher studies found
              </p>
              <Button onClick={handleNewHigherStudy}>Create First Higher Study</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {higherStudies.map((study) => (
                <HigherStudyCard
                  key={study.higherStudyId}
                  higherStudy={study}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>

        {total > limit && (
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((prev) => prev - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {Math.ceil(total / limit)}
            </span>
            <Button
              variant="outline"
              disabled={page >= Math.ceil(total / limit)}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      <CreateEditHigherStudyDialog
        open={createEditDialogOpen}
        onOpenChange={(open) => {
          setCreateEditDialogOpen(open);
          if (!open) setEditingHigherStudy(null);
        }}
        higherStudy={editingHigherStudy}
        onSuccess={handleCreateSuccess}
      />

      {selectedHigherStudy && (
        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={(open) => {
            setDeleteDialogOpen(open);
            if (!open) setSelectedHigherStudy(null);
          }}
          higherStudy={selectedHigherStudy}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
}
