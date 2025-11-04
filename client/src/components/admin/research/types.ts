/**
 * Research Types and Constants
 * API Documentation:
 * 1. GET All Research: GET /api/research?status=ongoing&page=1&limit=10
 * 2. GET Single: GET /api/research/:researchId
 * 3. POST Create: POST /api/research
 * 4. PUT Update: PUT /api/research/:researchId
 * 5. DELETE Soft: DELETE /api/research/:researchId
 * 6. GET Admin List: GET /api/research/admin?status=ongoing&page=1&limit=20
 * 7. GET Stats: GET /api/research/admin/stats
 */

export interface Research {
  researchId: string;
  departmentId?: string;
  supervisorId?: string;
  title: string;
  description?: string;
  courseId: string;
  status: "proposed" | "ongoing" | "completed" | "published" | "archived";
  startDate?: string;
  endDate?: string;
  publicationUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateResearchPayload {
  title: string;
  description?: string;
  courseId: string;
  supervisorId?: string;
  status?: "proposed" | "ongoing" | "completed" | "published" | "archived";
  startDate?: string;
  endDate?: string;
  publicationUrl?: string;
}

export interface ListResearchResponse {
  data: Research[];
  total: number;
  page: number;
  limit: number;
}

export interface ResearchStatsResponse {
  total: number;
  proposed: number;
  ongoing: number;
  completed: number;
  published: number;
  archived: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  statusCode?: number;
}

export interface Course {
  courseId: string;
  courseCode: string;
  title: string;
}

// Research status colors for badges
export const RESEARCH_STATUS_COLORS: Record<Research["status"], string> = {
  proposed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  ongoing: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  published: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  archived: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
};

export const RESEARCH_STATUS_LABELS: Record<Research["status"], string> = {
  proposed: "Proposed",
  ongoing: "Ongoing",
  completed: "Completed",
  published: "Published",
  archived: "Archived",
};
