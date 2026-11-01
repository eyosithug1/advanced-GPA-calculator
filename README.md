# GPA Calculator Pro (MERN Stack Architecture)

Advanced academic performance tracking application built on the MERN stack (MongoDB, Express, React, Node.js). Engineered with dark glassmorphism aesthetics, real-time quality point computations, target GPA scenario planning, and MongoDB persistence.

---

## Architecture Overview

```
advanced-GPA-calculator/
├── backend/
│   ├── config/              # MongoDB connection lifecycle
│   ├── controllers/         # Auth, User, Semester, and Course controllers
│   ├── middleware/          # JWT authorization and centralized error handling
│   ├── models/              # User, Semester, and Course Mongoose schemas
│   ├── routes/              # Modular REST API endpoints
│   ├── .env.example         # Environment template
│   └── server.js            # Express application entry point
│
└── frontend/
    ├── src/
    │   ├── components/      # Glassmorphic UI layout (Sidebar, Header, Layout)
    │   ├── pages/           # Dashboard, Calculator, Cumulative, Analytics, Settings, Auth
    │   ├── services/        # Axios client with JWT request interceptors
    │   ├── store/           # Zustand state management (authStore & gpaStore)
    │   ├── utils/           # Client-side GPA engine & scenario models
    │   ├── App.jsx          # Protected route hierarchy with Framer Motion
    │   └── index.css        # Core design system and CSS tokens
    └── package.json         # React 18, Vite, Recharts, Framer Motion
```

---

## Core Capabilities

- **Semester GPA Calculator**: Real-time evaluation of courses, credit weightings, and letter grades across standard 4.0 and weighted 5.0 scales.
- **Cumulative Transcript Manager**: Aggregates term histories, combining granular course lists with quick-entry prior college credit records.
- **What-If Scenario Planner**: Computes the required grade point average needed across remaining credits to graduate with targeted academic distinctions.
- **Analytics & Grade Trajectories**: Interactive Recharts visualizations depicting term-by-term trends and letter grade distributions.
- **Academic Profile & Data Backup**: Profile configuration, dynamic scale switching, and complete JSON transcript export.

---

## Contributor & Git Workflow Rules

All project contributors (@eyosithug1, @BereketVM21) must adhere to these standards:

1. **No Micro-Commit Spam**: Group related changes into clean, atomic commits.
2. **Conventional Commits**: Format commit messages strictly as `<type>(<scope>): <summary>` (e.g., `feat(auth): add jsonwebtoken verification`).
3. **Branch & PR Workflow**: Direct pushes to `main` are prohibited. Create dedicated `feat/*` or `fix/*` branches and submit Pull Requests for peer review.
4. **Pre-Push Build Verification**: Run `npm run build` locally before pushing to guarantee clean production compilation.
5. **No Secret Commits**: Never commit `.env` files. Maintain updated `.env.example` templates.

---

## Local Development Setup

### 1. Backend Server
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```
API runs on `http://localhost:5000` (Health Check: `/health`).

### 2. Frontend Application
```bash
cd frontend
npm install
npm run dev
```
Application interface runs on `http://localhost:5173`.

### 3. Production Build Validation
```bash
cd frontend
npm run build
```
