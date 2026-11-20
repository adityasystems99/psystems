# THE LEGACY — Professor Portfolio

A cinematic academic portfolio and tribute built with React + TypeScript + Express + a JSON pseudo-database.

## Quick start

Install Node.js 20+ and npm.

```bash
npm run install:all
cp .env.example server/.env
npm run dev
```

On Windows PowerShell, use `Copy-Item .env.example server/.env` instead of `cp` if preferred. Edit `server/.env` to set a long unique `ADMIN_PASSWORD`.

Open http://localhost:5173. Admin dashboard: http://localhost:5173/admin. API: http://localhost:4000/api/health.

## Where to edit

- `server/src/data/content.json` — professor biography, journey, publications, achievements, sample testimonials
- `client/src/ParticleWave.tsx` — animated particle-wave background
- `client/src/style.css` — dark visual theme
- `client/src/App.tsx` — page sections, admin UI, and interactions
- `server/src/index.ts` — API endpoints and JSON storage

The frontend uses Vite's `/api` proxy. The server reads JSON from disk and writes updates atomically through a temporary file. Admin edits and testimonial submissions persist locally across restarts. Public API responses show only approved testimonials. The admin dashboard lets you edit the JSON content and change `approved` to true to publish a submission.

## API endpoints

- `GET /api/health`
- `GET /api/content`
- `POST /api/testimonials` with `{ "name": "...", "message": "..." }`
- `POST /api/admin/login` with `{ "password": "..." }`
- `PUT /api/admin/content` with Bearer token and full content JSON

## Demo security and production limitations

The admin token is generated in memory on server startup, so admin sessions expire on restart. The frontend keeps it only in component memory. The JSON file is not a production database and should not be used for multi-instance deployment. This demo uses a shared password, not individual admin accounts. Before public deployment, implement real authentication, HTTPS, CSRF protection if switching to cookies, persistent sessions, database-backed concurrency, backups, audit logs, content sanitization policies, and stricter media handling. Never commit a real `.env` file. Avoid publishing unapproved personal information or unverified achievements. Replace all sample content before sharing with students.

## Future database migration

Replace `read()` and `mutate()` in `server/src/index.ts` with repository functions using PostgreSQL/Prisma or another database. Keep the API response shapes unchanged so the frontend continues working.

## Attribution

Made as a personal token of gratitude to a professor. Replace placeholder information only with permission and verified details.
