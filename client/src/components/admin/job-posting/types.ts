/**
 * Job Posting Types
 * API Documentation:
 * 1. GET All Jobs
 *    URL: GET /api/jobs?jobType=internship&location=remote&page=1&limit=10
 *    Success: { statusCode:200, data:{ data:Job[], total:number, page:number, limit:number }, success:true }
 *    Error:   { success:false, message:"..." }
 *
 * 2. GET Single
 *    URL: GET /api/jobs/:jobId
 *    Success: { statusCode:200, data:JobFull, success:true }
 *    Error:   { success:false, message:"Job not found" }
 *
 * 3. POST Create
 *    URL: POST /api/jobs
 *    Body: { title*, description*, companyName?, location?, jobType, externalUrl*, applicationDeadline?, status? }
 *    Success: { statusCode:201, data:{ jobId, title, status, postedAt }, success:true }
 *    Error:   { success:false, message:"Invalid request payload" }
 *
 * 4. PUT Update
 *    URL: PUT /api/jobs/:jobId
 *    Body: Partial<CreateBody>
 *    Success: { statusCode:200, data:{ jobId, title, status, updatedAt }, success:true }
 *    Error:   { success:false, message:"Unable to update job" }
 *
 * 5. DELETE Soft
 *    URL: DELETE /api/jobs/:jobId
 *    Success: { data:{ success:true, deletedAt }, success:true }
 *    Error:   { success:false, message:"Internal Server Error" }
 */

export interface Job {
  jobId: string;
  title: string;
  description: string;
  companyName?: string;
  location?: string;
  jobType: "full_time" | "internship" | "contract" | "part_time";
  externalUrl: string;
  applicationDeadline?: string;
  status: "active" | "closed" | "draft";
  postedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface JobFull extends Job {
  departmentId: string;
  postedBy: string;
  deletedAt?: string | null;
}

export interface CreateJobPayload {
  title: string;
  description: string;
  companyName?: string;
  location?: string;
  jobType: "full_time" | "internship" | "contract" | "part_time";
  externalUrl: string;
  applicationDeadline?: string;
  status?: "active" | "closed" | "draft";
  departmentId?: string;
}

export interface ListJobResponse {
  data: Job[];
  total: number;
  page: number;
  limit: number;
}

export interface JobStatsResponse {
  totalJobs: number;
  activeJobs: number;
  closedJobs: number;
  draftJobs: number;
  archivedJobs: number;
}

export interface ApiResponse<T> {
  statusCode?: number;
  data?: T;
  message?: string;
  success: boolean;
}

export interface CreateJobResponse {
  jobId: string;
  title: string;
  status: string;
  postedAt?: string;
}

export interface UpdateJobResponse {
  jobId: string;
  title: string;
  status: string;
  updatedAt: string;
}

export interface DeleteJobResponse {
  success: boolean;
  deletedAt: string;
}

export const JOB_TYPE_LABELS: Record<string, string> = {
  full_time: "Full Time",
  internship: "Internship",
  contract: "Contract",
  part_time: "Part Time",
};

export const JOB_TYPE_COLORS: Record<string, string> = {
  full_time: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  internship: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  contract: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  part_time: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

export const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  closed: "Closed",
  draft: "Draft",
};

export const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  closed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};
