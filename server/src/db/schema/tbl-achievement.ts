import { sql } from 'drizzle-orm';
import { boolean, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { departmentTable } from './tbl-department';
import { userTable } from './tbl-user';

export const achievementTable = pgTable('tbl_achievement', {
  achievementId: text('achievement_id').notNull().primaryKey(),
  departmentId: text('department_id')
    .notNull()
    .references(() => departmentTable.departmentId),
  postedBy: text('posted_by')
    .notNull()
    .references(() => userTable.userId),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  achievementType: text('achievement_type').notNull(), // e.g., "award", "certification", "recognition", "scholarship", "publication", "patent", "other"
  awardedTo: varchar('awarded_to', { length: 255 }), // Student/Faculty name or department
  awardingOrganization: varchar('awarding_organization', { length: 255 }),
  achievementDate: timestamp('achievement_date'),
  certificateUrl: text('certificate_url'), // Link to certificate/proof
  imageUrl: text('image_url'), // Achievement image/photo
  featured: boolean('featured').default(false), // Highlight on homepage
  status: text('status').notNull().default('draft'), // e.g., "draft", "published", "archived"
  publishedAt: timestamp('published_at'),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .default(sql`current_timestamp`)
    .$onUpdate(() => new Date()),
});
