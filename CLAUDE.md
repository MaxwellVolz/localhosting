# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This repository contains production-ready boilerplates for self-hosted home server setups. It provides three independent but complementary systems designed to work together via Jenkins CI/CD, NGINX reverse proxy, and Cloudflare Tunnel.

## Project Structure

```
localhosting/
├── blog/       # Next.js + MDX static blog with Decap CMS
├── api/        # FastAPI backend with email contact form
└── hosting/    # Deployment configurations (Jenkins, NGINX, Cloudflare)
```

## Common Development Commands

### Blog (Next.js + MDX)

```bash
cd blog

# Development
npm install
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Build static site to /out directory
npm run format       # Format code with Prettier

# Content Management
# - Visit http://localhost:3000/admin for Decap CMS
# - Or manually edit .mdx files in content/posts/
```

### API (FastAPI)

```bash
cd api

# Setup
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env      # Configure email/database settings

# Development
python init_db.py         # Initialize database (creates tables)
python run.py             # Start server at http://localhost:8000

# Testing
pytest                    # Run all tests
pytest tests/test_contact.py  # Run specific test file
pytest --cov=app tests/   # Run with coverage

# Production
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## Architecture Deep Dive

### Blog Architecture

**Static Site Generation Flow**:
1. MDX files in `content/posts/` contain frontmatter + markdown
2. `pages/[slug].tsx` uses `getStaticPaths` to discover all posts at build time
3. `getStaticProps` reads each post, processes with gray-matter, serializes MDX
4. MDX pipeline: remarkSubstitutions → remarkGfm → rehypeSlug → rehypePrettyCode
5. Output: Static HTML in `/out` directory (no runtime server needed)

**Key Components**:
- `pages/index.tsx`: Homepage with three post categories (pinned, work, regular)
  - Reads all posts at build time via `getStaticProps`
  - Filters by frontmatter flags: `pinned`, `work`, `draft`
  - Tag system with color mapping in `tagColors` object
- `pages/[slug].tsx`: Dynamic blog post template
  - Processes MDX with custom plugins
  - Adds copy buttons to code blocks via `useEffect`
  - Renders with `<MDXRemote>` component
- `lib/remarkSubstitutions.ts`: Custom remark plugin
  - Text replacements: `->` → `→`, `<-` → `←`, `<3` → `♥`
  - `::text::` syntax → `<Kbd>text</Kbd>` component
  - Operates on AST (Abstract Syntax Tree) before HTML generation
- `pages/_app.tsx`: Theme management
  - Reads/writes theme preference to localStorage
  - Sets `data-theme` attribute on `<html>` element

**Content Frontmatter**:
- `pinned: true` → "What I'm Doing" section (featured work)
- `work: true` → "Things I've Shipped" section (portfolio)
- `draft: true` → Hidden from site (for work-in-progress)
- `tags: "web react"` → Space-separated or array format

**Decap CMS Integration**:
- Configuration: `public/admin/config.yml`
- Backend: GitHub (commits directly to repo)
- Media: Uploaded to `public/uploads/`
- Authentication: GitHub OAuth or token
- Visual editor at `/admin` route

### API Architecture

**Clean Architecture Pattern**:
```
app/
├── main.py              # FastAPI app initialization, router registration
├── core/
│   ├── config.py        # Pydantic Settings (reads from .env)
│   ├── database.py      # SQLAlchemy engine, session factory, get_db dependency
│   └── email.py         # Email sending utilities (aiosmtplib)
├── models/              # SQLAlchemy ORM models (database tables)
├── schemas/             # Pydantic models (validation, serialization)
└── routers/             # FastAPI route handlers (business logic)
```

**Key Patterns**:

1. **Dependency Injection**:
   - `get_db()` yields database session, auto-closes after request
   - Used via `db: Session = Depends(get_db)` in route handlers
   - Ensures database connections are properly managed

2. **Pydantic Validation**:
   - Schemas define what comes in (`*Create`, `*Update`) and goes out (`*Response`)
   - `EmailStr` field type validates email format automatically
   - `model_dump()` converts Pydantic model to dict for database

3. **Background Tasks**:
   - Contact form uses `BackgroundTasks` to send emails asynchronously
   - `/contact/` endpoint returns immediately, emails sent in background
   - `/contact/send-now` endpoint waits for email confirmation (slower)

4. **Email System** (`app/core/email.py`):
   - `send_contact_notification()`: Sends admin notification with form details
   - `send_confirmation_email()`: Sends thank you email to submitter
   - Uses HTML templates with inline styles
   - Configured via environment variables (SMTP_HOST, SMTP_PORT, etc.)

**Database Models vs Schemas**:
- **Models** (`app/models/item.py`): Define database tables via SQLAlchemy
  - Use `Column`, `Integer`, `String`, etc.
  - Maps to actual database structure
- **Schemas** (`app/schemas/item.py`): Define API contracts via Pydantic
  - `ItemCreate`: What client sends to create item
  - `ItemUpdate`: What client sends to update item (all fields optional)
  - `ItemResponse`: What API returns (includes id, timestamps)
  - `Config.from_attributes = True` allows ORM object → Pydantic conversion

**Adding New Endpoints**:
1. Create model in `app/models/` (SQLAlchemy)
2. Create schema in `app/schemas/` (Pydantic)
3. Create router in `app/routers/` (FastAPI routes)
4. Register router in `app/main.py`: `app.include_router()`
5. Run `python init_db.py` to create database tables

### Deployment Architecture

**Complete Flow**:
```
Developer pushes to Git
    ↓
