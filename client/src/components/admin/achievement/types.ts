/**
 * Achievement Types and Constants
 * API Documentation:
 * 1. GET All Achievements: GET /api/achievements?type=award&featured=true&page=1&limit=10
 * 2. GET Single: GET /api/achievements/:achievementId
 * 3. POST Create: POST /api/achievements
 * 4. PUT Update: PUT /api/achievements/:achievementId
 * 5. DELETE Soft: DELETE /api/achievements/:achievementId
 * 6. GET Admin List: GET /api/achievements/admin?status=published&page=1&limit=20
 * 7. GET Stats: GET /api/achievements/admin/stats
 */

export interface Achievement {
  achievementId: string;
  departmentId?: string;
  postedBy?: string;
  title: string;
  description: string;
  achievementType: "award" | "certification" | "recognition" | "scholarship" | "publication" | "patent" | "other";
  awardedTo?: string;
  awardingOrganization?: string;
  achievementDate?: string;
  certificateUrl?: string;
  imageUrl?: string;
  featured: boolean;
  status: "draft" | "published" | "archived";
  postedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAchievementPayload {
  title: string;
  description: string;
  achievementType: "award" | "certification" | "recognition" | "scholarship" | "publication" | "patent" | "other";
  awardedTo?: string;
  awardingOrganization?: string;
  achievementDate?: string;
  certificateUrl?: string;
  imageUrl?: string;
  featured?: boolean;
  status?: "draft" | "published" | "archived";
}

export interface ListAchievementResponse {
  data: Achievement[];
  total: number;
  page: number;
  limit: number;
}

export interface AchievementStatsResponse {
  total: number;
  published: number;
  draft: number;
  archived: number;
  featured: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  statusCode?: number;
}

// Achievement type colors for badges
export const ACHIEVEMENT_TYPE_COLORS: Record<Achievement["achievementType"], string> = {
  award: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  certification: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  recognition: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  scholarship: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  publication: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  patent: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  other: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
};

export const ACHIEVEMENT_TYPE_LABELS: Record<Achievement["achievementType"], string> = {
  award: "Award",
  certification: "Certification",
  recognition: "Recognition",
  scholarship: "Scholarship",
  publication: "Publication",
  patent: "Patent",
  other: "Other",
};

// Status colors for badges
export const STATUS_COLORS: Record<Achievement["status"], string> = {
  published: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
  archived: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export const STATUS_LABELS: Record<Achievement["status"], string> = {
  published: "Published",
  draft: "Draft",
  archived: "Archived",
};
