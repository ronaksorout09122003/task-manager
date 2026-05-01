# Testing Checklist

Use this checklist before deployment or after role, auth, project, or task changes.

## Automated Checks

- [ ] Backend tests: `cd backend && npm test`
- [ ] Backend build and Prisma generate: `cd backend && npm run build`
- [ ] Prisma schema validation: `cd backend && npx prisma validate`
- [ ] Frontend tests: `cd frontend && npm test`
- [ ] Frontend production build: `cd frontend && npm run build`
- [ ] Workspace formatting: `npm run format:check`

## Auth and Roles

- [ ] Login works for super admin, admin, and member accounts.
- [ ] Public signup is not available.
- [ ] All users can change their password.
- [ ] Invalid credentials show a friendly message.
- [ ] Expired or invalid tokens redirect to login.
- [ ] Super admin can create admins only.
- [ ] Admin can create members only.
- [ ] Member cannot access the Team page.
- [ ] Super admin sees admins, not project/member task rows.
- [ ] Opening an admin from Team shows only members under that admin.

## Projects

- [ ] Admin can create, update, and delete a project.
- [ ] Project creator is protected from member removal.
- [ ] Admin can add and remove eligible project members.
- [ ] Project progress is calculated from task status.
- [ ] Member sees only accessible projects.
- [ ] Member cannot create, update, or delete projects.

## Tasks

- [ ] Admin can create, update, delete, assign, and filter tasks.
- [ ] Tasks can only be assigned to project members.
- [ ] Member sees assigned tasks.
- [ ] Member can update only assigned task status.
- [ ] Drag-and-drop status changes update the backend.
- [ ] Failed drag-and-drop updates revert in the UI.
- [ ] Overdue tasks are highlighted.

## Dashboard and UI

- [ ] Dashboard stats load from API data.
- [ ] Empty states appear when lists are empty.
- [ ] Loading states appear during API requests.
- [ ] Toast messages are user-friendly.
- [ ] No raw backend errors leak into the UI.
- [ ] Desktop layout has no overlapping text or controls.
- [ ] Mobile layout works for dashboard, projects, tasks, and team pages.
- [ ] Browser console has no unexpected errors.

## Railway

- [ ] Backend root directory is `backend`.
- [ ] Backend healthcheck path is `/api/health`.
- [ ] Backend has `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `FRONTEND_URL`, and `NODE_ENV`.
- [ ] Frontend root directory is `frontend`.
- [ ] Frontend has `VITE_API_URL=https://your-backend-url/api`.
- [ ] Railway PostgreSQL is running before backend deployment.
- [ ] Backend healthcheck returns `{ "status": "ok", "service": "team-task-manager-api" }`.
- [ ] Frontend login works against the deployed backend.
