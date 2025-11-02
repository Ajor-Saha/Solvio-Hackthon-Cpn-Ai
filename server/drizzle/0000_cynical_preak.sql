CREATE TYPE "public"."course_enrollment_role" AS ENUM('student', 'instructor');--> statement-breakpoint
CREATE TYPE "public"."resource_type" AS ENUM('pdf', 'ppt', 'image', 'link');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('student', 'faculty', 'department_admin');--> statement-breakpoint
CREATE TYPE "public"."milestone_status" AS ENUM('not_started', 'in_progress', 'ready_for_review', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('pending', 'in_progress', 'completed', 'submitted', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('proposed', 'ongoing', 'completed', 'archived');--> statement-breakpoint
CREATE TYPE "public"."research_status" AS ENUM('proposed', 'ongoing', 'completed', 'published', 'archived');--> statement-breakpoint
CREATE TABLE "tbl_course_enrollment" (
	"enrollment_id" text PRIMARY KEY NOT NULL,
	"course_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role_in_course" "course_enrollment_role" DEFAULT 'student' NOT NULL,
	"enrollment_date" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT current_timestamp
);
--> statement-breakpoint
CREATE TABLE "tbl_course" (
	"course_id" text PRIMARY KEY NOT NULL,
	"department_id" text NOT NULL,
	"course_code" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"semester" varchar(10) NOT NULL,
	"credits" integer NOT NULL,
	"capacity" integer DEFAULT 30 NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT current_timestamp
);
--> statement-breakpoint
CREATE TABLE "tbl_course_resource" (
	"resource_id" text PRIMARY KEY NOT NULL,
	"course_id" text NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"resource_type" "resource_type" NOT NULL,
	"file_url" text NOT NULL,
	"file_size" varchar(50),
	"uploaded_by" text NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT current_timestamp
);
--> statement-breakpoint
CREATE TABLE "tbl_department" (
	"department_id" text PRIMARY KEY NOT NULL,
	"institution_id" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(50) NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT current_timestamp
);
--> statement-breakpoint
CREATE TABLE "tbl_institution" (
	"institution_id" text PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(50) NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT current_timestamp,
	CONSTRAINT "tbl_institution_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "tbl_user" (
	"user_id" text PRIMARY KEY NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255),
	"email" varchar(255) NOT NULL,
	"password" text NOT NULL,
	"role" "user_role" DEFAULT 'student' NOT NULL,
	"department_id" text NOT NULL,
	"verify_code" text,
	"verify_code_expiry" timestamp,
	"is_verified" boolean DEFAULT false,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT current_timestamp,
	CONSTRAINT "tbl_user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "tbl_milestone" (
	"milestone_id" text PRIMARY KEY NOT NULL,
	"project_id" text,
	"research_id" text,
	"title" varchar(255) NOT NULL,
	"description" text,
	"status" "milestone_status" DEFAULT 'not_started' NOT NULL,
	"start_date" date,
	"deadline" date,
	"approved_at" timestamp,
	"approved_by" text,
	"proof_hash" varchar(255),
	"blockchain_tx_id" varchar(255),
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT current_timestamp
);
--> statement-breakpoint
CREATE TABLE "tbl_task" (
	"task_id" text PRIMARY KEY NOT NULL,
	"milestone_id" text NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"details" text,
	"status" "task_status" DEFAULT 'pending' NOT NULL,
	"assigned_to" text,
	"due_date" date,
	"completed_at" timestamp,
	"submitted_at" timestamp,
	"submission_details" text,
	"submission_url" text,
	"submission_hash" varchar(64),
	"submission_tx_id" varchar(255),
	"file_hash" varchar(64),
	"reviewed_by" text,
	"reviewed_at" timestamp,
	"review_comments" text,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT current_timestamp
);
--> statement-breakpoint
CREATE TABLE "tbl_project" (
	"project_id" text PRIMARY KEY NOT NULL,
	"course_id" text NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text,
	"student_id" text NOT NULL,
	"supervisor_id" text NOT NULL,
	"status" "project_status" DEFAULT 'proposed' NOT NULL,
	"start_date" date,
	"end_date" date,
	"project_url" text,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT current_timestamp
);
--> statement-breakpoint
CREATE TABLE "tbl_research" (
	"research_id" text PRIMARY KEY NOT NULL,
	"course_id" text NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text,
	"student_id" text NOT NULL,
	"supervisor_id" text NOT NULL,
	"status" "research_status" DEFAULT 'proposed' NOT NULL,
	"start_date" date,
	"end_date" date,
	"publication_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT current_timestamp,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "tbl_evaluation" (
	"evaluation_id" text PRIMARY KEY NOT NULL,
	"project_id" text,
	"research_id" text,
	"evaluator_id" text NOT NULL,
	"criteria" text,
	"score" text,
	"comments" text,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT current_timestamp
);
--> statement-breakpoint
CREATE TABLE "tbl_feedback" (
	"feedback_id" text PRIMARY KEY NOT NULL,
	"project_id" text,
	"research_id" text,
	"milestone_id" text,
	"from_user_id" text NOT NULL,
	"to_user_id" text NOT NULL,
	"feedback_text" text NOT NULL,
	"rating" integer,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT current_timestamp
);
--> statement-breakpoint
CREATE TABLE "tbl_meeting" (
	"meeting_id" text PRIMARY KEY NOT NULL,
	"project_id" text,
	"research_id" text,
	"supervisor_id" text NOT NULL,
	"student_id" text NOT NULL,
	"meeting_date" timestamp NOT NULL,
	"duration" integer,
	"notes" text,
	"next_action" text,
	"attendees" text[],
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT current_timestamp
);
--> statement-breakpoint
CREATE TABLE "tbl_competition" (
	"competition_id" text PRIMARY KEY NOT NULL,
	"department_id" text NOT NULL,
	"posted_by" text NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"type" text NOT NULL,
	"organizer_name" varchar(255),
	"location" varchar(255),
	"event_date" timestamp,
	"registration_deadline" date,
	"external_url" text NOT NULL,
	"banner_url" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"posted_at" timestamp,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT current_timestamp
);
--> statement-breakpoint
CREATE TABLE "tbl_job_posting" (
	"job_id" text PRIMARY KEY NOT NULL,
	"department_id" text NOT NULL,
	"posted_by" text NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"company_name" varchar(255),
	"location" varchar(255),
	"job_type" text DEFAULT 'full_time' NOT NULL,
	"external_url" text NOT NULL,
	"application_deadline" date,
	"status" text DEFAULT 'draft' NOT NULL,
	"posted_at" timestamp,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT current_timestamp
);
--> statement-breakpoint
CREATE TABLE "tbl_department_showcase" (
	"showcase_id" text PRIMARY KEY NOT NULL,
	"department_id" text NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text NOT NULL,
	"achievements" text,
	"tags" text[],
	"thumbnail_url" text,
	"featured" boolean DEFAULT false,
	"metadata" jsonb,
	"published_at" timestamp,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT current_timestamp
);
--> statement-breakpoint
ALTER TABLE "tbl_course_enrollment" ADD CONSTRAINT "tbl_course_enrollment_course_id_tbl_course_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."tbl_course"("course_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_course_enrollment" ADD CONSTRAINT "tbl_course_enrollment_user_id_tbl_user_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."tbl_user"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_course" ADD CONSTRAINT "tbl_course_department_id_tbl_department_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."tbl_department"("department_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_course_resource" ADD CONSTRAINT "tbl_course_resource_course_id_tbl_course_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."tbl_course"("course_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_department" ADD CONSTRAINT "tbl_department_institution_id_tbl_institution_institution_id_fk" FOREIGN KEY ("institution_id") REFERENCES "public"."tbl_institution"("institution_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_user" ADD CONSTRAINT "tbl_user_department_id_tbl_department_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."tbl_department"("department_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_milestone" ADD CONSTRAINT "tbl_milestone_project_id_tbl_project_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."tbl_project"("project_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_milestone" ADD CONSTRAINT "tbl_milestone_research_id_tbl_research_research_id_fk" FOREIGN KEY ("research_id") REFERENCES "public"."tbl_research"("research_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_milestone" ADD CONSTRAINT "tbl_milestone_approved_by_tbl_user_user_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."tbl_user"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_task" ADD CONSTRAINT "tbl_task_milestone_id_tbl_milestone_milestone_id_fk" FOREIGN KEY ("milestone_id") REFERENCES "public"."tbl_milestone"("milestone_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_task" ADD CONSTRAINT "tbl_task_assigned_to_tbl_user_user_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."tbl_user"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_task" ADD CONSTRAINT "tbl_task_reviewed_by_tbl_user_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."tbl_user"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_project" ADD CONSTRAINT "tbl_project_course_id_tbl_course_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."tbl_course"("course_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_project" ADD CONSTRAINT "tbl_project_student_id_tbl_user_user_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."tbl_user"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_project" ADD CONSTRAINT "tbl_project_supervisor_id_tbl_user_user_id_fk" FOREIGN KEY ("supervisor_id") REFERENCES "public"."tbl_user"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_research" ADD CONSTRAINT "tbl_research_course_id_tbl_course_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."tbl_course"("course_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_research" ADD CONSTRAINT "tbl_research_student_id_tbl_user_user_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."tbl_user"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_research" ADD CONSTRAINT "tbl_research_supervisor_id_tbl_user_user_id_fk" FOREIGN KEY ("supervisor_id") REFERENCES "public"."tbl_user"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_evaluation" ADD CONSTRAINT "tbl_evaluation_project_id_tbl_project_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."tbl_project"("project_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_evaluation" ADD CONSTRAINT "tbl_evaluation_research_id_tbl_research_research_id_fk" FOREIGN KEY ("research_id") REFERENCES "public"."tbl_research"("research_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_evaluation" ADD CONSTRAINT "tbl_evaluation_evaluator_id_tbl_user_user_id_fk" FOREIGN KEY ("evaluator_id") REFERENCES "public"."tbl_user"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_feedback" ADD CONSTRAINT "tbl_feedback_project_id_tbl_project_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."tbl_project"("project_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_feedback" ADD CONSTRAINT "tbl_feedback_research_id_tbl_research_research_id_fk" FOREIGN KEY ("research_id") REFERENCES "public"."tbl_research"("research_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_feedback" ADD CONSTRAINT "tbl_feedback_milestone_id_tbl_milestone_milestone_id_fk" FOREIGN KEY ("milestone_id") REFERENCES "public"."tbl_milestone"("milestone_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_feedback" ADD CONSTRAINT "tbl_feedback_from_user_id_tbl_user_user_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."tbl_user"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_feedback" ADD CONSTRAINT "tbl_feedback_to_user_id_tbl_user_user_id_fk" FOREIGN KEY ("to_user_id") REFERENCES "public"."tbl_user"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_meeting" ADD CONSTRAINT "tbl_meeting_project_id_tbl_project_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."tbl_project"("project_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_meeting" ADD CONSTRAINT "tbl_meeting_research_id_tbl_research_research_id_fk" FOREIGN KEY ("research_id") REFERENCES "public"."tbl_research"("research_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_meeting" ADD CONSTRAINT "tbl_meeting_supervisor_id_tbl_user_user_id_fk" FOREIGN KEY ("supervisor_id") REFERENCES "public"."tbl_user"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_meeting" ADD CONSTRAINT "tbl_meeting_student_id_tbl_user_user_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."tbl_user"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_competition" ADD CONSTRAINT "tbl_competition_department_id_tbl_department_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."tbl_department"("department_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_competition" ADD CONSTRAINT "tbl_competition_posted_by_tbl_user_user_id_fk" FOREIGN KEY ("posted_by") REFERENCES "public"."tbl_user"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_job_posting" ADD CONSTRAINT "tbl_job_posting_department_id_tbl_department_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."tbl_department"("department_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_job_posting" ADD CONSTRAINT "tbl_job_posting_posted_by_tbl_user_user_id_fk" FOREIGN KEY ("posted_by") REFERENCES "public"."tbl_user"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_department_showcase" ADD CONSTRAINT "tbl_department_showcase_department_id_tbl_department_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."tbl_department"("department_id") ON DELETE no action ON UPDATE no action;