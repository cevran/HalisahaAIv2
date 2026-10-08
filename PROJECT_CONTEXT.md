PROJECT NAME

Halısaha AI V2

PURPOSE

Halısaha AI is a football group management platform designed for amateur football groups.

The application allows:

- Multiple football groups
- Player rating system
- Automatic balanced team generation
- Match history
- MVP calculations
- Statistics
- Attendance tracking
- Shareable football field squad view

----------------------------------------------------

ARCHITECTURE

Frontend:

- GitHub Pages
- HTML
- CSS
- Vanilla JavaScript

Backend:

- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Storage
- Row Level Security

----------------------------------------------------

HOSTING

Frontend is hosted on GitHub Pages.

Therefore:

- No Node.js server
- No Express backend
- No Next.js
- No React unless explicitly requested later
- No server-side rendering

Everything must work using:

- Static HTML
- Static CSS
- Vanilla JavaScript
- Supabase client SDK

----------------------------------------------------

DATABASE STATUS

Database schema is COMPLETE and FROZEN.

Migrations already exist:

V001_initial_schema
V002_rls_policies
V003_triggers_and_functions
V004_schema_extensions
V005_storage_setup

Do NOT create new tables.

Do NOT modify database schema unless explicitly requested.

Assume database already exists and is working.

----------------------------------------------------

MULTI GROUP SUPPORT

Users may belong to multiple groups.

After login:

If user belongs to one group:
- Open that group

If user belongs to multiple groups:
- Show group selector

----------------------------------------------------

UI REQUIREMENTS

- Mobile First
- Responsive
- Modern football themed design
- Dark/Green football styling
- Touch friendly controls
- PWA compatible

----------------------------------------------------

DEVELOPMENT APPROACH

The project is developed in phases.

Current Phase:

PHASE 1

Scope:

- Login
- Register
- Forgot Password
- Profile Management
- Group Creation
- Group Selection
- Group Invitations

Do NOT implement:

- Player Ratings
- Matches
- Team Generation
- MVP
- Statistics

until Phase 1 is completed.

----------------------------------------------------

IMPORTANT

Always preserve existing architecture.

Do not introduce additional frameworks.

Prefer simple maintainable Vanilla JavaScript solutions.

Always provide production-ready code.



