import { sql } from 'drizzle-orm';
import { pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { projectTable } from './tbl-project';
import { userTable } from './tbl-user';

// Enum for role in project
export const projectRoleEnum = pgEnum('project_role', [
  'member', // Student member
  'instructor', // Faculty instructor
]);

// Junction table for many-to-many relationship between projects and students
export const projectStudentTable = pgTable('tbl_project_student', {
  id: text('id').notNull().primaryKey(),
  projectId: text('project_id')
    .notNull()
    .references(() => projectTable.projectId, { onDelete: 'cascade' }),
  studentId: text('student_id')
    .notNull()
    .references(() => userTable.userId, { onDelete: 'cascade' }),
  role: projectRoleEnum('role').notNull().default('member'),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .default(sql`current_timestamp`)
    .$onUpdate(() => new Date()),
});
