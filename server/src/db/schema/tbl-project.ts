import { sql } from 'drizzle-orm';
import {
  date,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { courseTable } from './tbl-course';
import { userTable } from './tbl-user';

export const projectStatusEnum = pgEnum('project_status', [
  'proposed',
  'ongoing',
  'completed',
  'archived',
]);

export const projectTable = pgTable('tbl_project', {
  projectId: text('project_id').notNull().primaryKey(),
  courseId: text('course_id')
    .notNull()
    .references(() => courseTable.courseId),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description'),
  studentId: text('student_id')
    .notNull()
    .references(() => userTable.userId),
  supervisorId: text('supervisor_id')
    .notNull()
    .references(() => userTable.userId),
  status: projectStatusEnum('status').notNull().default('proposed'),
  startDate: date('start_date'),
  endDate: date('end_date'),
  projectUrl: text('project_url'),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .default(sql`current_timestamp`)
    .$onUpdate(() => new Date()),
});
