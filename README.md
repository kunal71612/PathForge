# PathForge 🚀
> **Learn with purpose. Prove your skills. Find your opportunity.**

PathForge is a production-grade full-stack student growth and opportunity platform. It closes the critical disconnect in conventional career websites by bridging:

$$\text{Goal} \longrightarrow \text{Roadmap} \longrightarrow \text{Learning} \longrightarrow \text{Practice} \longrightarrow \text{Assessment} \longrightarrow \text{Skill Confidence} \longrightarrow \text{Opportunity Match} \longrightarrow \text{Readiness Gap} \longrightarrow \text{Application}$$

---

## 🌟 Why PathForge?

Students often know about opportunities (hackathons, internships, fellowships) but face constant friction:
- **Discovering them too late** and missing critical deadlines.
- **Not knowing whether they are ready** to apply.
- **Not knowing which specific skills are missing**.
- **Passive tutorial consumption** without verifiable skill testing.

**PathForge solves this end-to-end:**
1. **Targeted Goals & Roadmaps:** Select your dream role (e.g. *Full-Stack Developer*, *AI Engineer*) to activate curated milestone roadmaps.
2. **Curated External Library:** Master skills via top tutorials, official documentation, interactive courses, and repositories.
3. **Skill Verification Quizzes:** Diagnostic tests with instant scoring and answer explanations that prove practical understanding.
4. **Transparent Skill Confidence Formula:**
   $$\text{Skill Confidence} = (\text{Assessment Score} \times 0.80) + (\text{Hands-on Learning Progress} \times 0.20)$$
5. **Smart Recommendation & Readiness Engine:** Multi-factor match scoring:
   - Skill Overlap (40%)
   - Domain Interests (25%)
   - Education Eligibility (15%)
   - Category Match (10%)
   - Goal Alignment (10%)
6. **1-Click Skill Gap Analysis:** See exactly why your readiness is at 60%, what prerequisite skills you lack (e.g., Docker, CI/CD), and get 1-click links to close the gap.
7. **Application Lifecycle Tracker:** Manage saved and applied opportunities through an interactive pipeline (`SAVED` $\to$ `PREPARING` $\to$ `READY` $\to$ `APPLIED` $\to$ `SHORTLISTED` $\to$ `SELECTED`) with deadline alerts.
8. **Admin Control Center:** Comprehensive CRUD dashboard to manage opportunities, learning resources, roadmaps, questions, and inspect student progress.

---

## 🛠️ Architecture & Tech Stack

### Frontend
- **Framework:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS with a clean monochrome SaaS design system
- **Routing:** React Router v7 with protected routes and role-based guards
- **Data Fetching & State:** TanStack React Query + Axios with JWT interceptors
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js (TypeScript) + Express
- **Database & ORM:** PostgreSQL + Prisma ORM (v6)
- **Validation:** Zod schemas for request validation
- **Security:** Helmet, CORS, Express Rate Limit, bcrypt password hashing, JWT authentication
- **Testing:** Vitest

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **PostgreSQL database** (Local PostgreSQL, Docker, or Cloud provider like Neon / Supabase / Render)

### 2. Environment Setup

#### Backend Setup
```bash
cd backend
# Create your environment file from the template
cp ../.env.example .env
```
Ensure `.env` in `backend/` has your database URL:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pathforge?schema=public"
JWT_SECRET="dev-jwt-secret-change-in-production"
PORT=3000
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

#### Frontend Setup
```bash
cd ../frontend
```
Ensure `.env` in `frontend/` points to the backend API:
```env
VITE_API_URL="http://localhost:3000/api"
```

### 3. Database Migration & Seed
Run Prisma migrations and populate realistic initial data (16 skills, 7 goals, 4 roadmaps, 30+ curated resources, 25 opportunities, 25 quiz questions, and pre-configured student/admin demo accounts):
```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
```

### 4. Running the Development Servers

#### Terminal 1 — Backend:
```bash
cd backend
npm run dev
# API running on http://localhost:3000
```

#### Terminal 2 — Frontend:
```bash
cd frontend
npm run dev
# Web application running on http://localhost:5173
```

