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

This is a Next.js 16.0.10 application (using the App Router) built with React 19.2.0, TypeScript, and Tailwind CSS v4. The project is a comprehensive maritime school management system featuring:
- **Agent Management** - Track agents with their formations and training history
- **Formation Management** - Manage training programs with sessions and schedules
- **Formateur (Trainer) Management** - Track trainers and their course assignments
- **Cours (Courses) Management** - Manage individual courses taught by trainers
- **Session Planning** - Calendar-based session scheduling with drag-and-drop support
- **Authentication & Dynamic RBAC** - Role-based access control with Better-Auth + DB-driven permissions (roles, resources, and permissions matrix stored in database)

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
  - [session-formation/page.tsx](app/(with-header)/session-formation/page.tsx) - Session formation calendar with drag-and-drop planning
  - [liste-formateur/page.tsx](app/(with-header)/liste-formateur/page.tsx) - Trainers (formateurs) listing page
  - [nouveau-formateur/page.tsx](app/(with-header)/nouveau-formateur/page.tsx) - New trainer creation page
  - [liste-cours/page.tsx](app/(with-header)/liste-cours/page.tsx) - Courses (دروس) listing page
  - [cours-formateur/page.tsx](app/(with-header)/cours-formateur/page.tsx) - Courses taught by trainers

