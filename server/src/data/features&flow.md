# Department-Led Course Management (Minimal)

## Setup (Manual)

- One Institution/University created manually in database
- Department users (role: `department_admin`) created manually and linked to institution
- Each department manages its own courses and users

---

## Core Entities

**Institution**

- id, name, code

**Department**

- id, institution_id, name, code

**Course**

- id, department_id, code, title, semester (e.g., "1/1", "2/2")
- Basic fields: credits, capacity

**User** (department-scoped)

- id, department_id, role (student, faculty, department_admin)
- email, name

**Course Enrollment**

- course_id, user_id, role_in_course (student, instructor)

**Course Resources**

- id, course_id, uploaded_by (user_id)
- title (required), description (optional)
- resource_type (pdf, ppt, image, link)
- file_url (S3 URL or external link)

**Projects**

- id, course_id, student_id, supervisor_id (faculty user_id)
- title, description
- status (proposed, ongoing, completed, archived)
- start_date, end_date

**Research**

- id, course_id, student_id, supervisor_id (faculty user_id)
- title, description, abstract
- status (proposed, ongoing, completed, published, archived)
- start_date, end_date, publication_url

**Milestones**

- id, project_id (nullable), research_id (nullable)
- title, description
- status (not_started, in_progress, ready_for_review, approved, rejected)
- progress (0-100), start_date, deadline
- approved_by, approved_at

**Tasks**

- id, milestone_id, assigned_to (user_id)
- title, description, details
- status (pending, in_progress, completed, submitted, approved, rejected)
- due_date, completed_at, submitted_at
- submission_details, submission_url (file or link)
- submission_hash (SHA256), submission_tx_id (blockchain), file_hash
- reviewed_by, reviewed_at, review_comments

**Job Postings**

- id, department_id, posted_by (user_id)
- title, description
- company_name, location, job_type (full_time, part_time, internship, contract, remote)
- external_url (link to company website/job portal)
- application_deadline
- status (draft, active, closed, archived)
- posted_at

**Competitions**

- id, department_id, posted_by (user_id)
- title, description, type (hackathon, debate, datathon, programming_contest, math_competition, quiz, case_study, design_challenge, other)
- organizer_name, location
- event_date, registration_deadline
- external_url (link to competition website/registration page)
- banner_url
- status (draft, active, closed, archived)
- posted_at

**Meetings** (Supervision)

- id, project_id (nullable), research_id (nullable)
- supervisor_id, student_id (both required, reference users)
- meeting_date, duration (in minutes)
- notes, next_action
- attendees (array of user IDs)
- Supports meetings for both projects and research work

**Feedback** (Supervision)

- id, project_id (nullable), research_id (nullable), milestone_id (nullable)
- from_user_id (supervisor/evaluator), to_user_id (student)
- feedback_text (required), rating (1-5 scale, optional)
- Can be given on: specific milestone, overall project, or overall research
- Tracks who gave feedback and who received it

**Evaluations** (Supervision)

- id, project_id (nullable), research_id (nullable)
- evaluator_id (faculty/evaluator)
- criteria, score (flexible: percentage, grade, GPA, etc.)
- comments
- Used for formal assessment of projects or research work

**Department Showcase** (Discovery)

- id, department_id
- title, description
- achievements (key impact or results achieved)
- tags (array of topics, technologies, domains)
- thumbnail_url (cover image)
- featured (boolean - highlight exceptional work)
- metadata (flexible JSON for additional data - can include project/research references, GitHub links, publications, etc.)
- published_at
- Simplified standalone table - not directly linked to project or research tables
- Department can showcase any significant work (projects, research, achievements, events, etc.)

---

## Workflow

1. **Department Admin** creates courses

   - Set: code, title, semester, credits, capacity

2. **Department Admin** assigns faculty to courses

   - Create enrollment: course_id + user_id (faculty) + role = "instructor"

3. **Department Admin** enrolls students to courses

   - Create enrollment: course_id + user_id (student) + role = "student"

4. **Faculty** uploads course resources

   - Upload materials: PDFs, PPTs, images, or links
   - Each resource has: title (required), description (optional)
   - Resource is linked to course_id and tracks uploaded_by (user_id)

