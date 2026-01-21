# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Training Diary (Dziennik Treningowy) - A full-stack fitness tracking application built with Astro 5, React 19, PostgreSQL, and Better Auth. Users can track workouts, set fitness goals, and export training reports to PDF.

## Development Commands

### Setup
```bash
pnpm install                    # Install dependencies
cp .env.example .env            # Create environment file (configure DATABASE_URL, BETTER_AUTH_SECRET, RESEND_API_KEY)
pnpm db:push                    # Push schema to database
pnpm db:seed                    # Seed default training types (9 types: Siłowy, Cardio, HIIT, etc.)
```

### Development
```bash
pnpm dev                        # Start dev server at localhost:4321
pnpm build                      # Build for production
pnpm preview                    # Preview production build
pnpm start                      # Start production server (requires build first)
```

### Database
```bash
pnpm db:generate                # Generate Drizzle migrations from schema
pnpm db:migrate                 # Run migrations
pnpm db:push                    # Push schema changes directly (dev only)
pnpm db:studio                  # Open Drizzle Studio GUI
pnpm db:seed                    # Seed default training types
```

### Code Quality
```bash
pnpm lint                       # Run ESLint
pnpm format                     # Format code with Prettier
pnpm format:check               # Check formatting
pnpm test                       # Run Vitest unit tests
pnpm test:e2e                   # Run Playwright E2E tests
```

## Architecture

### Tech Stack
- **Framework:** Astro 5.16 (SSR mode) + React 19 for interactive components
- **Database:** PostgreSQL with Drizzle ORM
- **Auth:** Better Auth 1.4.16 (email/password with verification)
- **Styling:** Tailwind CSS 4.1
- **Forms:** React Hook Form + Zod validation
- **Email:** Resend for transactional emails
- **PDF Export:** jsPDF + jsPDF-AutoTable

### Project Structure

```
src/
├── pages/                      # Astro file-based routing
│   ├── api/                   # API endpoints (all require auth)
│   │   ├── auth/[...all].ts   # Better Auth handler
│   │   ├── dashboard.ts       # Dashboard summary data
│   │   ├── trainings/         # Training CRUD + filters
│   │   ├── training-types/    # Training type management
│   │   └── goals/             # Goal CRUD + achieve/archive
│   ├── auth/                  # Auth pages (login, register, reset, verify)
│   ├── trainings/             # Training pages (list, new, view, edit)
│   ├── goals/                 # Goals management page
│   └── dashboard/             # User dashboard
├── components/
│   ├── features/              # Feature-specific components
│   │   ├── auth/             # Login/Register/Password forms
│   │   ├── trainings/        # 9 training-related components
│   │   ├── goals/            # 4 goal-related components
│   │   ├── dashboard/        # 5 dashboard components
│   │   └── pdf/              # Export functionality
│   ├── layout/               # Navbar, MobileMenu, UserMenu
│   └── ui/                   # Reusable primitives (Button, Input, Dialog, etc.)
├── layouts/                   # Astro layouts (MainLayout, AppLayout)
├── lib/
│   ├── db/
│   │   ├── schema.ts         # Drizzle schema (users, trainings, goals, training_types)
│   │   └── index.ts          # Database client
│   ├── validations/          # Zod schemas for forms and API
│   ├── pdf/                  # PDF generation utilities (weekly/monthly reports)
│   ├── auth.ts               # Better Auth server config
│   ├── auth-client.ts        # Better Auth client exports
│   └── email.ts              # Email service with Resend
└── middleware.ts             # Auth protection (redirects to /auth/login if not authenticated)
```

### Database Schema

**Auth Tables** (Better Auth):
- `users` - User accounts (email, name, emailVerified, image)
- `sessions` - Session management (7-day expiration, 1-day update age)
- `accounts` - OAuth/social login support
- `verifications` - Email verification & password reset tokens

**Application Tables**:
- `training_types` - Exercise categories (default + user-custom, with icon field)
- `trainings` - Individual workouts with multi-category ratings and reflection fields:
  - Basic: userId, trainingTypeId, date, time, durationMinutes, caloriesBurned
  - Ratings (1-5 scale): ratingOverall (required), ratingPhysical, ratingEnergy, ratingMotivation, ratingDifficulty
  - Reflection: trainingGoal, mostSatisfiedWith, improveNextTime, howToImprove, notes
- `goals` - Fitness goals (userId, title, description, targetValue, unit, deadline, status, isArchived, achievedAt)

**Key Constraints**:
- Goals: Max 5 active goals per user (enforced in API, not DB)
- Sessions: Auto-cleanup on expiration
- Training types: Default types (isDefault=true) cannot be deleted by users

