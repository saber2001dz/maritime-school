# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ IMPORTANT: Philosophie de Développement

**TOUJOURS PRIVILÉGIER LA SIMPLICITÉ**

Lors de la résolution de problèmes ou de bugs :
1. **Commencer par la solution la plus simple** - Ne pas ajouter de complexité inutile
2. **Consulter la documentation officielle** - Vérifier les bonnes pratiques avant d'agir
3. **Analyser en profondeur** - Comprendre la cause racine avant de proposer une solution
4. **Éviter la sur-ingénierie** - Ne pas créer de routes API personnalisées, de wrappers ou d'abstractions quand les outils natifs suffisent
5. **Tester la solution minimale** - Si la version simple fonctionne, ne pas la compliquer

**Exemple concret :**
- ✅ BON : Utiliser directement `auth.api.getSession({ headers: await headers() })` (comme documenté)
- ❌ MAUVAIS : Créer une route API personnalisée qui enveloppe Better-Auth avec manipulation manuelle des cookies

**Règle d'or :** Si la bibliothèque ou le framework fournit une solution native, l'utiliser telle quelle.

## Pattern Standard pour Pages avec Tables

### Architecture Recommandée (2 fichiers)

Pour les pages affichant des données avec des opérations CRUD, suivre ce pattern simple :

**1. page.tsx (Server Component)**
- Fetch data from Prisma
- Transform data for UI
- Pass to client component

**2. client-component.tsx (Client Component)**
- State management (useState)
- API calls (CRUD operations)
- Router navigation (useRouter)
- UI rendering (table, dialogs, forms)

**Exemple :**
```typescript
// ✅ BON (pattern cours-formateur, formation-agent)
page.tsx (Server Component)
  ↓ Fetch data from Prisma
ClientComponent (Client Component)
  ↓ Handle TOUT (API, state, router, UI)
```

### Exception: Wrapper Component (3 fichiers)

Ajouter un wrapper component uniquement si vous avez une **raison architecturale valide** :

- **Context providers** nécessaires (ToastProvider, ThemeProvider, etc.)
- **Boundaries d'erreur** spécifiques
- **Optimistic updates** complexes

**Exemple d'exception justifiée :**
- [liste-cours](app/(with-header)/liste-cours/) utilise un wrapper pour le `<ToastProvider>` et les optimistic updates

**Exemple de sur-ingénierie à éviter :**
```typescript
// ❌ MAUVAIS (ancien pattern formation-agent - maintenant corrigé)
page.tsx (Server Component)
  ↓ Fetch data from Prisma
WrapperComponent (Client Component)
  ↓ Proxy API calls (inutile - juste passer les appels)
ClientComponent (Client Component)
  ↓ Handle UI only
```

**Principe :** N'ajouter un wrapper que s'il apporte une **vraie valeur architecturale**, pas juste pour séparer la logique.

## Project Overview

This is a Next.js 16.0.1 application (using the App Router) built with React 19.2.0, TypeScript, and Tailwind CSS v4. The project is intended for a maritime school management system with comprehensive authentication, user management, agent tracking, and training (formation) management capabilities.

## Development Commands

### Running the Development Server

**Default Development (Neon Cloud):**
```bash
npm run dev
```
Runs the development server with Neon cloud database.
The app will be available at http://localhost:3000

**Note:** The project uses **Neon Cloud PostgreSQL as the database** for both development and production. Neon provides serverless PostgreSQL with connection pooling optimized for Next.js and Vercel deployments.

### Building for Production
```bash
npm run build
```
Builds the application with current `.env` configuration.

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
- [app/login/page.tsx](app/login/page.tsx) - Login page with custom layout

