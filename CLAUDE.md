# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16.0.1 application (using the App Router) built with React 19.2.0, TypeScript, and Tailwind CSS v4. The project is bootstrapped from `create-next-app` and is intended for a maritime school website.

## Development Commands

### Running the Development Server
```bash
npm run dev
```
The app will be available at http://localhost:3000

### Building for Production
```bash
npm run build
```

### Starting Production Server
```bash
npm start
```

### Linting
```bash
npm run lint
```

## Architecture and Structure

### App Router Structure
- Uses Next.js App Router with the `app/` directory
- [app/layout.tsx](app/layout.tsx) - Root layout with Geist font configuration (sans and mono variants)
- [app/page.tsx](app/page.tsx) - Home page component
- [app/globals.css](app/globals.css) - Global styles with Tailwind CSS v4 imports

### Styling
- **Tailwind CSS v4** with the new `@tailwindcss/postcss` plugin
- Uses `@import "tailwindcss"` syntax (not the traditional `@tailwind` directives)
- Theme configuration uses the new `@theme inline` directive in [globals.css](app/globals.css)
- CSS variables for theming: `--background`, `--foreground`, `--font-geist-sans`, `--font-geist-mono`
- Dark mode support via `prefers-color-scheme`

### TypeScript Configuration
- Path alias: `@/*` maps to the project root
- Strict mode enabled
- Uses `react-jsx` for JSX transformation

### ESLint Configuration
- Uses ESLint's flat config format (eslint.config.mjs)
- Configured with `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Ignores: `.next/`, `out/`, `build/`, `next-env.d.ts`

## Key Dependencies
- React 19.2.0 and React DOM 19.2.0
- Next.js 16.0.1
- Tailwind CSS v4 (using the new PostCSS plugin architecture)
- TypeScript 5
- Prisma 6.19.0 with SQLite
- Radix UI components (@radix-ui/react-*)
- Framer Motion (animations)
- Lucide React (icons)

## Database (Prisma ORM)

### Setup
The project uses Prisma ORM with SQLite as the database provider.

### Configuration Files
- [prisma/schema.prisma](prisma/schema.prisma) - Database schema definition
- [prisma.config.ts](prisma.config.ts) - Prisma configuration (requires dotenv)
- [.env](.env) - Environment variables (DATABASE_URL)
- [lib/db.ts](lib/db.ts) - Prisma Client singleton instance

### Database Commands
```bash
npm run db:generate  # Generate Prisma Client
npm run db:push      # Push schema changes without migration
npm run db:migrate   # Create and apply a new migration
npm run db:studio    # Open Prisma Studio (GUI for database)
npm run db:seed      # Seed the database
```

### Current Schema Models
- **Agent** - Maritime school agents (nom, prenom, email, telephone, poste)
- **User** - Application users (email, name, password, role)

### API Routes
- [app/api/agents/route.ts](app/api/agents/route.ts) - GET (list), POST (create)
- [app/api/agents/[id]/route.ts](app/api/agents/[id]/route.ts) - GET, PUT, DELETE (by ID)

### Using Prisma in Code
```typescript
import { prisma } from '@/lib/db'

// Example: Fetch all agents
const agents = await prisma.agent.findMany()
```

## Notes
- This project uses Tailwind CSS v4, which has breaking changes from v3:
  - Uses `@import "tailwindcss"` instead of `@tailwind` directives
  - Configuration moved to CSS with `@theme` directive
  - Uses `@tailwindcss/postcss` plugin
- The project uses Geist fonts (sans and mono) loaded via `next/font/google`
- SQLite database file (dev.db) and journal files are gitignored
- Prisma migrations are versioned and committed to the repository