GitHub webhook triggers Jenkins
    ↓
Jenkins clones repo, runs npm build (blog) or sets up venv (api)
    ↓
deploy_blog.sh copies /out to /var/www/{site-name}/
    ↓
NGINX serves static files (blog) and proxies API requests
    ↓
Cloudflare Tunnel exposes localhost:80 to internet (no port forwarding)
    ↓
Public access at https://your-site.com
```

**Jenkins Pipeline** (`hosting/Jenkinsfile`):
- Stage 1: Health check (verify Node.js/npm)
- Stage 2: Install dependencies (`npm install`)
- Stage 3: Build (`npm run build` with NODE_ENV=production)
- Stage 4: Deploy (`sudo /usr/local/bin/deploy_blog.sh`)
- Stage 5: Archive artifacts

**NGINX Configuration**:
- Static files: `try_files $uri $uri/ =404`
- API proxy: `proxy_pass http://localhost:8000/`
- Gzip compression enabled
- Cache headers for static assets
- Security headers (X-Frame-Options, etc.)

**Cloudflare Tunnel**:
- Runs as systemd service (`cloudflared`)
- Configuration in `~/.cloudflared/config.yml`
- Routes domain to `http://localhost:80`
- No exposed ports, all traffic encrypted

## Important Configuration

### Blog Configuration

**Decap CMS** (`public/admin/config.yml`):
```yaml
backend:
  name: github
  repo: your-username/your-repo  # Update this!
  branch: master
```

**Site Branding** (`pages/index.tsx`):
- Line ~116: Change "MVOLZ" header
- Line ~246-285: Update social links (LinkedIn, Instagram, X)
- Line ~12-27: Update tag colors in `tagColors` object

**Theme** (`tailwind.config.js`):
- Custom VSCode-inspired color palette
- Custom fonts: Inter (sans), Orbitron (display), Roboto Mono (mono)

### API Configuration

**Email Setup** (`.env`):
```env
# For Gmail - requires App Password (not regular password)
# Generate at: https://myaccount.google.com/apppasswords
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
SMTP_FROM_EMAIL=your-email@gmail.com
CONTACT_EMAIL_RECIPIENT=your-email@gmail.com
```

**Database** (`.env`):
```env
# SQLite (default, good for development)
DATABASE_URL=sqlite:///./app.db

# PostgreSQL (production)
DATABASE_URL=postgresql://user:password@localhost/dbname
```

**CORS** (`.env`):
```env
# Allow blog to call API on different origin (comma-separated)
CORS_ORIGINS=http://localhost:3000,https://your-site.com
```

## Critical Notes

### Blog
- Posts require `.mdx` extension (not `.md`)
- Build output uses `trailingSlash: true` (all routes end with `/`)
- Static export means no server-side runtime (no API routes in production)
- TypeScript strict mode is disabled (`strict: false` in tsconfig.json)

### API
- `CORS_ORIGINS` must be comma-separated string in `.env` (parsed automatically)
- Contact form sends two emails: admin notification + user confirmation
- Emails sent via background tasks (non-blocking)
- Database sessions auto-closed via dependency injection
- SMTP credentials never committed to git (in `.env`)
- For production, use SendGrid/Mailgun/SES instead of Gmail

### Deployment
- Jenkins requires sudo permission for deploy script only (configured via visudo)
- NGINX serves blog static files and proxies API requests
- Cloudflare Tunnel runs as systemd service
- Both blog and API can run on same server, different paths

## Testing Approach

### Blog
No automated tests. Verify by:
- Running `npm run build` successfully
- Checking `/out` directory contains HTML files
- Testing MDX features (syntax highlighting, heading anchors, custom components)

### API
- Unit tests in `tests/` directory
- Use `TestClient` from FastAPI for endpoint testing
- Mock database with fixtures
- Test validation errors (422 responses)
- Test business logic without actual email sending

## Path Aliases

### Blog
```typescript
import { Kbd } from '@/components/Kbd';
// @ maps to project root
```

### API
```python
from app.core.config import settings
# app/ is the root package
```

## Special Features

### Blog Custom Syntax
- `::Ctrl+C::` → `<Kbd>Ctrl+C</Kbd>` (keyboard shortcuts)
- `->` → `→`, `<-` → `←`, `<3` → `♥` (text replacements)
- All headings auto-generate IDs for anchor links (rehype-slug)
- Code blocks get copy buttons via client-side JavaScript

### API Email Templates
- HTML emails with inline styles (for email client compatibility)
- Both HTML and plain text versions sent
- Admin notification includes clickable email/phone links
- User confirmation is a thank you message

## Cross-Project Integration

When using blog + API together:
1. Blog is static, deployed to `/var/www/blog`
2. API runs as systemd service on `localhost:8000`
3. NGINX config:
   - `/` → serves blog static files
   - `/api/` → proxies to `http://localhost:8000/`
4. Blog can fetch from `/api/contact` (same origin, no CORS issues)
5. Single Cloudflare Tunnel exposes both via one domain
