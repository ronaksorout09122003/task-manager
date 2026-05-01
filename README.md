# Team Task Manager

A full-stack task management app for small teams. Super admins manage admins, admins manage
members and projects, and members work through assigned tasks.

## Features

- JWT authentication with bcrypt password hashing
- Super admin, admin, and member role model
- Admin-created user accounts with default first-login passwords
- Password change flow for every logged-in user
- Project CRUD with members, due dates, status, and progress
- Task CRUD with assignee, priority, status, due date, overdue state, and Kanban board
- Drag-and-drop task status updates with optimistic UI
- Dashboard metrics from PostgreSQL
- Clean error handling for validation, network, and token-expiration failures
- Responsive React UI for desktop and mobile
- Railway-ready backend and frontend configuration

## Tech Stack

Frontend:

- React with Vite
- Tailwind CSS
- Axios
- React Router
- dnd-kit
- Lucide React
- React Hot Toast

Backend:

- Node.js
- Express
- Prisma
- PostgreSQL
- JWT
- bcrypt
- Zod
- Helmet and CORS

Testing:

- Node test runner
- Vitest
- Playwright for visual smoke checks

## Project Structure

```text
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
```

## Roles

- `SUPERADMIN`: creates admins and reviews admins with their members.
- `ADMIN`: creates members, manages projects, assigns tasks, and tracks team work.
- `MEMBER`: views assigned projects and updates assigned task status.

Only one super admin should exist. Public signup is disabled; new accounts are created from the
Team page.

Default password for created users:

```text
firstname@123
```

Example: `Sahil Kumar` gets `sahil@123`.

## API Overview

Auth:

- `POST /api/auth/login`
- `GET /api/auth/me`
- `PATCH /api/auth/password`

Users:

- `GET /api/users`
- `POST /api/users`
- `GET /api/users/:id`
- `GET /api/users/admins/:id/members`
- `PATCH /api/users/:id/role`

Projects:

- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:id`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`
- `GET /api/projects/:id/members`
- `POST /api/projects/:id/members`
- `DELETE /api/projects/:id/members/:userId`

Tasks:

- `GET /api/tasks`
- `GET /api/tasks/:id`
- `GET /api/projects/:projectId/tasks`
- `POST /api/projects/:projectId/tasks`
- `PUT /api/tasks/:id`
- `PATCH /api/tasks/:id/status`
- `DELETE /api/tasks/:id`

Dashboard:

- `GET /api/dashboard/stats`

Health:

- `GET /api/health`

## Local Setup

Prerequisites:

- Node.js 20+
- npm
- PostgreSQL or Docker Desktop

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

Run Prisma and start the API:

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
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Open `http://localhost:5173`.

## Seed Accounts

Seed data creates one super admin, one admin, and two members for local testing.

```text
Super admin: owner@example.com / Owner@123
Admin: admin@example.com / Admin@123
Member: member@example.com / Member@123
Member: noah@example.com / Member@123
```

Change these credentials before using any real deployment.

## Scripts

Backend:

```bash
cd backend
npm test
npm run build
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

## Railway Deployment

Backend service:

- Root directory: `backend`
- Build command: `npm ci && npm run build`
- Start command: `npm run prisma:deploy && npm start`
- Healthcheck path: `/api/health`

Backend variables:

```env
DATABASE_URL=<Railway PostgreSQL DATABASE_URL>
JWT_SECRET=<strong random production secret>
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend-url
NODE_ENV=production
```

Frontend service:

- Root directory: `frontend`
- Build command: `npm ci && npm run build`
- Start command: `npm run preview -- --host 0.0.0.0 --port $PORT`

Frontend variables:

```env
VITE_API_URL=https://your-backend-url/api
```

After changing Railway variables, redeploy the affected service.

## Verification

Run these checks before pushing production changes:

```bash
cd backend
npm test
npm run build

cd ../frontend
npm test
npm run build
```

The detailed manual checklist is in `TESTING_CHECKLIST.md`.
