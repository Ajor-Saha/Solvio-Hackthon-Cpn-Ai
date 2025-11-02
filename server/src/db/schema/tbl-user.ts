import { sql } from 'drizzle-orm';
import {
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { departmentTable } from './tbl-department';

export const userRoleEnum = pgEnum('user_role', [
  'student',
  'faculty',
  'department_admin',
]);

export const userTable = pgTable('tbl_user', {
  userId: text('user_id').notNull().primaryKey(),
  firstName: varchar('first_name', { length: 255 }).notNull(),
  lastName: varchar('last_name', { length: 255 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  role: userRoleEnum('role').notNull().default('student'),
  departmentId: text('department_id')
    .notNull()
    .references(() => departmentTable.departmentId),
  verifyCode: text('verify_code'),
  verifyCodeExpiry: timestamp('verify_code_expiry'),
  isVerified: boolean('is_verified').default(false),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .default(sql`current_timestamp`)
    .$onUpdate(() => new Date()),
});
