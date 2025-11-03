import { sql } from 'drizzle-orm';
import { date, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { departmentTable } from './tbl-department';
import { userTable } from './tbl-user';

export const higherStudyTable = pgTable('tbl_higher_study', {
  higherStudyId: text('higher_study_id').notNull().primaryKey(),
  departmentId: text('department_id')
    .notNull()
    .references(() => departmentTable.departmentId),
  postedBy: text('posted_by')
    .notNull()
    .references(() => userTable.userId),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  studyType: text('study_type').notNull(), // e.g., "masters", "phd", "postdoc", "fellowship", "exchange_program", "research_opportunity", "scholarship"
  institution: varchar('institution', { length: 255 }).notNull(), // University/Institution name
  location: varchar('location', { length: 255 }), // Country/City
  fieldOfStudy: varchar('field_of_study', { length: 255 }), // Major/Subject area
  applicationDeadline: date('application_deadline'),
  startDate: date('start_date'), // Program start date
  duration: varchar('duration', { length: 100 }), // e.g., "2 years", "6 months"
  tuitionFee: text('tuition_fee'), // Fee information
  scholarshipAvailable: text('scholarship_available'), // Scholarship details
  eligibilityCriteria: text('eligibility_criteria'),
  applicationUrl: text('application_url').notNull(), // Link to application portal
  contactEmail: varchar('contact_email', { length: 255 }),
  imageUrl: text('image_url'), // University/Program image
  status: text('status').notNull().default('draft'), // e.g., "draft", "active", "closed", "archived"
  publishedAt: timestamp('published_at'),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .default(sql`current_timestamp`)
    .$onUpdate(() => new Date()),
});
