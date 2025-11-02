import { sql } from 'drizzle-orm';
import {
  date,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { projectTable } from './tbl-project';
import { researchTable } from './tbl-research';
import { userTable } from './tbl-user';

export const milestoneStatusEnum = pgEnum('milestone_status', [
  'not_started',
  'in_progress',
  'ready_for_review',
  'approved',
  'rejected',
]);

export const milestoneTable = pgTable('tbl_milestone', {
  milestoneId: text('milestone_id').notNull().primaryKey(),
  projectId: text('project_id').references(() => projectTable.projectId),
  researchId: text('research_id').references(() => researchTable.researchId),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: milestoneStatusEnum('status').notNull().default('not_started'),
  startDate: date('start_date'),
  deadline: date('deadline'),
  approvedAt: timestamp('approved_at'),
  approvedBy: text('approved_by').references(() => userTable.userId),
  proofHash: varchar('proof_hash', { length: 255 }),
  blockchainTxId: varchar('blockchain_tx_id', { length: 255 }),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .default(sql`current_timestamp`)
    .$onUpdate(() => new Date()),
});

export const taskStatusEnum = pgEnum('task_status', [
  'pending',
  'in_progress',
  'completed',
  'submitted',
  'approved',
  'rejected',
]);

export const taskTable = pgTable('tbl_task', {
  taskId: text('task_id').notNull().primaryKey(),
  milestoneId: text('milestone_id')
    .notNull()
    .references(() => milestoneTable.milestoneId),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  details: text('details'), // Additional task details
  status: taskStatusEnum('status').notNull().default('pending'),
  assignedTo: text('assigned_to').references(() => userTable.userId),
  dueDate: date('due_date'),
  completedAt: timestamp('completed_at'),
  submittedAt: timestamp('submitted_at'),
  submissionDetails: text('submission_details'), // Submission notes/description
  submissionUrl: text('submission_url'), // File URL or link to submission
  submissionHash: varchar('submission_hash', { length: 64 }), // SHA256 hash of submission
  submissionTxId: varchar('submission_tx_id', { length: 255 }), // Blockchain TX ID
  fileHash: varchar('file_hash', { length: 64 }), // Hash of submitted file
  reviewedBy: text('reviewed_by').references(() => userTable.userId),
  reviewedAt: timestamp('reviewed_at'),
  reviewComments: text('review_comments'),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .default(sql`current_timestamp`)
    .$onUpdate(() => new Date()),
});
