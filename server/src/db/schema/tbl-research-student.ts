import { sql } from 'drizzle-orm';
import { pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { researchTable } from './tbl-research';
import { userTable } from './tbl-user';

// Enum for role in research
export const researchRoleEnum = pgEnum('research_role', [
  'member', // Student member
  'instructor', // Faculty instructor
]);

// Junction table for many-to-many relationship between research and students
export const researchStudentTable = pgTable('tbl_research_student', {
  id: text('id').notNull().primaryKey(),
  researchId: text('research_id')
    .notNull()
    .references(() => researchTable.researchId, { onDelete: 'cascade' }),
  studentId: text('student_id')
    .notNull()
    .references(() => userTable.userId, { onDelete: 'cascade' }),
  role: researchRoleEnum('role').notNull().default('member'),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .default(sql`current_timestamp`)
    .$onUpdate(() => new Date()),
});
