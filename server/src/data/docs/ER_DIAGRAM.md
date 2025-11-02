# CPN-AI Database Entity-Relationship Diagram

## Main Entity Relationships

```mermaid
erDiagram
    USER ||--o{ PROJECT_AS_STUDENT : "creates"
    USER ||--o{ PROJECT_AS_SUPERVISOR : "supervises"
    USER ||--o{ COURSE_ENROLLMENT : "enrolls"
    USER ||--o{ DAILY_LOG : "writes"
    USER ||--o{ AI_QUERY : "asks"
    USER ||--o{ SKILL_LADDER : "builds"
    USER ||--o{ NOTIFICATION : "receives"

    DEPARTMENT ||--o{ USER : "employs"
    DEPARTMENT ||--o{ COURSE : "offers"
    DEPARTMENT ||--o{ RESEARCH_TREND : "tracks"

    COURSE ||--o{ COURSE_ENROLLMENT : "has"
    COURSE ||--o{ PROJECT : "includes"

    PROJECT ||--o{ MILESTONE : "contains"
    PROJECT ||--o{ DAILY_LOG : "documents"
    PROJECT ||--o{ PROOF_RECORD : "verifies"
    PROJECT ||--o{ MEETING : "schedules"
    PROJECT ||--o{ FEEDBACK : "receives"
    PROJECT ||--|| PROJECT_SHOWCASE : "displays"

    MILESTONE ||--o{ TASK : "breaks_into"
    MILESTONE ||--o{ DAILY_LOG : "tracks"
    MILESTONE ||--o{ SUBMISSION_VERSION : "submits"

    DAILY_LOG ||--o{ PROOF_RECORD : "proves"
    DAILY_LOG ||--o{ REPRODUCIBILITY_CHECK : "validates"

    PROJECT ||--o{ RESEARCH_SOURCE : "uses"
    PROJECT ||--o{ RESEARCH_PROVENANCE : "links"

    USER {
        text user_id PK
        varchar first_name
        varchar last_name
        varchar email UK
        text password
        enum role
        text department_id FK
        boolean is_verified
        timestamp created_at
    }

    DEPARTMENT {
        text department_id PK
        varchar name
        varchar code UK
        text description
        timestamp created_at
    }

    PROJECT {
        text project_id PK
        varchar title
        text description
        text student_id FK
        text supervisor_id FK
        text course_id FK
        enum status
        varchar doi_identifier UK
        timestamp created_at
    }

    MILESTONE {
        text milestone_id PK
        text project_id FK
        varchar title
        enum status
        integer progress
        varchar proof_hash
        timestamp approved_at
    }

    DAILY_LOG {
        text log_id PK
        text project_id FK
        text user_id FK
        text milestone_id FK
        enum type
        enum source
        text activity
        text ai_summary
        varchar proof_hash
        timestamp created_at
    }

    PROOF_RECORD {
        text proof_id PK
        text project_id FK
        text log_id FK
        enum type
        varchar hash_value UK
        varchar blockchain_tx_id
        boolean verified
        timestamp verified_at
    }
```

## TwinPulse Engines Schema

```mermaid
erDiagram
    USER ||--o{ SKILL_LADDER : "develops"
    USER ||--o{ COMPANY_TARGET : "targets"
    USER ||--o{ PORTFOLIO_PLANNER : "plans"

    DEPARTMENT ||--o{ RESEARCH_TREND : "monitors"
    DEPARTMENT ||--o{ COLLABORATION_TARGET : "suggests"

    SKILL_LADDER {
        text ladder_id PK
        text user_id FK
        varchar skill_name
        enum current_level
        enum target_level
        jsonb learning_plan
        integer progress
    }

    JOB_MARKET_TREND {
        text job_trend_id PK
        varchar skill_name
        enum demand_level
        varchar industry
        varchar avg_salary_range
        integer job_postings_count
    }

    RESEARCH_TREND {
        text trend_id PK
        varchar topic
        text department_id FK
        real growth_rate
        integer citation_count
        enum source
        timestamp last_updated
    }

    COMPANY_TARGET {
        text company_target_id PK
        text user_id FK
        varchar company_name
        text hiring_status
        jsonb matched_skills
        real fit_score
    }
```

## Supervision & Collaboration Schema

```mermaid
erDiagram
    PROJECT ||--o{ MEETING : "has"
    PROJECT ||--o{ FEEDBACK : "receives"
    PROJECT ||--o{ EVALUATION : "graded_by"

    USER ||--o{ MEETING_AS_SUPERVISOR : "conducts"
    USER ||--o{ MEETING_AS_STUDENT : "attends"
    USER ||--o{ FEEDBACK_GIVEN : "gives"
    USER ||--o{ FEEDBACK_RECEIVED : "receives"

    MEETING {
        text meeting_id PK
        text project_id FK
        text supervisor_id FK
        text student_id FK
        timestamp meeting_date
        text notes
        text next_action
    }

    FEEDBACK {
        text feedback_id PK
        text project_id FK
        text milestone_id FK
        text from_user_id FK
        text to_user_id FK
        text feedback_text
        integer rating
    }

    EVALUATION {
        text evaluation_id PK
        text project_id FK
        text evaluator_id FK
        text criteria
        text score
        text comments
    }
```

## Discovery & Showcase Schema

