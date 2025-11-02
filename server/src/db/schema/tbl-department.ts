import { sql } from 'drizzle-orm';
import { pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { institutionTable } from './tbl-institution';

export const departmentTable = pgTable('tbl_department', {
  departmentId: text('department_id').notNull().primaryKey(),
  institutionId: text('institution_id')
    .notNull()
    .references(() => institutionTable.institutionId),
  name: varchar('name', { length: 255 }).notNull(),
  code: varchar('code', { length: 50 }).notNull(),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .default(sql`current_timestamp`)
    .$onUpdate(() => new Date()),
});
