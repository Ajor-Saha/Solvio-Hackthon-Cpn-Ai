"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Axios } from "@/config/axios";
import { env } from "@/config/env";
import useAuthStore from "@/store/store";
import { Microscope, Plus, Search, BookOpen, Users, Archive, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Research {
  researchId: string;
  title: string;
  description?: string;
  status: string;
  startDate?: string;
  endDate?: string;
  publicationUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface ResearchStats {
  total: number;
  ongoing: number;
  completed: number;
  published: number;
}

const researchStatuses = [
  { value: "proposed", label: "Proposed", color: "bg-gray-100 text-gray-800" },
  { value: "ongoing", label: "Ongoing", color: "bg-blue-100 text-blue-800" },
  { value: "completed", label: "Completed", color: "bg-green-100 text-green-800" },
  { value: "published", label: "Published", color: "bg-purple-100 text-purple-800" },
  { value: "archived", label: "Archived", color: "bg-yellow-100 text-yellow-800" },
];

export default function ResearchPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [research, setResearch] = useState<Research[]>([]);
  const [stats, setStats] = useState<ResearchStats>({ total: 0, ongoing: 0, completed: 0, published: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (user?.role !== "department_admin") {
      router.push("/dashboard");
      return;
    }
    fetchData();
  }, [user, statusFilter, searchQuery]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [researchResponse, statsResponse] = await Promise.all([
        Axios.get(`${env.BACKEND_BASE_URL}/api/research`, {
          params: {
            search: searchQuery || undefined,
            status: statusFilter === "all" ? undefined : statusFilter,
            limit: 20,
          },
        }),
        Axios.get(`${env.BACKEND_BASE_URL}/api/research/admin/stats`),
      ]);

      if (researchResponse.data.success) {
        setResearch(researchResponse.data.data.data || []);
      }
      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }
    } catch (error: any) {
      console.error("Error fetching research:", error);
      toast.error("Failed to load research");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (researchId: string) => {
    if (!confirm("Are you sure you want to delete this research?")) return;

    try {
      const response = await Axios.delete(`${env.BACKEND_BASE_URL}/api/research/${researchId}`);
      if (response.data.success) {
        toast.success("Research deleted successfully");
        fetchData();
      }
    } catch (error: any) {
      console.error("Error deleting research:", error);
      toast.error("Failed to delete research");
    }
  };

  const getStatusColor = (status: string) => {
    return researchStatuses.find(s => s.value === status)?.color || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status: string) => {
    return researchStatuses.find(s => s.value === status)?.label || status;
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
            <Microscope className="h-8 w-8 text-primary" />
            Research Projects
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage research projects, publications, and academic work
          </p>
        </div>
        <Link href="/announcement/research/create">
          <Button size="lg" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Research
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Microscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ongoing</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.ongoing}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <BookOpen className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Archive className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.published}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search research by title or description..."
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
            {researchStatuses.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Research Grid */}
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
      ) : research.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Microscope className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Research Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || statusFilter !== "all"
                ? "No research projects match your current filters"
                : "Start by adding your first research project"}
            </p>
            <Link href="/announcement/research/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Research
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {research.map((item) => (
            <Card key={item.researchId} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{item.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-xs ${getStatusColor(item.status)}`}>
                        {getStatusLabel(item.status)}
                      </Badge>
                      {item.publicationUrl && (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                          <LinkIcon className="h-3 w-3 mr-1" />
                          Published
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {item.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {item.description}
                  </p>
                )}
                <div className="space-y-2 mb-4">
                  {item.startDate && (
                    <p className="text-sm text-muted-foreground">
                      📅 Started: {new Date(item.startDate).toLocaleDateString()}
                    </p>
                  )}
                  {item.endDate && (
                    <p className="text-sm text-muted-foreground">
                      🏁 End: {new Date(item.endDate).toLocaleDateString()}
                    </p>
                  )}
                  {item.publicationUrl && (
                    <p className="text-sm text-muted-foreground">
                      🔗 <a href={item.publicationUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        View Publication
                      </a>
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link href={`/announcement/research/${item.researchId}?edit=true`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(item.researchId)}
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