- **app/(with-header)/** - Route group with shared header layout
  - [layout.tsx](app/(with-header)/layout.tsx) - Shared layout with Header component
  - [principal/page.tsx](app/(with-header)/principal/page.tsx) - Home page (displays "Page Principal")
  - [liste-agent/page.tsx](app/(with-header)/liste-agent/page.tsx) - Agents list page with agents table
  - [nouveau-agent/page.tsx](app/(with-header)/nouveau-agent/page.tsx) - New agent creation page
  - [liste-formation/page.tsx](app/(with-header)/liste-formation/page.tsx) - Formations listing page
  - [nouvelle-formarion/page.tsx](app/(with-header)/nouvelle-formarion/page.tsx) - New formation creation page
  - [formation-agent/page.tsx](app/(with-header)/formation-agent/page.tsx) - Agent's formations listing page

- **app/admin/** - Admin panel with protected routes and sidebar navigation
  - [layout.tsx](app/admin/layout.tsx) - Admin layout with Sidebar and authentication guard
  - [page.tsx](app/admin/page.tsx) - Admin home/redirect page
  - [dashboard/page.tsx](app/admin/dashboard/page.tsx) - Admin dashboard with statistics and overview
  - **database/** - Database management pages
    - [liste-agents/page.tsx](app/admin/database/liste-agents/page.tsx) - Manage agents
    - [liste-formations/page.tsx](app/admin/database/liste-formations/page.tsx) - Manage formations
    - [formations-agent/page.tsx](app/admin/database/formations-agent/page.tsx) - Manage agent-formation relationships
  - **auth-management/** - User and role management
    - [users/page.tsx](app/admin/auth-management/users/page.tsx) - User management (CRUD, role assignment, session control)
    - [roles/page.tsx](app/admin/auth-management/roles/page.tsx) - Role management and permissions overview
    - [permissions/page.tsx](app/admin/auth-management/permissions/page.tsx) - Permissions management
  - [import-data/page.tsx](app/admin/import-data/page.tsx) - Data import functionality
  - [export-data/page.tsx](app/admin/export-data/page.tsx) - Data export functionality
  - [logs/page.tsx](app/admin/logs/page.tsx) - System logs viewer
  - [connections/page.tsx](app/admin/connections/page.tsx) - Active connections monitoring

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

### Core Framework
- React 19.2.0 and React DOM 19.2.0
- Next.js 16.0.1 (App Router)
- TypeScript 5

### Styling & UI
- Tailwind CSS v4 (using the new PostCSS plugin architecture)
- class-variance-authority (CVA) for component variants
- tailwind-merge for className merging
- tw-animate-css 1.4.0 (animation utilities)
- next-themes 0.4.6 (dark mode support)

### UI Component Libraries
- Radix UI components (@radix-ui/react-*) - Avatar, Dialog, Dropdown Menu, Label, Select, Alert Dialog, Checkbox, Navigation Menu, Popover, Separator, Slider, Slot, Toggle, Tooltip
- Headless UI (@headlessui/react) 2.2.9
- Heroicons (@heroicons/react) 2.2.0
- Lucide React 0.552.0 (icon system)

### Animation & Interaction
- Framer Motion 12.23.24 (animations)
- Motion 12.23.24
- react-resizable 3.0.5 (resizable table columns)
- react-use-measure 2.1.7 (element measurements)

### Database & Backend
- Prisma 6.19.0 with PostgreSQL database
- @prisma/client 6.19.0

### Authentication & Authorization
- Better-Auth 1.3.34 (authentication framework)
- bcryptjs 3.0.3 (password hashing)

### Utilities
- clsx 2.1.1 (conditional classes)
- dotenv 17.2.3 (environment variables)
- sonner 2.0.7 (toast notifications)

### Dev Dependencies
- @tailwindcss/postcss v4
- tsx 4.20.6 (TypeScript execution)
- ESLint 9 with eslint-config-next 16.0.1

## Database (Prisma ORM)

### Neon Cloud Database Setup

The project uses **Neon Cloud PostgreSQL** as the database for both development and production:

**Neon Cloud PostgreSQL:**
- Provider: Neon (Serverless PostgreSQL)
- Connection: Pooled connection with pgbouncer for optimal serverless performance
- Database: `Maritime School`
- Region: EU Central 1 (AWS)
- Purpose: **Development, testing, and production**
- Benefits: Serverless, connection pooling, optimized for Next.js and Vercel, no cold starts with pooled connections

### Environment Files

The project uses two environment files:

1. **[.env](.env)** - Active environment (git-ignored)
   - Contains the Neon cloud database configuration
   - Format: `postgresql://neondb_owner:password@host-pooler.region.aws.neon.tech/Maritime%20School?sslmode=require&channel_binding=require`
   - This is the primary configuration used for development

2. **[.env.example](.env.example)** - Template file (safe for git)
   - Contains placeholder values for all required environment variables
   - Use this as reference when setting up new environments

3. **[.env.neon](.env.neon)** - Reference copy (optional)
   - Backup of Neon configuration for reference

### Database Backup Strategy

**Backup Directory:** `backups/`
- Contains historical database dumps for reference
- Use Neon Console for point-in-time recovery and automated backups
- Neon provides automatic backups with branch-based restore capabilities

**Manual Backup (if needed):**
```bash
# Export from Neon using psql
pg_dump 'postgresql://neondb_owner:password@host-pooler.region.aws.neon.tech/Maritime%20School?sslmode=require' > backups/neon_backup_$(date +%Y%m%d_%H%M%S).sql
```

**Restoring from backup:**
```bash
psql 'postgresql://neondb_owner:password@host-pooler.region.aws.neon.tech/Maritime%20School?sslmode=require' < backups/neon_backup_YYYYMMDD_HHMMSS.sql
```

### Schema Migration Workflow

**Standard Development Workflow:**

1. **Make changes to schema:**
   ```bash
   # Edit prisma/schema.prisma
   ```

2. **Apply migration to Neon:**
   ```bash
   npm run db:migrate            # Create and apply migration
   npm run db:generate           # Update Prisma Client
   ```

3. **Test the application:**
   ```bash
   npm run dev                   # Test application with Neon
   ```

**Important Notes:**
- All development and testing is done with Neon cloud database
- Migrations are automatically applied to the Neon database
- No environment switching needed

### Configuration Files
- [prisma/schema.prisma](prisma/schema.prisma) - Database schema definition
- [prisma.config.ts](prisma.config.ts) - Prisma configuration (requires dotenv)
- [.env](.env) - Active Neon configuration
- [.env.example](.env.example) - Template file for environment setup
- [.env.neon](.env.neon) - Reference copy of Neon configuration
- [lib/db.ts](lib/db.ts) - Prisma Client singleton instance

### Neon Configuration Best Practices

**Critical: Prisma Schema Configuration**

The [prisma/schema.prisma](prisma/schema.prisma) file MUST include both `url` and `directUrl` for reliable Neon migrations:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")      # Pooled connection for queries
  directUrl = env("DIRECT_URL")        # Direct connection for migrations
}
```

**Why `directUrl` is Required:**
- Separates application queries (pooled via pgBouncer) from migrations (direct connection)
- Prevents pooler from interfering with migration transactions
- Ensures reliable schema changes in serverless environments
- Recommended by Neon for all Prisma versions

**Connection String Parameters:**

Both `DATABASE_URL` and `DIRECT_URL` in `.env` should include:
- `sslmode=require` - Enforce SSL/TLS encryption
- `channel_binding=require` - Enhanced security
- `connect_timeout=10` - Handle Neon compute idle states (prevents timeouts)

**Example:**
```env
DATABASE_URL="postgresql://user:pass@host-pooler.region.aws.neon.tech/db?sslmode=require&channel_binding=require&connect_timeout=10"
DIRECT_URL="postgresql://user:pass@host.region.aws.neon.tech/db?sslmode=require&channel_binding=require&connect_timeout=10"
```

**Note the difference:**
- `DATABASE_URL`: Uses `-pooler` in hostname (pooled connection)
- `DIRECT_URL`: No `-pooler` in hostname (direct connection)

**Migration Commands:**
- **Development:** `npm run db:migrate` (or `npx prisma migrate dev`) - Create and apply migrations
- **Production:** `npx prisma migrate deploy` - Apply pending migrations only (safe, non-destructive)
- **Emergency:** `npx prisma db push` - Force schema sync (NOT production-safe, may lose data)

**Troubleshooting Common Issues:**

1. **"Can't reach database server" error:**
   - Cause: Neon compute is in idle state
   - Solution: Wait 10-30 seconds for compute to wake up, or increase `connect_timeout`

2. **Missing tables after migration:**
   - Cause: `directUrl` not configured in schema
   - Solution: Add `directUrl = env("DIRECT_URL")` to datasource block

3. **Schema drift warnings:**
   - Use `npx prisma db pull` to inspect current database schema
   - Use `npx prisma migrate status` to check migration state

4. **Migration stuck or failing:**
   - Ensure `DIRECT_URL` is using non-pooled connection (no `-pooler`)
   - Verify connection with: `psql "YOUR_DIRECT_URL" -c "SELECT 1;"`
   - Check Neon Console for compute status

### Database Commands
```bash
npm run db:generate  # Generate Prisma Client
npm run db:push      # Push schema changes without migration (prototyping only)
npm run db:migrate   # Create and apply a new migration
npm run db:studio    # Open Prisma Studio (GUI for database)
npm run db:seed      # Seed the database
```

**Important Notes:**
- **Neon Cloud is the only database** - all work uses Neon
- Use `npm run db:migrate` for production-ready schema changes
- Use `npm run db:push` only for rapid prototyping (no migration history)
- Neon database uses pooled connection (pgbouncer) with `channel_binding=require` for enhanced security

### Current Schema Models

#### Agent Model
Maritime school agents with fields:
- id (String, cuid, primary key)
- nomPrenom (String) - Full name
- grade (String) - Agent's grade/rank
- matricule (String, unique) - Registration number
- responsabilite (String) - Responsibility/position
- telephone (Int) - Phone number
- categorie (String) - Category
- avatar (String, optional) - Avatar URL
- createdAt (DateTime, default: now())
- updatedAt (DateTime, auto-updated)
- formations (AgentFormation[]) - Related formations

#### User Model (Better-Auth)
Application users with authentication fields:
- id (String, cuid, primary key)
- email (String, unique) - User email
- name (String) - User name
- emailVerified (Boolean, default: false)
- image (String, optional) - Profile image URL
- role (String, default: "agent") - User role (administrateur, coordinateur, formateur, agent)
- lastLogin (DateTime, optional) - Last login timestamp
- createdAt (DateTime, default: now())
- updatedAt (DateTime, auto-updated)
- banned (Boolean, optional) - Ban status
- banReason (String, optional) - Reason for ban
- banExpires (DateTime, optional) - Ban expiration date
- sessions (Session[]) - Related sessions
- accounts (Account[]) - Related accounts

#### Session Model (Better-Auth)
User sessions:
- id (String, cuid, primary key)
- userId (String, FK to User)
- token (String, unique) - Session token
- expiresAt (DateTime) - Session expiration
- ipAddress (String, optional) - IP address
- userAgent (String, optional) - User agent string
- createdAt (DateTime, default: now())
- updatedAt (DateTime, auto-updated)
- impersonatedBy (String, optional) - Admin impersonation tracking
- user (User relation, cascade delete)

#### Account Model (Better-Auth)
OAuth and credential accounts:
- id (String, cuid, primary key)
- userId (String, FK to User)
- accountId (String) - Provider account ID
- providerId (String) - OAuth provider ID
- password (String, optional) - Hashed password for email/password auth
- accessToken (String, optional) - OAuth access token
- refreshToken (String, optional) - OAuth refresh token
- accessTokenExpiresAt (DateTime, optional)
- refreshTokenExpiresAt (DateTime, optional)
- scope (String, optional) - OAuth scopes
- idToken (String, optional) - OAuth ID token
- createdAt (DateTime, default: now())
- updatedAt (DateTime, auto-updated)
- user (User relation, cascade delete)

#### Verification Model (Better-Auth)
Email verification and password reset tokens:
- id (String, cuid, primary key)
- identifier (String) - Email or user identifier
- value (String) - Verification token
- expiresAt (DateTime) - Token expiration
- createdAt (DateTime, default: now())
- updatedAt (DateTime, auto-updated)

#### Formation Model
Training courses with fields:
- id (String, cuid, primary key)
- typeFormation (String) - Formation type (تكوين إختصاص, تكوين تخصصي, تكوين مستمر)
- formation (String) - Formation name
- duree (String, optional) - Duration
- capaciteAbsorption (Int, optional) - Absorption capacity
- specialite (String, optional) - Specialty (بحري, عدلي, إداري)
- createdAt (DateTime, default: now())
- updatedAt (DateTime, auto-updated)
- agentFormations (AgentFormation[]) - Related agent formations

#### AgentFormation Model
Junction table linking agents to formations:
- id (String, cuid, primary key)
- agentId (String, FK to Agent)
- formationId (String, FK to Formation)
- dateDebut (String) - Start date
- dateFin (String) - End date
- reference (String, optional) - Reference number
- resultat (String, optional) - Result
- moyenne (Float) - Average score (0-20)
- createdAt (DateTime, default: now())
- updatedAt (DateTime, auto-updated)
- formation (Formation relation, cascade delete)
- agent (Agent relation, cascade delete)
- Indexes on agentId and formationId for query optimization

### API Routes

#### Agents API
- [app/api/agents/route.ts](app/api/agents/route.ts)
  - GET - List all agents with optional pagination
  - POST - Create new agent
- [app/api/agents/[id]/route.ts](app/api/agents/[id]/route.ts)
  - GET - Get single agent by ID
  - PUT - Update agent by ID
  - DELETE - Delete agent by ID (cascades to AgentFormation)

#### Formations API
- [app/api/formations/route.ts](app/api/formations/route.ts)
  - GET - List all formations
  - POST - Create new formation
- [app/api/formations/[id]/route.ts](app/api/formations/[id]/route.ts)
  - GET - Get single formation by ID
  - PUT - Update formation by ID
  - DELETE - Delete formation by ID (cascades to AgentFormation)

#### Agent-Formations API (Junction Table)
- [app/api/agent-formations/route.ts](app/api/agent-formations/route.ts)
  - GET - List agent formations with optional `?agentId=xxx` query parameter
  - POST - Create new agent-formation relationship
- [app/api/agent-formations/[id]/route.ts](app/api/agent-formations/[id]/route.ts)
  - GET - Get single agent-formation by ID
  - PUT - Update agent-formation by ID
  - DELETE - Delete agent-formation by ID

#### Authentication API (Better-Auth)
- [app/api/auth/[...all]/route.ts](app/api/auth/[...all]/route.ts)
  - Catch-all route for Better-Auth endpoints
  - Handles: sign-in, sign-up, sign-out, session management, OAuth flows

#### Users API
- [app/api/users/route.ts](app/api/users/route.ts)
  - GET - List all users with optional filtering
  - POST - Create new user
  - PUT - Update user (role assignment, profile updates)
  - DELETE - Delete user
- [app/api/users/[id]/route.ts](app/api/users/[id]/route.ts)
  - GET - Get single user by ID
  - PUT - Update user by ID
  - DELETE - Delete user by ID
- [app/api/users/kill-session/route.ts](app/api/users/kill-session/route.ts)
  - POST - Terminate user session by session ID

#### Roles API
- [app/api/roles/route.ts](app/api/roles/route.ts)
  - GET - List all available roles with permissions
- [app/api/roles/users/route.ts](app/api/roles/users/route.ts)
  - GET - List users grouped by roles

### Using Prisma in Code
```typescript
import { prisma } from '@/lib/db'

// Example: Fetch all agents
const agents = await prisma.agent.findMany()

// Example: Create agent with formations
const agent = await prisma.agent.create({
  data: {
    nomPrenom: "John Doe",
    grade: "Captain",
    matricule: "MAT001",
    responsabilite: "Navigation",
    telephone: 123456789,
    categorie: "Officer"
  }
})
```

## Authentication & Authorization

### Better-Auth Configuration
- [lib/auth.ts](lib/auth.ts) - Server-side Better-Auth configuration
  - Email/password authentication enabled
  - Prisma adapter for PostgreSQL
  - Admin plugin with role-based access control (RBAC)
  - Custom hooks for tracking last login
- [lib/auth-client.ts](lib/auth-client.ts) - Client-side authentication hooks
  - `signIn`, `signUp`, `signOut`, `useSession` exports
- [lib/check-permission.ts](lib/check-permission.ts) - Permission checking utilities

### Role System
- [lib/roles.ts](lib/roles.ts) - Centralized role definitions
  - **administrateur** - Full system access (purple badge)
  - **coordinateur** - Manage agents and formations (blue badge)
  - **formateur** - View agents and formations (green badge)
  - **agent** - Read-only access (gray badge)
- Helper functions: `getRoleByName`, `getRoleDisplayName`, `isValidRole`, `getRoleColor`

### Access Control
Defined in [lib/auth.ts](lib/auth.ts) using Better-Auth access control:
- **user**: create, list, update, delete, set-role
- **agent**: create, edit, delete, view
- **formation**: create, edit, delete, view
- **session**: list, revoke

### Environment Variables
Required in `.env` (Neon cloud configuration):
- `DATABASE_URL` - Neon PostgreSQL database connection string
  - **Format**: `postgresql://neondb_owner:password@host-pooler.region.aws.neon.tech/Maritime%20School?sslmode=require&channel_binding=require`
  - Use the pooled connection endpoint (`-pooler`) for optimal serverless performance
  - `sslmode=require` enforces SSL/TLS encryption
  - `channel_binding=require` provides enhanced security
- `BETTER_AUTH_SECRET` - Secret key for Better-Auth (generate with `openssl rand -base64 32`)
- `BETTER_AUTH_URL` / `NEXT_PUBLIC_BETTER_AUTH_URL` - Base URL for authentication
  - Development: `http://localhost:3000`
  - Production (Vercel): `https://your-app.vercel.app`
- `NEON_API_KEY` - Neon API key for MCP server integration (optional)

## UI Components

### Layout Components
- [components/ui/header.tsx](components/ui/header.tsx) - Application header with navigation for (with-header) route group
- [components/ui/sidebar.tsx](components/ui/sidebar.tsx) - Admin panel collapsible sidebar with navigation

### Data Display Components
- [components/ui/project-data-table.tsx](components/ui/project-data-table.tsx) - Table for displaying agent formations
- [components/ui/resizable-table.tsx](components/ui/resizable-table.tsx) - Resizable table component
- [components/ui/server-management-table.tsx](components/ui/server-management-table.tsx) - Server/agent management table
- [components/ui/permissions-table.tsx](components/ui/permissions-table.tsx) - Permissions display table

### Form & Dialog Components
- [components/login-form.tsx](components/login-form.tsx) - Login form with Better-Auth integration
- [components/dialogue-agent.tsx](components/dialogue-agent.tsx) - Dialog for creating/editing agents
- [components/dialogue-formation.tsx](components/dialogue-formation.tsx) - Dialog for creating/editing formations
- [components/dialogue-agent-formation.tsx](components/dialogue-agent-formation.tsx) - Dialog for assigning formations to agents
- [components/dialogue-edition-formation.tsx](components/dialogue-edition-formation.tsx) - Dialog for editing agent formations

### Utility Components
- [components/formation-agent-client.tsx](components/formation-agent-client.tsx) - Client component for agent formations page
- [components/theme-provider.tsx](components/theme-provider.tsx) - Theme provider wrapper for next-themes
- [components/ui/ultra-quality-toast.tsx](components/ui/ultra-quality-toast.tsx) - Enhanced toast notifications

### Base UI Components (Radix UI Styled)
- [components/ui/button.tsx](components/ui/button.tsx) - Button variants
- [components/ui/card.tsx](components/ui/card.tsx) - Card container
- [components/ui/input.tsx](components/ui/input.tsx) - Input field
- [components/ui/label.tsx](components/ui/label.tsx) - Form label
- [components/ui/select.tsx](components/ui/select.tsx) - Select dropdown
- [components/ui/textarea.tsx](components/ui/textarea.tsx) - Textarea input
- [components/ui/dialog.tsx](components/ui/dialog.tsx) - Modal dialog
- [components/ui/alert-dialog.tsx](components/ui/alert-dialog.tsx) - Confirmation dialog
- [components/ui/dropdown-menu.tsx](components/ui/dropdown-menu.tsx) - Dropdown menu
- [components/ui/popover.tsx](components/ui/popover.tsx) - Popover container
- [components/ui/avatar.tsx](components/ui/avatar.tsx) - User avatar
- [components/ui/badge.tsx](components/ui/badge.tsx) - Status badge
- [components/ui/separator.tsx](components/ui/separator.tsx) - Visual separator
- [components/ui/toggle.tsx](components/ui/toggle.tsx) - Toggle switch
- [components/ui/tooltip.tsx](components/ui/tooltip.tsx) - Tooltip component
- [components/ui/table.tsx](components/ui/table.tsx) - Table components
- [components/ui/field.tsx](components/ui/field.tsx) - Form field wrapper
- [components/ui/neumorph-button.tsx](components/ui/neumorph-button.tsx) - Neumorphic button variant
- [components/ui/RevealText.tsx](components/ui/RevealText.tsx) - Animated text reveal
- [components/ui/menu-toggle-icon.tsx](components/ui/menu-toggle-icon.tsx) - Animated menu icon
- [components/ui/use-scroll.tsx](components/ui/use-scroll.tsx) - Scroll position hook

## Project Structure Summary

### Route Organization
1. **Public Routes**: `/` (home), `/login`
2. **Authenticated Routes (with-header)**: `/principal`, `/liste-agent`, `/nouveau-agent`, `/liste-formation`, `/nouvelle-formarion`, `/formation-agent`
3. **Admin Routes**: All under `/admin/*` with sidebar navigation and authentication guard

### Key Libraries
- [lib/db.ts](lib/db.ts) - Prisma Client singleton
- [lib/auth.ts](lib/auth.ts) - Better-Auth server configuration
- [lib/auth-client.ts](lib/auth-client.ts) - Better-Auth client hooks
- [lib/roles.ts](lib/roles.ts) - Role definitions and helpers
- [lib/check-permission.ts](lib/check-permission.ts) - Permission utilities
- [lib/dal.ts](lib/dal.ts) - Data access layer
- [lib/utils.ts](lib/utils.ts) - Utility functions (cn, etc.)

### Admin Panel Features
- Dashboard with statistics and system overview
- Database management (Agents, Formations, Agent-Formations)
- User management with role assignment and ban functionality
- Session management with ability to terminate sessions
- Role and permission management
- Data import/export capabilities
- System logs viewer
- Active connections monitoring

### Seeding
- [prisma/seed.ts](prisma/seed.ts) - Database seeding script
- Run with: `npm run db:seed`
- Seeds default users, agents, formations, and relationships

## Important Notes

### Tailwind CSS v4
This project uses Tailwind CSS v4 with breaking changes from v3:
- Uses `@import "tailwindcss"` instead of `@tailwind` directives
- Configuration moved to CSS with `@theme` directive
- Uses `@tailwindcss/postcss` plugin instead of traditional setup

### Typography & Internationalization
- Primary font: Geist Sans and Geist Mono via `next/font/google`
- Arabic support: Noto Naskh Arabic font for bilingual content (French/Arabic)
- Text direction: `dir="ltr"` for admin panel, `dir="rtl"` support for Arabic content

### Database & Migrations
- **Neon Cloud PostgreSQL**: Single database for all environments
  - **Serverless PostgreSQL** with pooled connection (pgbouncer)
  - Database: `Maritime School`, Region: EU Central 1 (AWS)
  - Optimized for Next.js and Vercel deployments
- **Development Strategy**: All development and testing uses Neon cloud database
- Prisma migrations are versioned and committed to the repository
- **Migration Strategy**: Simple and straightforward
  - Run `npm run db:migrate` to create and apply migrations
  - Run `npm run db:generate` to update Prisma Client
  - No environment switching needed
- Use `npm run db:push` for quick schema prototyping (no migration files)
- Current migration: `20251127151746_init_postgresql` (PostgreSQL schema)
- **Backup Strategy**: Use Neon Console for point-in-time recovery and automated backups
- **Manual Backups**: Historical backups stored in `backups/` directory for reference

### Component Architecture
- Route groups: `(with-header)` for shared header layout
- Admin layout: Separate layout with sidebar navigation
- All tables support resizable columns using react-resizable
- Animations: Framer Motion for dialogs, page transitions, and sidebar
- State persistence: Sidebar collapse state stored in localStorage

### Authentication Flow
1. User logs in via `/login` using Better-Auth
2. Session created with token, expiration, IP, and user agent tracking
3. Last login timestamp updated via Better-Auth hook
4. Admin routes protected by session check in layout
5. Roles determine access to features (RBAC)

### Best Practices
- Always use `prisma` from `@/lib/db` (singleton pattern)
- Use Better-Auth hooks from `@/lib/auth-client` for client-side auth
- Check permissions using role definitions from `@/lib/roles`
- Use `cn()` utility from `@/lib/utils` for conditional classes
- Handle form submissions with proper validation and error handling
- Display user feedback using Sonner toast notifications

### Development Workflow

#### Standard Development
1. Start development server:
   ```bash
   npm run dev              # Uses Neon cloud database
   ```
2. Make changes to your code
3. Test in the browser at http://localhost:3000
4. Commit changes when ready

#### Schema Changes Workflow
1. Make schema changes in [prisma/schema.prisma](prisma/schema.prisma)
2. **Apply migration:**
   ```bash
   npm run db:migrate       # Create and apply migration
   npm run db:generate      # Update Prisma Client
   ```
3. **Test the application:**
   ```bash
   npm run dev              # Test with Neon cloud
   ```
4. Update API routes if needed
5. Update UI components to reflect changes
6. Commit changes (including migration files)

#### Database Backup Workflow
**Create manual backup from Neon (if needed):**
```bash
pg_dump 'postgresql://neondb_owner:password@host-pooler.region.aws.neon.tech/Maritime%20School?sslmode=require' > backups/neon_backup_$(date +%Y%m%d_%H%M%S).sql
```

**Note:** Use Neon Console for point-in-time recovery and automated backups.

#### Vercel Deployment
When deploying to Vercel, configure these environment variables in Vercel dashboard:
- `DATABASE_URL` - Same Neon connection string from `.env`
- `BETTER_AUTH_SECRET` - Same secret from `.env`
- `BETTER_AUTH_URL` - Your Vercel URL (e.g., `https://maritime-school.vercel.app`)
- `NEXT_PUBLIC_BETTER_AUTH_URL` - Your Vercel URL
- `NEON_API_KEY` - Same API key from `.env` (optional)
