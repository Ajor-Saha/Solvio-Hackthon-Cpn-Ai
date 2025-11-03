CREATE TYPE "public"."project_role" AS ENUM('member', 'instructor');--> statement-breakpoint
CREATE TYPE "public"."research_role" AS ENUM('member', 'instructor');--> statement-breakpoint
CREATE TABLE "tbl_project_student" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"student_id" text NOT NULL,
	"role" "project_role" DEFAULT 'member' NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT current_timestamp
);
--> statement-breakpoint
CREATE TABLE "tbl_research_student" (
	"id" text PRIMARY KEY NOT NULL,
	"research_id" text NOT NULL,
	"student_id" text NOT NULL,
	"role" "research_role" DEFAULT 'member' NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT current_timestamp
);
--> statement-breakpoint
CREATE TABLE "tbl_achievement" (
	"achievement_id" text PRIMARY KEY NOT NULL,
	"department_id" text NOT NULL,
	"posted_by" text NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"achievement_type" text NOT NULL,
	"awarded_to" varchar(255),
	"awarding_organization" varchar(255),
	"achievement_date" timestamp,
	"certificate_url" text,
	"image_url" text,
	"featured" boolean DEFAULT false,
	"status" text DEFAULT 'draft' NOT NULL,
	"published_at" timestamp,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT current_timestamp
);
--> statement-breakpoint
CREATE TABLE "tbl_higher_study" (
	"higher_study_id" text PRIMARY KEY NOT NULL,
	"department_id" text NOT NULL,
	"posted_by" text NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"study_type" text NOT NULL,
	"institution" varchar(255) NOT NULL,
	"location" varchar(255),
	"field_of_study" varchar(255),
	"application_deadline" date,
	"start_date" date,
	"duration" varchar(100),
	"tuition_fee" text,
	"scholarship_available" text,
	"eligibility_criteria" text,
	"application_url" text NOT NULL,
	"contact_email" varchar(255),
	"image_url" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"published_at" timestamp,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT current_timestamp
);
--> statement-breakpoint
ALTER TABLE "tbl_project" DROP CONSTRAINT "tbl_project_student_id_tbl_user_user_id_fk";
--> statement-breakpoint
ALTER TABLE "tbl_research" DROP CONSTRAINT "tbl_research_student_id_tbl_user_user_id_fk";
--> statement-breakpoint
ALTER TABLE "tbl_user" ADD COLUMN "avatar" text;--> statement-breakpoint
ALTER TABLE "tbl_project_student" ADD CONSTRAINT "tbl_project_student_project_id_tbl_project_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."tbl_project"("project_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_project_student" ADD CONSTRAINT "tbl_project_student_student_id_tbl_user_user_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."tbl_user"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_research_student" ADD CONSTRAINT "tbl_research_student_research_id_tbl_research_research_id_fk" FOREIGN KEY ("research_id") REFERENCES "public"."tbl_research"("research_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_research_student" ADD CONSTRAINT "tbl_research_student_student_id_tbl_user_user_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."tbl_user"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_achievement" ADD CONSTRAINT "tbl_achievement_department_id_tbl_department_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."tbl_department"("department_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_achievement" ADD CONSTRAINT "tbl_achievement_posted_by_tbl_user_user_id_fk" FOREIGN KEY ("posted_by") REFERENCES "public"."tbl_user"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_higher_study" ADD CONSTRAINT "tbl_higher_study_department_id_tbl_department_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."tbl_department"("department_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_higher_study" ADD CONSTRAINT "tbl_higher_study_posted_by_tbl_user_user_id_fk" FOREIGN KEY ("posted_by") REFERENCES "public"."tbl_user"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_project" DROP COLUMN "student_id";--> statement-breakpoint
ALTER TABLE "tbl_research" DROP COLUMN "student_id";