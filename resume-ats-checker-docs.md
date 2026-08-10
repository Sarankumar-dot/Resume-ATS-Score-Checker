# Resume ATS Checker — Project Documents

---

## 01 — PRD (Product Requirements Document)

| Field | Details |
|---|---|
| **App Name** | ResumeFit (working name) |
| **Tagline** | Know if your resume passes the ATS — and how to fix it if it doesn't. |
| **Problem** | Freshers and job seekers apply to dozens of roles but don't know why their resume gets filtered out before a human sees it. ATS systems reject resumes for formatting issues, missing keywords, and weak phrasing — and candidates have no visibility into any of it. |
| **Target User** | A fresher or early-career job seeker applying to multiple roles who wants to check if their resume is ATS-friendly and matches a specific job description before submitting. Comfortable uploading a resume file and pasting a JD, not looking for a full career-coaching product. |
| **Core Value Proposition** | Paste a job description, upload a resume, get a concrete match score plus specific, actionable fixes — not just a generic score. |
| **Core Features (Must Have)** | - User signup/login (email + Google OAuth)<br>- Resume upload (PDF/DOCX) with text extraction<br>- JD-matching score with matched/missing keyword breakdown<br>- ATS-parseability check (flags tables, images, columns, non-standard fonts)<br>- Section detection (contact, summary, skills, experience, education, projects)<br>- Action verb + quantification suggestions per bullet<br>- Analysis history per user |
| **Nice to Have (v2)** | - LLM-powered bullet rewrite suggestions<br>- Multi-JD comparison<br>- Export improved resume<br>- Chrome extension to scan a job posting directly |
| **Out of Scope** | Full resume builder/editor, cover letter generation, job application tracking, LinkedIn integration, payment/subscription tiers. |
| **User Stories** | - As a job seeker, I want to upload my resume and a JD so that I can see how well they match.<br>- As a job seeker, I want to see which keywords are missing so that I know what to add.<br>- As a job seeker, I want formatting warnings so that I know if an ATS can even parse my resume.<br>- As a job seeker, I want weak bullet points flagged so that I can rewrite them with impact. |
| **Success Metrics** | End-to-end flow (signup → upload → analyze → view suggestions) works without errors; demoable in under 2 minutes; deployed with a working live link. |

---

## 02 — TRD (Technical Requirements Document)

