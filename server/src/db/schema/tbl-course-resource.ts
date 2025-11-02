import { sql } from 'drizzle-orm';
import { pgEnum, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { courseTable } from './tbl-course';

export const resourceTypeEnum = pgEnum('resource_type', [
  'pdf',
  'ppt',
  'image',
  'link',
]);

export const courseResourceTable = pgTable('tbl_course_resource', {
  resourceId: text('resource_id').notNull().primaryKey(),
  courseId: text('course_id')
    .notNull()
    .references(() => courseTable.courseId),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  resourceType: resourceTypeEnum('resource_type').notNull(),
  fileUrl: text('file_url').notNull(), // S3 URL or external link
  fileSize: varchar('file_size', { length: 50 }), // e.g., "2.5 MB" (optional for links)
  uploadedBy: text('uploaded_by').notNull(), // user_id of faculty who uploaded
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .default(sql`current_timestamp`)
    .$onUpdate(() => new Date()),
});
