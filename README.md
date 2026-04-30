# Team Task Manager - Full Stack Web App

A production-ready full-stack task manager for teams. Admin users can create projects, manage project members, assign tasks, and view the full dashboard. Member users can view their projects, see assigned work, and update only their own task status.

## Features

- JWT authentication with bcrypt password hashing
- Admin and Member role-based access control
- Project CRUD with status, start date, due date, members, and progress
- Team directory and project member management for admins
- Task CRUD with priority, status, due date, assignee, filters, and overdue highlighting
- Real dashboard statistics from PostgreSQL, not hardcoded numbers
- Responsive React UI with sidebar desktop navigation and mobile top navigation
- Toasts, loading states, empty states, form validation, badges, modals, and delete confirmations
- Prisma PostgreSQL schema, seed data, tests, Railway configs, and deployment guide

## Tech Stack

Frontend:

- React.js with Vite
- Tailwind CSS
- Axios
- React Router
- Lucide icons
- React Hot Toast

Backend:

- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- JWT
- bcrypt
- Zod validation
- Helmet and CORS

Testing and verification:

- Node test runner
- Vitest
- Playwright screenshot verification

## Folder Structure

```text
root/
  backend/
    prisma/
      migrations/
      schema.prisma
      seed.js
    src/
      config/
      controllers/
      middleware/
      routes/
      tests/
      utils/
      app.js
      server.js
    package.json
    .env.example
    railway.json
  frontend/
    src/
      api/
      components/
      context/
      layouts/
      pages/
      routes/
      utils/
      App.jsx
      main.jsx
    package.json
    .env.example
    railway.json
  docs/screenshots/
  TESTING_CHECKLIST.md
  docker-compose.yml
  README.md
```

## Database Schema Overview

- `User`: name, unique email, hashed password, role, timestamps
- `Project`: title, description, status, start date, optional due date, creator, timestamps
- `ProjectMember`: project-user join table with unique `projectId + userId`
- `Task`: title, description, priority, status, due date, project, assignee, creator, timestamps

Enums:

- `Role`: `ADMIN`, `MEMBER`
- `ProjectStatus`: `ACTIVE`, `COMPLETED`, `ARCHIVED`
- `TaskStatus`: `TODO`, `IN_PROGRESS`, `DONE`
- `TaskPriority`: `LOW`, `MEDIUM`, `HIGH`

## Role-Based Access

Admins can create, update, and delete projects; add or remove project members; create, assign, update, and delete tasks; list users; and view full dashboard data.

Members can view projects where they are members, view assigned tasks, and update only their own task status. They cannot delete projects, assign tasks, list all users, update full task fields, or access admin-only routes.

## API Routes

Auth:

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`

Users:

- `GET /api/users`
- `GET /api/users/:id`

Projects:

- `POST /api/projects`
- `GET /api/projects`
- `GET /api/projects/:id`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`

Project Members:

- `POST /api/projects/:id/members`
- `DELETE /api/projects/:id/members/:userId`
- `GET /api/projects/:id/members`

Tasks:

- `POST /api/projects/:projectId/tasks`
- `GET /api/tasks`
- `GET /api/projects/:projectId/tasks`
- `GET /api/tasks/:id`
- `PUT /api/tasks/:id`
- `PATCH /api/tasks/:id/status`
- `DELETE /api/tasks/:id`

Dashboard:

- `GET /api/dashboard/stats`

## Local Setup

Prerequisites:

- Node.js 20+
- npm
- Docker Desktop, or an existing PostgreSQL database

Start PostgreSQL with Docker:

```bash
docker compose up -d postgres
```

Backend:

```bash
cd backend
npm install
cp .env.example .env
```

Set `backend/.env`:

```env
DATABASE_URL=postgresql://taskmanager:taskmanager@localhost:5433/team_task_manager?schema=public
JWT_SECRET=replace-with-a-strong-local-secret
JWT_EXPIRES_IN=7d
PORT=5000
FRONTEND_URL=http://localhost:5173,http://127.0.0.1:5173
NODE_ENV=development
```

Run Prisma and seed:

```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run seed
npm run dev
```

Frontend:

```bash
cd frontend
npm install
cp .env.example .env
```

