import { sql } from 'drizzle-orm';
import {
  boolean,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { departmentTable } from './tbl-department';

export const departmentShowcaseTable = pgTable('tbl_department_showcase', {
  showcaseId: text('showcase_id').notNull().primaryKey(),
  departmentId: text('department_id')
    .notNull()
    .references(() => departmentTable.departmentId),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description').notNull(),
  achievements: text('achievements'), // Key achievements or impact
  tags: text('tags').array(), // Topics, technologies, domains
  thumbnailUrl: text('thumbnail_url'), // Cover image
  featured: boolean('featured').default(false), // Highlight exceptional work
  metadata: jsonb('metadata'), // Additional flexible data (can include project/research references if needed)
  publishedAt: timestamp('published_at'),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .default(sql`current_timestamp`)
    .$onUpdate(() => new Date()),
});
