/**
 * Competition Types and Constants
 * API Documentation:
 * 1. GET All Competitions: GET /api/competitions?type=hackathon&upcoming=true&page=1&limit=10
 * 2. GET Single: GET /api/competitions/:competitionId
 * 3. POST Create: POST /api/competitions
 * 4. PUT Update: PUT /api/competitions/:competitionId
 * 5. DELETE Soft: DELETE /api/competitions/:competitionId
 * 6. GET Admin List: GET /api/competitions/admin/list?status=draft&page=1&limit=20
 * 7. GET Stats: GET /api/competitions/admin/stats
 */

export interface Competition {
  competitionId: string;
  departmentId?: string;
  postedBy?: string;
  title: string;
  description: string;
  type: "hackathon" | "debate" | "datathon" | "programming_contest" | "math_competition" | "quiz" | "case_study" | "design_challenge" | "other";
  organizerName?: string;
  location?: string;
  eventDate?: string;
  registrationDeadline?: string;
  externalUrl: string;
  bannerUrl?: string;
  status: "active" | "closed" | "draft" | "archived";
  postedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCompetitionPayload {
  title: string;
  description: string;
  type: "hackathon" | "debate" | "datathon" | "programming_contest" | "math_competition" | "quiz" | "case_study" | "design_challenge" | "other";
  organizerName?: string;
  location?: string;
  eventDate?: string;
  registrationDeadline?: string;
  externalUrl: string;
  bannerUrl?: string;
  status?: "active" | "closed" | "draft";
}

export interface ListCompetitionResponse {
  data: Competition[];
  total: number;
  page: number;
  limit: number;
}

export interface CompetitionStatsResponse {
  total: number;
  active: number;
  ended: number;
  upcoming: number;
}

export interface ApiResponse<T> {
  statusCode?: number;
  data?: T;
  message?: string;
  success: boolean;
}

export interface CreateCompetitionResponse {
  competitionId: string;
  title: string;
  status: string;
  postedAt?: string;
}

export interface UpdateCompetitionResponse {
  competitionId: string;
  title: string;
  status: string;
  updatedAt: string;
}

// Type colors for badges
export const COMPETITION_TYPE_COLORS: Record<Competition["type"], string> = {
  hackathon: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  debate: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  datathon: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  programming_contest: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  math_competition: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  quiz: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  case_study: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
  design_challenge: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200",
  other: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
};

export const COMPETITION_TYPE_LABELS: Record<Competition["type"], string> = {
  hackathon: "Hackathon",
  debate: "Debate",
  datathon: "Datathon",
  programming_contest: "Programming Contest",
  math_competition: "Math Competition",
  quiz: "Quiz",
  case_study: "Case Study",
  design_challenge: "Design Challenge",
  other: "Other",
};

// Status colors for badges
export const STATUS_COLORS: Record<Competition["status"], string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  closed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  draft: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  archived: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
};

export const STATUS_LABELS: Record<Competition["status"], string> = {
  active: "Active",
  closed: "Closed",
  draft: "Draft",
  archived: "Archived",
};