5. **Department Admin or Faculty** creates projects for students

   - Assign project to: course_id, student_id, supervisor_id (faculty)
   - Set: title, description, status, start_date, end_date
   - Project tracks progress through statuses: proposed → ongoing → completed → archived

6. **Department Admin or Faculty** creates research for students

   - Assign research to: course_id, student_id, supervisor_id (faculty)
   - Set: title, description, abstract, status, start_date, end_date
   - Research tracks progress: proposed → ongoing → completed → published → archived
   - Optional: publication_url when published

7. **Faculty** creates milestones for projects/research

   - Add milestones to project_id or research_id
   - Set: title, description, start_date, deadline
   - Track progress (0-100%) and status
   - Approve/reject milestones

8. **Faculty or Student** creates tasks within milestones

   - Add tasks to milestone_id
   - Set: title, description, details, assigned_to, due_date
   - Tasks can be assigned to students or self

9. **Student** works on and submits tasks

   - Update task status: pending → in_progress → completed
   - Submit task with submission_details and submission_url
   - Task status changes to "submitted"
   - System calculates submission_hash (SHA256) of submission data
   - Optional: System writes hash to blockchain, stores submission_tx_id

10. **Faculty** reviews task submissions

    - Review submitted tasks
    - System verifies blockchain proof (if enabled)
    - Add review_comments
    - Approve (status → approved) or reject (status → rejected)
    - Optional: Approval creates blockchain verification entry

11. **Faculty** tracks milestone progress

    - View all tasks within milestone
    - Monitor task completion percentage
    - Update milestone progress (0-100%)
    - When all tasks approved, mark milestone as "ready_for_review"

12. **Faculty or Department Admin** approves milestones

    - Review milestone completion
    - Verify all tasks are approved
    - Approve milestone (status → approved)
    - System calculates milestone proof_hash
    - Optional: Store milestone proof on blockchain with blockchain_tx_id

13. **Students** access course resources

    - View all resources uploaded for their enrolled courses
    - Download/access PDFs, PPTs, images, or external links

14. **Students** track project/research progress

    - View their assigned projects and research
    - Monitor milestones and task deadlines
    - View blockchain verification status of submissions
    - Download blockchain proof certificates
    - Collaborate with supervisor (faculty)

15. **External parties** verify academic work (if blockchain enabled)

    - Access public verification page with task_id or milestone_id
    - System retrieves blockchain proof
    - System recalculates hash from stored data
    - System displays verification status with timestamp
    - Download verification certificate

16. **Department Admin or Faculty** posts job opportunities

    - Create job posting with title, description
    - Set: company_name, location, job_type
    - Add external_url (link to company website/job portal/LinkedIn post)
    - Set application_deadline
    - Status: draft → active (when published)
    - Students click link to navigate to external application page

17. **Department Admin or Faculty** posts competitions

    - Create competition posting with title, description, type
    - Set: organizer_name, location, event_date
    - Add external_url (link to competition registration website/social media)
    - Set registration_deadline
    - Upload banner_url (optional)
    - Status: draft → active (when published)
    - Students click link to navigate to external registration page

18. **Students** browse job postings

    - View all active job postings from their department
    - Filter by job_type, location, company
    - View job details and deadline
    - Click external_url to visit company website/application portal
    - Apply directly on external platform

19. **Students** browse competitions

    - View all active competition postings from their department
    - Filter by type, location, date
    - View competition details, deadline, and banner
    - Click external_url to visit competition website/registration page
    - Register directly on external platform

20. **Faculty schedules supervision meetings**

    - Create meeting for project or research
    - Set meeting date, duration, agenda
    - Add notes and next actions
    - Track attendees (can include multiple students or faculty)

21. **Faculty provides feedback to students**

    - Give feedback on specific milestone, project, or research
    - Add rating (1-5 scale) and detailed comments
    - Student receives notification
    - Feedback history tracked for progress monitoring

22. **Faculty conducts evaluations**

    - Evaluate project or research work
    - Set evaluation criteria
    - Assign score (percentage, grade, etc.)
    - Add comments for improvement
    - Used for formal assessment and grading

23. **Department showcases significant work**

    - Select completed projects or research with significant achievements
    - Create showcase entry with title, description
    - Highlight key achievements and impact
    - Add relevant tags (e.g., "AI", "IoT", "Published Research")
    - Upload thumbnail image
    - Mark as "featured" for exceptional work
    - Publish to department showcase page
    - Students and external visitors can view showcased work

