# CPN-AI — Campus Projects & Proof Network

CPN-AI (Campus Projects & Proof Network) is an AI-enhanced academic management platform that helps institutions manage semester-based courses, projects, research activities, and achievement verification. It combines Retrieval-Augmented Generation (RAG) for research and content assistance, a recommendation engine for opportunities, and cryptographic proofing for immutable verification of academic milestones and submissions.

Key highlights

- Role-based authentication and department-scoped user management
- Semester-based course and project lifecycle management
- RAG-based AI assistant for research, content generation, and meeting summarization
- Blockchain-verified proof records for submissions and milestones
- Personalized recommendation engine for jobs, competitions, and higher-study opportunities

## Tech Stack

- **Frontend**

  - Framework: Next.js 15 + React 19
  - Language: TypeScript
  - Styling: Tailwind CSS, shadcn/ui
  - State: Zustand
  - Forms & Validation: react-hook-form, zod
  - Charts: Recharts
  - Animations: Framer Motion

- **Backend**

  - Runtime & Framework: Node.js + Express (TypeScript)
  - ORM: Drizzle ORM (drizzle-kit)
  - Database: PostgreSQL (pg) — compatible with Neon/Serverless Postgres
  - Auth: JWT-based authentication
  - AI / Vector tooling: OpenAI, @langchain, @pinecone-database/pinecone, @google/genai
  - File storage: AWS S3 SDK (or compatible R2/S3)

## Quick Start Guide

This guide gets the app running locally (client + server). The repository uses pnpm as the package manager (pnpm is recommended but npm/yarn can be used as alternatives).

Prerequisites

- Node.js (v18+ recommended)
- pnpm (or npm/yarn)

Install dependencies

- Install client dependencies and start the frontend:

```bash
cd client
pnpm install
pnpm run dev
```

- Install server dependencies and start the backend:

```bash
cd server
npm install
npm run dev
```

**Environment Setup**

Run these commands to create your .env files and update them as needed:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Then, open each file and fill in the required values (e.g. DATABASE_URL, JWT_SECRET, API keys, and NEXT_PUBLIC_API_BASE_URL).

**Database and migrations**

- The backend uses Drizzle ORM. Useful commands (from `server`):

```bash
npm run db:generate   # generate drizzle migrations
npm run db:migrate    # apply migrations
npm run db:studio     # open drizzle studio
npm run db:push       # push schema
```

Where to look next

- Frontend: `client/src/` — Next.js app, components, hooks, and configuration.
- Backend: `server/src/` — controllers, routes, middleware, and Drizzle schema.
- API endpoints: see `resources/API_DOCUMENTATION.md` for documented endpoints, or inspect `server/src/routes/` and `server/src/controllers/`.

## Diagrams

Below are the primary architecture and flow diagrams for CPN-AI:

[View Entity Relationship Diagram](resources/cpn-entity-relationship-diagram.png)

- End-to-End (ETE) flow

![ETE Diagram](resources/cpn-ete-diagram.png)

- Blockchain verification flow

![Blockchain Data Flow](resources/block-chain-data-flow-diagram.png)

- Research & Chatbot architecture

![Research & Chatbot](resources/researchandproject-chatbot-diagram.png)

- Quiz generation & evaluation

![Quiz Generation & Evaluation](resources/quiz-gen-eval-diagram.png)

## Resources

The project includes supporting documentation and design artifacts in the `resources/` folder. Quick references and diagrams:

- Project Flow: `resources/Project-Flow.md` — full project overview, core features, architecture, and data-flows (RAG, verification, recommendation engines).
- API Documentation: [Click here to open API docs](resources/API_DOCUMENTATION.md) — backend API details and endpoints (also mirrored under `resources/API_DOCUMENTATION.md`).

Useful diagrams (in `resources/`):

- `cpn-entity-relationship-diagram.png` — conceptual ERD for projects, users, milestones, proofs.
- `cpn-ete-diagram.png` — end-to-end (ETE) flow of the platform lifecycle.
- `block-chain-data-flow-diagram.png` — verification & blockchain proof flow.
- `quiz-gen-eval-diagram.png` — quiz generation and evaluation flow used by RAG/AI assistant.
- `researchandproject-chatbot-diagram.png` — architecture of the research/project chatbot assistant.
