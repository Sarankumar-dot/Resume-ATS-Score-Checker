# Resume ATS Checker (ResumeFit)

> Know if your resume passes the ATS — and how to fix it if it doesn't.

A full-stack web app that lets job seekers upload a resume, paste a job description, and get a detailed ATS compatibility score with actionable suggestions.

## Project Structure

```
resume-ats-checker/
├── client/          → React (Vite) + JavaScript + Tailwind CSS v4
├── server/          → Node.js + Express + JavaScript + Prisma
├── package.json     → Root scripts to run both apps
└── README.md
```

## Backend Architecture (Layered)

The backend follows a strict layered architecture. Every request flows through:

```
Route → Auth Middleware → Validation Middleware → Controller → Service → Model/Prisma → Database
```

| Layer | Location | Responsibility |
|---|---|---|
| **Routes** | `src/routes/` | Define endpoints only — wire path + middleware + controller. Include Swagger JSDoc annotations. |
| **Auth Middleware** | `src/middleware/auth.middleware.js` | Verify JWT access token, attach user to `req`, reject unauthorized requests. |
| **Validation Middleware** | `src/middleware/validate.middleware.js` | Validate request body/params/query using Zod schemas before reaching the controller. |
| **Validators** | `src/validators/` | Zod schemas defining the shape of valid input for each endpoint. |
| **Controllers** | `src/controllers/` | Handle `req`/`res` only — parse input, call the relevant service, send the response. No business logic or DB calls. |
| **Services** | `src/services/` | All business logic lives here. Call models/Prisma for data access. Framework-agnostic (no `req`/`res`). |
| **Models** | `src/models/` | Thin Prisma data-access wrappers — just queries, no business logic. |
| **Config** | `src/config/` | Environment variables, CORS settings, Swagger configuration. |
| **Lib** | `src/lib/` | Shared utilities — Prisma client singleton, JWT helpers. |

## Tech Stack

- **Frontend**: React (Vite) + JavaScript, Tailwind CSS v4, React Router v7
- **Backend**: Node.js + Express, JavaScript (ESM)
- **Database**: PostgreSQL (hosted on Supabase)
- **ORM**: Prisma
- **Validation**: Zod
- **API Docs**: Swagger (swagger-jsdoc + swagger-ui-express)
- **Deployment**: Frontend → Vercel, Backend → Render

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- PostgreSQL database (or a Supabase project)

### 1. Clone & Install

```bash
git clone <repo-url>
cd resume-ats-checker
npm install          # Install root dependencies (concurrently)
cd client && npm install && cd ..
cd server && npm install && cd ..
```

### 2. Configure Environment

```bash
# Client
cp client/.env.example client/.env

# Server
cp server/.env.example server/.env
# Edit server/.env with your actual DATABASE_URL and secrets
```

### 3. Set Up Database (after providing Supabase connection string)

```bash
cd server
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Run Both Apps

From the root directory:

```bash
npm run dev
```

This starts:
- **Client** at [http://localhost:5173](http://localhost:5173)
- **Server** at [http://localhost:5000](http://localhost:5000)

Or run them individually:

```bash
npm run dev:client   # Just the frontend
npm run dev:server   # Just the backend
```

### 5. API Documentation

Swagger UI is available at: [http://localhost:5000/api/docs](http://localhost:5000/api/docs)

### 6. Health Check

```bash
curl http://localhost:5000/api/health
# → { "status": "ok", "timestamp": "..." }
```

## Implementation Phases

| Phase | Description |
|---|---|
| **0** | Project setup & scaffolding ← *current* |
| **1** | Authentication (JWT + Google OAuth) |
| **2** | Resume upload + parsing |
| **3** | Section detection + ATS parseability check |
| **4** | JD-matching score |
| **5** | Action verb + quantification suggestions |
| **6** | UI polish + history |
| **7** | Deployment |
| **8** | Stretch goals (LLM rewrites, multi-JD, dark mode) |
# Resume-ATS-Score-Checker
# Resume-ATS-Score-Checker
# Resume-ATS-Score-Checker