---

## Detailed Workflows

### Project/Research Lifecycle

```
[Created] → [Milestones Added] → [Tasks Assigned] → [Tasks Submitted]
→ [Tasks Reviewed] → [Milestone Approved] → [Project/Research Completed]
```

**1. Project/Research Creation**

- Faculty/Admin creates project or research
- Assigns to: course, student, supervisor
- Sets timeline: start_date, end_date
- Status: "proposed"

**2. Project Planning**

- Faculty creates milestones (e.g., "Requirements", "Design", "Implementation")
- Sets milestone deadlines
- Status changes: proposed → ongoing

**3. Task Breakdown**

- Faculty/Student creates tasks within each milestone
- Assigns tasks to student(s)
- Sets due dates for each task

**4. Task Execution**

- Student: Updates task status to "in_progress"
- Student: Works on task
- Student: Submits with details and files
- System: Generates submission_hash
- System: Optional blockchain recording

**5. Review Cycle**

- Faculty: Reviews submission
- Faculty: Adds comments
- Faculty: Approves or rejects
- If rejected: Student revises and resubmits
- If approved: Task marked as "approved"

**6. Milestone Completion**

- All tasks in milestone approved
- Milestone status → "ready_for_review"
- Faculty reviews overall milestone
- Faculty approves milestone
- System: Optional blockchain proof of milestone

**7. Project Completion**

- All milestones approved
- Project status → "completed"
- Optional: Research published (status → "published")
- System: Final blockchain proof generated
- Student: Receives completion certificate

### Task Submission Workflow (with Blockchain)

```
[Pending] → [In Progress] → [Completed] → [Submitted + Hash]
→ [Blockchain Record] → [Faculty Review] → [Approved + Verified]
```

**Step-by-Step:**

1. Student clicks "Submit Task"
2. Uploads file (if required)
3. Adds submission_details
4. System calculates file_hash (if file uploaded)
5. System creates submission data object
6. System calculates submission_hash (SHA256)
7. System saves hash to database
8. Optional: System writes hash to blockchain
9. System stores blockchain transaction ID
10. Student receives submission receipt with blockchain TX
11. Faculty receives notification
12. Faculty reviews and verifies blockchain proof
13. Faculty approves/rejects with comments

### Milestone Approval Workflow (with Blockchain)

```
[Tasks Created] → [Tasks In Progress] → [All Tasks Approved]
→ [Ready for Review] → [Milestone Approved + Hash] → [Blockchain Proof]
```

**Step-by-Step:**

1. Faculty creates milestone with multiple tasks
2. Students work on assigned tasks
3. Students submit tasks (each gets blockchain proof)
4. Faculty reviews and approves all tasks
5. System auto-updates milestone progress to 100%
6. Milestone status → "ready_for_review"
7. Faculty reviews overall milestone
8. Faculty clicks "Approve Milestone"
9. System collects all task hashes
10. System creates milestone proof data (includes task hashes)
11. System calculates proof_hash
12. Optional: System writes to blockchain
13. System stores blockchain_tx_id
14. Milestone status → "approved"
15. System notifies student of milestone completion

### Blockchain Verification Workflow

**For Students (Getting Proof):**

1. Navigate to "My Submissions"
2. Click "Download Proof Certificate" on any submitted task
3. System generates PDF with:
   - Task details
   - Submission hash
   - Blockchain transaction ID
   - QR code for verification
   - Timestamp
4. Student shares certificate with employers/institutions

**For External Verifiers:**

1. Visit public verification page: `/verify/{taskId}`
2. Enter task ID or scan QR code
3. System fetches:
   - Stored submission data from database
   - Blockchain hash from smart contract
4. System recalculates hash from current data
5. System compares: Database hash ↔ Blockchain hash ↔ Calculated hash
6. Displays verification result:
   - ✅ Verified: All hashes match
   - ⚠️ Modified: Database data changed after blockchain record
   - ❌ Not Found: No blockchain record exists
7. Shows verification details:
   - Original submission timestamp
   - Blockchain timestamp
   - Transaction ID with blockchain explorer link
   - Student and course information

---

### Job Posting Workflow

