"use client";

import {
    CompetitionCard,
    DeleteConfirmDialog,
    type Competition,
    type CompetitionStatsResponse
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
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface StatCard {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

export default function CompetitionsPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [stats, setStats] = useState<CompetitionStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Competition | null>(null);

  // Fetch competitions and stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch competitions
        const queryParams = new URLSearchParams();
        if (searchQuery) queryParams.append("q", searchQuery);
        if (statusFilter !== "all") queryParams.append("status", statusFilter);

        const [competitionsRes, statsRes] = await Promise.all([
          Axios.get(
            `${env.BACKEND_BASE_URL}/api/competitions?${queryParams.toString()}`
          ),
          Axios.get(
            `${env.BACKEND_BASE_URL}/api/competitions/admin/stats`
          ),
        ]);

        console.log("Competitions API Response:", competitionsRes.data);

        if (competitionsRes.data.success && competitionsRes.data.data) {
          // Handle both possible response structures
          const competitions = competitionsRes.data.data.competitions || competitionsRes.data.data.data || competitionsRes.data.data;
          setCompetitions(Array.isArray(competitions) ? competitions : []);
          console.log("Competitions data:", competitions);
        }

        if (statsRes.data.data) {
          setStats(statsRes.data.data);
          toast.success("Competition stats loaded successfully");
        }
      } catch (error: any) {
        console.error("Failed to fetch competitions:", error);
        toast.error("Failed to load competitions");
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchData, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, statusFilter]);

  const handleEdit = (competition: Competition) => {
    // Navigation to edit page is handled in CompetitionCard component
  };

  const handleDelete = (competitionId: string) => {
    const competition = competitions.find(
      (c) => c.competitionId === competitionId
    );
    if (competition) {
      setDeleteTarget(competition);
      setDeleteDialogOpen(true);
    }
  };

  const handleCreateSuccess = async () => {
    // Refetch data
    const response = await Axios.get(
      `${env.BACKEND_BASE_URL}/api/competitions/admin/list`
    );
    if (response.data.data) {
      setCompetitions(response.data.data);
    }
  };

  const handleDeleteSuccess = () => {
    setCompetitions(
      competitions.filter(
        (c) => c.competitionId !== deleteTarget?.competitionId
      )
    );
  };

  // Stat cards configuration
  const statCards: StatCard[] = [
    {
      label: "Total Events",
      value: stats?.total ?? 0,
      icon: "🏆",
      color: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      label: "Active",
      value: stats?.active ?? 0,
      icon: "✅",
      color: "bg-green-50 dark:bg-green-900/20",
    },
    {
      label: "Upcoming",
      value: stats?.upcoming ?? 0,
      icon: "📝",
      color: "bg-amber-50 dark:bg-amber-900/20",
    },
    {
      label: "Ended",
      value: stats?.ended ?? 0,
      icon: "🔒",
      color: "bg-red-50 dark:bg-red-900/20",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Competitions</h1>
            <p className="text-muted-foreground mt-1">
              Manage competition announcements
            </p>
          </div>
          <Link href="/announcement/competition/create">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Competition
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className={`${stat.color} rounded-lg p-4 border`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{stat.icon}</span>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search competitions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Competitions Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-80 bg-muted rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : competitions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
            {competitions.map((competition) => (
              <CompetitionCard
                key={competition.competitionId}
                competition={competition}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">
              No competitions found
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "Create your first competition announcement"}
            </p>
          </div>
        )}
      </div>

      {/* Dialogs */}
      {deleteTarget && (
        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          competition={deleteTarget}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
}
