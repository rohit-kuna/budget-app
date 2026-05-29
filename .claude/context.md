---
description: Budget app repo context and Next.js stack rules
alwaysApply: true
---

# Project Context

Use this repository as a Next.js App Router app with shadcn/ui, Drizzle, Clerk, and PostgreSQL.
Follow industry best practices for modern Next.js work: prefer server components, keep client boundaries small, validate inputs, and keep UI primitives reusable.
Treat the codebase with Next.js 15 App Router conventions in mind, even though `package.json` currently pins `next` 16.1.6.

## Stack Rules

### Agent Skills
- Always refer to the agent skills folder for technical skills for each of the stack being used, follow best practices

### Frontend
- Next.js App Router architecture
- React 19
- TypeScript strict mode
- Tailwind CSS v4
- shadcn/ui components only for shared UI
- Use server components by default
- Use client components only when interactivity requires them

### Styling
- Prefer Tailwind utilities
- Use the `cn()` helper from `lib/utils.ts`
- Avoid inline styles
- Use semantic colors and existing design tokens
- Avoid CSS modules

### Components
- Keep reusable UI in `components/ui`
- Keep feature-specific UI in `components/features`
- Follow shadcn component patterns
- Keep components small and composable

### Database
- PostgreSQL
- Drizzle ORM
- Use snake_case in the database
- Use camelCase in TypeScript

### API and Server Logic
- Prefer server actions when possible
- Validate input with `zod`
- Prefer async/await
- Keep data mutations close to the feature that owns them

### Code Style
- Write small reusable functions
- Avoid prop drilling
- Prefer clear naming over clever abstractions
- Keep files focused on a single responsibility

## Current Repository Architecture

### App Router structure
- `app/` contains routes, layouts, and route-local UI
- `app/(auth)` holds Clerk sign-in and sign-up routes
- `app/(application)` holds authenticated user-facing pages like dashboard views
- `app/(admin)` holds admin-only pages and layout wrappers
- `app/join/[inviteCode]` handles invite acceptance after sign-in
- `app/service-unavailable` is the fallback route for backend or DB failures

### Application logic
- `app/lib/auth.ts` centralizes auth checks and DB user loading
- `app/lib/constants.ts` stores route constants and public route patterns
- `app/lib/roles.ts` defines the app role model
- `app/lib/urls.ts` builds shareable organization invite links
- `app/lib/user-sync.ts` handles Clerk-to-DB user synchronization
- `app/actions/` contains server actions grouped by domain

### UI composition
- `components/ui/` contains reusable shadcn-style primitives
- `app/components/` contains app-specific shared components like the logo and auth header
- `lib/utils.ts` provides the `cn()` helper used across UI

### Data layer
- `db/schema.ts` defines the PostgreSQL schema with Drizzle
- `db/migrations/` stores migration output and snapshots
- `db/index.ts` is the DB entry point

### Routing and protection
- `proxy.ts` likely handles request-time route protection and auth gating
- Public routes stay minimal
- Authenticated routes redirect based on role when appropriate

## Working Notes

- Prefer server components unless a component needs browser-only state, effects, or handlers
- Keep route-specific logic close to the route segment
- Reuse existing shadcn primitives before creating new UI patterns
- Keep DB names snake_case and TypeScript identifiers camelCase
- Favor incremental, focused changes over broad refactors
- Org admins create an organization from the admin dashboard, share a Clerk-backed invite link, and manage member roles inside the org scope
- Google OAuth is configured in Clerk, so keep sign-in flows compatible with OAuth and email-based login

## ShadCN
- always refer to .agents/skills/shadcn
- install new components if required from https://ui.shadcn.com/docs/components
