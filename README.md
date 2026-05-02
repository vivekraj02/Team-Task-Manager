# Team Task Manager

A full-stack Team Task Manager app with project-based task tracking, role-based access, and a clean modern admin dashboard.

## Recommended Tech Stack

- Frontend: React + JavaScript + Vite
- Styling: Custom professional palette with modern cards and dashboard views
- Backend: Node.js + Express + JavaScript
- Database: PostgreSQL with Prisma ORM
- Auth: JWT + bcrypt
- Deployment: Railway for backend/API and static hosting via Railway or Vercel

## Project Structure

- `server/` — Express API, Prisma models, auth, projects, tasks
- `client/` — React app, routes, dashboard UI, task cards

## Setup

1. Install dependencies
   - `cd server && npm install`
   - `cd client && npm install`
   - `cd .. && npm install`
2. Create `.env` from `server/.env.example`
3. Start locally
   - `cd server && npm run dev`
   - `cd client && npm run dev`
   - or run both with `npm run dev` from the project root

## Deployment

1. Provision a PostgreSQL database on Railway
2. Set `DATABASE_URL` and `JWT_SECRET` in Railway environment
3. Deploy the `server/` service to Railway
4. Build the React app and serve it from the backend or host the static files separately

## Notes

This scaffold gives you the architecture, API patterns, and a polished UI foundation. Extend it by adding task filters, team invitation workflows, and project timelines.
