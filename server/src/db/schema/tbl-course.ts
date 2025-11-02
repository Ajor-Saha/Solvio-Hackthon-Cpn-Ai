import { sql } from 'drizzle-orm';
import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { departmentTable } from './tbl-department';
import { userTable } from './tbl-user';

export const courseEnrollmentRoleEnum = pgEnum('course_enrollment_role', [
  'student',
  'instructor',
]);

export const courseTable = pgTable('tbl_course', {
  courseId: text('course_id').notNull().primaryKey(),
  departmentId: text('department_id')
    .notNull()
    .references(() => departmentTable.departmentId),
  courseCode: varchar('course_code', { length: 50 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  semester: varchar('semester', { length: 10 }).notNull(), // e.g., "1/1", "2/2"
  credits: integer('credits').notNull(),
  capacity: integer('capacity').notNull().default(30),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .default(sql`current_timestamp`)
    .$onUpdate(() => new Date()),
});

export const courseEnrollmentTable = pgTable('tbl_course_enrollment', {
  enrollmentId: text('enrollment_id').notNull().primaryKey(),
  courseId: text('course_id')
    .notNull()
    .references(() => courseTable.courseId),
  userId: text('user_id')
    .notNull()
    .references(() => userTable.userId),
  roleInCourse: courseEnrollmentRoleEnum('role_in_course')
    .notNull()
    .default('student'),
  enrollmentDate: timestamp('enrollment_date').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .default(sql`current_timestamp`)
    .$onUpdate(() => new Date()),
});