- **app/admin/** - Admin panel with protected routes and sidebar navigation
  - [layout.tsx](app/admin/layout.tsx) - Admin layout with Sidebar and authentication guard
  - [page.tsx](app/admin/page.tsx) - Admin home/redirect page
  - [dashboard/page.tsx](app/admin/dashboard/page.tsx) - Admin dashboard with statistics and overview
  - **database/** - Database management pages
    - [liste-agents/page.tsx](app/admin/database/liste-agents/page.tsx) - Manage agents
    - [liste-formations/page.tsx](app/admin/database/liste-formations/page.tsx) - Manage formations
    - [formations-agent/page.tsx](app/admin/database/formations-agent/page.tsx) - Manage agent-formation relationships
    - [liste-formateur/page.tsx](app/admin/database/liste-formateur/page.tsx) - Manage trainers (formateurs)
    - [liste-cours/page.tsx](app/admin/database/liste-cours/page.tsx) - Manage courses
    - [cours-formateur/page.tsx](app/admin/database/cours-formateur/page.tsx) - Manage course-trainer relationships
  - **auth-management/** - User, role, and permission management
    - [users/page.tsx](app/admin/auth-management/users/page.tsx) - User management (CRUD, role assignment, session control)
    - [roles/page.tsx](app/admin/auth-management/roles/page.tsx) - Role CRUD (create, edit, delete roles), view/assign users per role
    - [permissions/page.tsx](app/admin/auth-management/permissions/page.tsx) - Interactive permissions matrix (click checkboxes to toggle actions per role/resource)
    - [ui-components/page.tsx](app/admin/auth-management/ui-components/page.tsx) - UI Components permissions matrix (manage access to specific UI elements like buttons, filters, export features per role)
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
- Motion 12.23.26
- react-resizable 3.0.5 (resizable table columns)
- react-use-measure 2.1.7 (element measurements)
- @dnd-kit/core 6.3.1 (drag and drop for calendar)
- @dnd-kit/utilities 3.2.2 (DnD utilities)

### Calendar & Date
- date-fns 4.1.0 (date utilities with Arabic locale support)
- react-day-picker 9.12.0 (calendar date picker)

### Charts
- Recharts 2.15.4 (dashboard statistics and charts)

### Additional Icons
- @remixicon/react 4.7.0 (additional icon library)

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
- sessionFormationId (String, FK to SessionFormation, optional) - Links to specific session
- dateDebut (String) - Start date
- dateFin (String) - End date
- reference (String, optional) - Reference number
- resultat (String, optional) - Result
- moyenne (Float) - Average score (0-20)
- createdAt (DateTime, default: now())
- updatedAt (DateTime, auto-updated)
- formation (Formation relation, cascade delete)
- agent (Agent relation, cascade delete)
- sessionFormation (SessionFormation relation, optional)
- Indexes on agentId, formationId, and sessionFormationId for query optimization

#### SessionFormation Model
Training sessions - instances of formations with specific dates:
- id (String, cuid, primary key)
- formationId (String, FK to Formation)
- dateDebut (DateTime) - Session start date/time (stored in UTC)
- dateFin (DateTime) - Session end date/time (stored in UTC)
- nombreParticipants (Int, default: 0) - Number of participants
- reference (String, optional) - Reference number
- statut (String, optional) - Session status (مبرمجة, قيد التنفيذ, انتهت)
- color (String, optional) - Custom calendar color
- createdAt (DateTime, default: now())
- updatedAt (DateTime, auto-updated)
- agentFormations (AgentFormation[]) - Agent enrollments
- formation (Formation relation, cascade delete)
- Indexes on dateDebut and formationId

**Session Status Values:**
- مبرمجة (Scheduled) - Future sessions
- قيد التنفيذ (In Progress) - Currently running sessions
- انتهت (Completed) - Past sessions

#### Formateur Model
Trainers/instructors with fields:
- id (String, cuid, primary key)
- nomPrenom (String) - Full name
- grade (String) - Grade/rank
- unite (String) - Unit/department
- responsabilite (String) - Responsibility/position
- telephone (Int) - Phone number
- RIB (String, VarChar(20), unique) - Bank account number (20 digits)
- createdAt (DateTime, default: now())
- updatedAt (DateTime, auto-updated)
- coursFormateurs (CoursFormateur[]) - Related course assignments

#### Cours Model
Individual courses/lessons:
- id (String, cuid, primary key)
- titre (String) - Course title
- createdAt (DateTime, default: now())
- updatedAt (DateTime, auto-updated)
- coursFormateurs (CoursFormateur[]) - Related trainer assignments

#### CoursFormateur Model
Junction table linking courses to trainers:
- id (String, cuid, primary key)
- formateurId (String, FK to Formateur)
- coursId (String, FK to Cours)
- dateDebut (String) - Start date
- dateFin (String) - End date
- nombreHeures (Float) - Number of hours taught
- reference (String, optional) - Reference number
- createdAt (DateTime, default: now())
- updatedAt (DateTime, auto-updated)
- cours (Cours relation, cascade delete)
- formateur (Formateur relation, cascade delete)
- Indexes on coursId and formateurId for query optimization

#### Role Model (Dynamic Permissions System)
Roles stored in DB (replaces hardcoded `ROLES` array):
- id (String, cuid, primary key)
- name (String, unique) - Technical name (e.g. "administrateur")
- displayName (String) - Display name (e.g. "Administrateur")
- description (String, default: "") - Role description
- color (String, default: "gray") - Badge color
- isSystem (Boolean, default: false) - Protects system roles from deletion
- createdAt (DateTime, default: now())
- updatedAt (DateTime, auto-updated)
- permissions (RolePermission[]) - Related permissions

`User.role` remains a `String` (no FK) for Better-Auth compatibility — references `Role.name`.

#### Resource Model (Dynamic Permissions System)
Permission resources stored in DB:
- id (String, cuid, primary key)
- name (String, unique) - Technical name (e.g. "agent")
- displayName (String) - Display name (e.g. "Agents")
- description (String, default: "") - Resource description
- actions (String[]) - Available actions (e.g. ["create", "edit", "delete", "view"])
- actionLabels (Json, default: "{}") - Localized action labels (e.g. {"create": "Créer"})
- createdAt (DateTime, default: now())
- updatedAt (DateTime, auto-updated)
- permissions (RolePermission[]) - Related permissions

#### RolePermission Model (Dynamic Permissions System)
Junction table linking roles to resources with specific actions:
- id (String, cuid, primary key)
- roleId (String, FK to Role)
- resourceId (String, FK to Resource)
- actions (String[]) - Allowed actions for this role on this resource
- createdAt (DateTime, default: now())
- updatedAt (DateTime, auto-updated)
- role (Role relation, cascade delete)
- resource (Resource relation, cascade delete)
- @@unique([roleId, resourceId]) - Unique constraint on role+resource pair
- Indexes on roleId and resourceId

#### UIComponent Model (UI Permissions System)
UI components that can be conditionally shown/hidden per role:
- id (String, cuid, primary key)
- name (String, unique) - Technical name (e.g. "export_button_agents")
- displayName (String) - Display name (e.g. "Bouton Exporter")
- category (String) - Page category (e.g. "Agents", "Formations", "Sessions")
- description (String, default: "") - Component description
- icon (String, default: "Square") - Lucide icon name
- createdAt (DateTime, default: now())
- updatedAt (DateTime, auto-updated)
- permissions (UIComponentPermission[]) - Related permissions
- @@index([category]) - Index on category for grouping

#### UIComponentPermission Model (UI Permissions System)
Junction table linking roles to UI components:
- id (String, cuid, primary key)
- roleId (String, FK to Role)
- componentId (String, FK to UIComponent)
- enabled (Boolean, default: false) - Whether the component is accessible for this role
- createdAt (DateTime, default: now())
- updatedAt (DateTime, auto-updated)
- role (Role relation, cascade delete)
- component (UIComponent relation, cascade delete)
- @@unique([roleId, componentId]) - Unique constraint on role+component pair
- Indexes on roleId and componentId

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

#### Session-Formations API (Training Sessions)
- [app/api/session-formations/route.ts](app/api/session-formations/route.ts)
  - GET - List sessions with optional filtering (`?formationId=xxx`, `?dateDebut_gte=xxx`)
    - Includes related formations and agent enrollments
    - Computes session status automatically (مبرمجة/قيد التنفيذ/انتهت)
  - POST - Create new session formation
    - Validates date logic (dateDebut < dateFin)
    - UTC time handling (stores 09:00-18:00 UTC)
    - Automatic status computation
- [app/api/session-formations/[id]/route.ts](app/api/session-formations/[id]/route.ts)
  - GET - Get single session by ID
  - PUT - Update session by ID
  - DELETE - Delete session by ID

#### Formateurs API (Trainers)
- [app/api/formateurs/route.ts](app/api/formateurs/route.ts)
  - GET - List all trainers with authentication
  - POST - Create new trainer
    - Validates RIB (20 digits requirement)
    - Handles phone number normalization
    - Arabic error messages
- [app/api/formateurs/[id]/route.ts](app/api/formateurs/[id]/route.ts)
  - GET - Get single trainer by ID
  - PUT - Update trainer by ID
  - DELETE - Delete trainer by ID

#### Cours API (Courses)
- [app/api/cours/route.ts](app/api/cours/route.ts)
  - GET - List all courses
  - POST - Create new course (validates `titre` required)
- [app/api/cours/[id]/route.ts](app/api/cours/[id]/route.ts)
  - GET - Get single course by ID
  - PUT - Update course by ID
  - DELETE - Delete course by ID

#### Cours-Formations API (Course-Trainer Junction)
- [app/api/cours-formations/route.ts](app/api/cours-formations/route.ts)
  - GET - List course-trainer mappings with optional filtering (`?formateurId=xxx`, `?coursId=xxx`)
  - POST - Create course-trainer relationship
    - Validates required fields: formateurId, coursId, dateDebut, dateFin, nombreHeures
- [app/api/cours-formations/[id]/route.ts](app/api/cours-formations/[id]/route.ts)
  - GET - Get single mapping by ID
  - PUT - Update mapping by ID
  - DELETE - Delete mapping by ID

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

#### Roles API (Dynamic - DB-driven)
- [app/api/roles/route.ts](app/api/roles/route.ts)
  - GET - List all roles from DB with permissions and user counts
  - POST - Create new role (requires `user:create` permission)
    - Validates unique name, requires name + displayName
- [app/api/roles/[id]/route.ts](app/api/roles/[id]/route.ts)
  - GET - Get single role by ID with permissions
  - PUT - Update role (displayName, description, color)
  - DELETE - Delete role (blocked if `isSystem: true`, reassigns users to "agent" role)
- [app/api/roles/users/route.ts](app/api/roles/users/route.ts)
  - GET - List users grouped by roles

#### Resources API (Dynamic Permissions)
- [app/api/resources/route.ts](app/api/resources/route.ts)
  - GET - List all permission resources
  - POST - Create new resource (name, displayName, description, actions, actionLabels)
- [app/api/resources/[id]/route.ts](app/api/resources/[id]/route.ts)
  - GET - Get single resource by ID
  - PUT - Update resource (displayName, description, actions, actionLabels)
  - DELETE - Delete resource (cascades RolePermissions)

#### Role-Permissions API (Dynamic Permissions Matrix)
- [app/api/role-permissions/route.ts](app/api/role-permissions/route.ts)
  - GET - Get full permissions matrix (all RolePermission entries with role and resource)
  - PUT - Update permissions (dual mode):
    - **Mode 1 - Toggle by name**: `{ roleName, resourceName, action }` — toggles single action on/off
    - **Mode 2 - Set by ID**: `{ roleId, resourceId, actions[] }` — sets full actions array
    - Auto-deletes entry if resulting actions array is empty
    - Validates actions against resource's allowed actions

#### UI Components API (UI Permissions System)
- [app/api/ui-components/route.ts](app/api/ui-components/route.ts)
  - GET - List all UI components with their permissions
  - POST - Create new UI component (name, displayName, category, description, icon)
- [app/api/ui-components/permissions/route.ts](app/api/ui-components/permissions/route.ts)
  - PUT - Toggle UI component permission for a role
    - Request: `{ roleId, componentId, enabled }`
    - Creates or updates UIComponentPermission entry
    - Returns updated permission state

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
  - Admin plugin with static role fallback (not the source of truth for runtime permissions)
  - Custom hooks for tracking last login
- [lib/auth-client.ts](lib/auth-client.ts) - Client-side authentication hooks
  - `signIn`, `signUp`, `signOut`, `useSession` exports

### Dynamic Permissions System (DB-driven)

Roles, resources, actions, and the permissions matrix are all stored in the database and manageable via the admin UI. This replaces the previous hardcoded approach.

#### Architecture Overview

```
Server (layout.tsx)                    Client Components
┌──────────────────┐                  ┌──────────────────────┐
│ loadPermissions() │──permissionsMap──▶│ PermissionsProvider  │
│ loadRoles()       │──roles──────────▶│   usePermissions()   │
└──────────────────┘                  │   can(role, res,     │
                                      │     action, map)     │
                                      └──────────────────────┘

API Routes
┌──────────────────┐
│ requirePermission │── auth + DB check ──▶ 401/403/OK
│ (resource, action)│
└──────────────────┘
```

#### Permission Files (Client/Server Split)

| File | Side | Purpose |
|------|------|---------|
| [lib/permissions.ts](lib/permissions.ts) | Client + Server | `can()` function, `PermissionsMap` type |
| [lib/permissions-server.ts](lib/permissions-server.ts) | Server only | `loadPermissions()` — loads matrix from DB (React `cache()`) |
| [lib/permissions-context.tsx](lib/permissions-context.tsx) | Client | `PermissionsProvider`, `usePermissions()` hook |
| [lib/roles.ts](lib/roles.ts) | Client + Server | `Role` interface, `getRoleDisplayName()`, `getRoleColor()`, `DEFAULT_ROLE` |
| [lib/roles-server.ts](lib/roles-server.ts) | Server only | `loadRoles()`, `getRoleByName()`, `isValidRole()` |
| [lib/check-permission.ts](lib/check-permission.ts) | Server only | `requirePermission()`, `checkPermission()`, `isAdmin()` |

#### Key Functions

**`can(role, resource, action, permissionsMap)`** — Synchronous, pure function. Works client + server.
```typescript
import { can } from "@/lib/permissions"
can("administrateur", "agent", "edit", permissionsMap) // true/false
```

**`loadPermissions()`** — Async, server-only. Cached per request via React `cache()`.
```typescript
import { loadPermissions } from "@/lib/permissions-server"
const permissionsMap = await loadPermissions()
// Returns: Record<string, Record<string, string[]>>
// Example: { "administrateur": { "agent": ["create", "edit", "delete", "view"] } }
```

**`usePermissions()`** — Client hook. Returns `permissionsMap` from context.
```typescript
import { usePermissions } from "@/lib/permissions-context"
const permissionsMap = usePermissions()
```

**`requirePermission(resource, action)`** — API route helper. Combines auth + permission check.
```typescript
import { requirePermission } from "@/lib/check-permission"
const auth = await requirePermission("agent", "create")
if (!auth.authorized) return auth.errorResponse!
```

#### Layout Integration

The `(with-header)/layout.tsx` wraps all authenticated pages with `PermissionsProvider`:
```typescript
const permissionsMap = await loadPermissions()
<PermissionsProvider permissionsMap={permissionsMap}>
  {children}
</PermissionsProvider>
```

All client components use `usePermissions()` to access the map and pass it to `can()`.

#### Default Roles (seeded via `prisma/seed-permissions.ts`)
- **administrateur** — Full system access (purple, isSystem: true)
- **direction** — Direction-level access (blue)
- **coordinateur** — Manage agents and formations (blue)
- **formateur** — View agents and formations (green)
- **agent** — Read-only access (gray)

#### Default Resources (10 resources seeded)
user, agent, formation, session, formateur, cours, sessionFormation, agentFormation, coursFormateur, sessionAgent

#### Admin UI for Managing Permissions
- **Roles page** (`/admin/auth-management/roles`): Create, edit, delete roles. View/assign users per role.
- **Permissions page** (`/admin/auth-management/permissions`): Interactive matrix with clickable checkboxes to toggle actions per role/resource. Optimistic updates.
- **UI Components page** (`/admin/auth-management/ui-components`): Matrix interface to manage access to specific UI elements (buttons, filters, export features, etc.) per role. Grouped by page category with optimistic updates.

### UI Permissions System (Component-Level Access Control)

The project features a **separate UI permissions system** that controls access to specific UI components (buttons, filters, drag-and-drop, export features, etc.) independently from CRUD permissions.

#### Architecture Overview

```
Server (page.tsx)                      Client Components
┌───────────────────┐                 ┌────────────────────────────┐
│ loadUIPermissions()│──uiPermissionsMap──▶│ UIPermissionsProvider     │
│ loadRoles()        │──roles─────────▶│   useUIPermissions()      │
└───────────────────┘                 │   canAccessUIComponent()  │
                                      └────────────────────────────┘

API Routes
┌──────────────────┐
│ PUT /api/ui-     │── toggle permission ──▶ DB update
│ components/      │
│ permissions      │
└──────────────────┘
```

#### UI Permission Files (Client/Server Split)

| File | Side | Purpose |
|------|------|---------|
| [lib/ui-permissions.ts](lib/ui-permissions.ts) | Client + Server | `canAccessUIComponent()` function, `UIPermissionsMap` type |
| [lib/ui-permissions-server.ts](lib/ui-permissions-server.ts) | Server only | `loadUIPermissions()` — loads UI permissions from DB (React `cache()`) |
| [lib/ui-permissions-context.tsx](lib/ui-permissions-context.tsx) | Client | `UIPermissionsProvider`, `useUIPermissions()` hook |

#### Key Functions

**`canAccessUIComponent(roleId, componentName, uiPermissionsMap)`** — Synchronous, pure function. Works client + server.
```typescript
import { canAccessUIComponent } from "@/lib/ui-permissions"
canAccessUIComponent(roleId, "export_button_agents", uiPermissionsMap) // true/false
```

**`loadUIPermissions()`** — Async, server-only. Cached per request via React `cache()`.
```typescript
import { loadUIPermissions } from "@/lib/ui-permissions-server"
const uiPermissionsMap = await loadUIPermissions()
// Returns: Record<string, string[]>
// Example: { "role-id-1": ["export_button_agents", "filter_advanced"] }
```

**`useUIPermissions()`** — Client hook. Returns `uiPermissionsMap` from context.
```typescript
import { useUIPermissions } from "@/lib/ui-permissions-context"
const uiPermissionsMap = useUIPermissions()
```

#### Default UI Components (26 components seeded via `prisma/seed-ui-components.ts`)

**Categories:**
- **Agents** (5 components): Export button, import button, advanced filters, column resizing, bulk actions
- **Formations** (5 components): Export button, import button, advanced filters, column resizing, bulk actions
- **Sessions** (5 components): Export button, drag & drop, color picker, advanced filters, calendar views
- **Formateurs** (4 components): Export button, import button, advanced filters, column resizing
- **Cours** (4 components): Export button, import button, advanced filters, bulk actions
- **Dashboard** (3 components): Export charts, print view, advanced analytics

**Seed script:** Run `npx tsx prisma/seed-ui-components.ts` to populate UI components with default permissions.

#### Usage in Client Components

```typescript
import { useUIPermissions } from "@/lib/ui-permissions-context"
import { canAccessUIComponent } from "@/lib/ui-permissions"

function AgentsList() {
  const session = useSession()
  const uiPermissionsMap = useUIPermissions()
  const roleId = session?.user?.roleId

  const canExport = canAccessUIComponent(roleId, "export_button_agents", uiPermissionsMap)
  const canFilter = canAccessUIComponent(roleId, "filter_advanced_agents", uiPermissionsMap)

  return (
    <div>
      {canExport && <ExportButton />}
      {canFilter && <AdvancedFilters />}
    </div>
  )
}
```

#### Matrix Interface Features

The `/admin/auth-management/ui-components` page provides:
- **Grouped by category**: Components organized by page (Agents, Formations, Sessions, etc.)
- **Clickable checkboxes**: Toggle component access per role with a single click
- **Optimistic updates**: Immediate UI feedback without waiting for server response
- **Role ordering**: Custom order (Administrateur, Coordinateur, Formateur, Direction, Agent)
- **Color-coded roles**: Each role has a distinct color (purple, blue, green, orange, gray)
- **Export functionality**: Export permissions matrix to CSV
- **Icon support**: Each component has an associated Lucide icon

#### Key Differences from CRUD Permissions

| Feature | CRUD Permissions | UI Permissions |
|---------|-----------------|----------------|
| **Granularity** | Resource-level (agents, formations) | Component-level (buttons, filters) |
| **Actions** | Multiple actions per resource (create, edit, delete, view) | Binary access (enabled/disabled) |
| **Use Case** | API routes, page-level access | Conditional UI rendering |
| **Data Model** | RolePermission (actions[]) | UIComponentPermission (enabled boolean) |
| **Admin Page** | `/admin/auth-management/permissions` | `/admin/auth-management/ui-components` |

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
- [components/ui/permissions-table.tsx](components/ui/permissions-table.tsx) - Editable permissions matrix table (clickable action badges to toggle permissions)

### Form & Dialog Components
- [components/login-form.tsx](components/login-form.tsx) - Login form with Better-Auth integration
- [components/dialogue-agent.tsx](components/dialogue-agent.tsx) - Dialog for creating/editing agents
- [components/dialogue-formation.tsx](components/dialogue-formation.tsx) - Dialog for creating/editing formations
- [components/dialogue-agent-formation.tsx](components/dialogue-agent-formation.tsx) - Dialog for assigning formations to agents
- [components/dialogue-edition-formation.tsx](components/dialogue-edition-formation.tsx) - Dialog for editing agent formations
- [components/dialogue-formateur.tsx](components/dialogue-formateur.tsx) - Dialog for creating/editing trainers
- [components/dialogue-cours.tsx](components/dialogue-cours.tsx) - Dialog for creating/editing courses
- [components/dialogue-ajouter-cours-formateur.tsx](components/dialogue-ajouter-cours-formateur.tsx) - Dialog for adding course-trainer relationships
- [components/dialogue-edition-cours-formateur.tsx](components/dialogue-edition-cours-formateur.tsx) - Dialog for editing course-trainer mappings

### Event Calendar System
Complete drag-and-drop calendar for session planning:
- [components/event-calendar/event-calendar.tsx](components/event-calendar/event-calendar.tsx) - Main calendar component (month/week/day/agenda views)
- [components/event-calendar/event-dialog.tsx](components/event-calendar/event-dialog.tsx) - Dialog for creating/editing events
- [components/event-calendar/draggable-event.tsx](components/event-calendar/draggable-event.tsx) - Draggable event items
- [components/event-calendar/droppable-cell.tsx](components/event-calendar/droppable-cell.tsx) - Drop zones for calendar cells
- [components/event-calendar/calendar-dnd-context.tsx](components/event-calendar/calendar-dnd-context.tsx) - Drag-and-drop context provider
- [components/event-calendar/month-view.tsx](components/event-calendar/month-view.tsx) - Month view mode
- [components/event-calendar/week-view.tsx](components/event-calendar/week-view.tsx) - Week view mode
- [components/event-calendar/day-view.tsx](components/event-calendar/day-view.tsx) - Day view mode
- [components/event-calendar/agenda-view.tsx](components/event-calendar/agenda-view.tsx) - Agenda view mode
- [components/event-calendar/event-item.tsx](components/event-calendar/event-item.tsx) - Event display item
- [components/event-calendar/events-popup.tsx](components/event-calendar/events-popup.tsx) - Popup for event details
- [components/event-calendar/types.ts](components/event-calendar/types.ts) - TypeScript types for calendar
- [components/event-calendar/constants.ts](components/event-calendar/constants.ts) - Calendar constants
- [components/event-calendar/utils.ts](components/event-calendar/utils.ts) - Calendar utilities

### Client Components
- [components/formation-agent-client.tsx](components/formation-agent-client.tsx) - Client component for agent formations page
- [components/cours-formateur-client.tsx](components/cours-formateur-client.tsx) - Client component for course-trainer display
- [components/liste-formation-client.tsx](components/liste-formation-client.tsx) - Client component for formation listing
- [components/session-event-dialog-adapter.tsx](components/session-event-dialog-adapter.tsx) - Adapter between session data and event dialogs

### Utility Components
- [components/theme-provider.tsx](components/theme-provider.tsx) - Theme provider wrapper for next-themes
- [components/ui/ultra-quality-toast.tsx](components/ui/ultra-quality-toast.tsx) - Enhanced toast notifications
- [components/database-indicator.tsx](components/database-indicator.tsx) - Database connection indicator

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
- [components/ui/resizable-table-formateur.tsx](components/ui/resizable-table-formateur.tsx) - Resizable table for trainers
- [components/ui/resizable-session-table.tsx](components/ui/resizable-session-table.tsx) - Resizable table for sessions
- [components/ui/cours-simple-table.tsx](components/ui/cours-simple-table.tsx) - Simple table for courses
- [components/ui/calendar.tsx](components/ui/calendar.tsx) - Calendar date picker component
- [components/ui/tabs.tsx](components/ui/tabs.tsx) - Tab component
- [components/ui/chart.tsx](components/ui/chart.tsx) - Chart components for dashboard
- [components/ui/skeleton.tsx](components/ui/skeleton.tsx) - Loading skeleton placeholders
- [components/ui/spinner.tsx](components/ui/spinner.tsx) - Loading spinner
- [components/ui/checkbox.tsx](components/ui/checkbox.tsx) - Checkbox component
- [components/ui/radio-group.tsx](components/ui/radio-group.tsx) - Radio group component

## Project Structure Summary

### Route Organization
1. **Public Routes**: `/` (home), `/login`
2. **Authenticated Routes (with-header)**: `/principal`, `/liste-agent`, `/nouveau-agent`, `/liste-formation`, `/nouvelle-formarion`, `/formation-agent`, `/session-formation`, `/liste-formateur`, `/nouveau-formateur`, `/liste-cours`, `/cours-formateur`
3. **Admin Routes**: All under `/admin/*` with sidebar navigation and authentication guard

### Key Libraries
- [lib/db.ts](lib/db.ts) - Prisma Client singleton
- [lib/auth.ts](lib/auth.ts) - Better-Auth server configuration
- [lib/auth-client.ts](lib/auth-client.ts) - Better-Auth client hooks
- [lib/permissions.ts](lib/permissions.ts) - `can()` function and `PermissionsMap` type (client + server)
- [lib/permissions-server.ts](lib/permissions-server.ts) - `loadPermissions()` from DB (server-only, React cached)
- [lib/permissions-context.tsx](lib/permissions-context.tsx) - `PermissionsProvider` and `usePermissions()` hook (client)
- [lib/ui-permissions.ts](lib/ui-permissions.ts) - `canAccessUIComponent()` function and `UIPermissionsMap` type (client + server)
- [lib/ui-permissions-server.ts](lib/ui-permissions-server.ts) - `loadUIPermissions()` from DB (server-only, React cached)
- [lib/ui-permissions-context.tsx](lib/ui-permissions-context.tsx) - `UIPermissionsProvider` and `useUIPermissions()` hook (client)
- [lib/roles.ts](lib/roles.ts) - `Role` interface, `getRoleDisplayName()`, `getRoleColor()` (client-safe)
- [lib/roles-server.ts](lib/roles-server.ts) - `loadRoles()`, `getRoleByName()`, `isValidRole()` (server-only)
- [lib/check-permission.ts](lib/check-permission.ts) - `requirePermission()` for API routes, `checkPermission()`, `isAdmin()`
- [lib/dal.ts](lib/dal.ts) - Data access layer
- [lib/utils.ts](lib/utils.ts) - Utility functions (cn, etc.)
- [lib/session-utils.ts](lib/session-utils.ts) - `computeSessionStatus()` function for calculating session status
- [lib/calendar-utils.ts](lib/calendar-utils.ts) - Transform functions between SessionFormation and CalendarEvent objects
- [lib/calendar-locale.ts](lib/calendar-locale.ts) - Localization support for calendar (Arabic month names)
- [lib/timezone-utils.ts](lib/timezone-utils.ts) - Timezone handling (UTC to GMT+1 conversions)

### Custom Hooks
- [hooks/use-debounce.ts](hooks/use-debounce.ts) - Debounce hook for search/input optimization
- [hooks/use-file-upload.ts](hooks/use-file-upload.ts) - File upload hook

### Admin Panel Features
- Dashboard with statistics and system overview (with charts via Recharts)
- Database management (Agents, Formations, Agent-Formations, Formateurs, Cours, Cours-Formateur)
- User management with role assignment and ban functionality
- Session management with ability to terminate sessions
- **Dynamic role management** — CRUD roles via UI (create, edit, delete, with isSystem protection)
- **Dynamic CRUD permissions management** — Interactive matrix to toggle actions per role/resource with optimistic updates
- **Dynamic UI permissions management** — Component-level access control matrix (buttons, filters, export, drag-and-drop, etc.) grouped by page
- Data import/export capabilities
- System logs viewer
- Active connections monitoring

### Seeding
- [prisma/seed.ts](prisma/seed.ts) - Database seeding script (users, agents, formations, relationships)
- [prisma/seed-permissions.ts](prisma/seed-permissions.ts) - CRUD permissions seeding script (roles, resources, permissions matrix)
  - Seeds 5 roles (administrateur, direction, coordinateur, formateur, agent)
  - Seeds 10 resources with actions and localized action labels
  - Seeds the full permissions matrix (RolePermission entries)
  - Run with: `npx tsx prisma/seed-permissions.ts`
- [prisma/seed-ui-components.ts](prisma/seed-ui-components.ts) - UI components permissions seeding script
  - Seeds 26 UI components across 6 categories (Agents, Formations, Sessions, Formateurs, Cours, Dashboard)
  - Seeds default UI permissions (130 UIComponentPermission entries for 26 components × 5 roles)
  - Run with: `npx tsx prisma/seed-ui-components.ts`
- Run with: `npm run db:seed` (runs main seed script)

### Data Model Architecture

The application manages several interconnected entities:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FORMATION SYSTEM                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Formation ──────┬──────────── SessionFormation ────── AgentFormation   │
│  (Training       │             (Session instances     (Agent enrollment  │
│   Programs)      │              with dates)            in sessions)      │
│                  │                                            │          │
│                  └─────────────────────────────────────── Agent         │
│                                                          (Trainees)      │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                           TRAINER SYSTEM                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Formateur ─────────────── CoursFormateur ─────────────── Cours         │
│  (Trainers)               (Course assignments          (Courses/        │
│                            with hours)                  Lessons)         │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        CRUD PERMISSIONS SYSTEM                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Role ──────────────── RolePermission ──────────────── Resource         │
│  (Roles with          (Junction: role ×              (Resources with     │
│   displayName,         resource → actions[])          actions[],          │
│   color, isSystem)                                    actionLabels{})     │
│                                                                          │
│  User.role (String) ──references──▶ Role.name                           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                        UI PERMISSIONS SYSTEM                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Role ──────────── UIComponentPermission ──────────── UIComponent       │
│  (Same roles)     (Junction: role ×                  (UI elements with   │
│                    component → enabled)               name, category,     │
│                                                       icon, description)  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Key Relationships:**
- A `Formation` can have multiple `SessionFormation` instances (different dates)
- An `Agent` enrolls in sessions via `AgentFormation` (linked to both Formation and optionally SessionFormation)
- A `Formateur` teaches courses via `CoursFormateur` junction table
- A `Cours` can be taught by multiple trainers
- A `Role` has CRUD permissions on multiple `Resource` entries via `RolePermission` junction table
- A `Role` has UI permissions on multiple `UIComponent` entries via `UIComponentPermission` junction table
- `User.role` references `Role.name` (String, no FK — for Better-Auth compatibility)

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
5. `(with-header)/layout.tsx` loads `permissionsMap` from DB and wraps children with `PermissionsProvider`
6. Client components use `usePermissions()` + `can()` to conditionally show/hide UI actions
7. API routes use `requirePermission()` to enforce server-side permission checks (401/403)

### Session Calendar System
The session formation page uses a comprehensive calendar system with:
- **Drag-and-drop support** via @dnd-kit for rescheduling sessions
- **Multiple view modes**: Month, Week, Day, Agenda
- **Color coding** by formation type:
  - تكوين إختصاص (Specialization) → sky (blue)
  - تكوين تخصصي (Specialized) → violet (purple)
  - تكوين مستمر (Continuous) → emerald (green)
- **Automatic status computation** based on current date:
  - مبرمجة (Scheduled) - Future sessions
  - قيد التنفيذ (In Progress) - Currently running
  - انتهت (Completed) - Past sessions
- **Timezone handling**: Dates stored in UTC, displayed in GMT+1 (Algeria timezone)

**Key utilities:**
```typescript
// Compute session status
import { computeSessionStatus } from '@/lib/session-utils'
const status = computeSessionStatus(dateDebut, dateFin)

// Transform sessions to calendar events
import { transformSessionsToEvents, transformEventToSessionData } from '@/lib/calendar-utils'
const events = transformSessionsToEvents(sessions)
```

### Best Practices
- Always use `prisma` from `@/lib/db` (singleton pattern)
- Use Better-Auth hooks from `@/lib/auth-client` for client-side auth
- **CRUD Permissions**: Use `can(role, resource, action, permissionsMap)` for permission checks — always pass the 4th argument
- **UI Permissions**: Use `canAccessUIComponent(roleId, componentName, uiPermissionsMap)` for UI element visibility
- **Client components**: Get permissions via `usePermissions()` and `useUIPermissions()` hooks from their respective contexts
- **Server pages**: Load permissions via `loadPermissions()` and `loadUIPermissions()` from their respective server modules
- **API routes**: Use `requirePermission(resource, action)` from `@/lib/check-permission`
- **Roles**: Use `getRoleDisplayName(name, roles)` and `getRoleColor(name, roles)` — pass `roles` array as 2nd argument
- Use `cn()` utility from `@/lib/utils` for conditional classes
- Handle form submissions with proper validation and error handling
- Display user feedback using Sonner toast notifications (errors/warnings only, not success messages for toggling permissions)
- Use `computeSessionStatus()` for consistent session status across the application
- Store dates in UTC and convert to local time for display using `lib/timezone-utils.ts`

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
