"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Axios } from "@/config/axios";
import { env } from "@/config/env";
import useAuthStore from "@/store/store";
import { Award, Plus, Search, Star, Trophy, Users, Archive } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Achievement {
  achievementId: string;
  title: string;
  description: string;
  achievementType: string;
  awardedTo?: string;
  awardingOrganization?: string;
  achievementDate?: string;
  certificateUrl?: string;
  imageUrl?: string;
  featured: boolean;
  status: string;
  publishedAt?: string;
  createdAt: string;
}

interface AchievementStats {
  total: number;
  published: number;
  draft: number;
  featured: number;
}

const achievementTypes = [
  { value: "award", label: "Award", color: "bg-yellow-100 text-yellow-800" },
  { value: "certification", label: "Certification", color: "bg-blue-100 text-blue-800" },
  { value: "recognition", label: "Recognition", color: "bg-green-100 text-green-800" },
  { value: "scholarship", label: "Scholarship", color: "bg-purple-100 text-purple-800" },
  { value: "publication", label: "Publication", color: "bg-indigo-100 text-indigo-800" },
  { value: "patent", label: "Patent", color: "bg-pink-100 text-pink-800" },
  { value: "other", label: "Other", color: "bg-gray-100 text-gray-800" },
];

export default function AchievementsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<AchievementStats>({ total: 0, published: 0, draft: 0, featured: 0 });
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
      const [achievementsResponse, statsResponse] = await Promise.all([
        Axios.get(`${env.BACKEND_BASE_URL}/api/achievements`, {
          params: {
            search: searchQuery || undefined,
            status: statusFilter === "all" ? undefined : statusFilter,
            type: typeFilter === "all" ? undefined : typeFilter,
            limit: 20,
          },
        }),
        Axios.get(`${env.BACKEND_BASE_URL}/api/achievements/stats`),
      ]);

      if (achievementsResponse.data.success) {
        setAchievements(achievementsResponse.data.data.data || []);
      }
      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }
    } catch (error: any) {
      console.error("Error fetching achievements:", error);
      toast.error("Failed to load achievements");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (achievementId: string) => {
    if (!confirm("Are you sure you want to delete this achievement?")) return;

    try {
      const response = await Axios.delete(`${env.BACKEND_BASE_URL}/api/achievements/${achievementId}`);
      if (response.data.success) {
        toast.success("Achievement deleted successfully");
        fetchData();
      }
    } catch (error: any) {
      console.error("Error deleting achievement:", error);
      toast.error("Failed to delete achievement");
    }
  };

  const getTypeColor = (type: string) => {
    return achievementTypes.find(t => t.value === type)?.color || "bg-gray-100 text-gray-800";
  };

  const getTypeLabel = (type: string) => {
    return achievementTypes.find(t => t.value === type)?.label || type;
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
            <Award className="h-8 w-8 text-primary" />
            Achievements
          </h1>
          <p className="text-muted-foreground mt-2">
            Showcase department achievements, awards, and recognitions
          </p>
        </div>
        <Link href="/announcement/achievements/create">
          <Button size="lg" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Achievement
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Trophy className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.published}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Featured</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.featured}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <Archive className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.draft}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search achievements by title, awardee, or organization..."
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
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {achievementTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Achievements Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
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
      ) : achievements.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Award className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Achievements Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                ? "No achievements match your current filters"
                : "Start by adding your first achievement"}
            </p>
            <Link href="/announcement/achievements/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Achievement
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement) => (
            <Card key={achievement.achievementId} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2 flex items-center gap-2">
                      {achievement.title}
                      {achievement.featured && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                    </CardTitle>
                    {achievement.awardedTo && (
                      <p className="text-sm text-muted-foreground mb-1">🏆 {achievement.awardedTo}</p>
                    )}
                    {achievement.awardingOrganization && (
                      <p className="text-sm text-muted-foreground">🏢 {achievement.awardingOrganization}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <Badge
                      variant={achievement.status === "published" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {achievement.status}
                    </Badge>
                    <Badge variant="outline" className={`text-xs ${getTypeColor(achievement.achievementType)}`}>
                      {getTypeLabel(achievement.achievementType)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {achievement.description}
                </p>
                {achievement.achievementDate && (
                  <p className="text-sm text-muted-foreground mb-4">
                    📅 {new Date(achievement.achievementDate).toLocaleDateString()}
                  </p>
                )}
                <div className="flex gap-2">
                  <Link href={`/announcement/achievements/${achievement.achievementId}?edit=true`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(achievement.achievementId)}
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
