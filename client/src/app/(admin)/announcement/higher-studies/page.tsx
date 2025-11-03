"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Axios } from "@/config/axios";
import { env } from "@/config/env";
import useAuthStore from "@/store/store";
import { GraduationCap, Plus, Search, Calendar, MapPin, Users, Archive, DollarSign } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface HigherStudy {
  higherStudyId: string;
  title: string;
  description: string;
  studyType: string;
  institution: string;
  location?: string;
  fieldOfStudy?: string;
  applicationDeadline?: string;
  startDate?: string;
  duration?: string;
  tuitionFee?: string;
  scholarshipAvailable?: string;
  applicationUrl: string;
  contactEmail?: string;
  imageUrl?: string;
  status: string;
  publishedAt?: string;
  createdAt: string;
}

interface HigherStudyStats {
  total: number;
  active: number;
  draft: number;
  closed: number;
}

const studyTypes = [
  { value: "masters", label: "Master's", color: "bg-blue-100 text-blue-800" },
  { value: "phd", label: "PhD", color: "bg-purple-100 text-purple-800" },
  { value: "postdoc", label: "Postdoc", color: "bg-green-100 text-green-800" },
  { value: "fellowship", label: "Fellowship", color: "bg-orange-100 text-orange-800" },
  { value: "exchange_program", label: "Exchange Program", color: "bg-teal-100 text-teal-800" },
  { value: "research_opportunity", label: "Research Opportunity", color: "bg-indigo-100 text-indigo-800" },
  { value: "scholarship", label: "Scholarship", color: "bg-yellow-100 text-yellow-800" },
];

export default function HigherStudiesPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [higherStudies, setHigherStudies] = useState<HigherStudy[]>([]);
  const [stats, setStats] = useState<HigherStudyStats>({ total: 0, active: 0, draft: 0, closed: 0 });
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
      const [studiesResponse, statsResponse] = await Promise.all([
        Axios.get(`${env.BACKEND_BASE_URL}/api/higher-studies`, {
          params: {
            search: searchQuery || undefined,
            status: statusFilter === "all" ? undefined : statusFilter,
            studyType: typeFilter === "all" ? undefined : typeFilter,
            limit: 20,
          },
        }),
        Axios.get(`${env.BACKEND_BASE_URL}/api/higher-studies/admin/stats`),
      ]);

      if (studiesResponse.data.success) {
        setHigherStudies(studiesResponse.data.data.data || []);
      }
      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }
    } catch (error: any) {
      console.error("Error fetching higher studies:", error);
      toast.error("Failed to load higher studies");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (higherStudyId: string) => {
    if (!confirm("Are you sure you want to delete this higher study opportunity?")) return;

    try {
      const response = await Axios.delete(`${env.BACKEND_BASE_URL}/api/higher-studies/${higherStudyId}`);
      if (response.data.success) {
        toast.success("Higher study opportunity deleted successfully");
        fetchData();
      }
    } catch (error: any) {
      console.error("Error deleting higher study:", error);
      toast.error("Failed to delete higher study opportunity");
    }
  };

  const getTypeColor = (type: string) => {
    return studyTypes.find(t => t.value === type)?.color || "bg-gray-100 text-gray-800";
  };

  const getTypeLabel = (type: string) => {
    return studyTypes.find(t => t.value === type)?.label || type;
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
            <GraduationCap className="h-8 w-8 text-primary" />
            Higher Studies
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage higher education opportunities, scholarships, and study programs
          </p>
        </div>
        <Link href="/announcement/higher-studies/create">
          <Button size="lg" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Opportunity
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
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
            placeholder="Search by title, institution, or field of study..."
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
            {studyTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Higher Studies Grid */}
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
      ) : higherStudies.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <GraduationCap className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Higher Study Opportunities Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                ? "No opportunities match your current filters"
                : "Start by adding your first higher study opportunity"}
            </p>
            <Link href="/announcement/higher-studies/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Opportunity
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {higherStudies.map((study) => (
            <Card key={study.higherStudyId} className="hover:shadow-lg transition-shadow overflow-hidden">
              {study.imageUrl && (
                <div className="h-32 bg-gradient-to-r from-blue-400 to-purple-500 relative">
                  <img
                    src={study.imageUrl}
                    alt={study.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{study.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mb-1">🏫 {study.institution}</p>
                    {study.location && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
                        <MapPin className="h-3 w-3" />
                        {study.location}
                      </p>
                    )}
                    {study.fieldOfStudy && (
                      <p className="text-sm text-muted-foreground">📚 {study.fieldOfStudy}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <Badge
                      variant={study.status === "active" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {study.status}
                    </Badge>
                    <Badge variant="outline" className={`text-xs ${getTypeColor(study.studyType)}`}>
                      {getTypeLabel(study.studyType)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {study.description}
                </p>
                <div className="space-y-2 mb-4">
                  {study.duration && (
                    <p className="text-sm text-muted-foreground">⏱️ Duration: {study.duration}</p>
                  )}
                  {study.tuitionFee && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {study.tuitionFee}
                    </p>
                  )}
                  {study.scholarshipAvailable && (
                    <p className="text-sm text-green-600">💰 Scholarship Available</p>
                  )}
                  {study.applicationDeadline && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Deadline: {new Date(study.applicationDeadline).toLocaleDateString()}
                    </p>
                  )}
                  {study.startDate && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Start: {new Date(study.startDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link href={`/announcement/higher-studies/${study.higherStudyId}?edit=true`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(study.higherStudyId)}
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
