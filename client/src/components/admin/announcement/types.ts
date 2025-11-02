/**
 * Showcase Types
 * API Documentation:
 * 1. GET All Showcases
 *    URL: GET /api/showcases?page=1&limit=10&tags=AI,ML&featured=true&search=drug
 *    Success: { statusCode:200, data:{ data:Showcase[], total:number, page:number, limit:number }, message:"", success:true }
 *    Error:   { success:false, message:"..." }
 *
 * 2. GET Single
 *    URL: GET /api/showcases/:showcaseId
 *    Success: { statusCode:200, data:ShowcaseFull, message:"", success:true }
 *    Error:   { success:false, message:"Showcase not found" }
 *
 * 3. POST Create (Publish)
 *    URL: POST /api/showcases
 *    Body: { title, description, achievements?, tags[], thumbnailUrl?, featured, metadata?, departmentId, publishedAt? }
 *    Success: { data:{ showcaseId, title, featured, publishedAt }, success:true }
 *    Error:   { success:false, message:"Invalid request payload" }
 *
 * 4. PUT Update
 *    URL: PUT /api/showcases/:showcaseId
 *    Body: Partial<CreateBody>
 *    Success: { data:{ showcaseId, title, featured, updatedAt }, success:true }
 *    Error:   { success:false, message:"Unable to update showcase" }
 *
 * 5. DELETE Soft
 *    URL: DELETE /api/showcases/:showcaseId
 *    Success: { data:{ success:true, deletedAt }, success:true }
 *    Error:   { success:false, message:"Internal Server Error" }
 */

export interface Showcase {
  showcaseId: string;
  title: string;
  description: string;
  achievements?: string;
  tags: string[];
  thumbnailUrl?: string;
  featured: boolean;
  metadata?: Record<string, any>;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ShowcaseFull extends Showcase {
  departmentId: string;
  deletedAt?: string | null;
}

export interface CreateShowcasePayload {
  title: string;
  description: string;
  achievements?: string;
  tags: string[];
  thumbnailUrl?: string;
  featured: boolean;
  metadata?: Record<string, any>;
  departmentId?: string;
  publishedAt?: string;
}

export interface ListShowcaseResponse {
  data: Showcase[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiResponse<T> {
  statusCode?: number;
  data?: T;
  message?: string;
  success: boolean;
}

export interface CreateShowcaseResponse {
  showcaseId: string;
  title: string;
  featured: boolean;
  publishedAt?: string;
}

export interface UpdateShowcaseResponse {
  showcaseId: string;
  title: string;
  featured: boolean;
  updatedAt: string;
}

export interface DeleteShowcaseResponse {
  success: boolean;
  deletedAt: string;
}
