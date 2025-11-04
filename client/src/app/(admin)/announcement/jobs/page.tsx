"use client";

import {
  type ApiResponse,
  CreateEditJobDialog,
  DeleteConfirmDialog,
  type Job,
  JobPostCard,
  JobStatsResponse,
  type ListJobResponse
} from "@/components/admin/job-posting";
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

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const [createEditDialogOpen, setCreateEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    draft: 0,
    closed: 0,
    archived: 0,
  });

  // Fetch jobs
  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page,
        limit,
        jobStatus: "all", // Get all jobs regardless of status for admin
      };

      if (searchTerm) params.q = searchTerm;
      if (jobTypeFilter !== "all") params.jobType = jobTypeFilter;
      if (statusFilter !== "all") params.jobStatus = statusFilter;

      const response = await Axios.get<ApiResponse<ListJobResponse>>(
        `${env.BACKEND_BASE_URL}/api/jobs`,
        { params }
      );

      console.log("Jobs API Response:", response.data);

      if (response.data.success && response.data.data) {
        setJobs(response.data.data.data || []);
        setTotal(response.data.data.total || 0);

        // Calculate stats
        const allResponse = await Axios.get<ApiResponse<JobStatsResponse>>(
          `${env.BACKEND_BASE_URL}/api/jobs/admin/stats`
        );

        if (allResponse.data.success && allResponse.data.data) {
          const allJobs = allResponse.data.data;
          setStats({
            total: allJobs.totalJobs,
            active: allJobs.activeJobs,
            closed: allJobs.closedJobs,
            draft: allJobs.draftJobs,
            archived: allJobs.archivedJobs,
          });
        }
      } else {
        toast.error("Failed to load job postings");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to load job postings"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [searchTerm, jobTypeFilter, statusFilter]);

  useEffect(() => {
    fetchJobs();
  }, [page, searchTerm, jobTypeFilter, statusFilter]);

  const handleEdit = (job: Job) => {
    setEditingJob(job);
    setCreateEditDialogOpen(true);
  };

  const handleDelete = (job: Job) => {
    setSelectedJob(job);
    setDeleteDialogOpen(true);
  };

  const handleCreateSuccess = () => {
    setEditingJob(null);
    fetchJobs();
  };

  const handleDeleteSuccess = () => {
    setSelectedJob(null);
    fetchJobs();
  };

  const handleNewJob = () => {
    setEditingJob(null);
    setCreateEditDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold">Job Postings</h1>
            <p className="text-muted-foreground mt-1">
              Manage career opportunities
            </p>
          </div>
          <Button size="lg" className="gap-2" onClick={handleNewJob}>
            <Plus className="w-5 h-5" />
            Post Job
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg">
                📋
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Postings
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
                  Active
                </p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-lg">
                🎓
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
              <div className="h-10 w-10 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-lg">
                💼
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Closed
                </p>
                <p className="text-2xl font-bold">{stats.closed}</p>
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
                placeholder="Search job postings..."
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
              </SelectContent>
            </Select>
            <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="full_time">Full Time</SelectItem>
                <SelectItem value="internship">Internship</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="part_time">Part Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Job Posts Grid */}
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
          ) : jobs.length === 0 ? (
            <div className="bg-card rounded-lg border p-12 text-center">
              <p className="text-muted-foreground text-lg mb-4">
                No job postings found
              </p>
              <Button onClick={handleNewJob}>Create First Job Posting</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <JobPostCard
                  key={job.jobId}
                  job={job}
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
      <CreateEditJobDialog
        open={createEditDialogOpen}
        onOpenChange={setCreateEditDialogOpen}
        job={editingJob}
        onSuccess={handleCreateSuccess}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        job={selectedJob}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
