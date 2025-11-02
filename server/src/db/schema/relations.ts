import { relations } from 'drizzle-orm';
import { competitionTable } from './tbl-competition';
import { courseEnrollmentTable, courseTable } from './tbl-course';
import { courseResourceTable } from './tbl-course-resource';
import { departmentTable } from './tbl-department';
import { departmentShowcaseTable } from './tbl-discovery';
import { institutionTable } from './tbl-institution';
import { jobPostingTable } from './tbl-job-posting';
import { milestoneTable, taskTable } from './tbl-milestone';
import { projectTable } from './tbl-project';
import { researchTable } from './tbl-research';
import {
  evaluationTable,
  feedbackTable,
  meetingTable,
} from './tbl-supervision';
import { userTable } from './tbl-user';

// ============= Institution Relations =============
export const institutionRelations = relations(institutionTable, ({ many }) => ({
  departments: many(departmentTable),
}));

// ============= Department Relations =============
export const departmentRelations = relations(
  departmentTable,
  ({ one, many }) => ({
    institution: one(institutionTable, {
      fields: [departmentTable.institutionId],
      references: [institutionTable.institutionId],
    }),
    users: many(userTable),
    courses: many(courseTable),
    jobPostings: many(jobPostingTable),
    competitions: many(competitionTable),
    showcases: many(departmentShowcaseTable),
  })
);

// ============= User Relations =============
export const userRelations = relations(userTable, ({ one, many }) => ({
  department: one(departmentTable, {
    fields: [userTable.departmentId],
    references: [departmentTable.departmentId],
  }),
  projectsAsStudent: many(projectTable, { relationName: 'student_projects' }),
  projectsAsSupervisor: many(projectTable, {
    relationName: 'supervisor_projects',
  }),
  researchAsStudent: many(researchTable, { relationName: 'student_research' }),
  researchAsSupervisor: many(researchTable, {
    relationName: 'supervisor_research',
  }),
  courseEnrollments: many(courseEnrollmentTable),
  meetingsAsSupervisor: many(meetingTable, {
    relationName: 'supervisor_meetings',
  }),
  meetingsAsStudent: many(meetingTable, { relationName: 'student_meetings' }),
  feedbackGiven: many(feedbackTable, { relationName: 'feedback_from' }),
  feedbackReceived: many(feedbackTable, { relationName: 'feedback_to' }),
  evaluations: many(evaluationTable),
  uploadedResources: many(courseResourceTable),
  assignedTasks: many(taskTable, { relationName: 'assigned_tasks' }),
  reviewedTasks: many(taskTable, { relationName: 'reviewed_tasks' }),
  postedJobs: many(jobPostingTable),
  postedCompetitions: many(competitionTable),
}));

// ============= Course Relations =============
export const courseRelations = relations(courseTable, ({ one, many }) => ({
  department: one(departmentTable, {
    fields: [courseTable.departmentId],
    references: [departmentTable.departmentId],
  }),
  enrollments: many(courseEnrollmentTable),
  projects: many(projectTable),
  research: many(researchTable),
  resources: many(courseResourceTable),
}));

export const courseEnrollmentRelations = relations(
  courseEnrollmentTable,
  ({ one }) => ({
    user: one(userTable, {
      fields: [courseEnrollmentTable.userId],
      references: [userTable.userId],
    }),
    course: one(courseTable, {
      fields: [courseEnrollmentTable.courseId],
      references: [courseTable.courseId],
    }),
  })
);

export const courseResourceRelations = relations(
  courseResourceTable,
  ({ one }) => ({
    course: one(courseTable, {
      fields: [courseResourceTable.courseId],
      references: [courseTable.courseId],
    }),
    uploader: one(userTable, {
      fields: [courseResourceTable.uploadedBy],
      references: [userTable.userId],
    }),
  })
);

// ============= Project Relations =============
export const projectRelations = relations(projectTable, ({ one, many }) => ({
  student: one(userTable, {
    fields: [projectTable.studentId],
    references: [userTable.userId],
    relationName: 'student_projects',
  }),
  supervisor: one(userTable, {
    fields: [projectTable.supervisorId],
    references: [userTable.userId],
    relationName: 'supervisor_projects',
  }),
  course: one(courseTable, {
    fields: [projectTable.courseId],
    references: [courseTable.courseId],
  }),
  milestones: many(milestoneTable),
  meetings: many(meetingTable),
  feedbacks: many(feedbackTable),
  evaluations: many(evaluationTable),
}));

