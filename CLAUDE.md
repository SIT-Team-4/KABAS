# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

KABAS (Kanban Board Assessment System) is a full-stack web app that lets instructors assess student Kanban board contributions across GitHub and Jira. It provides a bird's-eye view of all teams at a glance for consultation and assessment purposes.

Monorepo with two independent packages (no workspace config):
- `server/` — Express.js v5 backend (Node 20+, Sequelize ORM, MySQL 8)
- `client/` — React 18 frontend (Material-UI v5, React Router v6)

## Common Commands

### Backend (`server/`)
```bash
npm run dev          # Start MySQL container + Express with nodemon
npm start            # Start Express only (production)
npm run db:up        # Start MySQL container
npm run db:down      # Stop MySQL container
npm test             # Run all tests (vitest run)
npm run test:watch   # Run tests in watch mode (vitest)
npm run lint         # ESLint check
npm run lint:fix     # ESLint auto-fix
```

### Frontend (`client/`)
```bash
npm start            # Dev server (Create React App)
npm run build        # Production build
CI=true npm test     # Run tests non-interactively
npm run lint         # ESLint check
```

### Infrastructure
```bash
docker-compose up -d   # Start MySQL (port 3307→3306)
docker-compose down    # Stop MySQL
```

Environment: copy `.env.example` to `.env` at repo root. Required vars: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_ROOT_PASSWORD`, `ENCRYPTION_KEY` (64-char hex), `ADMIN_API_KEY`.

## Architecture

### Backend Request Flow
```
Route → Controller → Service → Gateway (external APIs) / Model (database)
```

| Layer | Role |
|-------|------|
| Routes (`src/routes/`) | URL-to-controller mappings, mounted in `src/config/app.js` |
| Controllers (`src/controllers/`) | Parse HTTP requests, call services, return responses |
| Services (`src/services/`) | Business logic, orchestrate gateways and models |
| Gateways (`src/gateways/`) | External API clients (Jira REST v3, GitHub REST + GraphQL) |
| Models (`src/models/`) | Sequelize definitions; associations in `models/index.js` |
| Middleware (`src/middleware/`) | Auth (API key via `x-api-key` header, timing-safe), error handler |
| Validation (`src/validation/`) | Yup schemas for request validation |

### Data Model
```
ClassGroup (1) → (Many) Team (1) → (One) TeamCredential
```
- `TeamCredential` stores encrypted Jira/GitHub credentials (AES-256-GCM via `src/utils/crypto.js`)
- DB auto-syncs on startup with `sequelize.sync({ alter: true })`

### Frontend Structure
- `src/pages/` — Page components (TeamDashboard, AllTeams, TeamCredentials)
- `src/components/` — Reusable components (AppShell layout, StatusCard, modals)
- `src/theme/theme.js` — MUI theme config
- Routes: `/teams/:teamId`, `/all-teams`, `/team-credentials`

### External Integrations
- **Jira**: REST API v3 with JQL search, token-based pagination. Project key validated with regex to prevent JQL injection.
- **GitHub**: REST API v3 for issues/timeline, GraphQL for ProjectV2 board status queries. Uses Octokit.

## Testing

- Backend: Vitest with tests co-located as `*.test.js` next to source files
- Frontend: React Testing Library
- Run a single backend test: `npx vitest run path/to/file.test.js` (from `server/`)

## CI/CD

- **CI** runs on PRs to `main`: lint + test (server), lint + test + build (client) — parallel jobs
- **CD** runs on push to `main`: CI then Render deploy hooks for both services
- Deployment: Render (backend web service + frontend static site) + Aiven MySQL

## Conventions

- Backend uses 4-space indentation (ESLint airbnb-base)
- Tests are co-located with source files, not in a separate test directory
- API endpoints are prefixed with `/api/`
- Auth-protected routes require `x-api-key` header
