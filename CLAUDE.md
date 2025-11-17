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
- [app/login/](app/login/) - Login page with custom layout
- **app/(with-header)/** - Route group with shared header layout
  - [layout.tsx](app/(with-header)/layout.tsx) - Shared layout with Header component
  - [principal/](app/(with-header)/principal/) - Main dashboard page with agents table
  - [nouveau-agent/](app/(with-header)/nouveau-agent/) - New agent creation page
  - [liste-formation/](app/(with-header)/liste-formation/) - Formations listing page
  - [nouvelle-formarion/](app/(with-header)/nouvelle-formarion/) - New formation creation page
  - [formation-agent/](app/(with-header)/formation-agent/) - Agent's formations listing page

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
- Radix UI components (@radix-ui/react-*) - Avatar, Dialog, Dropdown Menu, Label, Select, etc.
- Framer Motion 12.23.24 (animations)
- Lucide React 0.552.0 (icons)
- next-themes 0.4.6 (dark mode support)
- class-variance-authority (CVA) for component variants
- tailwind-merge for className merging
- react-resizable 3.0.5 (resizable table columns)
- sonner 2.0.7 (toast notifications)

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
- **Agent** - Maritime school agents with fields:
  - id (String, cuid)
  - nomPrenom (String) - Full name
  - grade (String) - Agent's grade/rank
  - matricule (String, unique) - Registration number
  - responsabilite (String) - Responsibility/position
  - telephone (Int) - Phone number
  - derniereDateFormation (String) - Last formation date
  - categorie (String) - Category
  - avatar (String, optional) - Avatar URL
  - formations (AgentFormation[]) - Related formations

- **User** - Application users (email, name, password, role)

- **Formation** - Training courses with fields:
  - id (String, cuid)
  - formation (String) - Formation name
  - typeFormation (String) - Formation type (تكوين إختصاص, تكوين تخصصي, تكوين مستمر)
  - specialite (String, optional) - Specialty (بحري, عدلي, إداري)
  - duree (String, optional) - Duration
  - capaciteAbsorption (Int, optional) - Absorption capacity
  - agentFormations (AgentFormation[]) - Related agent formations

- **AgentFormation** - Junction table linking agents to formations:
  - id (String, cuid)
  - agentId (String, FK) - Reference to Agent
  - formationId (String, FK) - Reference to Formation
  - dateDebut (String) - Start date
  - dateFin (String) - End date
  - reference (String, optional) - Reference number
  - resultat (String, optional) - Result
  - moyenne (Float) - Average score (0-20)
  - Cascading deletes on agent/formation removal

### API Routes
- **Agents API**
  - [app/api/agents/route.ts](app/api/agents/route.ts) - GET (list all), POST (create)
  - [app/api/agents/[id]/route.ts](app/api/agents/[id]/route.ts) - GET, PUT, DELETE (by ID)

- **Formations API**
  - [app/api/formations/route.ts](app/api/formations/route.ts) - GET (list all), POST (create)
  - [app/api/formations/[id]/route.ts](app/api/formations/[id]/route.ts) - GET, PUT, DELETE (by ID)

- **Agent-Formations API** (Junction table)
  - [app/api/agent-formations/route.ts](app/api/agent-formations/route.ts) - GET (list with filtering by agentId), POST (create)
  - [app/api/agent-formations/[id]/route.ts](app/api/agent-formations/[id]/route.ts) - GET, PUT, DELETE (by ID)
  - Supports query parameter: `?agentId=xxx` to filter formations by agent

### Using Prisma in Code
```typescript
import { prisma } from '@/lib/db'

// Example: Fetch all agents
const agents = await prisma.agent.findMany()
```

## UI Components

### Custom Components
- [components/ui/header.tsx](components/ui/header.tsx) - Application header with navigation
- [components/ui/project-data-table.tsx](components/ui/project-data-table.tsx) - Table component for displaying agent formations
- [components/ui/resizable-table.tsx](components/ui/resizable-table.tsx) - Resizable table component for data display
- [components/ui/server-management-table.tsx](components/ui/server-management-table.tsx) - Server/agent management table
- [components/login-form.tsx](components/login-form.tsx) - Login form component
- [components/dialogue-agent.tsx](components/dialogue-agent.tsx) - Dialog for creating/editing agents
- [components/dialogue-formation.tsx](components/dialogue-formation.tsx) - Dialog for creating/editing formations
- [components/dialogue-agent-formation.tsx](components/dialogue-agent-formation.tsx) - Dialog for assigning formations to agents
- [components/dialogue-edition-formation.tsx](components/dialogue-edition-formation.tsx) - Dialog for editing agent formations
- [components/formation-agent-client.tsx](components/formation-agent-client.tsx) - Client component for agent formations page
- [components/theme-provider.tsx](components/theme-provider.tsx) - Theme provider wrapper for next-themes

### Radix UI Components (Styled)
- Button, Card, Input, Label, Select, Textarea
- Dialog, Dropdown Menu, Popover
- Avatar, Badge, Separator, Toggle
- Table components with custom styling

## Notes
- This project uses Tailwind CSS v4, which has breaking changes from v3:
  - Uses `@import "tailwindcss"` instead of `@tailwind` directives
  - Configuration moved to CSS with `@theme` directive
  - Uses `@tailwindcss/postcss` plugin
- The project uses Geist fonts (sans and mono) loaded via `next/font/google`
- SQLite database file (dev.db) and journal files are gitignored
- Prisma migrations are versioned and committed to the repository
- The application is bilingual (French/Arabic) with Arabic support using Noto Naskh Arabic font
- Uses route groups with `(with-header)` for pages that need the shared header layout
- All tables support resizable columns using react-resizable
- Animations are implemented with Framer Motion for dialogs and page transitions