```mermaid
erDiagram
    PROJECT ||--|| PROJECT_SHOWCASE : "featured_in"
    PROJECT ||--o{ DEPARTMENT_ARCHIVE : "archived_in"
    PROJECT ||--o{ CAMPUS_FEED : "publicizes"

    DEPARTMENT ||--o{ DEPARTMENT_ARCHIVE : "maintains"

    PROJECT_SHOWCASE {
        text showcase_id PK
        text project_id FK UK
        boolean featured
        integer views_count
        integer likes_count
        text abstract
        jsonb key_figures
        timestamp published_at
    }

    DEPARTMENT_ARCHIVE {
        text archive_id PK
        text department_id FK
        text project_id FK
        integer year
        varchar semester
        text[] tags
    }

    CAMPUS_FEED {
        text feed_id PK
        text project_id FK
        text user_id FK
        varchar event_type
        varchar title
        text description
        boolean is_public
    }
```

## System Management Schema

```mermaid
erDiagram
    USER ||--o{ NOTIFICATION : "receives"
    USER ||--o{ AUDIT_LOG : "generates"

    PROJECT ||--o{ NOTIFICATION : "triggers"
    MILESTONE ||--o{ NOTIFICATION : "alerts"

    NOTIFICATION {
        text notification_id PK
        text user_id FK
        enum type
        text message
        text related_project_id FK
        text related_milestone_id FK
        boolean read_status
        timestamp created_at
    }

    AUDIT_LOG {
        text audit_id PK
        varchar table_name
        text record_id
        enum action
        text user_id FK
        jsonb changes
        varchar ip_address
        timestamp created_at
    }
```

## Data Flow Diagrams

### Project Lifecycle Flow

```mermaid
flowchart TD
    A[Student Creates Project] --> B[Assign Supervisor]
    B --> C[Define Milestones]
    C --> D[Work on Tasks]
    D --> E[Daily Logs Created]
    E --> F[AI Summarizes Progress]
    F --> G[Generate Blockchain Proof]
    G --> H[Milestone Ready for Review]
    H --> I{Supervisor Approval}
    I -->|Approved| J[Milestone Badge Generated]
    I -->|Rejected| D
    J --> K{More Milestones?}
    K -->|Yes| D
    K -->|No| L[Project Complete]
    L --> M[Showcase & Archive]
```

### TwinPulse Data Processing

```mermaid
flowchart LR
    A[External APIs] --> B[Data Collection Layer]
    B --> C{Engine Type}
    C -->|ScholarPulse| D[Research Trend Analysis]
    C -->|CareerPulse| E[Job Market Analysis]
    D --> F[Department Insights]
    E --> G[Student Skill Ladders]
    F --> H[Course Refresh Plans]
    G --> I[Career Recommendations]
    H --> J[Dashboard Widgets]
    I --> J
```

### Verification Flow

```mermaid
flowchart TD
    A[Action Performed] --> B[Log Entry Created]
    B --> C[Generate Hash]
    C --> D[Store in Proof Table]
    D --> E[Submit to Blockchain]
    E --> F[Receive TX ID]
    F --> G[Update Proof Record]
    G --> H[Verification Badge]
    H --> I[Public Proof Link]
```

---

## Database Indexes Visualization

### Critical Performance Indexes

```mermaid
graph TD
    A[Query Optimization] --> B[User Queries]
    A --> C[Project Queries]
    A --> D[Log Queries]
    A --> E[Notification Queries]

    B --> B1[idx_user_email]
    B --> B2[idx_user_role]
    B --> B3[idx_user_department]

    C --> C1[idx_project_student]
    C --> C2[idx_project_supervisor]
    C --> C3[idx_project_status]

    D --> D1[idx_daily_log_project]
    D --> D2[idx_daily_log_date]
    D --> D3[idx_daily_log_user]

    E --> E1[idx_notification_user]
    E --> E2[idx_notification_read]
```

---

## Table Cardinality Summary

| Relationship                 | Cardinality | Notes                         |
| ---------------------------- | ----------- | ----------------------------- |
| User → Projects (Student)    | 1:N         | One student, many projects    |
| User → Projects (Supervisor) | 1:N         | One supervisor, many projects |
| Project → Milestones         | 1:N         | Ordered phases                |
| Milestone → Tasks            | 1:N         | Breakdown of work             |
| Project → Daily Logs         | 1:N         | Activity history              |
| Daily Log → Proof Records    | 1:N         | Verification chain            |
| Project → Showcase           | 1:1         | Optional display              |
| Department → Research Trends | 1:N         | Monitoring topics             |
| User → Skill Ladders         | 1:N         | Learning paths                |

---

## View Diagram in Tools

### Online Mermaid Editors

- [Mermaid Live Editor](https://mermaid.live/)
- [Mermaid Chart](https://www.mermaidchart.com/)

### VS Code Extensions

- Markdown Preview Mermaid Support
- Mermaid Markdown Syntax Highlighting

### Export Options

```bash
# Install mermaid CLI
npm install -g @mermaid-js/mermaid-cli

# Generate PNG
mmdc -i ER_DIAGRAM.md -o er-diagram.png

# Generate SVG
mmdc -i ER_DIAGRAM.md -o er-diagram.svg -t neutral
```

---

**Last Updated:** 2025-11-02
**Diagram Version:** 1.0.0