| Field | Details |
|---|---|
| **Frontend** | React (Vite) + Javascript |
| **Backend** | Node.js + Express (custom REST API), Prisma ORM |
| **Database** | PostgreSQL, hosted on Supabase (DB only — not Supabase's auto-API/Auth) |
| **Auth** | Self-built: JWT access token (short-lived) + refresh token (httpOnly cookie), plus Google OAuth via `google-auth-library` or Passport.js |
| **Hosting** | Frontend → Vercel; Backend → Render; Database → Supabase Postgres |
| **File Handling** | Parse-and-discard by default (store only extracted text in Postgres); Supabase Storage as fallback if original file retention is needed later |
| **Design Tool** | Stitch (for UI screen design/mockups before implementation) |
| **Coding Tool** | Antigravity (AI coding agent — this document set is the source-of-truth brief for it) |
| **Third-Party APIs / Libraries** | pdf-parse (PDF text extraction), mammoth (DOCX text extraction), multer (file upload handling), bcrypt (password hashing), jsonwebtoken (JWT), express-rate-limit (login/signup rate limiting) |
| **Key Libraries** | React Router, React Query (or Axios + custom hooks), Zod (validation), Tailwind CSS |
| **Environment Variables** | `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` (if using Storage), `CLIENT_URL`, `PORT` |
| **Constraints** | Must run on free tiers throughout (Vercel/Render/Supabase free plans); must work well on mobile/responsive; no local disk file persistence (Render's filesystem is ephemeral) |

---

## 03 — App Flow

| Field | Details |
|---|---|
| **Pages List** | `/` (landing), `/login`, `/signup`, `/dashboard`, `/analyze` (upload + JD input), `/analysis/:id` (results view), `/history`, `/settings` |
| **Navigation Type** | Top navbar (logo, nav links, avatar menu) on desktop; collapses to a hamburger/bottom nav on mobile |
| **First Screen** | Landing page explaining the product with a "Get Started" CTA → signup |
| **Auth Flow** | Signup (email/password or Google) → straight to Dashboard (no email verification in MVP) → Login on return visits → silent token refresh on app load |
| **Core User Journey 1** | User logs in → goes to `/analyze` → uploads resume (PDF/DOCX) → pastes JD text → clicks "Analyze" → redirected to `/analysis/:id` showing match score, missing keywords, ATS warnings, and bullet suggestions |
| **Core User Journey 2** | User goes to `/history` → sees list of past analyses with score + date → clicks one → returns to `/analysis/:id` for that past result |
| **Empty States** | `/history` with no analyses yet → "You haven't analyzed a resume yet" + CTA to `/analyze` |
| **Error States** | Failed upload (wrong file type/too large) → inline error under upload box; failed parse → "We couldn't read this file, try a different format"; network/API error → toast notification with retry |
| **Redirects** | After signup/login → `/dashboard`; after logout → `/login`; unauthenticated access to `/dashboard`, `/analyze`, `/history` → redirect to `/login` |

---

## 04 — UI/UX Design Brief

| Field | Details |
|---|---|
| **Aesthetic** | Minimal, clean, professional — approachable for job seekers, not overly corporate |
| **Primary Color** | #4F46E5 (indigo) |
| **Background Color** | #FFFFFF (light mode primary) |
| **Text Color** | #1F2937 |
| **Accent / CTA Color** | #4F46E5, with #10B981 (green) for good scores/success states and #EF4444 (red) for warnings/missing items |
| **Font** | Inter for UI text |
| **Border Radius** | 8px rounded corners throughout |
| **Shadows** | Subtle card shadows, no heavy drop shadows |
| **Dark/Light Mode** | Light mode for MVP; dark mode as a stretch goal |
| **Reference Apps** | Notion, Linear — clean cards, generous whitespace, clear typographic hierarchy |
| **Key UI Patterns** | Upload dropzone card, score gauge/progress ring, expandable sections for keyword breakdown and suggestions, tag-style chips for matched/missing keywords |
| **Mobile** | Fully responsive; stacked single-column layout on mobile, nav collapses to hamburger |
| **Design Workflow Note** | Screens to be mocked up in Stitch first (landing, dashboard, analyze/upload, analysis results, history) before implementation in Antigravity |

---

## 05 — Backend Schema

| Field | Details |
|---|---|
| **Table: users** | `id` (uuid, PK), `email` (text, unique), `password_hash` (text, nullable if OAuth-only), `name` (text), `google_id` (text, nullable), `avatar_url` (text, nullable), `created_at` (timestamp) |
| **Table: refresh_tokens** | `id` (uuid, PK), `user_id` (FK → users.id), `token_hash` (text), `expires_at` (timestamp), `created_at` (timestamp) |
| **Table: resumes** | `id` (uuid, PK), `user_id` (FK → users.id), `filename` (text), `parsed_text` (text), `uploaded_at` (timestamp) |
| **Table: analyses** | `id` (uuid, PK), `resume_id` (FK → resumes.id), `user_id` (FK → users.id), `jd_text` (text), `match_score` (int), `ats_score` (int), `missing_keywords` (text[] or jsonb), `matched_keywords` (text[] or jsonb), `section_check` (jsonb), `suggestions` (jsonb), `created_at` (timestamp) |
| **Relationships** | `resumes.user_id` → `users.id` (many-to-one); `analyses.resume_id` → `resumes.id` (many-to-one); `analyses.user_id` → `users.id` (many-to-one); `refresh_tokens.user_id` → `users.id` (many-to-one) |
| **Indexes** | `users.email` (unique index), `resumes.user_id`, `analyses.user_id`, `analyses.resume_id` |
| **Auth Provider** | Self-built — JWT access tokens (short-lived) + refresh tokens (httpOnly cookie, rotated on use), Google OAuth for social login |
| **Authorization Rule** | Users can only read/write their own `resumes` and `analyses` rows — enforced in Express middleware (not DB-level RLS, since Supabase is used as plain Postgres here) |
| **User Roles** | Single role for MVP: `user`. No admin/guest tiers needed. |
| **File Storage** | None by default (parse-and-discard — only `parsed_text` is stored). If retaining originals later: Supabase Storage under `/resumes/{user_id}/{resume_id}` |
| **Sensitive Fields** | `password_hash` (bcrypt-hashed, never returned in API responses), refresh token values (stored hashed, not plaintext) |

---

## 06 — Implementation Plan

| Phase | Details |
|---|---|
| **Phase 0: Setup** | Init GitHub repo, React (Vite) app, Express server skeleton, Supabase Postgres project, Prisma connected. *Done: both apps run locally and Prisma can connect to the DB.* |
| **Phase 1: Auth** | Prisma `users`/`refresh_tokens` models, signup/login routes (bcrypt), JWT access + refresh token issuance, refresh endpoint, Google OAuth, logout (invalidate refresh token), rate limiting on login/signup, auth middleware. React: signup/login forms, Google button, token storage, silent refresh, protected routes. *Done: user can sign up, log in via email or Google, stay logged in across refresh, and log out.* |
| **Phase 2: Resume upload + parsing** | Upload endpoint (multer), PDF parsing (pdf-parse), DOCX parsing (mammoth), store extracted text in `resumes` table. React: upload dropzone, parsed text preview. *Done: uploading a PDF or DOCX produces stored, readable extracted text.* |
| **Phase 3: Section detection + ATS-parseability check** | Section-detection logic (regex/heading patterns), ATS-breaking format checks. React: checklist + warnings UI. *Done: analysis correctly flags missing sections and common ATS formatting issues on test resumes.* |
| **Phase 4: JD-matching score** | JD input field, keyword extraction (tokenize/stopword removal/TF-IDF), match scoring against resume text, matched/missing keyword lists. React: score display + keyword chips. *Done: pasting a JD and resume produces a sensible match score and keyword breakdown.* |
| **Phase 5: Action verb + quantification suggestions** | Bullet extraction from experience section, weak-verb dictionary check, quantification regex check. React: inline per-bullet suggestions. *Done: weak/unquantified bullets are correctly flagged with suggestions.* |
| **Phase 6: UI polish + history** | Responsive design pass, loading/empty/error states, `/history` page wired to past analyses. *Done: app looks and feels finished on both desktop and mobile.* |
| **Phase 7: Deploy** | Deploy backend to Render, frontend to Vercel, connect env vars, verify Supabase connection from prod, test full flow end-to-end on live URLs. *Done: live link works start to finish for a new user.* |
| **Phase 8: Stretch (optional)** | LLM-powered rewrite suggestions, multi-JD comparison, export improved resume, dark mode. |
