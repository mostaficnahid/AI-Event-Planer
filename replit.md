# AI Events Organizer

## Overview

Production-ready full-stack AI-powered Events Organizer SaaS platform.  
pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec in `lib/api-spec/openapi.yaml`)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui + Recharts
- **AI**: OpenAI via Replit AI Integrations (gpt-5.2)
- **Auth**: JWT (access 15m + refresh 7d) with bcryptjs, SESSION_SECRET env var
- **State**: React Context (Auth + Theme), TanStack Query

## Packages

| Path | Name | Purpose |
|------|------|---------|
| `artifacts/api-server` | `@workspace/api-server` | Express REST API |
| `artifacts/ai-events-organizer` | `@workspace/ai-events-organizer` | React Vite SPA |
| `lib/db` | `@workspace/db` | Drizzle ORM + schema |
| `lib/api-spec` | `@workspace/api-spec` | OpenAPI spec + Orval codegen |
| `lib/api-client-react` | `@workspace/api-client-react` | TanStack Query hooks (generated) |
| `lib/api-zod` | `@workspace/api-zod` | Zod schemas (generated) |

## Database Schema

Tables: `events`, `categories`, `activity`, `users`, `guests`

- `events`: title, description, category, location, startDate, endDate, status, attendeeCount, maxAttendees, imageUrl, budget, budgetUsed, tags, organizerId
- `users`: name, email, passwordHash, role (admin/organizer/attendee), avatarUrl, refreshToken
- `guests`: eventId, name, email, rsvpStatus (pending/confirmed/declined/maybe), note

## API Endpoints

### Auth
- `POST /api/auth/register` — register new user (name, email, password, role?)
- `POST /api/auth/login` — login → { accessToken, refreshToken, user }
- `POST /api/auth/refresh` — refresh tokens
- `POST /api/auth/logout` — logout

### Users
- `GET /api/users/me` — current user profile (requires Bearer token)
- `PATCH /api/users/me` — update profile
- `GET /api/users` — list all users (admin)

### Events
- `GET /api/events` — list events (category/status/search/limit/offset filters)
- `POST /api/events` — create event
- `GET /api/events/dashboard` — dashboard stats (totalEvents, totalBudget, etc.)
- `GET /api/events/analytics` — Recharts data (attendanceByMonth, statusBreakdown, budgetVsActual, categoryDistribution)
- `GET /api/events/upcoming` — upcoming events
- `GET /api/events/recent-activity` — activity feed
- `GET/PATCH/DELETE /api/events/:id` — event CRUD
- `POST /api/events/:id/rsvp` — RSVP to event

### Guests
- `GET /api/events/:eventId/guests` — list guests
- `POST /api/events/:eventId/guests` — add guest
- `PATCH /api/events/:eventId/guests/:guestId` — update RSVP status
- `DELETE /api/events/:eventId/guests/:guestId` — remove guest

### Categories
- `GET /api/categories` — list categories
- `POST /api/categories` — create category

### AI
- `POST /api/ai/generate-description` — generate event description + tags
- `POST /api/ai/suggest-schedule` — suggest 3 optimal time slots
- `POST /api/ai/estimate-budget` — budget breakdown by category
- `POST /api/ai/suggest-themes` — 3 creative themes + improvements + engagement tips
- `POST /api/ai/chat` — conversational event planning assistant

## Frontend Pages

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Dashboard | Analytics with Recharts charts (area, pie, bar) + stats cards + upcoming events + activity feed |
| `/login` | Login | JWT login form |
| `/register` | Register | Registration with role selector |
| `/events` | EventsList | All events with search/filter |
| `/events/new` | EventNew | Create event form with AI description + budget estimator + theme suggester |
| `/events/:id` | EventDetail | Event info + Guest List tab + budget progress + AI AI buttons |
| `/categories` | CategoriesList | Category management |
| `/profile` | Profile | View/edit user profile |
| `/ai-assistant` | AiAssistant | Full chat interface with conversation history and suggestion chips |

## Security

- JWT access tokens (15m) + refresh tokens (7d) stored per-user in DB
- Rate limiting: auth routes 30 req/15min, AI routes 20 req/min
- bcrypt password hashing (cost 12)
- CORS enabled
- Zod input validation on all routes

## Demo Accounts

| Email | Password | Role |
|-------|----------|------|
| admin@demo.com | demo1234 | admin |
| alice@demo.com | demo1234 | organizer |
| bob@demo.com | demo1234 | attendee |

## Development

```bash
# Push DB schema changes
pnpm --filter @workspace/db run push-force

# Regenerate API client after spec changes
pnpm --filter @workspace/api-spec run codegen

# Run API server
pnpm --filter @workspace/api-server run dev

# Run frontend
pnpm --filter @workspace/ai-events-organizer run dev
```

## Architecture Notes

- OpenAPI spec is source of truth: edit `lib/api-spec/openapi.yaml` → run codegen → hooks + Zod schemas regenerate automatically
- Express 5: handlers must return `Promise<void>`, use `res.status().json(); return;` pattern for early returns
- Do NOT use `console.log` in server — use `req.log` or the `logger` from `lib/logger.ts`
- Theme: dark mode by default (CSS variable-based, ThemeProvider in contexts/theme.tsx)
- Auth: AuthProvider in contexts/auth.tsx reads from localStorage on mount, token auto-injected via `setAuthTokenGetter` in api-client-react