### Authentication Flow

**Better Auth Configuration** (`src/lib/auth.ts`):
- Email/password with required email verification
- Password reset with 1-hour token expiration
- 7-day session expiration, 1-day session update
- PostgreSQL adapter with Drizzle
- Email verification sends HTML emails via Resend

**Middleware** (`src/middleware.ts`):
- Protects all routes EXCEPT: `/`, `/auth/*`, `/api/auth`
- Redirects unauthenticated users to `/auth/login`
- Injects `user` and `session` into `Astro.locals`

**Client Usage**:
```typescript
import { signIn, signUp, signOut, useSession } from '@/lib/auth-client';
```

### API Patterns

All API routes in `src/pages/api/` follow this pattern:

1. **Authentication Check**: Validate session via Better Auth
2. **Request Validation**: Use Zod schemas from `src/lib/validations/`
3. **Database Operation**: Use Drizzle ORM with schema imports
4. **Response Format**: JSON with appropriate status codes

**Example API Routes**:
- `GET /api/trainings?startDate=...&endDate=...&trainingTypeId=...&page=1&limit=10` - Filtered training list
- `POST /api/trainings` - Create training (validates with Zod)
- `PUT /api/trainings/[id]` - Update training (ownership check)
- `DELETE /api/trainings/[id]` - Delete training (ownership check)
- `POST /api/goals/[id]/achieve` - Mark goal as achieved
- `POST /api/goals/[id]/archive` - Archive goal
- `GET /api/dashboard` - Get dashboard summary (recent trainings, week stats, active goals)

### Component Patterns

**Astro + React Integration**:
- Astro pages handle routing and SSR
- React components use `client:load` directive for interactivity
- Server data passed as props from Astro pages
- Client-side fetching for dynamic updates

**Form Handling**:
- React Hook Form for form state
- Zod schemas for validation (shared with API)
- Error display with field-level messages

**State Management**:
- Better Auth's `useSession()` for user state
- Local component state for UI interactions
- Server state via API calls (no global store)

### Key Business Rules

1. **Goals**: Users can have max 5 active goals (status='active' && isArchived=false)
2. **Training Types**: Default types (isDefault=true) are global, custom types are user-specific
3. **Email Verification**: Required before accessing the application
4. **Session Expiration**: 7 days, with updates every 1 day
5. **Password Reset**: Tokens expire after 1 hour
6. **Training Ratings**: ratingOverall is required (1-5), all other ratings are optional
7. **Reflection Fields**: All reflection fields (trainingGoal, mostSatisfiedWith, improveNextTime, howToImprove) are optional with 500 char limit each

### Environment Variables

Required variables (see `.env.example`):
- `DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Min 32 chars for session signing
- `BETTER_AUTH_URL` - Application URL (http://localhost:4321 in dev)
- `RESEND_API_KEY` - For sending verification/reset emails
- `EMAIL_FROM` - Sender email address
- `PUBLIC_APP_NAME` - Application name (Dziennik Treningowy)

### Testing

- **Unit tests**: Vitest (`pnpm test`)
- **E2E tests**: Playwright (`pnpm test:e2e`)
- Test files colocated with source code

### Database Workflow

When modifying schema (`src/lib/db/schema.ts`):

1. Make schema changes
2. Run `pnpm db:generate` to create migration
3. Run `pnpm db:migrate` to apply migration
4. Or use `pnpm db:push` for direct schema push (dev only, skips migrations)

When seeding data:
- `pnpm db:seed` runs `scripts/seed-training-types.ts` to insert 9 default training types

### PDF Export

Located in `src/lib/pdf/`:
- `training-pdf.ts` - Main export orchestrator
- `weekly-report.ts` - Weekly summary generation
- `monthly-report.ts` - Monthly summary generation
- `common.ts` - Shared PDF utilities (headers, footers, styling)

Export formats include training lists, statistics, and goal progress.

### Code Conventions

- **TypeScript**: Strict mode enabled
- **Imports**: Use `@/` alias for `src/` directory
- **Components**: PascalCase file names matching component name
- **API Routes**: kebab-case file names
- **Validation**: Always validate API inputs with Zod schemas
- **Error Handling**: Return appropriate HTTP status codes with error messages
- **Authorization**: Check resource ownership before mutations (trainings, goals, training types)

### Important Notes

- This is a **server-rendered (SSR)** Astro application with Node adapter in standalone mode
- **Email verification is required** - users cannot access the app without verifying their email
- **All routes are protected** except public landing page and auth pages
- Database uses **PostgreSQL** - no SQLite or other dialects
- Polish language used in UI and default training types
