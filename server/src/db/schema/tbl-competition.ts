import { sql } from 'drizzle-orm';
import { date, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { departmentTable } from './tbl-department';
import { userTable } from './tbl-user';

export const competitionTable = pgTable('tbl_competition', {
  competitionId: text('competition_id').notNull().primaryKey(),
  departmentId: text('department_id')
    .notNull()
    .references(() => departmentTable.departmentId),
  postedBy: text('posted_by')
    .notNull()
    .references(() => userTable.userId),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  type: text('type').notNull(), // e.g., "hackathon", "debate", "datathon", "programming_contest", "math_competition", "quiz", "case_study", "design_challenge", "other"
  organizerName: varchar('organizer_name', { length: 255 }), // Organization/company name
  location: varchar('location', { length: 255 }), // Physical or "Online"
  eventDate: timestamp('event_date'), // When competition takes place
  registrationDeadline: date('registration_deadline'),
  externalUrl: text('external_url').notNull(), // Link to competition website/registration
  bannerUrl: text('banner_url'), // Competition banner image
  status: text('status').notNull().default('draft'), // e.g., "draft", "active", "closed", "archived"
  postedAt: timestamp('posted_at'),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .default(sql`current_timestamp`)
    .$onUpdate(() => new Date()),
});