```
[Draft] → [Active/Published] → [Students View & Click Link] → [External Application] → [Closed]
```

**Step-by-Step:**

1. Faculty/Admin creates job posting
2. Fills in job details: title, description
3. Sets company info: company_name, location, job_type
4. Adds external_url: link to company website, job portal, LinkedIn post, or application form
5. Sets application_deadline
6. Saves as draft or publishes (status → active)
7. System displays posting to department students
8. Students browse job postings
9. Students click external_url to navigate to external platform
10. Students apply directly on company's website/portal
11. When deadline passed or position filled: Job status → closed
12. Department can archive old postings (status → archived)

**Key Points:**

- No application tracking within system
- All applications handled externally
- System only serves as announcement/discovery platform
- External URL can be: company career page, LinkedIn post, Google Form, job portal, etc.

---

### Competition Posting Workflow

```
[Draft] → [Active/Published] → [Students View & Click Link] → [External Registration] → [Closed]
```

**Step-by-Step:**

1. Faculty/Admin creates competition posting
2. Selects type: hackathon, debate, datathon, programming_contest, math_competition, quiz, case_study, design_challenge, other
3. Fills details: title, description, organizer_name
4. Sets logistics: location (physical or "Online"), event_date
5. Adds external_url: link to competition website, registration page, social media post
6. Sets registration_deadline
7. Uploads banner_url (optional promotional image)
8. Saves as draft or publishes (status → active)
9. System displays posting to department students
10. Students browse competition postings
11. Students click external_url to navigate to external platform
12. Students register/participate directly on competition platform
13. When event completed: Competition status → closed
14. Department can archive old competitions (status → archived)

**Key Points:**

- No registration tracking within system
- No results tracking within system
- All registration and participation handled externally
- System only serves as announcement/discovery platform
- External URL can be: event website, Devpost, social media, Google Form, etc.

---

### Supervision & Collaboration Workflow

**Meeting Management:**

```
[Schedule Meeting] → [Conduct Meeting] → [Record Notes] → [Set Next Actions]
```

**Step-by-Step:**

1. Faculty navigates to project/research supervision page
2. Clicks "Schedule Meeting"
3. Selects: project_id OR research_id
4. Sets meeting_date and duration (in minutes)
5. Can add multiple attendees (array of user IDs)
6. During/after meeting: Faculty adds notes
7. Faculty sets next_action items for student
8. System saves meeting record
9. Student receives notification with meeting summary
10. Both supervisor and student can view meeting history

**Feedback Process:**

```
[Identify Work to Review] → [Provide Feedback] → [Rate & Comment] → [Student Notified]
```

**Types of Feedback:**

- **Milestone Feedback**: Specific to a milestone review
- **Project Feedback**: Overall project progress and quality
- **Research Feedback**: Research methodology, findings, writing quality

**Step-by-Step:**

1. Faculty selects work to review (milestone/project/research)
2. Writes detailed feedback_text
3. Optionally adds rating (1-5 scale):
   - 1: Needs significant improvement
   - 2: Below expectations
   - 3: Meets expectations
   - 4: Good work
   - 5: Excellent work
4. System saves feedback and links to appropriate entity
5. System notifies student (to_user_id)
6. Student views feedback in their dashboard
7. Student can reference feedback while working
8. Faculty can track feedback history per student

**Evaluation Workflow:**

```
[Project/Research Complete] → [Set Criteria] → [Assign Score] → [Add Comments] → [Final Grade]
```

**Step-by-Step:**

1. Faculty identifies completed project/research
2. Creates evaluation record
3. Defines evaluation criteria (e.g., "Code Quality", "Documentation", "Innovation")
4. Assigns score (flexible format):
   - Percentage: "85%"
   - Letter grade: "A-"
   - GPA: "3.7"
   - Custom: "8/10"
5. Adds detailed comments:
   - Strengths
   - Areas for improvement
   - Overall assessment
6. System saves evaluation
7. Student can view evaluation and feedback
8. Department can generate reports from evaluations

**Use Cases:**

- **Regular Check-ins**: Weekly/bi-weekly meetings to track progress
- **Milestone Reviews**: Meetings after each milestone completion
- **Progress Feedback**: Continuous feedback throughout project lifecycle
- **Final Evaluation**: Formal assessment at project/research completion
- **Peer Collaboration**: Meetings can include multiple students/faculty

