import { sql } from 'drizzle-orm';
import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { milestoneTable } from './tbl-milestone';
import { projectTable } from './tbl-project';
import { researchTable } from './tbl-research';
import { userTable } from './tbl-user';

export const meetingTable = pgTable('tbl_meeting', {
  meetingId: text('meeting_id').notNull().primaryKey(),
  projectId: text('project_id').references(() => projectTable.projectId),
  researchId: text('research_id').references(() => researchTable.researchId),
  supervisorId: text('supervisor_id')
    .notNull()
    .references(() => userTable.userId),
  studentId: text('student_id')
    .notNull()
    .references(() => userTable.userId),
  meetingDate: timestamp('meeting_date').notNull(),
  duration: integer('duration'), // in minutes
  notes: text('notes'),
  nextAction: text('next_action'),
  attendees: text('attendees').array(), // Array of user IDs
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .default(sql`current_timestamp`)
    .$onUpdate(() => new Date()),
});

export const feedbackTable = pgTable('tbl_feedback', {
  feedbackId: text('feedback_id').notNull().primaryKey(),
  projectId: text('project_id').references(() => projectTable.projectId),
  researchId: text('research_id').references(() => researchTable.researchId),
  milestoneId: text('milestone_id').references(
    () => milestoneTable.milestoneId
  ),
  fromUserId: text('from_user_id')
    .notNull()
    .references(() => userTable.userId), // supervisor/evaluator
  toUserId: text('to_user_id')
    .notNull()
    .references(() => userTable.userId), // student
  feedbackText: text('feedback_text').notNull(),
  rating: integer('rating'), // 1-5 scale
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .default(sql`current_timestamp`)
    .$onUpdate(() => new Date()),
});

export const evaluationTable = pgTable('tbl_evaluation', {
  evaluationId: text('evaluation_id').notNull().primaryKey(),
  projectId: text('project_id').references(() => projectTable.projectId),
  researchId: text('research_id').references(() => researchTable.researchId),
  evaluatorId: text('evaluator_id')
    .notNull()
    .references(() => userTable.userId),
  criteria: text('criteria'),
  score: text('score'), // can be percentage, grade, etc.
  comments: text('comments'),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .default(sql`current_timestamp`)
    .$onUpdate(() => new Date()),
});