// ============= Research Relations =============
export const researchRelations = relations(researchTable, ({ one, many }) => ({
  student: one(userTable, {
    fields: [researchTable.studentId],
    references: [userTable.userId],
    relationName: 'student_research',
  }),
  supervisor: one(userTable, {
    fields: [researchTable.supervisorId],
    references: [userTable.userId],
    relationName: 'supervisor_research',
  }),
  course: one(courseTable, {
    fields: [researchTable.courseId],
    references: [courseTable.courseId],
  }),
  milestones: many(milestoneTable),
  meetings: many(meetingTable),
  feedbacks: many(feedbackTable),
  evaluations: many(evaluationTable),
}));

// ============= Milestone Relations =============
export const milestoneRelations = relations(
  milestoneTable,
  ({ one, many }) => ({
    project: one(projectTable, {
      fields: [milestoneTable.projectId],
      references: [projectTable.projectId],
    }),
    research: one(researchTable, {
      fields: [milestoneTable.researchId],
      references: [researchTable.researchId],
    }),
    approver: one(userTable, {
      fields: [milestoneTable.approvedBy],
      references: [userTable.userId],
    }),
    tasks: many(taskTable),
    feedbacks: many(feedbackTable),
  })
);

export const taskRelations = relations(taskTable, ({ one }) => ({
  milestone: one(milestoneTable, {
    fields: [taskTable.milestoneId],
    references: [milestoneTable.milestoneId],
  }),
  assignee: one(userTable, {
    fields: [taskTable.assignedTo],
    references: [userTable.userId],
    relationName: 'assigned_tasks',
  }),
  reviewer: one(userTable, {
    fields: [taskTable.reviewedBy],
    references: [userTable.userId],
    relationName: 'reviewed_tasks',
  }),
}));

// ============= Supervision Relations =============
export const meetingRelations = relations(meetingTable, ({ one }) => ({
  project: one(projectTable, {
    fields: [meetingTable.projectId],
    references: [projectTable.projectId],
  }),
  research: one(researchTable, {
    fields: [meetingTable.researchId],
    references: [researchTable.researchId],
  }),
  supervisor: one(userTable, {
    fields: [meetingTable.supervisorId],
    references: [userTable.userId],
    relationName: 'supervisor_meetings',
  }),
  student: one(userTable, {
    fields: [meetingTable.studentId],
    references: [userTable.userId],
    relationName: 'student_meetings',
  }),
}));

export const feedbackRelations = relations(feedbackTable, ({ one }) => ({
  project: one(projectTable, {
    fields: [feedbackTable.projectId],
    references: [projectTable.projectId],
  }),
  research: one(researchTable, {
    fields: [feedbackTable.researchId],
    references: [researchTable.researchId],
  }),
  milestone: one(milestoneTable, {
    fields: [feedbackTable.milestoneId],
    references: [milestoneTable.milestoneId],
  }),
  fromUser: one(userTable, {
    fields: [feedbackTable.fromUserId],
    references: [userTable.userId],
    relationName: 'feedback_from',
  }),
  toUser: one(userTable, {
    fields: [feedbackTable.toUserId],
    references: [userTable.userId],
    relationName: 'feedback_to',
  }),
}));

export const evaluationRelations = relations(evaluationTable, ({ one }) => ({
  project: one(projectTable, {
    fields: [evaluationTable.projectId],
    references: [projectTable.projectId],
  }),
  research: one(researchTable, {
    fields: [evaluationTable.researchId],
    references: [researchTable.researchId],
  }),
  evaluator: one(userTable, {
    fields: [evaluationTable.evaluatorId],
    references: [userTable.userId],
  }),
}));

// ============= Discovery Relations =============
export const departmentShowcaseRelations = relations(
  departmentShowcaseTable,
  ({ one }) => ({
    department: one(departmentTable, {
      fields: [departmentShowcaseTable.departmentId],
      references: [departmentTable.departmentId],
    }),
  })
);

// ============= Job Posting Relations =============
export const jobPostingRelations = relations(jobPostingTable, ({ one }) => ({
  department: one(departmentTable, {
    fields: [jobPostingTable.departmentId],
    references: [departmentTable.departmentId],
  }),
  poster: one(userTable, {
    fields: [jobPostingTable.postedBy],
    references: [userTable.userId],
  }),
}));

// ============= Competition Relations =============
export const competitionRelations = relations(competitionTable, ({ one }) => ({
  department: one(departmentTable, {
    fields: [competitionTable.departmentId],
    references: [departmentTable.departmentId],
  }),
  poster: one(userTable, {
    fields: [competitionTable.postedBy],
    references: [userTable.userId],
  }),
}));
