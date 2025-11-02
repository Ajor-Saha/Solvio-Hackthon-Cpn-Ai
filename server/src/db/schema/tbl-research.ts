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

export const researchStatusEnum = pgEnum('research_status', [
  'proposed',
  'ongoing',
  'completed',
  'published',
  'archived',
]);

export const researchTable = pgTable('tbl_research', {
  researchId: text('research_id').notNull().primaryKey(),
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
  status: researchStatusEnum('status').notNull().default('proposed'),
  startDate: date('start_date'),
  endDate: date('end_date'),
  publicationUrl: text('publication_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .default(sql`current_timestamp`)
    .$onUpdate(() => new Date()),
  deletedAt: timestamp('deleted_at'),
});