---

## 🔑 Pre-Configured Demo Accounts

| Role | Email | Password | Pre-loaded State |
| :--- | :--- | :--- | :--- |
| **Student** | `demo@student.local` | `demo1234` | Target Goal: *Full-Stack Developer*, verified skills in React, TypeScript, Node.js; active roadmaps and tracked applications. |
| **Admin** | `admin@pathforge.local` | `admin1234` | Full access to Admin Control Center, CRUD for roadmaps, opportunities, resources, and assessments. |

*You can also register a brand new student account directly from the UI.*

---

## 📂 Project Structure

```
PathForge/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma         # Complete relational models (User, Skill, Goal, Roadmap, Resource, Assessment, Opportunity, Application)
│   │   └── seed.ts               # Database seed script with rich production-grade mock data
│   ├── src/
│   │   ├── config/               # Database client and environment configuration
│   │   ├── controllers/          # Express route controllers with input handling
│   │   ├── middleware/           # Auth guards, role verification, Zod validation, error handler
│   │   ├── routes/               # API route definitions
│   │   ├── services/             # Core business logic (Dashboard, Roadmap, Skill, Opportunity, Assessment, Recommendation, Admin)
│   │   ├── validators/           # Zod schemas for all endpoints
│   │   ├── __tests__/            # Vitest unit tests for scoring formulas and input validation
│   │   ├── app.ts                # Express application setup
│   │   └── server.ts             # Server entry point
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/                  # Axios client & typed API endpoints
│   │   ├── components/ui/        # Reusable UI primitives (Button, Input, Card, Badge, ProgressBar, Modal)
│   │   ├── hooks/                # AuthContext & useAuth hook
│   │   ├── layouts/              # AppLayout with responsive sidebar and top bar navigation
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx   # Premium SaaS landing hero
│   │   │   ├── LoginPage.tsx     # Student & Admin authentication
│   │   │   ├── RegisterPage.tsx  # Student onboarding
│   │   │   ├── DashboardPage.tsx # Today's focus plan, skill progress, recommendations, deadlines
│   │   │   ├── GoalsPage.tsx     # Goal selection & track activation
│   │   │   ├── RoadmapsPage.tsx  # Track listing & milestones preview
│   │   │   ├── RoadmapDetailPage.tsx # Interactive module timeline & progress toggling
│   │   │   ├── LearnPage.tsx     # Filterable external library (YouTube, Docs, Repos)
│   │   │   ├── SkillsPage.tsx    # Comprehensive skill confidence matrix
│   │   │   ├── SkillDetailPage.tsx # Weighted confidence formula breakdown & quizzes
│   │   │   ├── AssessmentsPage.tsx # Skill tests catalog & pass status
│   │   │   ├── AssessmentDetailPage.tsx # Interactive quiz taker with instant explanations
│   │   │   ├── OpportunitiesPage.tsx # Filterable opportunities with match badges & gap analysis modal
│   │   │   ├── OpportunityDetailPage.tsx # Prerequisites matrix, gap-closing links, pipeline stage changer
│   │   │   ├── ApplicationsPage.tsx # Pipeline tracker with notes & deadline badges
│   │   │   ├── CalendarPage.tsx  # Urgency-grouped deadlines (48h, 7d, 30d)
│   │   │   ├── ProfilePage.tsx   # Academic credentials & interest tags
│   │   │   └── admin/            # Admin management pages (Dashboard, Opportunities, Resources, Roadmaps, Assessments, Students)
│   │   ├── App.tsx               # Route definitions & guards
│   │   ├── main.tsx              # Application entry point
│   │   └── index.css             # Tailwind design system directives
│   ├── nginx.conf
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml            # Multi-container orchestration (DB + Backend + Frontend)
└── README.md
```

---

## 🐳 Docker Deployment

To launch the complete platform including the PostgreSQL database using Docker Compose:
```bash
docker-compose up --build
```
- **Frontend:** `http://localhost:5173`
- **Backend API:** `http://localhost:3000/api`
- **Database:** PostgreSQL on port `5432`

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