Set `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Run the app:

```bash
npm run dev
```

Open `http://localhost:5173`.

## Test Credentials

Admin:

- Email: `admin@example.com`
- Password: `Admin@123`

Member:

- Email: `member@example.com`
- Password: `Member@123`

Additional seeded member:

- Email: `noah@example.com`
- Password: `Member@123`

## Test Commands

Backend:

```bash
cd backend
npm test
```

Frontend:

```bash
cd frontend
npm test
npm run build
```

Workspace formatting:

```bash
npm install
npm run format
npm run format:check
```

Readable frontend build for code review:

```bash
cd frontend
npm run build:readable
```

The normal `npm run build` command stays optimized for deployment. Use `build:readable` only when you want the generated Vite/Tailwind files in `dist` to be easier to inspect locally.

Full local verification results are documented in [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md).

## Railway Deployment Guide

### Backend on Railway

1. Create a new Railway project.
2. Add a PostgreSQL service.
3. Add a backend service from the GitHub repository.
4. Set the backend service root directory to `backend`.
5. Connect the backend service to the Railway PostgreSQL service so Railway provides `DATABASE_URL`.
6. Add backend environment variables:

```env
DATABASE_URL=<Railway PostgreSQL connection string>
JWT_SECRET=<strong random production secret>
JWT_EXPIRES_IN=7d
FRONTEND_URL=<deployed frontend URL>
NODE_ENV=production
```

Railway provides `PORT` automatically. Set it manually only if your hosting target requires a fixed port.

7. Use this build command:

```bash
npm ci && npm run build
```

This runs `prisma generate`.

8. Use this start command:

```bash
npm run prisma:deploy && npm start
```

This runs `prisma migrate deploy` against Railway PostgreSQL before starting Express.

9. After the first successful deployment, run a one-off Railway command if you want seed data:

```bash
npm run seed
```

### Frontend on Vercel

1. Import the repository into Vercel.
2. Set root directory to `frontend`.
3. Set environment variable:

```env
VITE_API_BASE_URL=https://your-railway-backend-url/api
```

4. Build command: `npm run build`
5. Output directory: `dist`

### Frontend on Railway

1. Add another Railway service from the same GitHub repository.
2. Set root directory to `frontend`.
3. Set environment variable before building:

```env
VITE_API_BASE_URL=https://your-railway-backend-url/api
```

4. Build command:

```bash
npm ci && npm run build
```

5. Start command:

```bash
npm run preview -- --host 0.0.0.0 --port $PORT
```

After the frontend deploys, update the backend `FRONTEND_URL` to the deployed frontend URL and redeploy the backend if needed. `FRONTEND_URL` supports comma-separated origins, so you can temporarily include both preview and production frontend URLs.

## Environment Variables

Backend `.env.example`:

```env
DATABASE_URL=
JWT_SECRET=
JWT_EXPIRES_IN=7d
PORT=5000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

Production backend values:

```env
DATABASE_URL=<Railway PostgreSQL DATABASE_URL>
JWT_SECRET=<strong random production secret>
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend-production-url
NODE_ENV=production
```

Production example file: `backend/.env.production.example`.

Frontend `.env.example`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Production frontend value:

```env
VITE_API_BASE_URL=https://your-railway-backend-url/api
```

Production example file: `frontend/.env.production.example`.

## Screenshots

Local screenshots are in [docs/screenshots](./docs/screenshots):

- Login page
- Signup page
- Dashboard
- Projects page
- Project details page
- Task management page
- Admin role actions
- Member role restricted view
- Mobile responsive view

Capture Railway deployment success manually after deployment because it depends on the owner's Railway dashboard and live service URL.

## Live URL Placeholder

- Backend: `https://your-railway-backend-url`
- Frontend: `https://your-frontend-url`

## GitHub Repo Placeholder

- Repository: `https://github.com/your-username/team-task-manager`

## Demo Video Instructions

Record a 3-5 minute walkthrough covering:

1. Admin login
2. Dashboard stats
3. Create/edit project
4. Add project member
5. Create and assign task
6. Filter task list and show overdue task
7. Login as member
8. Show restricted actions and update own task status
9. Mention Railway deployment configuration
