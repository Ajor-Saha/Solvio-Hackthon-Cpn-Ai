/**
 * Higher Study Types and Constants
 * API Documentation:
 * 1. GET All Higher Studies: GET /api/higher-studies?type=masters&active=true&page=1&limit=10
 * 2. GET Single: GET /api/higher-studies/:higherStudyId
 * 3. POST Create: POST /api/higher-studies
 * 4. PUT Update: PUT /api/higher-studies/:higherStudyId
 * 5. DELETE Soft: DELETE /api/higher-studies/:higherStudyId
 * 6. GET Admin List: GET /api/higher-studies/admin?status=active&page=1&limit=20
 * 7. GET Stats: GET /api/higher-studies/admin/stats
 */

export interface HigherStudy {
  higherStudyId: string;
  departmentId?: string;
  postedBy?: string;
  title: string;
  description: string;
  studyType: "masters" | "phd" | "postdoc" | "fellowship" | "exchange_program" | "research_opportunity" | "scholarship";
  institution: string;
  location?: string;
  fieldOfStudy?: string;
  applicationDeadline?: string;
  startDate?: string;
  duration?: string;
  tuitionFee?: string;
  scholarshipAvailable: boolean;
  eligibilityCriteria?: string;
  applicationUrl: string;
  contactEmail?: string;
  imageUrl?: string;
  status: "draft" | "active" | "closed" | "archived";
  postedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateHigherStudyPayload {
  title: string;
  description: string;
  studyType: "masters" | "phd" | "postdoc" | "fellowship" | "exchange_program" | "research_opportunity" | "scholarship";
  institution: string;
  location?: string;
  fieldOfStudy?: string;
  applicationDeadline?: string;
  startDate?: string;
  duration?: string;
  tuitionFee?: string;
  scholarshipAvailable?: boolean;
  eligibilityCriteria?: string;
  applicationUrl: string;
  contactEmail?: string;
  imageUrl?: string;
  status?: "draft" | "active" | "closed" | "archived";
}

export interface ListHigherStudyResponse {
  data: HigherStudy[];
  total: number;
  page: number;
  limit: number;
}

export interface HigherStudyStatsResponse {
  total: number;
  active: number;
  draft: number;
  closed: number;
  archived: number;
  withScholarship: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  statusCode?: number;
}

// Higher study type colors for badges
export const HIGHER_STUDY_TYPE_COLORS: Record<HigherStudy["studyType"], string> = {
  masters: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  phd: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  postdoc: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  fellowship: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  exchange_program: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  research_opportunity: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
  scholarship: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
};

export const HIGHER_STUDY_TYPE_LABELS: Record<HigherStudy["studyType"], string> = {
  masters: "Masters",
  phd: "PhD",
  postdoc: "Postdoc",
  fellowship: "Fellowship",
  exchange_program: "Exchange Program",
  research_opportunity: "Research Opportunity",
  scholarship: "Scholarship",
};

// Status colors for badges
export const STATUS_COLORS: Record<HigherStudy["status"], string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
  closed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  archived: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
};

export const STATUS_LABELS: Record<HigherStudy["status"], string> = {
  active: "Active",
  draft: "Draft",
  closed: "Closed",
  archived: "Archived",
};
