import { sql } from 'drizzle-orm';
import { date, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { departmentTable } from './tbl-department';
import { userTable } from './tbl-user';

export const jobPostingTable = pgTable('tbl_job_posting', {
  jobId: text('job_id').notNull().primaryKey(),
  departmentId: text('department_id')
    .notNull()
    .references(() => departmentTable.departmentId),
  postedBy: text('posted_by')
    .notNull()
    .references(() => userTable.userId),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  companyName: varchar('company_name', { length: 255 }),
  location: varchar('location', { length: 255 }),
  jobType: text('job_type').notNull().default('full_time'), // e.g., "full_time", "part_time", "internship", "contract", "remote"
  externalUrl: text('external_url').notNull(), // Link to company website/job portal
  applicationDeadline: date('application_deadline'),
  status: text('status').notNull().default('draft'), // e.g., "draft", "active", "closed", "archived"
  postedAt: timestamp('posted_at'),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .default(sql`current_timestamp`)
    .$onUpdate(() => new Date()),
});
