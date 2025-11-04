"use client";

import {
  CompetitionCard,
  CreateEditCompetitionDialog,
  DeleteConfirmDialog,
  type Competition,
  type CompetitionStatsResponse,
} from "@/components/admin/competition";
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

export default function CompetitionsPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 9;

  const [createEditDialogOpen, setCreateEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCompetition, setEditingCompetition] = useState<Competition | null>(null);
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);

  const [stats, setStats] = useState<CompetitionStatsResponse | null>(null);

  const fetchCompetitions = async () => {
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
        Axios.get(`${env.BACKEND_BASE_URL}/api/competitions/admin/list`, { params }),
        Axios.get(`${env.BACKEND_BASE_URL}/api/competitions/admin/stats`),
      ]);

      if (listResponse.data.success && listResponse.data.data) {
        const payload = listResponse.data.data;
        let rows: Competition[] = [];
        let totalCount = 0;

        if (Array.isArray(payload)) {
          rows = payload;
          totalCount = rows.length;
        } else {
          rows = payload.competitions || payload.data || [];
          totalCount = payload.total || rows.length || 0;
        }

        setCompetitions(rows);
        setTotal(totalCount);
      } else {
        toast.error("Failed to load competitions");
      }

      if (statsResponse.data.success && statsResponse.data.data) {
        setStats(statsResponse.data.data);
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to load competitions"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter, typeFilter]);

  useEffect(() => {
    fetchCompetitions();
  }, [page, searchTerm, statusFilter, typeFilter]);

  const handleNewCompetition = () => {
    setEditingCompetition(null);
    setCreateEditDialogOpen(true);
  };

  const handleEdit = (competition: Competition) => {
    setEditingCompetition(competition);
    setCreateEditDialogOpen(true);
  };

  const handleDelete = (competition: Competition) => {
    setSelectedCompetition(competition);
    setDeleteDialogOpen(true);
  };

  const handleCreateSuccess = () => {
    setEditingCompetition(null);
    fetchCompetitions();
  };

  const handleDeleteSuccess = () => {
    setSelectedCompetition(null);
    fetchCompetitions();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold">Competitions</h1>
            <p className="text-muted-foreground mt-1">
              Manage competition announcements
            </p>
          </div>
          <Button size="lg" className="gap-2" onClick={handleNewCompetition}>
            <Plus className="w-5 h-5" />
            Add Competition
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-600 font-bold text-lg">
                🏆
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Events
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
              <div className="h-10 w-10 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-600 font-bold text-lg">
                📅
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Upcoming
                </p>
                <p className="text-2xl font-bold">{stats?.upcoming ?? 0}</p>
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
                  Ended
                </p>
                <p className="text-2xl font-bold">{stats?.ended ?? 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6 space-y-4">
          <div className="flex gap-2 flex-col sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search competitions..."
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
                <SelectItem value="hackathon">Hackathon</SelectItem>
                <SelectItem value="debate">Debate</SelectItem>
                <SelectItem value="datathon">Datathon</SelectItem>
                <SelectItem value="programming_contest">
                  Programming Contest
                </SelectItem>
                <SelectItem value="math_competition">Math Competition</SelectItem>
                <SelectItem value="quiz">Quiz</SelectItem>
                <SelectItem value="case_study">Case Study</SelectItem>
                <SelectItem value="design_challenge">Design Challenge</SelectItem>
                <SelectItem value="other">Other</SelectItem>
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
          ) : competitions.length === 0 ? (
            <div className="bg-card rounded-lg border p-12 text-center">
              <p className="text-muted-foreground text-lg mb-4">
                No competitions found
              </p>
              <Button onClick={handleNewCompetition}>Create First Competition</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {competitions.map((competition) => (
                <CompetitionCard
                  key={competition.competitionId}
                  competition={competition}
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

      <CreateEditCompetitionDialog
        open={createEditDialogOpen}
        onOpenChange={(open) => {
          setCreateEditDialogOpen(open);
          if (!open) setEditingCompetition(null);
        }}
        competition={editingCompetition}
        onSuccess={handleCreateSuccess}
      />

      {selectedCompetition && (
        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={(open) => {
            setDeleteDialogOpen(open);
            if (!open) setSelectedCompetition(null);
          }}
          competition={selectedCompetition}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
}
