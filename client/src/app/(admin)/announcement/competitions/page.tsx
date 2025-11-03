"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Axios } from "@/config/axios";
import { env } from "@/config/env";
import useAuthStore from "@/store/store";
import { Trophy, Plus, Search, Calendar, Users, Archive, MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Competition {
  competitionId: string;
  title: string;
  description: string;
  type: string;
  organizerName?: string;
  location?: string;
  eventDate?: string;
  registrationDeadline?: string;
  externalUrl: string;
  bannerUrl?: string;
  status: string;
  publishedAt?: string;
  createdAt: string;
}

interface CompetitionStats {
  total: number;
  active: number;
  draft: number;
  closed: number;
}

const competitionTypes = [
  { value: "hackathon", label: "Hackathon", color: "bg-purple-100 text-purple-800" },
  { value: "debate", label: "Debate", color: "bg-blue-100 text-blue-800" },
  { value: "datathon", label: "Datathon", color: "bg-green-100 text-green-800" },
  { value: "programming_contest", label: "Programming Contest", color: "bg-orange-100 text-orange-800" },
  { value: "math_competition", label: "Math Competition", color: "bg-indigo-100 text-indigo-800" },
  { value: "quiz", label: "Quiz", color: "bg-yellow-100 text-yellow-800" },
  { value: "case_study", label: "Case Study", color: "bg-pink-100 text-pink-800" },
  { value: "design_challenge", label: "Design Challenge", color: "bg-teal-100 text-teal-800" },
  { value: "other", label: "Other", color: "bg-gray-100 text-gray-800" },
];

export default function CompetitionsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [stats, setStats] = useState<CompetitionStats>({ total: 0, active: 0, draft: 0, closed: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    if (user?.role !== "department_admin") {
      router.push("/dashboard");
      return;
    }
    fetchData();
  }, [user, statusFilter, typeFilter, searchQuery]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [competitionsResponse, statsResponse] = await Promise.all([
        Axios.get(`${env.BACKEND_BASE_URL}/api/competitions/admin/list`, {
          params: {
            q: searchQuery || undefined,
            status: statusFilter === "all" ? undefined : statusFilter,
            type: typeFilter === "all" ? undefined : typeFilter,
            limit: 20,
          },
        }),
        Axios.get(`${env.BACKEND_BASE_URL}/api/competitions/admin/stats`),
      ]);

      if (competitionsResponse.data.success) {
        setCompetitions(competitionsResponse.data.data.data || []);
      }
      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }
    } catch (error: any) {
      console.error("Error fetching competitions:", error);
      toast.error("Failed to load competitions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (competitionId: string) => {
    if (!confirm("Are you sure you want to delete this competition?")) return;

    try {
      const response = await Axios.delete(`${env.BACKEND_BASE_URL}/api/competitions/${competitionId}`);
      if (response.data.success) {
        toast.success("Competition deleted successfully");
        fetchData();
      }
    } catch (error: any) {
      console.error("Error deleting competition:", error);
      toast.error("Failed to delete competition");
    }
  };

  const getTypeColor = (type: string) => {
    return competitionTypes.find(t => t.value === type)?.color || "bg-gray-100 text-gray-800";
  };

  const getTypeLabel = (type: string) => {
    return competitionTypes.find(t => t.value === type)?.label || type;
  };

  if (user?.role !== "department_admin") {
    return null;
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Trophy className="h-8 w-8 text-primary" />
            Competitions
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage competitions, contests, and challenges for students
          </p>
        </div>
        <Link href="/announcement/competitions/create">
          <Button size="lg" className="gap-2">
            <Plus className="h-4 w-4" />
            Create Competition
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <Users className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.draft}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Closed</CardTitle>
            <Archive className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.closed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search competitions by title, organizer, or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {competitionTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Competitions Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded-t-lg"></div>
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : competitions.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Competitions Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                ? "No competitions match your current filters"
                : "Start by creating your first competition"}
            </p>
            <Link href="/announcement/competitions/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Competition
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {competitions.map((competition) => (
            <Card key={competition.competitionId} className="hover:shadow-lg transition-shadow overflow-hidden">
              {competition.bannerUrl && (
                <div className="h-32 bg-gradient-to-r from-purple-400 to-blue-500 relative">
                  <img
                    src={competition.bannerUrl}
                    alt={competition.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{competition.title}</CardTitle>
                    {competition.organizerName && (
                      <p className="text-sm text-muted-foreground mb-1">🏢 {competition.organizerName}</p>
                    )}
                    {competition.location && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {competition.location}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <Badge
                      variant={competition.status === "active" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {competition.status}
                    </Badge>
                    <Badge variant="outline" className={`text-xs ${getTypeColor(competition.type)}`}>
                      {getTypeLabel(competition.type)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {competition.description}
                </p>
                <div className="space-y-2 mb-4">
                  {competition.eventDate && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Event: {new Date(competition.eventDate).toLocaleDateString()}
                    </p>
                  )}
                  {competition.registrationDeadline && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Deadline: {new Date(competition.registrationDeadline).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link href={`/announcement/competitions/${competition.competitionId}?edit=true`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(competition.competitionId)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
