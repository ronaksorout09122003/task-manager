# Testing Checklist

Last verified locally on April 30, 2026 with:

- PostgreSQL via `docker compose up -d postgres`
- Backend API on `http://127.0.0.1:5000`
- Frontend on `http://127.0.0.1:5173`
- Prisma migration `20260430070549_init`
- Seed data from `backend/prisma/seed.js`
- A-to-Z audit rerun after final fixes

## Automated Tests

- [x] Backend tests: `cd backend && npm test`
- [x] Frontend tests: `cd frontend && npm test`
- [x] Frontend production build: `cd frontend && npm run build`
- [x] Frontend readable review build: `cd frontend && npm run build:readable`
- [x] Workspace format check: `npm run format:check`
- [x] Prisma generate: `cd backend && npm run prisma:generate`
- [x] Prisma migration against PostgreSQL: `cd backend && npm run prisma:migrate -- --name init`
- [x] Seed command: `cd backend && npm run seed`
- [x] Seed command is idempotent and restores sample project memberships/tasks
- [x] Frontend import/export graph verified by production build
- [x] Backend import/export graph verified by server startup and live API checks

## API Smoke Verification

- [x] Invalid login returns `401`
- [x] Invalid token rejected
- [x] Allowed CORS origin returns the expected CORS header
- [x] Disallowed CORS origin rejected with `403`
- [x] Admin login works
- [x] Member login works
- [x] Duplicate signup returns `409`
- [x] Auth, users, tasks, and dashboard responses do not expose password fields
- [x] Admin can list users
- [x] Member cannot list users
- [x] Admin can create project
- [x] Project validation rejects invalid title and invalid date ranges
- [x] Admin can add project member
- [x] Admin can create and assign task to a project member
- [x] Member can view an assigned project
- [x] Member cannot delete project
- [x] Member cannot update full task fields
- [x] Member can update own task status
- [x] Dashboard stats load from database
- [x] Admin can delete task
- [x] Admin can delete project

## Authentication

- [x] Signup works for new users
- [x] Login works
- [x] Invalid login shows an error
- [x] Logout works in the UI
- [x] Protected routes redirect unauthenticated users
- [x] Logged-in name and role are visible in the app shell

## Role Testing

- [x] Admin can create project
- [x] Admin can edit/delete project
- [x] Admin can add members
- [x] Admin can remove eligible members
- [x] Admin can create/assign tasks
- [x] Member cannot delete project
- [x] Member cannot assign tasks to others
- [x] Member can update own task status
- [x] Member is redirected away from admin-only `/team`

## Project Testing

- [x] Create project
- [x] View project list
- [x] Open project details
- [x] Edit project
- [x] Delete project
- [x] Add/remove members
- [x] Project progress is calculated from completed tasks
- [x] Project progress uses all project tasks while member task lists show only assigned tasks

## Task Testing

- [x] Create task
- [x] Assign task to project member only
- [x] Update task as admin
- [x] Change status as assigned member
- [x] Filter tasks by status, priority, assignee, and overdue state
- [x] Overdue task highlight is visible
- [x] Delete task as admin

## Dashboard Testing

- [x] Stats load correctly
- [x] Counts match seeded database state
- [x] Overdue count works
- [x] Progress bars calculate correctly
- [x] Recent tasks are loaded from API

## UI Testing

- [x] Desktop responsive layout captured in screenshots
- [x] Mobile responsive layout captured in screenshots
- [x] Forms are aligned and labeled
- [x] Buttons and modals work
- [x] Confirmation dialog appears before deletes
- [x] Toast notifications appear for success/error states
- [x] No unexpected browser console errors detected during Playwright pass
- [x] No broken primary routes found during Playwright pass
- [x] Empty states are implemented
- [x] Project creator remove button is hidden in member management

## Deployment Testing

- [x] Railway backend config prepared in `backend/railway.json`
- [x] Railway frontend config prepared in `frontend/railway.json`
- [x] Production environment variable examples included
- [x] Prisma deploy command documented
- [x] Backend Railway build command: `npm ci && npm run build`
- [x] Backend Railway start command: `npm run prisma:deploy && npm start`
- [x] Frontend Railway build command: `npm ci && npm run build`
- [x] Frontend Railway start command: `npm run preview -- --host 0.0.0.0 --port $PORT`
- [x] Runtime start tools are production dependencies (`prisma` for backend, `vite` for frontend)
- [ ] Backend starts on Railway: verify after connecting the user's Railway project
- [ ] Railway PostgreSQL database connected: verify after Railway provisions `DATABASE_URL`
- [ ] Frontend connects to deployed backend: verify after setting `VITE_API_BASE_URL`
- [ ] CORS works on live URL: verify after setting `FRONTEND_URL`
- [ ] Live login and dashboard work: verify after deployment