---

### Department Showcase Workflow

**Purpose:**
**Purpose:**
Highlight exceptional projects and research work to:

- Attract prospective students
- Showcase department capabilities
- Celebrate student achievements
- Share knowledge with broader community

```
[Identify Achievement] → [Create Showcase Entry] → [Add Details & Media]
→ [Publish] → [Feature Outstanding Work]
```

**Step-by-Step:**

1. Department identifies significant achievement to showcase:

   - Novel research findings
   - Published papers
   - Award-winning projects
   - Industry partnerships
   - Innovative solutions
   - High-impact implementations
   - Successful events or competitions

2. Faculty/Admin creates showcase entry
3. Writes compelling title and description (standalone - no database links)
4. Can optionally include project/research IDs in metadata field (flexible JSON)
5. Highlights key achievements:
   - Research contributions
   - Technical innovations
   - Real-world impact
   - Recognition received
6. Adds relevant tags for discoverability:
   - Technical: "Machine Learning", "IoT", "Blockchain"
   - Domain: "Healthcare", "Finance", "Education"
   - Type: "Research", "Product", "Tool", "Event"
7. Uploads attractive thumbnail_url (project demo, research diagram, event photo, etc.)
8. Adds metadata (JSON) for flexible additional context:
   - Optional: project_id or research_id references
   - GitHub repository link
   - Demo video URL
   - Publication DOI
   - Awards received
   - Media coverage
9. Reviews and publishes (published_at timestamp set)
10. Optionally marks as "featured" for homepage display
11. Showcase appears on department's public page
12. Students can share showcase link in portfolios
13. External visitors can browse department achievements

**Showcase Display:**

- **Featured Section**: Top 3-5 exceptional works
- **Category Filters**: By tags, year, type
- **Search**: By keywords, student names, technologies
- **Metrics**: View counts (optional)
- **Social Sharing**: Share buttons for LinkedIn, Twitter

**Benefits:**

- **Students**: Portfolio building, recognition, career opportunities
- **Department**: Reputation building, student recruitment, industry partnerships
- **Institution**: Showcase collective achievements, research output visibility
- **Industry**: Discover talent, identify collaboration opportunities

---

## Permissions

- **Department Admin**: Create courses, assign faculty, enroll students (within their department), create projects/research for students, post job opportunities, create and manage competitions, schedule meetings, provide feedback and evaluations, create and manage department showcase entries, feature exceptional work
- **Faculty**: View assigned courses and enrolled students, upload course resources (PDFs, PPTs, images, links), create and supervise projects/research, create milestones and tasks, review and approve/reject task submissions, track student progress, post job opportunities, create competitions, schedule supervision meetings, provide feedback (with ratings), conduct evaluations, recommend work for department showcase
- **Student**: View enrolled courses, access/download course resources, view assigned projects/research, work on tasks (update status, submit with details), track milestones and deadlines, browse and apply for jobs (via external links), register for competitions (via external links), attend supervision meetings, receive feedback and evaluations, view department showcase (their own and others' work)
- **Public/External Visitors**: View published department showcase entries (read-only access)

---

## Blockchain Integration (Optional Enhancement)

### Purpose

- Immutable proof of task submissions and milestone completions
- Tamper-proof academic records
- Verifiable timestamps for submissions
- Transparent progress tracking

### Implementation Approach

**Option 1: Task-Level Blockchain (Recommended)**

- Hash task submission data when status changes to "submitted"
- Store hash on blockchain with metadata (task_id, student_id, timestamp)
- Store blockchain transaction ID in `task.submission_tx_id` field
- Verify submission integrity by comparing stored hash with recalculated hash

**Option 2: Milestone-Level Blockchain**

- Hash milestone completion data when approved
- Store on blockchain when milestone status = "approved"
- Already supported via `milestone.blockchain_tx_id` field
- Proves milestone completion and approval

**Option 3: Hybrid Approach (Most Comprehensive)**

- Hash and store task submissions individually
- Hash and store milestone approvals
- Create merkle tree of all tasks when milestone approved
- Provides both granular and aggregate proof

### What to Hash and Store

**For Task Submissions:**

```javascript
const submissionData = {
  taskId: task.taskId,
  milestoneId: task.milestoneId,
  studentId: task.assignedTo,
  submissionDetails: task.submissionDetails,
  submissionUrl: task.submissionUrl,
  submittedAt: task.submittedAt.toISOString(),
  fileHash: calculateFileHash(submissionFile), // if file uploaded
};
const submissionHash = SHA256(JSON.stringify(submissionData));
// Store submissionHash on blockchain
// Save blockchain TX ID to task.submission_tx_id
```

**For Milestone Approvals:**

```javascript
const milestoneData = {
  milestoneId: milestone.milestoneId,
  projectId: milestone.projectId,
  researchId: milestone.researchId,
  title: milestone.title,
  approvedBy: milestone.approvedBy,
  approvedAt: milestone.approvedAt.toISOString(),
  progress: milestone.progress,
  taskHashes: milestone.tasks.map(t => t.submissionHash), // reference task proofs
};
const milestoneHash = SHA256(JSON.stringify(milestoneData));
// Store on blockchain
// Save TX ID to milestone.blockchain_tx_id
```

### Schema Updates Needed

✅ **Already Added to Tasks table:**

- `submission_hash` (varchar 64) - SHA256 hash of submission data
- `submission_tx_id` (varchar 255) - Blockchain transaction ID
- `file_hash` (varchar 64) - Hash of submitted file (if applicable)

✅ **Already Present in Milestones table:**

- `proof_hash` (varchar 255) - Hash for milestone proof
- `blockchain_tx_id` (varchar 255) - Blockchain transaction ID

### Blockchain Technology Options

1. **Ethereum** - Most decentralized, higher gas fees
2. **Polygon** - Lower fees, EVM compatible
3. **Hyperledger Fabric** - Private/permissioned, institutional use
4. **IPFS + Filecoin** - For storing large files with content addressing

### Verification Flow

**Student Submission:**

1. Student submits task → status = "submitted"
2. System calculates submission hash
3. System writes hash to blockchain
4. Store blockchain TX ID in database
5. Student receives blockchain receipt/proof

**Faculty Verification:**

1. Faculty views submission
2. System shows blockchain verification status
3. Faculty can verify hash matches blockchain
4. Faculty reviews and approves/rejects
5. Approval creates another blockchain entry

**External Verification:**

1. Anyone with task_id can verify submission
2. Recalculate hash from stored data
3. Compare with blockchain hash
4. Verify timestamp authenticity
5. Confirm data hasn't been tampered with

### Benefits

- **For Students**: Immutable proof of work and submission timestamps
- **For Faculty**: Transparent approval process, cannot be backdated
- **For Institution**: Verifiable academic records, audit trail
- **For Industry**: Trusted verification of project work for hiring

### Implementation Steps

**Phase 1: Hash Generation (No Blockchain Yet)**

1. When student submits task, calculate `submission_hash`
2. Store hash in database
3. Provides tamper detection without blockchain cost

**Phase 2: Blockchain Integration**

1. Choose blockchain (recommend Polygon for low cost)
2. Create smart contract for storing hashes
3. Write submission hash to blockchain on submit
4. Store transaction ID in `submission_tx_id`
5. Create verification API endpoint

**Phase 3: File Storage Integration**

1. Store submitted files on IPFS or S3
2. Calculate file hash (SHA256 or IPFS CID)
3. Store `file_hash` in database
4. Include file hash in blockchain submission data

**Example Smart Contract (Solidity):**

```solidity
contract AcademicProof {
    struct Submission {
        string taskId;
        string studentId;
        bytes32 submissionHash;
        uint256 timestamp;
    }

    mapping(string => Submission) public submissions;

    function recordSubmission(
        string memory taskId,
        string memory studentId,
        bytes32 submissionHash
    ) public {
        submissions[taskId] = Submission(
            taskId,
            studentId,
            submissionHash,
            block.timestamp
        );
    }

    function verifySubmission(
        string memory taskId
    ) public view returns (Submission memory) {
        return submissions[taskId];
    }
}
```

### Cost Considerations

- **Without Blockchain**: Free, only database storage
- **With Blockchain**: ~$0.01-0.10 per transaction (Polygon)
- **Hybrid**: Hash locally, blockchain only for important milestones
- **Batching**: Combine multiple task hashes in single transaction

---
